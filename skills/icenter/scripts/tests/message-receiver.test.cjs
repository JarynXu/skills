const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { MessageReceiver } = require('../message-receiver.cjs');
const { renderer, sessionFor, accountId, chatId, raw } = require('./notification-fixture.cjs');

async function fixture(t, overrides = {}) {
  const { setup, ...changes } = overrides;
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'icenter-receiver-test-'));
  t.after(async () => {
    assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('icenter-receiver-test-'));
    await fs.rm(root, { recursive: true, force: true });
  });
  let now = 100000;
  const app = renderer({ now: () => now }), session = sessionFor(app);
  setup?.(app);
  const options = { session, stateDir: root, accountId, sources: [{ kind: 'direct' }], quietMs: 1000, maxWaitMs: 3000, ...changes };
  const receiver = await MessageReceiver.open(options);
  t.after(() => receiver.close());
  return { app, session, root, options, receiver, time: value => { now = value; }, emit: (id, extra) => app.emit({ aNotifyType: 2, message: raw(id, extra) }) };
}

test('公开接收入口在静默后交付同人连续消息，确认不改变客户端已读', async t => {
  const f = await fixture(t);
  f.emit('first', { content: '看看方案' });
  assert.equal((await f.receiver.read()).batches.length, 0);
  f.time(100800); f.emit('second', { content: '先别修改' });
  assert.equal((await f.receiver.read()).batches.length, 0);
  f.time(101799); assert.equal((await f.receiver.read()).batches.length, 0);
  f.time(101800);
  const result = await f.receiver.read();
  assert.equal(result.error, null); assert.equal(result.batches.length, 1);
  assert.deepEqual(result.batches[0].records.map(item => item.id), ['first', 'second']);
  assert.equal(f.app.state.chatInfo.chatSelectUri, 'sip:unrelated@example.test');
  const batchId = result.batches[0].id;
  assert.equal((await f.receiver.read()).batches[0].id, batchId);
  await f.receiver.confirm(batchId);
  assert.deepEqual((await f.receiver.read()).batches, []);
  f.emit('second', { content: '先别修改' }); f.time(103000);
  assert.deepEqual((await f.receiver.read()).batches, []);
});

test('群提及位于末尾时保留前文，多人交错及未知提及各自保留', async t => {
  const group = 'sip:group@example.test';
  const f = await fixture(t, {
    setup: app => app.state.chatInfo.chatList.push({ chatRoomUri: group, chatRoomType: 1 }),
    sources: [{ kind: 'group', chatId: group, trigger: 'mention' }],
    mentionIdentity: { userIds: [accountId], unionIds: ['UN-OWNER'] },
  });
  const groupMessage = extra => ({ chatRoomUri: group, chatRoomType: 1, ...extra });
  f.emit('preface', groupMessage({ content: '正文在这里' }));
  f.time(100100); f.emit('other-person', groupMessage({ sendUri: 'sip:other@example.test' }));
  f.time(100200); f.emit('mention-at-end', groupMessage({ atInfo: accountId }));
  await f.receiver.read(); f.time(101200);
  const batches = (await f.receiver.read()).batches;
  const mine = batches.find(batch => batch.senderId === chatId);
  assert.equal(mine.triggered, true);
  assert.deepEqual(mine.records.map(record => record.id), ['preface', 'mention-at-end']);
  assert.equal(batches.find(batch => batch.senderId !== chatId).triggered, false);
  for (const batch of batches) await f.receiver.confirm(batch.id);
  f.time(102000); f.emit('unknown-mention', groupMessage({ atInfo: undefined, atExInfo: undefined }));
  await f.receiver.read(); f.time(103000);
  const unknown = (await f.receiver.read()).batches[0];
  assert.equal(unknown.triggered, null);
  assert.equal(unknown.records[0].id, 'unknown-mention');
});

