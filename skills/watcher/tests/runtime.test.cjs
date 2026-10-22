const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { loadConfig } = require('../scripts/config.cjs');
const { InboxStore, createInboxSource } = require('../scripts/inbox-source.cjs');
const { run } = require('../scripts/runtime.cjs');
const { atomicJson, readJson } = require('../scripts/persistence.cjs');
const { NativeCodexQueue } = require('../scripts/codex-queue.cjs');
const TARGET = '11111111-1111-4111-8111-111111111111';

async function fixture(t, extra = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'watcher-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const directory = path.join(root, 'inbox'); await fs.mkdir(directory);
  const configFile = path.join(root, 'config.json');
  await atomicJson(configFile, { version: 2, source: { kind: 'json-inbox', id: 'local-test', directory }, stateDir: path.join(root, 'runtime'), targetThreadId: TARGET,
    wake: { executable: process.execPath }, pollMs: 250, debounceMs: 0, ...extra });
  return { root, configFile, config: await loadConfig(configFile) };
}

test('来源和状态目录必须分离，目标身份不能来自事件正文', async t => {
  const { configFile, config } = await fixture(t);
  const raw = await readJson(configFile); raw.stateDir = config.source.directory;
  await atomicJson(configFile, raw);
  await assert.rejects(loadConfig(configFile), { code: 'INVALID_CONFIG' });
  const store = new InboxStore(config); await store.open();
  await assert.rejects(store.acceptFile('x.json', JSON.stringify({ id: '1', text: 'task', threadId: TARGET }), new Date().toISOString()), { code: 'INVALID_SOURCE_RECORD' });
  assert.equal(store.records.size, 0);
});

test('真实文件采集在投递前持久化，已有输入显式作为未消费事件处理', async t => {
  const { config } = await fixture(t);
  await atomicJson(path.join(config.source.directory, 'a.json'), { id: 'a', groupKey: 'topic', text: 'first' });
  const source = createInboxSource(config), store = source.createStore(); await store.open();
  const connection = await source.connect();
  const checkedAt = await source.collect(connection, store, () => {});
  assert.equal((await fs.readdir(path.join(config.stateDir, 'messages'))).length, 1);
  assert.ok(Number.isFinite(checkedAt));
  assert.equal((await fs.readdir(path.join(config.stateDir, 'batches'))).length, 1);
  const [event] = store.orderedEvents();
  assert.equal(event.sourceId, 'local-test'); assert.equal(event.threadId, TARGET);
  assert.equal(event.items[0].text, 'first'); assert.equal(event.accountId, undefined);
  assert.equal((await readJson(store.batchPath(event.eventId))).eventId, event.eventId);
});

test('按分组滚动静默窗口，边界两侧分为不同轮次', async t => {
  const { config } = await fixture(t);
  const start = Date.now(), store = new InboxStore(config); await store.open();
  const accept = (id, groupKey, at) => store.acceptFile(id + '.json', JSON.stringify({ id, groupKey, text: id }), new Date(start + at).toISOString());
  await accept('a', 'one', 0); await accept('b', 'one', 20000); await accept('c', 'two', 10000);
  assert.equal((await store.createBatches({ quietMs: 30000, now: start + 39999 })).length, 0);
  const first = await store.createBatches({ quietMs: 30000, now: start + 40000 });
  assert.deepEqual(first.map(item => item.items.map(record => record.id)), [['c']]);
  await accept('d', 'one', 50000);
  const second = await store.createBatches({ quietMs: 30000, now: start + 80000 });
  assert.deepEqual(second.map(item => item.items.map(record => record.id)), [['a', 'b'], ['d']]);
});

test('唯一 ID 去重且已采集文件不可改写，重启保留事件 ID 和投递回执', async t => {
  const { config } = await fixture(t), store = new InboxStore(config); await store.open();
  const raw = JSON.stringify({ id: 'a', text: 'task' }), at = new Date().toISOString();
  assert.equal(await store.acceptFile('a.json', raw, at), true);
  assert.equal(await store.acceptFile('a.json', raw, at), false);
  await assert.rejects(store.acceptFile('a.json', JSON.stringify({ id: 'a', text: 'changed' }), at), { code: 'SOURCE_RECORD_CHANGED' });
  await assert.rejects(store.acceptFile('b.json', JSON.stringify({ id: 'a', text: 'changed' }), at), { code: 'SOURCE_ID_CONFLICT' });
  const [event] = await store.createBatches(); await store.receipt(event.eventId, { state: 'queued' });
  const restored = new InboxStore(config); await restored.open();
  assert.equal(restored.records.size, 1); assert.equal(restored.batches.size, 1);
  assert.equal(restored.receipts.get(event.eventId).state, 'queued'); assert.equal(restored.pendingRecords().length, 0);
});

