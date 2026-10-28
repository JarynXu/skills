const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { subscriptionScope, sendReply, ClientError } = require('../notifications.cjs');
const { markAutomation } = require('../message-origin.cjs');
const { renderer, sessionFor, accountId, chatId, scope, raw } = require('./notification-fixture.cjs');
const exec = promisify(execFile);

test('客户端版本差异不阻止消息订阅、接收和释放', async () => {
  const app = renderer({ version: 'unverified' }), session = sessionFor(app);
  await session.subscribe(scope);
  assert.equal(app.listeners.size, 1);
  app.emit({ aNotifyType: 2, message: raw('different-version') });
  const snapshot = await session.readPending(scope);
  assert.equal(snapshot.records[0].message.id, 'different-version');
  await session.confirm({ ...scope, sequence: snapshot.sequence });
  await session.unsubscribe(scope);
  assert.equal(app.listeners.size, 0); assert.equal(app.chunks.length, 0);
});

test('应用技能在不存在其他技能的隔离进程中提供原生订阅', async t => {
  const parent = path.resolve(os.tmpdir());
  const root = await fs.mkdtemp(path.join(parent, 'icenter-native-isolated-'));
  t.after(async () => { assert.equal(path.dirname(root), parent); assert.ok(path.basename(root).startsWith('icenter-native-isolated-')); await fs.rm(root, { recursive: true, force: true }); });
  const copy = path.join(root, 'application');
  await fs.cp(path.resolve(__dirname, '../..'), copy, { recursive: true });
  const code = `
    const assert = require('node:assert/strict');
    const path = require('node:path');
    const Module = require('node:module');
    const ownRoot = path.resolve(process.argv[1]);
    const resolve = Module._resolveFilename;
    Module._resolveFilename = function(...args) {
      const resolved = resolve.apply(this, args);
      if (path.isAbsolute(resolved) && !resolved.startsWith(ownRoot + path.sep)) throw new Error('External dependency: ' + resolved);
      return resolved;
    };
    (async () => {
      for (const name of ['cdp','client','renderer','page','contracts','attachments','notifications','conversation-send','listener-page','message-batches','message-receiver']) require(path.join(ownRoot,'scripts',name+'.cjs'));
      const {renderer,sessionFor,scope,raw} = require(path.join(ownRoot,'scripts/tests/notification-fixture.cjs'));
      const app = renderer(), session = sessionFor(app);
      await session.subscribe(scope);
      app.emit({aNotifyType:2,message:raw('independent')});
      const snapshot = await session.readPending(scope);
      assert.equal(snapshot.records[0].message.id,'independent');
      await session.confirm({...scope,sequence:snapshot.sequence});
      await session.unsubscribe(scope);
      assert.equal(app.listeners.size,0);
      const {MessageReceiver} = require(path.join(ownRoot,'scripts/message-receiver.cjs'));
      const receiver = await MessageReceiver.open({session,stateDir:path.join(path.dirname(ownRoot),'receiver-state'),accountId:scope.accountId,sources:[{kind:'direct'}],quietMs:0,maxWaitMs:1000});
      app.emit({aNotifyType:2,message:raw('independent-grouping')});
      const grouped = await receiver.read();
      assert.equal(grouped.batches[0].records[0].id,'independent-grouping');
      await receiver.confirm(grouped.batches[0].id);
      await receiver.stop();
      console.log(JSON.stringify({independent:true,received:1,subscriptionRemoved:true}));
    })().catch(error=>{console.error(error);process.exitCode=1;});`;
  const result = await exec(process.execPath, ['-e', code, copy], { windowsHide: true, env: { ...process.env, CODEX_HOME: path.join(root, 'no-skills') }, timeout: 10000 });
  assert.equal(JSON.parse(result.stdout).independent, true);
  const help = await exec(process.execPath, [path.join(copy, 'scripts/icenter.cjs'), '--help'], { windowsHide: true, timeout: 10000 });
  assert.ok(JSON.parse(help.stdout));
});

test('订阅不接受目标会话、工作池和运行时字段', () => {
  for (const extra of [{ threadId: 'target' }, { routing: {} }, { createStore: true }]) assert.throws(() => subscriptionScope({ ...scope, ...extra }), { code: 'INVALID_NOTIFICATION_SCOPE' });
  assert.throws(() => subscriptionScope({ ...scope, sources: [{ ...scope.sources[0], threadId: 'target' }] }), { code: 'INVALID_NOTIFICATION_SCOPE' });
  assert.throws(() => subscriptionScope({ ...scope, mentionWindows: [null] }), { code: 'INVALID_NOTIFICATION_SCOPE' });
  const validated = subscriptionScope(scope);
  validated.sources[0].senderIds.push('another');
  assert.deepEqual(scope.sources[0].senderIds, [chatId]);
});

