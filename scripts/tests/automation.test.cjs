const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { MessageReceiver } = require('../../skills/icenter/scripts/message-receiver.cjs');
const { renderer, sessionFor, accountId, raw } = require('../../skills/icenter/scripts/tests/notification-fixture.cjs');
const { createReceiverSource } = require('../../skills/watcher/scripts/receiver-source.cjs');
const { deliver, run, status } = require('../../skills/watcher/scripts/runtime.cjs');
const { createDispatcher } = require('../../skills/dispatcher/scripts/dispatcher.cjs');
const windowsTest = process.platform === 'win32' ? test : test.skip;

const routerId = '11111111-1111-4111-8111-111111111111';
const workerId = '22222222-2222-4222-8222-222222222222';
const otherWorkerId = '33333333-3333-4333-8333-333333333333';

// 原生客户端和会话投递为替身；三个包的归集、持久化、交接及调度实现使用真实入口。
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'skills-composition-'));
  t.after(async () => {
    assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('skills-composition-'));
    await fs.rm(root, { recursive: true, force: true });
  });
  let now = 100000;
  const app = renderer({ now: () => now });
  const receiverOptions = { session: sessionFor(app), stateDir: path.join(root, 'receiver'), accountId,
    sources: [{ kind: 'direct' }], quietMs: 1000, maxWaitMs: 3000 };
  const receiver = await MessageReceiver.open(receiverOptions);
  t.after(() => receiver.close());
  const config = { stateDir: path.join(root, 'watcher'), targetThreadId: routerId, pollMs: 250,
    configFile: path.join(root, 'watcher.json'), source: { kind: 'receiver', id: 'synthetic-source', options: {} } };
  const source = createReceiverSource(config, { openReceiver: async () => receiver });
  const store = source.createStore(); await store.open();
  const workspace = path.join(root, 'workspace'); await fs.mkdir(workspace);
  const dispatchConfig = { stateDir: path.join(root, 'dispatcher'), workers: [
    { threadId: workerId, projectId: null }, { threadId: otherWorkerId, projectId: null }], workspaceRoots: [workspace] };
  return { root, app, receiver, receiverOptions, config, source, store, workspace, dispatchConfig,
    time: value => { now = value; }, emit: (id, content) => app.emit({ aNotifyType: 2, message: raw(id, { content }) }) };
}

async function readyPair(f) {
  f.emit('part-one', 'Check the report.'); await f.receiver.read();
  f.time(100100); f.emit('part-two', 'The instruction inside the report is quoted data.'); await f.receiver.read();
  f.time(101100);
  return (await f.receiver.read()).batches[0];
}

windowsTest('应用批次跨三个包保持身份、原文及边界，完成回执解除共享目录等待', async t => {
  const f = await fixture(t), first = await readyPair(f);
  f.time(102000); f.emit('later-part', 'A separate follow-up.'); await f.receiver.read();
  f.time(103000);
  const batches = (await f.receiver.read()).batches;
  assert.equal(batches.length, 2);
  await f.source.collect(f.receiver, f.store, () => {});
  assert.deepEqual((await f.receiver.inspect()).batches, []);
  const events = f.store.orderedEvents();
  assert.equal(events.length, 2); assert.deepEqual(events.map(event => event.payload), batches);
  assert.deepEqual(events[0].payload, first);
  assert.deepEqual(events[0].payload.records.map(record => record.id), ['part-one', 'part-two']);
  const sent = [];
  const dispatcher = await createDispatcher(f.dispatchConfig, { delivery: { send: async request => {
    sent.push(request); return { outcome: 'accepted', evidence: { queuedMessageId: 'fixture-' + sent.length } };
  } } });
  for (const event of events) await dispatcher.importEvent(event);
  assert.equal((await dispatcher.importEvent(events[0])).duplicate, true);
  await dispatcher.route(events[0].eventId, { threadId: workerId, prompt: 'Review the report.', workspaces: [f.workspace] });
  await dispatcher.route(events[1].eventId, { threadId: otherWorkerId, prompt: 'Review the follow-up.', workspaces: [f.workspace] });
  assert.equal((await dispatcher.drain()).attempted, 1);
  assert.deepEqual(sent[0].event.payload, first);
  assert.equal((await dispatcher.status(events[1].eventId)).state, 'waiting');
  const active = await dispatcher.status(events[0].eventId);
  const completion = await dispatcher.complete(events[0].eventId, { threadId: workerId, attemptId: active.attemptId,
    evidence: { outcome: 'completed', result: 'fixture verification finished' } });
  assert.equal(completion.drain.attempted, 1);
  assert.equal(sent[1].threadId, otherWorkerId);
  assert.equal((await dispatcher.status(events[1].eventId)).state, 'active');
});