test('最长等待封批，处理中后续输入不改写已交付批次', async t => {
  const f = await fixture(t, { quietMs: 2000, maxWaitMs: 3000 });
  for (let index = 0; index < 4; index++) {
    f.time(100000 + index * 900); f.emit('part-' + index); await f.receiver.read();
  }
  f.time(103000);
  const first = (await f.receiver.read()).batches[0];
  assert.equal(first.reason, 'max-wait'); assert.equal(first.records.length, 4);
  f.time(103100); f.emit('later-constraint'); await f.receiver.read();
  f.time(105100);
  const ready = (await f.receiver.read()).batches;
  assert.equal(ready.length, 2); assert.deepEqual(ready[0], first);
  assert.deepEqual(ready[1].records.map(record => record.id), ['later-constraint']);
  await f.receiver.confirm(first.id);
  assert.deepEqual((await f.receiver.inspect()).batches.map(batch => batch.id), [ready[1].id]);
});

test('恢复接收器不要求调用者提供窗口或所有者，保留未封组和未确认批次', async t => {
  const f = await fixture(t);
  f.emit('before-restart'); await f.receiver.read();
  const previous = await f.receiver.inspect();
  await f.receiver.close();
  assert.equal(f.app.listeners.size, 1);
  f.time(100500); f.emit('while-disconnected');
  const restored = await MessageReceiver.open(f.options); t.after(() => restored.close());
  assert.equal((await restored.inspect()).generationId, previous.generationId);
  await restored.read(); f.time(101500);
  const batch = (await restored.read()).batches[0];
  assert.deepEqual(batch.records.map(item => item.id), ['before-restart', 'while-disconnected']);
  await restored.close();
  const again = await MessageReceiver.open(f.options); t.after(() => again.close());
  assert.equal((await again.read()).batches[0].id, batch.id);
  await again.confirm(batch.id);
  await again.close();
  const confirmed = await MessageReceiver.open(f.options); t.after(() => confirmed.close());
  assert.deepEqual((await confirmed.read()).batches, []);
});

test('保存失败时不确认来源缓冲，重试可以接收原消息', async t => {
  const f = await fixture(t), file = path.join(f.root, 'receiver.json');
  const checkpoint = JSON.parse(await fs.readFile(file, 'utf8'));
  const owner = { ownerId: checkpoint.ownerId, accountId };
  f.emit('must-survive');
  await fs.rename(file, file + '.saved'); await fs.mkdir(file);
  await assert.rejects(f.receiver.read());
  assert.equal((await f.session.readPending(owner)).acknowledged, 0);
  assert.equal((await f.session.readPending(owner)).records[0].id, 'must-survive');
  await fs.rmdir(file); await fs.rename(file + '.saved', file);
  await f.receiver.read(); f.time(101000);
  assert.equal((await f.receiver.read()).batches[0].records[0].id, 'must-survive');
});

test('来源确认结果未知时，持久消息在重启后不重复归集', async t => {
  const f = await fixture(t), confirm = f.session.confirm.bind(f.session);
  let failOnce = true;
  f.session.confirm = async input => {
    await confirm(input);
    if (failOnce) { failOnce = false; throw Object.assign(new Error('lost confirmation'), { code: 'CDP_DISCONNECTED' }); }
  };
  f.emit('accepted-before-unknown'); await assert.rejects(f.receiver.read(), { code: 'CDP_DISCONNECTED' });
  await f.receiver.close();
  const restored = await MessageReceiver.open(f.options); t.after(() => restored.close());
  f.time(101000);
  const batches = (await restored.read()).batches;
  assert.equal(batches.length, 1); assert.equal(batches[0].records.length, 1);
});

test('同一状态目录只有一个写者，关闭后可由新实例接管', async t => {
  const f = await fixture(t);
  await assert.rejects(MessageReceiver.open(f.options), { code: 'RECEIVER_BUSY' });
  await f.receiver.close();
  const replacement = await MessageReceiver.open(f.options); t.after(() => replacement.close());
  assert.equal((await replacement.read()).error, null);
  assert.equal(f.app.closed, undefined);
});

test('改变账户或归集策略不能借旧状态继续运行', async t => {
  const f = await fixture(t); await f.receiver.close();
  for (const change of [{ accountId: 'sip:other@example.test' }, { quietMs: 500 }]) {
    await assert.rejects(MessageReceiver.open({ ...f.options, ...change }), { code: 'RECEIVER_CONFIG_CHANGED' });
  }
  const valid = await MessageReceiver.open(f.options); t.after(() => valid.close());
  assert.equal((await valid.inspect()).accountId, accountId);
});