test('旧 followups 参数经验证保留，其他来源不能使用该字段', () => {
  const identity = { userIds: ['native-owner'], unionIds: ['UN-OWNER'] };
  assert.equal(subscriptionScope({ ...scope, quietMs: 1000 }).quietMs, 1000);
  assert.deepEqual(subscriptionScope({ ...scope, mentionWindows: [] }).mentionWindows, []);
  assert.equal(subscriptionScope({ ...scope, sources: [{ kind: 'group-mention', chatId: 'sip:group@example.test', followups: true }], mentionIdentity: identity }).sources[0].followups, true);
  assert.throws(() => subscriptionScope({ ...scope, quietMs: 60001 }), { code: 'INVALID_NOTIFICATION_SCOPE' });
  assert.throws(() => subscriptionScope({ ...scope, sources: [{ kind: 'group', chatId: 'sip:group@example.test', followups: true }], mentionIdentity: identity }), { code: 'INVALID_NOTIFICATION_SCOPE' });
});

test('原生自聊过滤支持调用方前缀，不解释控制命令', async () => {
  const app = renderer();
  app.state.chatInfo.chatList.push({ chatRoomUri: accountId, chatRoomType: 0 });
  const session = sessionFor(app), input = { ...scope, sources: [{ kind: 'self-text', chatId: accountId, textPrefix: '/ops' }] };
  await session.subscribe(input);
  const own = (id, content, extra = {}) => raw(id, { chatRoomUri: accountId, data_owner: accountId, sendUri: accountId, sendUnionID: 'UN-OWNER', content, ...extra });
  app.emit({ aNotifyType: 8, multiMessageContentList: [own('accepted', '/ops status'), own('other-prefix', '/codex status'), own('quoted', '/ops status', { msgType: 5 }), own('foreign-owner', '/ops status', { data_owner: 'other' })] });
  const snapshot = await session.readPending(scope);
  assert.deepEqual(snapshot.records.filter(record => record.incoming).map(record => record.id), ['accepted']);
  assert.equal(snapshot.records[0].sourceKind, 'self-text');
  assert.equal(snapshot.records[0].message.direction, 'self-text');
  assert.equal(snapshot.error.code, 'MESSAGE_SCOPE_MISMATCH');
  await session.unsubscribe(scope);
});

test('确认旧快照保留确认期间到达的新消息', async () => {
  const app = renderer(), session = sessionFor(app);
  await session.subscribe(scope);
  app.emit({ aNotifyType: 2, message: raw('first') });
  const first = await session.readPending(scope);
  app.emit({ aNotifyType: 2, message: raw('second') });
  await session.confirm({ ...scope, sequence: first.sequence });
  assert.deepEqual((await session.readPending(scope)).records.map(record => record.id), ['second']);
  await assert.rejects(session.confirm({ ...scope, sequence: 999 }), { code: 'INVALID_ACK' });
  await session.unsubscribe(scope);
});

test('连接重建复用订阅代次，其他所有者没有确认或注销权', async () => {
  const app = renderer(), first = sessionFor(app), second = sessionFor(app);
  assert.equal((await first.subscribe(scope)).reused, false);
  const reused = await second.subscribe({ ...scope, generationId: 'unused-new-generation' });
  assert.equal(reused.reused, true);
  assert.equal(reused.generationId, scope.generationId);
  assert.equal(app.listeners.size, 1);
  for (const op of ['readPending', 'unsubscribe']) await assert.rejects(second[op]({ ...scope, ownerId: 'foreign' }), { code: 'LISTENER_BUSY' });
  await assert.rejects(second.confirm({ ...scope, ownerId: 'foreign', sequence: 0 }), { code: 'LISTENER_BUSY' });
  await second.unsubscribe(scope);
});

