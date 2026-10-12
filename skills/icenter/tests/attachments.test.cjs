const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { downloadFile } = require('../scripts/attachments.cjs');

async function fixture(t, overrides = {}) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'icenter-attachments-'));
  t.after(async () => { for (const name of await fs.readdir(directory)) await fs.unlink(path.join(directory, name)); await fs.rmdir(directory); });
  const message = { msgId: 'file-id', chatRoomUri: 'chat', getFileName: () => '文件.txt' };
  const calls = [], queue = [];
  const service = { async downLoadMessageAttachs(...args) {
    calls.push(args);
    await fs.writeFile(args[4], '下载原文件\n');
    return { ...message, getFilePath: () => args[4], isFileTransSuccess: () => true, ...overrides.reply };
  } };
  const modules = { '1bb8': { a: service }, '14ce': { n: { TapFile: 4 } } };
  const loader = id => modules[id]; loader.c = { 0: {} }; loader.m = { 0: () => {} }; loader.s = 0;
  queue.push = payload => { Array.prototype.push.call(queue, payload); for (const [id, factory] of Object.entries(payload[1])) { loader.s = id; loader.c[id] = {}; loader.m[id] = factory; factory(loader.c[id], {}, loader); } };
  const context = { window: { webpackJsonp: queue }, process: { resourcesPath: 'client' },
    require: name => name.endsWith('/app.asar/package.json') ? { version: overrides.version || '12.1.0' } : require(name),
    document: { querySelector: () => ({ __vue_app__: { config: { globalProperties: { $store: { state: { messageInfo: { messageList: [message] } } } } } } }) } };
  const session = { scope: { accountId: 'self', chatId: 'chat' }, async run(task, ...args) {
    return vm.runInNewContext(`(${task.toString()})(tools,...args)`, { ...context, tools: { check: () => ({ ...session.scope }) }, args });
  } };
  return { session, outputPath: path.join(directory, 'output.txt'), calls, loader, queue, message, service };
}

test('文件下载预览只定位消息，不创建文件或调用服务', async t => {
  const f = await fixture(t);
  const result = await downloadFile(f.session, { messageId: 'file-id', outputPath: f.outputPath });
  assert.equal(result.state, 'preview'); assert.equal(result.fileName, '文件.txt');
  await assert.rejects(fs.stat(f.outputPath), { code: 'ENOENT' });
  assert.equal(f.calls.length, 0); assert.equal(f.queue.length, 0);
});
test('下载调用已有客户端服务，确认消息、路径和实际文件，清理临时模块', async t => {
  const f = await fixture(t);
  const result = await downloadFile(f.session, { messageId: 'file-id', outputPath: f.outputPath, apply: true });
  assert.equal(result.state, 'downloaded'); assert.equal(await fs.readFile(f.outputPath, 'utf8'), '下载原文件\n');
  assert.deepEqual(f.calls[0].slice(0, 5), [4, 'chat', 'file-id', '', f.outputPath]);
  assert.equal(result.bytes, Buffer.byteLength('下载原文件\n'));
  assert.equal(f.queue.length, 0); assert.deepEqual(Object.keys(f.loader.c), ['0']); assert.deepEqual(Object.keys(f.loader.m), ['0']); assert.equal(f.loader.s, 0);
});
test('已有输出保留，拒绝覆盖且不调用下载服务', async t => {
  const f = await fixture(t); await fs.writeFile(f.outputPath, '原有文件');
  await assert.rejects(downloadFile(f.session, { messageId: 'file-id', outputPath: f.outputPath, apply: true }), { code: 'OUTPUT_EXISTS' });
  assert.equal(await fs.readFile(f.outputPath, 'utf8'), '原有文件'); assert.equal(f.calls.length, 0);
});
test('参数、版本及消息作用域不匹配时不创建目标', async t => {
  const f = await fixture(t, { version: 'other' });
  await assert.rejects(downloadFile(f.session, { messageId: 'file-id', outputPath: 'relative.txt' }), { code: 'INVALID_ARGUMENT' });
  await assert.rejects(downloadFile(f.session, { messageId: 'file-id', outputPath: f.outputPath, apply: true }), { code: 'UNSUPPORTED_VERSION' });
  const current = await fixture(t); current.message.chatRoomUri = 'other';
  await assert.rejects(downloadFile(current.session, { messageId: 'file-id', outputPath: current.outputPath, apply: true }), { code: 'MESSAGE_NOT_FOUND' });
  await assert.rejects(fs.stat(f.outputPath), { code: 'ENOENT' }); await assert.rejects(fs.stat(current.outputPath), { code: 'ENOENT' });
});
test('回复身份或传输失败时保留输出，报告未知且不重试', async t => {
  for (const reply of [{ msgId: 'other' }, { chatRoomUri: 'other' }, { isFileTransSuccess: () => false }, { getFilePath: () => 'other' }]) {
    const f = await fixture(t, { reply });
    await assert.rejects(downloadFile(f.session, { messageId: 'file-id', outputPath: f.outputPath, apply: true }), { code: 'DOWNLOAD_UNKNOWN' });
    assert.equal(f.calls.length, 1); assert.equal(await fs.readFile(f.outputPath, 'utf8'), '下载原文件\n');
  }
});
test('服务契约变化保留失败状态，撤销临时加载且不执行下载', async t => {
  const f = await fixture(t); f.service.downLoadMessageAttachs = null;
  await assert.rejects(downloadFile(f.session, { messageId: 'file-id', outputPath: f.outputPath, apply: true }), { code: 'DOWNLOAD_UNKNOWN' });
  assert.equal(f.calls.length, 0); assert.equal(f.queue.length, 0); assert.deepEqual(Object.keys(f.loader.m), ['0']);
});