test('原生订阅丢失后的重建保留输入并报告覆盖缺口', async t => {
  const f = await fixture(t); f.emit('saved'); await f.receiver.read();
  const file = JSON.parse(await fs.readFile(path.join(f.root, 'receiver.json'), 'utf8'));
  await f.receiver.close(); await f.session.unsubscribe({ ownerId: file.ownerId, accountId });
  const restored = await MessageReceiver.open(f.options); t.after(() => restored.close());
  f.time(105000);
  const result = await restored.read();
  assert.equal(result.error.code, 'LISTENER_LOST');
  assert.equal(result.batches[0].reason, 'coverage-gap');
  assert.deepEqual(result.batches[0].records.map(record => record.id), ['saved']);
  assert.match(await fs.readFile(path.join(f.root, 'receiver.json'), 'utf8'), /saved/);
});

test('首次订阅后未保存代次就中断，恢复不能掩盖原订阅丢失', async t => {
  const f = await fixture(t); await f.receiver.close();
  const file = path.join(f.root, 'receiver.json');
  const state = JSON.parse(await fs.readFile(file, 'utf8'));
  state.generationId = null; state.baseline = null;
  await fs.writeFile(file, JSON.stringify(state));
  await f.session.unsubscribe({ ownerId: state.ownerId, accountId });
  const restored = await MessageReceiver.open(f.options); t.after(() => restored.close());
  assert.equal((await restored.inspect()).error.code, 'LISTENER_LOST');
});

test('账户切换不读取旧账户缓存，也不把空快照当成无新消息', async t => {
  const f = await fixture(t); f.emit('account-a'); await f.receiver.read();
  f.app.state.userInfo.userId = 'sip:account-b@example.test';
  const result = await f.receiver.read();
  assert.equal(result.error.code, 'ACCOUNT_CHANGED');
  assert.equal(result.batches[0].accountId, accountId);
  assert.equal(result.batches[0].reason, 'coverage-gap');
  assert.deepEqual(result.batches[0].records.map(record => record.id), ['account-a']);
});

test('核对后恢复沿用状态目录、批次身份和去重记录，中断两侧不合并', async t => {
  const f = await fixture(t);
  f.emit('before-gap'); await f.receiver.read();
  const originalId = (await f.receiver.inspect()).pending[0].id;
  await f.receiver.stop();
  const restored = await MessageReceiver.open(f.options); t.after(() => restored.close());
  f.time(100100); f.emit('after-gap'); await restored.read();
  const interrupted = await restored.inspect();
  assert.equal(interrupted.batches[0].id, originalId);
  assert.deepEqual(interrupted.pending[0].records.map(record => record.id), ['after-gap']);
  const input = { errorId: interrupted.error.id, evidence: 'History checked through the new baseline; missing history handled in a separate task.' };
  const receipt = await restored.reconcile(input);
  assert.equal(receipt.error.id, input.errorId);
  assert.deepEqual(await restored.reconcile(input), receipt);
  await assert.rejects(restored.reconcile({ ...input, evidence: 'different' }), { code: 'RECONCILIATION_CONFLICT' });
  const recovered = await restored.read();
  assert.equal(recovered.error, null);
  assert.deepEqual(recovered.batches.map(batch => batch.reason), ['coverage-gap', 'coverage-gap']);
  assert.deepEqual(recovered.batches.map(batch => batch.records.map(record => record.id)), [['before-gap'], ['after-gap']]);
  for (const batch of recovered.batches) await restored.confirm(batch.id);
  f.time(100200); f.emit('before-gap'); f.emit('after-gap'); f.emit('normal');
  await restored.read(); f.time(101200);
  const normal = (await restored.read()).batches;
  assert.equal(normal.length, 1); assert.equal(normal[0].reason, 'quiet');
  assert.deepEqual(normal[0].records.map(record => record.id), ['normal']);
  await restored.close();
  const again = await MessageReceiver.open(f.options); t.after(() => again.close());
  assert.deepEqual((await again.inspect()).reconciliations, [receipt]);
  assert.equal((await again.read()).error, null);
});