test('账号切换后拒绝复用、读取与确认旧订阅，但允许原所有者清理', async () => {
  const app = renderer(), session = sessionFor(app);
  const accountA = { ...scope, sources: [{ kind: 'direct' }] };
  await session.subscribe(accountA);
  app.emit({ aNotifyType: 2, message: raw('private-to-account-a') });
  app.state.userInfo.userId = 'sip:account-b@example.test';
  const accountB = { ...accountA, accountId: 'sip:account-b@example.test', generationId: 'generation-b' };

  await assert.rejects(session.subscribe(accountB), { code: 'ACCOUNT_CHANGED' });
  await assert.rejects(session.readPending(accountB), { code: 'ACCOUNT_CHANGED' });
  await assert.rejects(session.confirm({ ...accountB, sequence: 1 }), { code: 'ACCOUNT_CHANGED' });
  assert.equal(app.listeners.size, 1);

  app.state.userInfo.userId = accountA.accountId;
  assert.deepEqual((await session.readPending(accountA)).records.map(record => record.id), ['private-to-account-a']);
  app.state.userInfo.userId = accountB.accountId;
  await session.unsubscribe(accountA);
  assert.equal(app.listeners.size, 0);
});

test('升级前无账户绑定的订阅拒绝复用和消费，原所有者可以清理重建', async () => {
  const app = renderer(), session = sessionFor(app);
  await session.subscribe(scope);
  app.emit({ aNotifyType: 2, message: raw('legacy-buffer') });
  const previous = app.window.__codexICenterListenerV1;
  delete previous.accountId;
  for (const action of [
    () => session.subscribe(scope),
    () => session.readPending(scope),
    () => session.confirm({ ...scope, sequence: 1 }),
  ]) await assert.rejects(action(), { code: 'LISTENER_ACCOUNT_UNKNOWN' });
  assert.equal(previous.records.length, 1);
  assert.equal(previous.acknowledged, 0);
  await session.unsubscribe(scope);
  assert.equal(app.listeners.size, 0);
  const fresh = await session.subscribe({ ...scope, generationId: 'replacement-generation' });
  assert.equal(fresh.reused, false);
  assert.equal(fresh.generationId, 'replacement-generation');
  await session.unsubscribe(scope);
});

test('通配单聊排除群和本人，保留新联系人的原生身份', async () => {
  const app = renderer(), session = sessionFor(app);
  await session.subscribe({ ...scope, sources: [{ kind: 'direct' }] });
  app.emit({ aNotifyType: 8, multiMessageContentList: [raw('new', { chatRoomUri: 'sip:new@example.test', sendUri: 'sip:new@example.test' }), raw('group', { chatRoomUri: 'sip:g@example.test', chatRoomType: 1 }), raw('own', { sendUri: accountId })] });
  assert.deepEqual((await session.readPending(scope)).records.filter(record => record.incoming).map(record => record.id), ['new']);
  await session.unsubscribe(scope);
});

test('通用群来源保留提及前后所有来信及结构化提及事实', async () => {
  const app = renderer(), session = sessionFor(app), group = 'sip:group@example.test';
  app.state.chatInfo.chatList.push({ chatRoomUri: group, chatRoomType: 1 });
  const installed = await session.subscribe({ ...scope, sources: [{ kind: 'group', chatId: group }], mentionIdentity: { userIds: ['native-owner'], unionIds: ['UN-OWNER'] } });
  assert.equal(Object.hasOwn(installed, 'compatibility'), false);
  const groupRaw = (id, extra = {}) => raw(id, { chatRoomUri: group, chatRoomType: 1, ...extra });
  app.emit({ aNotifyType: 8, multiMessageContentList: [
    groupRaw('before'),
    groupRaw('mentioned', { atInfo: 'native-owner' }),
    groupRaw('after'),
    groupRaw('all', { atInfo: 'all' }),
    groupRaw('other', { atInfo: 'other-person' }),
    groupRaw('other-sender', { sendUri: 'sip:other@example.test' }),
    groupRaw('mention-fields-unavailable', { atInfo: undefined, atExInfo: undefined }),
    groupRaw('own', { sendUri: accountId }),
  ] });
  const records = (await session.readPending(scope)).records.filter(record => record.incoming);
  assert.deepEqual(records.map(record => record.id), ['before', 'mentioned', 'after', 'all', 'other', 'other-sender', 'mention-fields-unavailable']);
  assert.deepEqual(records[0].message.mention, { state: 'available', userIds: [], unionIds: [], all: false, other: false });
  assert.deepEqual(records[1].message.mention, { state: 'available', userIds: ['native-owner'], unionIds: [], all: false, other: false });
  assert.equal(records[3].message.mention.all, true);
  assert.equal(records[4].message.mention.other, true);
  assert.equal(records[5].message.senderId, 'sip:other@example.test');
  assert.equal(records[6].message.mention.state, 'unavailable');
  await session.unsubscribe(scope);
});

