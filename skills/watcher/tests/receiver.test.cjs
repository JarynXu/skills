const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawnSync, spawn } = require('node:child_process');
const { once } = require('node:events');
const { loadConfig } = require('../scripts/config.cjs');
const { ReceiverStore, createReceiverSource } = require('../scripts/receiver-source.cjs');
const { run, deliver, acquireLock, status } = require('../scripts/runtime.cjs');
const { atomicJson, readJson } = require('../scripts/persistence.cjs');
const { main } = require('../scripts/cli.cjs');
const TARGET = '11111111-1111-4111-8111-111111111111';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'watcher-ready-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const configFile = path.join(root, 'config.json'), moduleFile = path.join(root, 'receiver.cjs');
  await fs.writeFile(moduleFile, 'exports.open = async options => ({read: async () => ({batches: []}), confirm: async () => true, close: async () => {}});');
  await atomicJson(configFile, { version: 2, source: { kind: 'receiver', id: 'ready-source', module: moduleFile, export: 'open', options: { opaque: ['value'] } },
    targetThreadId: TARGET, stateDir: path.join(root, 'watcher-state'), pollMs: 250, wake: { executable: process.execPath } });
  return { root, configFile, moduleFile, config: await loadConfig(configFile) };
}

test('接收已就绪批次保留每个边界、ID及完整载荷；确认前全部落盘', async t => {
  const { config } = await fixture(t), input = [{ id: 'one', arbitrary: { x: [1, null, false] }, account: 'opaque' }, { id: 'two', sender: 'also opaque', text: '' }];
  const confirmations = [];
  const source = createReceiverSource(config, { openReceiver: async options => {
    assert.deepEqual(options, { opaque: ['value'] });
    return { read: async () => ({ batches: input }), confirm: async id => {
      assert.equal((await fs.readdir(path.join(config.stateDir, 'batches'))).length, 2);
      confirmations.push(id); return true;
    }, close: async () => {} };
  } });
  const store = source.createStore(); await store.open();
  assert.equal(store.pendingRecords, undefined); assert.equal(store.createBatches, undefined);
  const receiver = await source.connect(); await source.collect(receiver, store, () => {});
  assert.deepEqual(store.orderedEvents().map(event => event.payload), input);
  assert.deepEqual(store.orderedEvents().map(event => event.recordKeys), [['one'], ['two']]);
  assert.deepEqual(confirmations, ['one', 'two']);
  input[0].arbitrary.x[0] = 999;
  assert.equal(store.orderedEvents()[0].payload.arbitrary.x[0], 1);
  await assert.rejects(source.collect(receiver, store, () => {}), { code: 'EVENT_ID_CONFLICT' });
});

test('稳定 ID 重放及键顺序变化不生成新事件，内容变化保持冲突', async t => {
  const { config } = await fixture(t), store = new ReceiverStore(config); await store.open();
  const event = await store.acceptBatch({ id: 'stable', value: { a: 1, b: 2 } });
  await store.receipt(event.eventId, { state: 'queued', threadId: TARGET });
  const restored = new ReceiverStore(config); await restored.open();
  assert.equal((await restored.acceptBatch({ value: { b: 2, a: 1 }, id: 'stable' })).eventId, event.eventId);
  assert.equal(restored.batches.size, 1); assert.equal(restored.receipts.get(event.eventId).state, 'queued');
  await assert.rejects(restored.acceptBatch({ id: 'stable', value: { a: 1, b: 3 } }), { code: 'EVENT_ID_CONFLICT' });
  assert.deepEqual((await readJson(store.batchPath(event.eventId))).payload.value, { a: 1, b: 2 });
});

test('批次与来源错误共同返回：错误与批次在首次确认前持久化，来源覆盖不伪装成功', async t => {
  const { config } = await fixture(t), confirmations = [];
  const source = createReceiverSource(config, { openReceiver: async () => ({
    read: async () => ({ batches: [{ id: 'kept', body: 'opaque' }], error: { code: 'GAP', details: { range: [1, 5] } } }),
    confirm: async id => {
      assert.equal((await readJson(path.join(config.stateDir, 'coverage-error.json'))).error.details.code, 'GAP');
      assert.equal((await fs.readdir(path.join(config.stateDir, 'batches'))).length, 1);
      confirmations.push(id); return true;
    }, close: async () => {}
  }) });
  const store = source.createStore(); await store.open();
  await assert.rejects(source.collect(await source.connect(), store, () => {}), { code: 'SOURCE_COVERAGE_ERROR' });
  assert.deepEqual(confirmations, ['kept']);
  const restored = new ReceiverStore(config); await restored.open();
  assert.equal(restored.summary().sourceCoverageError.error.details.code, 'GAP');
  assert.equal(restored.batches.size, 1);
});