test('恢复要求当前账户健康和当前错误证据，旧回执不能消除新错误', async t => {
  const f = await fixture(t);
  f.app.state.userInfo.userId = 'sip:other@example.test';
  const error = (await f.receiver.read()).error;
  await assert.rejects(f.receiver.reconcile({ errorId: error.id, evidence: '' }), { code: 'INVALID_RECONCILIATION' });
  await assert.rejects(f.receiver.reconcile({ errorId: 'stale', evidence: 'checked' }), { code: 'STALE_COVERAGE_ERROR' });
  await assert.rejects(f.receiver.reconcile({ errorId: error.id, evidence: 'checked' }), { code: 'RECEIVER_NOT_READY' });
  assert.equal((await f.receiver.inspect()).error.id, error.id);
  f.app.state.userInfo.userId = accountId;
  const receipt = await f.receiver.reconcile({ errorId: error.id, evidence: 'checked' });
  f.app.state.userInfo.userId = 'sip:other@example.test';
  const later = (await f.receiver.read()).error;
  assert.notEqual(later.id, error.id);
  assert.deepEqual(await f.receiver.reconcile({ errorId: error.id, evidence: 'checked' }), receipt);
  assert.equal((await f.receiver.inspect()).error.id, later.id);
});

test('原生持续错误通过公开 stop、open 和 reconcile 恢复', async t => {
  const f = await fixture(t);
  const read = f.session.readPending.bind(f.session);
  let broken = true;
  f.session.readPending = async owner => ({ ...await read(owner), error: broken ? { code: 'LISTENER_OVERFLOW', message: 'Native buffer overflow.' } : null });
  f.emit('retained');
  const error = (await f.receiver.read()).error;
  await assert.rejects(f.receiver.reconcile({ errorId: error.id, evidence: 'checked' }), { code: 'RECEIVER_NOT_READY' });
  await f.receiver.stop(); broken = false;
  const restored = await MessageReceiver.open(f.options); t.after(() => restored.close());
  const current = await restored.read();
  await assert.rejects(restored.reconcile({ errorId: error.id, evidence: 'checked' }), { code: 'STALE_COVERAGE_ERROR' });
  assert.equal(current.error.details.previousError.code, 'LISTENER_OVERFLOW');
  await restored.reconcile({ errorId: current.error.id, evidence: 'History checked including the restart interval.' });
  assert.equal((await restored.read()).error, null);
  assert.deepEqual((await restored.inspect()).batches.flatMap(batch => batch.records.map(record => record.id)), ['retained']);
});

test('恢复保存失败保留错误，重试不产生重复回执', async t => {
  const f = await fixture(t), file = path.join(f.root, 'receiver.json');
  f.app.state.userInfo.userId = 'sip:other@example.test';
  const error = (await f.receiver.read()).error;
  f.app.state.userInfo.userId = accountId;
  const input = { errorId: error.id, evidence: 'History checked after restoring the account.' };
  await fs.rename(file, file + '.saved'); await fs.mkdir(file);
  await assert.rejects(f.receiver.reconcile(input));
  assert.equal((await f.receiver.inspect()).error.id, error.id);
  assert.deepEqual((await f.receiver.inspect()).reconciliations, []);
  await fs.rmdir(file); await fs.rename(file + '.saved', file);
  await f.receiver.reconcile(input);
  assert.equal((await f.receiver.inspect()).reconciliations.length, 1);
});

test('序号缺口保存为可观察错误，不确认未保存的原生记录', async t => {
  const f = await fixture(t), read = f.session.readPending.bind(f.session);
  f.emit('omitted'); f.emit('visible');
  f.session.readPending = async owner => ({ ...await read(owner), records: (await read(owner)).records.slice(1) });
  const result = await f.receiver.read();
  assert.equal(result.error.code, 'RECEIVER_SEQUENCE_GAP');
  const state = JSON.parse(await fs.readFile(path.join(f.root, 'receiver.json'), 'utf8'));
  assert.equal((await read({ ownerId: state.ownerId, accountId })).acknowledged, 0);
  await assert.rejects(f.receiver.reconcile({ errorId: result.error.id, evidence: 'checked' }), { code: 'RECEIVER_NOT_READY' });
});