test('新 group-mention 只接收个人提及，旧 followups 保留兼容提示与续发行为', async () => {
  const app = renderer(), session = sessionFor(app), group = 'sip:group@example.test';
  app.state.chatInfo.chatList.push({ chatRoomUri: group, chatRoomType: 1 });
  const installed = await session.subscribe({ ...scope, sources: [{ kind: 'group-mention', chatId: group }], mentionIdentity: { userIds: ['native-owner'], unionIds: ['UN-OWNER'] } });
  assert.equal(Object.hasOwn(installed, 'compatibility'), false);
  const groupRaw = (id, extra = {}) => raw(id, { chatRoomUri: group, chatRoomType: 1, ...extra });
  app.emit({ aNotifyType: 8, multiMessageContentList: [
    groupRaw('before'),
    groupRaw('mentioned', { atInfo: 'native-owner' }),
    groupRaw('after'),
    groupRaw('all', { atInfo: 'all' }),
    groupRaw('other', { atInfo: 'other-person' }),
  ] });
  const records = (await session.readPending(scope)).records.filter(record => record.incoming);
  assert.deepEqual(records.map(record => record.id), ['mentioned']);
  assert.deepEqual(records[0].message.mention.userIds, ['native-owner']);
  await session.unsubscribe(scope);

  const legacy = sessionFor(app);
  const compatible = await legacy.subscribe({ ...scope, generationId: 'legacy-followups-generation', sources: [{ kind: 'group-mention', chatId: group, followups: true }], mentionIdentity: { userIds: ['native-owner'], unionIds: ['UN-OWNER'] }, quietMs: 30000 });
  assert.deepEqual(compatible.compatibility, { code: 'LEGACY_FOLLOWUPS', message: 'Use message-receiver.cjs for grouped delivery; native followups remain available for existing callers.' });
  app.emit({ aNotifyType: 2, message: groupRaw('legacy-mentioned', { atInfo: 'native-owner' }) });
  app.emit({ aNotifyType: 2, message: groupRaw('legacy-followup') });
  const legacyRecords = (await legacy.readPending(scope)).records.filter(record => record.incoming);
  assert.deepEqual(legacyRecords.map(record => record.id), ['legacy-mentioned', 'legacy-followup']);
  assert.deepEqual(legacyRecords[1].message.mentionContinuation, { previousId: 'legacy-mentioned' });
  await legacy.unsubscribe(scope);
});

test('群来源都要求个人身份并核对原生群类型', async () => {
  const app = renderer(), session = sessionFor(app), group = 'sip:group@example.test';
  for (const kind of ['group', 'group-mention']) {
    assert.throws(() => subscriptionScope({ ...scope, sources: [{ kind, chatId: group }] }), { code: 'INVALID_NOTIFICATION_SCOPE' });
    await assert.rejects(session.subscribe({ ...scope, sources: [{ kind, chatId: chatId }], mentionIdentity: { userIds: ['native-owner'], unionIds: ['UN-OWNER'] } }), { code: 'MESSAGE_SCOPE_MISMATCH' });
    await assert.rejects(session.subscribe({ ...scope, sources: [{ kind, chatId: chatId }], mentionIdentity: { userIds: ['other-user'], unionIds: ['OTHER-UNION'] } }), { code: 'ACCOUNT_CHANGED' });
  }
});

test('旧订阅契约拒绝复用但保留原 owner 读取确认和注销', async () => {
  const app = renderer(), session = sessionFor(app);
  await session.subscribe(scope);
  app.emit({ aNotifyType: 2, message: raw('old-contract-message') });
  const previous = app.window.__codexICenterListenerV1;
  previous.contractVersion = 2;
  previous.signature = JSON.stringify([accountId, scope.sources, null, 30000, false]);

  await assert.rejects(session.subscribe({ ...scope, generationId: 'new-contract-generation' }), { code: 'LISTENER_CONTRACT_CHANGED' });
  const snapshot = await session.readPending(scope);
  assert.deepEqual(snapshot.records.map(record => record.id), ['old-contract-message']);
  assert.equal(snapshot.acknowledged, 0);
  await session.confirm({ ...scope, sequence: snapshot.sequence });
  assert.equal((await session.readPending(scope)).records.length, 0);
  await session.unsubscribe(scope);
  assert.equal(app.listeners.size, 0);
});