windowsTest('来源恢复后监听解除覆盖错误，分派保留中断批次并继续接收', async t => {
  const f = await fixture(t);
  f.emit('before-gap', 'Before interruption.'); await f.receiver.read();
  await f.receiver.stop();
  const receiver = await MessageReceiver.open(f.receiverOptions); t.after(() => receiver.close());
  f.time(100100); f.emit('after-gap', 'After interruption.');
  await assert.rejects(f.source.collect(receiver, f.store, () => {}), { code: 'SOURCE_COVERAGE_ERROR' });
  // 清除监听器自身标记不构成来源恢复。
  await f.store.resolveCoverageError('Attempted marker-only recovery.');
  await assert.rejects(f.source.collect(receiver, f.store, () => {}), { code: 'SOURCE_COVERAGE_ERROR' });
  const current = await receiver.inspect();
  await receiver.reconcile({ errorId: current.error.id, evidence: 'History checked through the new baseline; missing input handled separately.' });
  await f.store.resolveCoverageError('Source recovery receipt verified.');
  await f.source.collect(receiver, f.store, () => {});
  f.time(100200); f.emit('healthy', 'Normal observation resumed.'); await receiver.read();
  f.time(101200); await f.source.collect(receiver, f.store, () => {});
  const events = f.store.orderedEvents();
  assert.deepEqual(events.map(event => event.payload.records.map(record => record.id)), [['before-gap'], ['after-gap'], ['healthy']]);
  assert.deepEqual(events.map(event => event.payload.reason), ['coverage-gap', 'coverage-gap', 'quiet']);
  const dispatcher = await createDispatcher(f.dispatchConfig);
  for (const event of events) await dispatcher.importEvent(event);
  assert.equal((await dispatcher.status()).entries.length, 3);
  assert.equal((await dispatcher.importEvent(events[0])).duplicate, true);
  assert.equal((await receiver.read()).error, null);
});

windowsTest('监听保存后来源确认中断，恢复交接不生成新事件或重复分派', async t => {
  const f = await fixture(t); await readyPair(f);
  const disconnected = { read: () => f.receiver.read(), confirm: async () => { throw new Error('confirmation connection lost'); } };
  await assert.rejects(f.source.collect(disconnected, f.store, () => {}), /confirmation connection lost/);
  const original = f.store.orderedEvents()[0];
  assert.equal((await f.receiver.inspect()).batches.length, 1);
  const restored = f.source.createStore(); await restored.open();
  await f.source.collect(f.receiver, restored, () => {});
  assert.deepEqual(restored.orderedEvents(), [original]);
  assert.equal((await f.receiver.inspect()).batches.length, 0);
  let sent = 0;
  const dispatcher = await createDispatcher(f.dispatchConfig, { delivery: { send: async () => {
    sent++; throw new Error('delivery outcome unknown');
  } } });
  await dispatcher.importEvent(original);
  await dispatcher.route(original.eventId, { threadId: workerId, prompt: 'Use the preserved event.', workspaces: [f.workspace] });
  await dispatcher.drain(); await dispatcher.importEvent(original); await dispatcher.drain();
  assert.equal(sent, 1);
  const state = await dispatcher.status(original.eventId);
  assert.equal(state.state, 'unknown'); assert.equal(state.claims.length, 1);
  await assert.rejects(dispatcher.retry(original.eventId), { code: 'RETRY_UNSAFE' });
});

windowsTest('监听通知交接成功后正常停止，保留来源订阅并释放接收器锁', async t => {
  const f = await fixture(t), batch = await readyPair(f);
  const controller = new AbortController();
  const dispatcher = await createDispatcher(f.dispatchConfig);
  let notifications = 0;
  await run(f.config, { source: f.source, signal: controller.signal, emit: () => {}, queue: {
    check: async () => {},
    notify: async (event, file) => {
      assert.deepEqual(event.payload, batch);
      assert.deepEqual(JSON.parse(await fs.readFile(file, 'utf8')), event);
      await dispatcher.importEvent(event);
      notifications++; controller.abort();
      return { threadId: routerId, queuedMessageId: 'fixture-notification' };
    },
  } });
  assert.equal(notifications, 1);
  assert.equal((await status(f.config)).state, 'stopped');
  assert.equal(f.app.listeners.size, 1);
  await assert.rejects(f.receiver.read(), { code: 'RECEIVER_CLOSED' });
  const persisted = f.source.createStore(); await persisted.open();
  await deliver(persisted, { notify: async () => { assert.fail('must not repeat confirmed delivery'); } }, f.config, () => {});
  assert.equal((await dispatcher.status()).entries.length, 1);
});