test('确认拒绝保留持久事件；非法批次不能得到确认', async t => {
  const { config } = await fixture(t), source = createReceiverSource(config, { openReceiver: async () => ({ read: async () => ({ batches: [{ id: 'one' }] }), confirm: async () => false, close: async () => {} }) });
  const store = source.createStore(); await store.open();
  await assert.rejects(source.collect(await source.connect(), store, () => {}), { code: 'SOURCE_CONFIRM_UNKNOWN' });
  assert.equal(store.batches.size, 1);
  for (const value of [{ id: 'bad', value: undefined }, { id: 'bad', value: NaN }, { value: 1 }]) await assert.rejects(store.acceptBatch(value), { code: 'INVALID_RECEIVER_BATCH' });
});

test('模块和选项固定来源身份；预览及状态不执行受信模块', async t => {
  const { config, configFile, moduleFile, root } = await fixture(t), marker = path.join(root, 'loaded');
  await fs.writeFile(moduleFile, 'require("node:fs").writeFileSync(' + JSON.stringify(marker) + ', "loaded"); exports.open = async () => { throw new Error("connect attempted"); };');
  const trigger = path.resolve(__dirname, '../scripts/trigger.cjs');
  for (const command of ['start', 'run', 'stop', 'status']) {
    const result = spawnSync(process.execPath, [trigger, command, '--config', configFile], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    await assert.rejects(fs.access(marker), { code: 'ENOENT' });
  }
  await assert.rejects(createReceiverSource(config).connect(), /connect attempted/);
  assert.equal(await fs.readFile(marker, 'utf8'), 'loaded');
  const store = new ReceiverStore(config); await store.open();
  for (const source of [{ ...config.source, options: { changed: true } }, { ...config.source, export: 'another' }, { ...config.source, module: path.join(root, 'another.cjs') }]) {
    await assert.rejects(new ReceiverStore({ ...config, source }).open(), { code: 'LISTENER_CONFIG_CHANGED' });
  }
  await atomicJson(configFile, { ...(await readJson(configFile)), debounceMs: 1 });
  await assert.rejects(loadConfig(configFile), { code: 'INVALID_CONFIG' });
});

for (const checkpoint of ['before-confirm', 'after-confirm']) test('进程崩溃恢复：' + checkpoint, async t => {
  const { config, root } = await fixture(t), marker = path.join(root, 'confirmed');
  const sourceModule = path.resolve(__dirname, '../scripts/receiver-source.cjs');
  const code = `const fs=require('node:fs'); const {createReceiverSource}=require(${JSON.stringify(sourceModule)});
    const config=${JSON.stringify(config)};
    const source=createReceiverSource(config,{openReceiver:async()=>({read:async()=>({batches:[{id:'crash',payload:[1,2]}]}),confirm:async()=>{${checkpoint === 'after-confirm' ? `fs.writeFileSync(${JSON.stringify(marker)},'yes');` : ''}process.exit(19)},close:async()=>{}})});
    (async()=>{const store=source.createStore();await store.open();await source.collect(await source.connect(),store,()=>{});})().catch(e=>{console.error(e);process.exit(1)});`;
  const crashed = spawnSync(process.execPath, ['-e', code], { encoding: 'utf8' });
  assert.equal(crashed.status, 19, crashed.stderr);
  const receiver = { read: async () => ({ batches: await fs.access(marker).then(() => [], () => [{ id: 'crash', payload: [1, 2] }]) }), confirm: async () => { await fs.writeFile(marker, 'yes'); return true; }, close: async () => {} };
  const source = createReceiverSource(config, { openReceiver: async () => receiver }), store = source.createStore(); await store.open();
  await source.collect(await source.connect(), store, () => {});
  assert.equal(store.batches.size, 1);
  let notified = 0;
  const queue = { notify: async event => { notified++; return { threadId: event.threadId, queuedMessageId: 'receipt' }; } };
  await deliver(store, queue, config, () => {});
  const restored = new ReceiverStore(config); await restored.open(); await deliver(restored, queue, config, () => {});
  assert.equal(notified, 1);
});

test('事件持久顺序控制未知通知阻塞；核对回执后推进下一个事件', async t => {
  const { config } = await fixture(t), store = new ReceiverStore(config); await store.open();
  const first = await store.acceptBatch({ id: 'first' }), second = await store.acceptBatch({ id: 'second' });
  let notified = 0;
  await deliver(store, { notify: async () => { notified++; throw new Error('lost receipt'); } }, config, () => {});
  const restored = new ReceiverStore(config); await restored.open();
  await deliver(restored, { notify: async () => { notified++; } }, config, () => {});
  assert.equal(notified, 1); assert.deepEqual(restored.orderedEvents().map(event => event.eventId), [first.eventId, second.eventId]);
  await fs.mkdir(path.join(config.stateDir, 'consumer'));
  await atomicJson(path.join(config.stateDir, 'consumer', first.eventId + '.json'), { eventId: first.eventId, threadId: TARGET, outcome: 'completed' });
  await deliver(restored, { notify: async event => { notified++; assert.equal(event.eventId, second.eventId); return { threadId: TARGET, queuedMessageId: 'ok' }; } }, config, () => {});
  assert.equal(notified, 2); assert.equal(restored.receipts.get(first.eventId).state, 'handled');
});

test('停止保存最后输入并关闭连接，保留来源订阅；关闭失败对外可见', { skip: process.platform !== 'win32' }, async t => {
  const { config } = await fixture(t), controller = new AbortController(); let reads = 0, closed = 0, stopped = 0;
  const source = createReceiverSource(config, { openReceiver: async () => ({ read: async () => { if (++reads === 1) controller.abort(); return { batches: reads === 2 ? [{ id: 'last' }] : [] }; }, confirm: async () => true,
    close: async () => { closed++; }, stop: async () => { stopped++; } }) });
  await run(config, { source, signal: controller.signal, queue: { check: async () => {}, notify: async () => { throw new Error('unexpected'); } }, emit: () => {} });
  assert.equal(reads, 2); assert.equal(closed, 1); assert.equal(stopped, 0);
  const restored = source.createStore(); await restored.open(); assert.equal(restored.batches.size, 1);
  const failing = createReceiverSource(config, { openReceiver: async () => ({ read: async () => { throw new Error('source down'); }, confirm: async () => true, close: async () => { throw new Error('close failed'); } }) });
  await assert.rejects(run(config, { source: failing, queue: { check: async () => {} }, emit: () => {} }), { code: 'SOURCE_CLEANUP_FAILED' });
  assert.equal((await status(config)).state, 'failed');
  assert.equal(await readJson(path.join(config.stateDir, 'listener.lock')), null);
});

test('Windows 内核锁阻止竞争进程，崩溃后保留持久状态并可恢复锁', { skip: process.platform !== 'win32', timeout: 10000 }, async t => {
  const { config } = await fixture(t), moduleFile = path.resolve(__dirname, '../scripts/runtime.cjs');
  const lock = await acquireLock(config);
  const contender = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(moduleFile)}).acquireLock(${JSON.stringify(config)}).then(()=>process.exit(1)).catch(e=>{process.stdout.write(e.code);process.exit(0)});`], { encoding: 'utf8' });
  assert.equal(contender.status, 0); assert.equal(contender.stdout, 'LISTENER_ALREADY_RUNNING');
  await lock.release();
  const child = spawn(process.execPath, ['-e', `require(${JSON.stringify(moduleFile)}).acquireLock(${JSON.stringify(config)}).then(()=>{process.stdout.write('locked');setInterval(()=>{},1000)});`], { stdio: ['ignore', 'pipe', 'pipe'] });
  await once(child.stdout, 'data'); child.kill(); await once(child, 'exit');
  const recovered = await acquireLock(config); await recovered.release();
});

test('容量拒绝发生在来源确认前，保留已有持久事件', async t => {
  const { config } = await fixture(t), source = createReceiverSource(config, { openReceiver: async () => ({
    read: async () => ({ batches: [{ id: 'oversize', value: 'x'.repeat(64 * 1024 * 1024) }] }),
    confirm: async () => { throw new Error('capacity must not confirm'); }, close: async () => {}
  }) });
  const store = source.createStore(); await store.open(); await store.acceptBatch({ id: 'kept' });
  await assert.rejects(source.collect(await source.connect(), store, () => {}), { code: 'EVENT_CAPACITY_REACHED' });
  const restored = new ReceiverStore(config); await restored.open();
  assert.deepEqual(restored.orderedEvents().map(event => event.payload.id), ['kept']);
});

test('CLI 接受持久交接回执，重试要求核对证据并拒绝已有消费者结果', { skip: process.platform !== 'win32' }, async t => {
  const { config, configFile } = await fixture(t), store = new ReceiverStore(config); await store.open();
  const event = await store.acceptBatch({ id: 'handoff' });
  await store.receipt(event.eventId, { state: 'unknown' });
  const args = ['--config', configFile, '--event-id', event.eventId];
  await assert.rejects(main(['retry', ...args, '--apply']), { code: 'RECONCILIATION_REASON_REQUIRED' });
  await main(['retry', ...args, '--reason', 'recipient confirms absent and no pending send', '--apply']);
  assert.equal((await readJson(store.receiptPath(event.eventId))).reconciliationReason, 'recipient confirms absent and no pending send');
  await main(['ack', ...args, '--outcome', 'accepted', '--apply']);
  assert.equal((await readJson(path.join(config.stateDir, 'consumer', event.eventId + '.json'))).outcome, 'accepted');
  await store.receipt(event.eventId, { state: 'unknown' });
  await assert.rejects(main(['retry', ...args, '--reason', 'checked', '--apply']), { code: 'EVENT_ALREADY_HANDLED' });
});

test('历史来源缺口在后续读取成功时保持可见阻塞状态', { skip: process.platform !== 'win32' }, async t => {
  const { config } = await fixture(t), store = new ReceiverStore(config); await store.open();
  await store.markCoverageError(new Error('unresolved gap'));
  const controller = new AbortController(), observed = [];
  const source = createReceiverSource(config, { openReceiver: async () => ({ read: async () => ({ batches: [] }), confirm: async () => true, close: async () => {} }) });
  await run(config, { source, signal: controller.signal, queue: { check: async () => {} }, emit: value => { observed.push(value); if (value.event === 'source-coverage-blocked') controller.abort(); } });
  assert.ok(observed.some(value => value.event === 'source-coverage-blocked'));
  assert.ok(!observed.some(value => value.event === 'listening'));
  assert.equal((await status(config)).sourceCoverageError.error.message, 'unresolved gap');
});

test('公开来源核对命令保留证据且幂等，新错误重新阻塞', { skip: process.platform !== 'win32' }, async t => {
  const { config, configFile } = await fixture(t), store = new ReceiverStore(config); await store.open();
  await store.markCoverageError(new Error('gap'));
  const original = store.coverageError;
  await assert.rejects(main(['reconcile-source', '--config', configFile, '--apply']), { code: 'RECONCILIATION_REASON_REQUIRED' });
  const args = ['reconcile-source', '--config', configFile, '--reason', 'source owner verified recovered range 1..5'];
  await main(args);
  const previewed = new ReceiverStore(config); await previewed.open(); assert.equal(previewed.coverageError.coverageId, original.coverageId);
  await main([...args, '--apply']); await main([...args, '--apply']);
  const resolved = new ReceiverStore(config); await resolved.open(); assert.equal(resolved.coverageError, null);
  assert.equal((await readJson(path.join(config.stateDir, 'coverage-error.json'))).coverageId, original.coverageId);
  assert.equal((await readJson(path.join(config.stateDir, 'coverage-resolution.json'))).reason, 'source owner verified recovered range 1..5');
  await resolved.markCoverageError(new Error('gap'));
  const restored = new ReceiverStore(config); await restored.open();
  assert.notEqual(restored.coverageError.coverageId, original.coverageId);
});

test('状态目录不能放入其他已安装技能内部', async t => {
  const { root, configFile } = await fixture(t), other = path.join(root, 'another-skill');
  await fs.mkdir(other); await fs.writeFile(path.join(other, 'SKILL.md'), 'skill entry');
  const raw = await readJson(configFile); raw.stateDir = path.join(other, 'state'); await atomicJson(configFile, raw);
  await assert.rejects(loadConfig(configFile), { code: 'INVALID_STATE_DIR' });
});