test('本人回复必须已获客户端确认，长消息仍标记内容未读', async () => {
  const app = renderer(), session = sessionFor(app);
  await session.subscribe({ ...scope, replyAwareness: true });
  app.emit({ aNotifyType: 2, message: raw('empty', { content: '' }) });
  for (const [id, confirmed] of [['pending', false], ['confirmed', true]]) app.emit({ aNotifyType: 0, message: raw(id, { sendUri: accountId, isMessageTransSuccess: () => confirmed }) });
  const records = (await session.readPending(scope)).records;
  assert.equal(records.find(record => record.id === 'empty').message.contentState, 'needs-client-read');
  assert.deepEqual(records.filter(record => record.ownReply).map(record => record.id), ['confirmed']);
  await session.unsubscribe(scope);
});

test('通知读取识别来信及代发来源，不改变正文或推进确认序号', async () => {
  const app = renderer(), session = sessionFor(app), marked = markAutomation('answer');
  await session.subscribe({ ...scope, replyAwareness: true });
  app.emit({ aNotifyType: 2, message: raw('incoming', { content: 'human or unknown' }) });
  app.emit({ aNotifyType: 0, message: raw('outgoing', { content: marked, sendUri: accountId, isMessageTransSuccess: () => true }) });
  const first = await session.readPending(scope), second = await session.readPending(scope);
  assert.equal(first.records.find(record => record.id === 'incoming').message.origin.kind, 'unknown');
  const reply = first.records.find(record => record.id === 'outgoing').ownReply;
  assert.equal(reply.origin.kind, 'automation-marked'); assert.equal(reply.text, marked); assert.equal(reply.origin.sampleEligible, false);
  assert.deepEqual(second.records, first.records); assert.equal(second.sequence, first.sequence);
  assert.equal(first.acknowledged, 0); assert.equal(second.acknowledged, 0);
  await session.unsubscribe(scope);
});

test('缓冲溢出保留已捕获消息与缺口，不呈现空闲', async () => {
  const app = renderer(), session = sessionFor(app);
  await session.subscribe(scope);
  app.emit({ aNotifyType: 8, multiMessageContentList: Array.from({ length: 2049 }, (_, index) => raw('overflow-' + index)) });
  const snapshot = await session.readPending(scope);
  assert.equal(snapshot.records.length, 2048);
  assert.equal(snapshot.error.code, 'MONITOR_GAP');
  await session.confirm({ ...scope, sequence: snapshot.sequence });
  assert.equal((await session.readPending(scope)).error.code, 'MONITOR_GAP');
  await session.unsubscribe(scope);
});

test('关闭借用连接不取得释放权，关闭拥有连接不清除渲染订阅', async () => {
  const app = renderer(), borrowed = sessionFor(app), owned = sessionFor(app, { ownsConnection: true });
  await borrowed.subscribe(scope);
  borrowed.close();
  assert.equal(app.closed, undefined);
  owned.close();
  assert.equal(app.closed, 1);
  assert.equal(app.listeners.size, 1);
  await borrowed.unsubscribe(scope);
});

test('受限发送保留原聊天并返回客户端消息 ID，未知发送不重试', async () => {
  let activeChatId = 'sip:previous@example.test', sends = 0, sent = false;
  const client = { call: async (operation, input) => {
    if (operation === 'status') return { accountId, activeChatId };
    if (operation === 'select') { activeChatId = input.chatId; return { state: 'selected' }; }
    if (operation === 'read') return { accountId, chatId, messages: sent ? [{ id: 'confirmed-native', senderId: accountId, text: 'answer', transfer: 'confirmed' }] : [] };
    if (operation === 'send') { sends++; sent = true; return { beforeIds: [] }; }
    throw new Error(operation);
  } };
  assert.equal((await sendReply(client, { accountId, chatId }, 'answer')).messageId, 'confirmed-native');
  assert.equal(sends, 1);
  assert.equal(activeChatId, 'sip:previous@example.test');
  const failure = { call: async (operation, input) => {
    if (operation === 'send') { sends++; throw new ClientError('CDP_DISCONNECTED', 'lost after submission'); }
    return client.call(operation, input);
  } };
  await assert.rejects(sendReply(failure, { accountId, chatId }, 'answer'), { code: 'SEND_UNKNOWN' });
  assert.equal(sends, 2);
  assert.equal(activeChatId, 'sip:previous@example.test');
});