test('旧版检查点迁移保留消息，新增恢复记录不修改已交付批次', async t => {
  const f = await fixture(t), file = path.join(f.root, 'receiver.json');
  f.emit('ready'); await f.receiver.read(); f.time(101000);
  const batch = (await f.receiver.read()).batches[0];
  await f.receiver.close();
  const state = JSON.parse(await fs.readFile(file, 'utf8'));
  state.version = 1; delete state.reconciliations;
  state.error = { code: 'LISTENER_LOST', message: 'Legacy coverage gap.' };
  await fs.writeFile(file, JSON.stringify(state));
  const restored = await MessageReceiver.open(f.options); t.after(() => restored.close());
  const current = await restored.inspect();
  assert.ok(current.error.id); assert.deepEqual(current.batches, [batch]);
  await restored.reconcile({ errorId: current.error.id, evidence: 'Legacy interval checked.' });
  assert.deepEqual((await restored.read()).batches, [batch]);
});

test('状态目录拒绝根目录、技能包、Git 目录和 worktree 的未创建子路径', async t => {
  const f = await fixture(t);
  await assert.rejects(MessageReceiver.open({ ...f.options, stateDir: path.parse(f.root).root }), { code: 'INVALID_RECEIVER_SCOPE' });
  for (const [name, marker, directory] of [['skill', 'SKILL.md', false], ['git', '.git', true], ['worktree', '.git', false]]) {
    const container = path.join(f.root, name); await fs.mkdir(container);
    if (directory) await fs.mkdir(path.join(container, marker));
    else await fs.writeFile(path.join(container, marker), 'fixture');
    const stateDir = path.join(container, 'missing', 'state');
    await assert.rejects(MessageReceiver.open({ ...f.options, stateDir }), { code: 'INVALID_RECEIVER_SCOPE' });
    await assert.rejects(fs.lstat(path.join(container, 'missing')), { code: 'ENOENT' });
  }
});

test('链接解析后的技能和 Git 祖先不能被私有状态路径绕过', async t => {
  const f = await fixture(t);
  for (const marker of ['SKILL.md', '.git']) {
    const name = marker === '.git' ? 'git' : 'skill';
    const container = path.join(f.root, 'target-' + name); await fs.mkdir(container);
    await fs.writeFile(path.join(container, marker), 'fixture');
    const link = path.join(f.root, 'link-' + name);
    await fs.symlink(container, link, process.platform === 'win32' ? 'junction' : 'dir');
    await assert.rejects(MessageReceiver.open({ ...f.options, stateDir: path.join(link, 'state') }), { code: 'INVALID_RECEIVER_SCOPE' });
    await assert.rejects(fs.lstat(path.join(container, 'state')), { code: 'ENOENT' });
  }
});

test('损坏检查点不被重置为初始状态', async t => {
  const f = await fixture(t); await f.receiver.close();
  const file = path.join(f.root, 'receiver.json'); await fs.writeFile(file, '{broken');
  await assert.rejects(MessageReceiver.open(f.options), { code: 'INVALID_RECEIVER_STATE' });
  assert.equal(await fs.readFile(file, 'utf8'), '{broken');
});

test('等待支持截止与取消，关闭唤醒等待者且不删除原生订阅', async t => {
  const f = await fixture(t);
  assert.equal((await f.receiver.next({ timeoutMs: 0 })).timedOut, true);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(f.receiver.next({ signal: controller.signal }), { name: 'AbortError' });
  const waiting = f.receiver.next({ timeoutMs: 10000 });
  const rejected = assert.rejects(waiting, error => error.name === 'AbortError' || error.code === 'RECEIVER_CLOSED');
  await f.receiver.close(); await rejected;
  assert.equal(f.app.listeners.size, 1);
  await assert.rejects(f.receiver.read(), { code: 'RECEIVER_CLOSED' });
});

test('停止采集保留已捕获输入，注销订阅并留下覆盖结束状态', async t => {
  const f = await fixture(t); f.emit('last-input'); await f.receiver.stop();
  assert.equal(f.app.listeners.size, 0);
  const state = JSON.parse(await fs.readFile(path.join(f.root, 'receiver.json'), 'utf8'));
  assert.equal(state.error.code, 'OBSERVATION_STOPPED');
  assert.match(JSON.stringify(state.grouping), /last-input/);
});