test('空闲运行只采集文件，不加载任务分发或调用通知模型', { skip: process.platform !== 'win32' }, async t => {
  const { config } = await fixture(t), source = createInboxSource(config), controller = new AbortController();
  const collect = source.collect.bind(source); let captures = 0, notifications = 0;
  source.collect = async (...args) => { const value = await collect(...args); if (++captures === 3) controller.abort(); return value; };
  await run(config, { source, signal: controller.signal, queue: { check: async () => {}, notify: async () => notifications++ }, emit: () => {} });
  assert.ok(captures >= 3); assert.equal(notifications, 0);
  assert.ok(!Object.keys(require.cache).some(file => /[\\/]icenter[\\/]scripts[\\/]|[\\/]dispatcher[\\/]scripts[\\/]/.test(file)));
});

test('固定目标接收一轮，重启不重复通知', { skip: process.platform !== 'win32' }, async t => {
  const { config } = await fixture(t); await atomicJson(path.join(config.source.directory, 'a.json'), { id: 'a', text: 'one task' });
  let notifications = 0;
  const first = new AbortController();
  await run(config, { source: createInboxSource(config), signal: first.signal, emit: () => {}, queue: { check: async () => {}, notify: async batch => {
    notifications++; first.abort(); return { queuedMessageId: 'receipt', threadId: batch.threadId };
  } } });
  const second = new AbortController(), source = createInboxSource(config), collect = source.collect.bind(source); let captures = 0;
  source.collect = async (...args) => { const value = await collect(...args); if (++captures === 3) second.abort(); return value; };
  await run(config, { source, signal: second.signal, emit: () => {}, queue: { check: async () => {}, notify: async () => notifications++ } });
  assert.equal(notifications, 1);
});

test('投递超时保留未知，不重发且后续事件保持等待', { skip: process.platform !== 'win32' }, async t => {
  const { config } = await fixture(t);
  await atomicJson(path.join(config.source.directory, 'a.json'), { id: 'a', text: 'first' });
  await atomicJson(path.join(config.source.directory, 'b.json'), { id: 'b', text: 'second' });
  const controller = new AbortController(), source = createInboxSource(config), collect = source.collect.bind(source); let captures = 0, notifications = 0;
  source.collect = async (...args) => { const value = await collect(...args); if (++captures === 3) controller.abort(); return value; };
  await run(config, { source, signal: controller.signal, emit: () => {}, queue: { check: async () => {}, notify: async () => { notifications++; throw new Error('receipt lost'); } } });
  const store = new InboxStore(config); await store.open();
  assert.equal(notifications, 1); assert.equal(store.summary().uncertainBatches.length, 1); assert.equal(store.summary().pendingBatches, 1);
});

test('来源采集不能沿目录联接读取其他目录中的 JSON', { skip: process.platform !== 'win32' }, async t => {
  const { root, config } = await fixture(t), other = path.join(root, 'other'); await fs.mkdir(other);
  await fs.symlink(other, path.join(config.source.directory, 'escape.json'), 'junction');
  const source = createInboxSource(config), store = source.createStore(); await store.open();
  await assert.rejects(source.collect(await source.connect(), store, () => {}), { code: 'INVALID_SOURCE_RECORD' });
});

test('原生队列只执行配置的程序及参数，拒绝没有匹配的排队回执', async () => {
  const queue = new NativeCodexQueue(process.execPath, { run: async (exe, argv, options) => {
    assert.equal(exe, process.execPath); assert.equal(options.shell, undefined); assert.deepEqual(argv.slice(0, 3), ['queue', '--thread', TARGET]);
    return { stdout: 'Queued message 99999999-9999-4999-8999-999999999999 for thread ' + TARGET + '.' };
  } });
  assert.equal((await queue.enqueue(TARGET, 'data')).threadId, TARGET);
  queue.run = async () => ({ stdout: 'not a receipt' });
  await assert.rejects(queue.enqueue(TARGET, 'data'), { code: 'NOTIFY_UNKNOWN' });
});

test('连接后目录被替换，采集不能接入替换目录的事件', async t => {
  const { root, config } = await fixture(t), source = createInboxSource(config), store = source.createStore(); await store.open();
  const connection = await source.connect();
  await fs.rename(config.source.directory, path.join(root, 'original-inbox'));
  await fs.mkdir(config.source.directory);
  await atomicJson(path.join(config.source.directory, 'foreign.json'), { id: 'foreign', text: 'outside original source identity' });
  await assert.rejects(source.collect(connection, store, () => {}), { code: 'SOURCE_PATH_CHANGED' });
  assert.equal(store.records.size, 0);
});

test('连接后来源路径改成目录联接，不沿联接采集', { skip: process.platform !== 'win32' }, async t => {
  const { root, config } = await fixture(t), source = createInboxSource(config), store = source.createStore(); await store.open();
  const connection = await source.connect(), other = path.join(root, 'other-inbox'); await fs.mkdir(other);
  await fs.rename(config.source.directory, path.join(root, 'original-inbox'));
  await fs.symlink(other, config.source.directory, 'junction');
  await atomicJson(path.join(other, 'foreign.json'), { id: 'foreign', text: 'outside original source identity' });
  await assert.rejects(source.collect(connection, store, () => {}), { code: 'SOURCE_PATH_CHANGED' });
  assert.equal(store.records.size, 0);
});
