const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { imagePageOperation } = require('../image-page.cjs');
const { SdkSession } = require('../sdk.cjs');
const { withMessageContent } = require('../message-content.cjs');
const { releaseImage } = require('../image-output.cjs');
const { clientVersion } = require('../client-version.json');
const accountId = 'sip:owner@example.test', chatId = 'sip:peer@example.test', messageId = 'image-id';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j1ZkAAAAASUVORK5CYII=', 'base64');
const digest = value => createHash('sha256').update(String(value)).digest('hex');

function fixture({ version = clientVersion, cached = ['original', 'large', 'thumbnail'], bad = [], plain = [], download, decrypt, sourceBytes = png.length } = {}) {
  const calls = { query: 0, download: [], decrypt: [] }, cache = new Set(cached);
  const state = { userInfo: { userId: accountId }, chatInfo: { chatSelectUri: 'unrelated', draft: 'human draft' } };
  class Message {
    constructor() { this.msgId = messageId; this.chatRoomUri = chatId; this.data_owner = accountId; this.msgType = 3; this.originImageServerPath = 'registered-original'; }
    hasMessageAttributeWithDrawal() { return !!this.withdrawn; }
    hasMessageAttributeBurnAfterReading() { return !!this.ephemeral; }
    hasMessageAttributeOriginalImage() { return !!this.originImageServerPath; }
    getOriginImageLocalPath() { return '/cache/original'; }
    getLargeImagePath() { return '/cache/large'; }
    getThumbnailImagePath() { return '/cache/thumbnail'; }
  }
  class QueryItem { constructor(id) { this.msgId = id; } }
  const message = new Message();
  class Messages {
    async queryMsgByMsgIdList(items) { calls.query++; assert.equal(items[0].msgId, messageId); return { success: 1, aMessagesList: [message] }; }
    async downLoadMessageAttachs(...args) {
      calls.download.push(args);
      if (download) return download(args, { state, message, cache });
      cache.add(args[0] === 4 ? 'original' : args[0] === 3 ? 'large' : 'thumbnail'); return message;
    }
  }
  class Decoder {
    async decryptFileToBuf(file) {
      const variant = path.posix.basename(file); calls.decrypt.push(variant);
      if (decrypt) await decrypt({ state, message, variant });
      return bad.includes(variant) ? null : png;
    }
  }
  const loader = { c: { messages: { exports: { a: new Messages() } }, decoder: { exports: { a: new Decoder() } },
    models: { exports: { Message, QueryItem } }, enums: { exports: { n: { TapOrigin: 4, TapSecond: 3, DefaultAttach: 0 } } } }, m: {}, s: 0 };
  const chunks = [], window = { webpackJsonp: chunks };
  chunks.push = entry => { Array.prototype.push.call(chunks, entry); for (const [id, factory] of Object.entries(entry[1])) { loader.m[id] = factory; loader.c[id] = {}; factory({}, {}, loader); } };
  const contract = { messages: { moduleId: 'messages', export: 'a' },
    query: { hash: digest(Messages.prototype.queryMsgByMsgIdList) }, download: { hash: digest(Messages.prototype.downLoadMessageAttachs) },
    decoder: { moduleId: 'decoder', export: 'a', method: 'decryptFileToBuf', hash: digest(Decoder.prototype.decryptFileToBuf) },
    queryType: { moduleId: 'models', export: 'QueryItem', hash: digest(QueryItem) }, messageType: { moduleId: 'models', export: 'Message', hash: digest(Message) },
    downloadType: { moduleId: 'enums', export: 'n', values: { TapOrigin: 4, TapSecond: 3, DefaultAttach: 0 } },
    imageType: 3, maxSourceBytes: 100000, maxOutputBytes: 100000, maxPixels: 100 };
  const context = vm.createContext({ window, Date, Math, document: { querySelector: () => ({ __vue_app__: { config: { globalProperties: { $store: { state } } } } }) },
    process: { argv: ['IS_MAIN_WINDOW'], resourcesPath: '/fixture' },
    require: name => {
      if (name.endsWith('package.json')) return { version };
      if (name === 'fs') return { promises: { stat: async file => {
        if (!cache.has(path.posix.basename(file))) throw Object.assign(new Error('missing'), { code: 'ENOENT' });
        return { isFile: () => true, size: sourceBytes };
      } } };
      if (name === 'electron') return { nativeImage: {
        createFromPath: file => ({ isEmpty: () => !plain.includes(path.posix.basename(file)), getSize: () => ({ width: 1, height: 1 }), toPNG: () => png }),
        createFromBuffer: () => ({ isEmpty: () => false, getSize: () => ({ width: 1, height: 1 }), toPNG: () => png }),
      } };
      return require(name);
    } });
  vm.runInContext('globalThis.operation=' + imagePageOperation.toString(), context);
  return { state, calls, message, contract, loader, window, async call(changes = {}) {
    context.input = { accountId, chatId, messageId, variant: 'best', apply: true, timeoutMs: 15000, ...changes }; context.contract = contract;
    return JSON.parse(JSON.stringify(await vm.runInContext('operation(input,contract)', context)));
  } };
}

test('版本差异不阻止图片预览和缓存读取，执行不触碰聊天和草稿', async () => {
  const f = fixture({ version: 'unverified' });
  const preview = await f.call({ apply: false });
  assert.equal(preview.value.state, 'preview'); assert.equal(preview.value.contentRead, false);
  assert.deepEqual(f.calls.decrypt, []); assert.deepEqual(f.calls.download, []);
  const result = await f.call();
  assert.equal(result.value.state, 'exported'); assert.equal(result.value.variant, 'original'); assert.equal(result.value.mimeType, 'image/png');
  assert.equal(result.value.contentRead, false); assert.equal(result.value.width, 1); assert.equal(result.value.base64, png.toString('base64'));
  assert.equal(f.state.chatInfo.chatSelectUri, 'unrelated'); assert.equal(f.state.chatInfo.draft, 'human draft');
  assert.equal(f.window.__codexIcenterSdkCall, undefined); assert.equal(f.window.webpackJsonp.length, 0); assert.deepEqual(Object.keys(f.loader.m), []);
});
test('best 返回实际缓存清晰度，明确请求原图不返回缩略图', async () => {
  const low = fixture({ cached: ['thumbnail'] });
  assert.equal((await low.call()).value.variant, 'thumbnail'); assert.deepEqual(low.calls.download, []);
  const cold = fixture({ cached: [] });
  const original = await cold.call({ variant: 'original' });
  assert.equal(original.value.variant, 'original'); assert.equal(original.value.source, 'client-download');
  assert.deepEqual(cold.calls.download.map(args => args[0]), [3, 4]);
  assert.ok(cold.calls.download.every(args => args[1] === chatId && args[2] === messageId && args[3] === '' && args[4] === ''));
  const noOriginal = fixture({ cached: ['thumbnail'] }); noOriginal.message.originImageServerPath = '';
  assert.equal((await noOriginal.call({ variant: 'original' })).error.code, 'IMAGE_VARIANT_UNAVAILABLE'); assert.deepEqual(noOriginal.calls.download, []);
});
test('无缓存的大图使用客户端 TapSecond，下载返回后重查原消息', async () => {
  const f = fixture({ cached: [] });
  const result = await f.call({ variant: 'large' });
  assert.equal(result.value.variant, 'large'); assert.equal(f.calls.download.length, 1); assert.equal(f.calls.download[0][0], 3); assert.equal(f.calls.query, 2);
  assert.equal((await f.call({ variant: 'large' })).value.source, 'client-cache'); assert.equal(f.calls.download.length, 1);
});
test('明文缓存直接解码，不把普通图片误报为解密失败',async()=>{
  const f=fixture({plain:['original']});
  assert.equal((await f.call()).value.variant,'original');assert.deepEqual(f.calls.decrypt,[]);
});
test('图片归属、类型、撤回与临时消息限制在解码前核对', async () => {
  for (const [change, code] of [[{ data_owner: 'other' }, 'MESSAGE_SCOPE_MISMATCH'], [{ chatRoomUri: 'other' }, 'MESSAGE_SCOPE_MISMATCH'],
    [{ msgId: 'other' }, 'MESSAGE_SCOPE_MISMATCH'], [{ msgType: 25 }, 'MESSAGE_NOT_IMAGE'], [{ withdrawn: true }, 'IMAGE_REVOKED'], [{ ephemeral: true }, 'IMAGE_RESTRICTED']]) {
    const f = fixture(); Object.assign(f.message, change);
    assert.equal((await f.call()).error.code, code); assert.deepEqual(f.calls.decrypt, []); assert.deepEqual(f.calls.download, []);
  }
});
test('已有调用占用、解码期间账户变化及契约变化不导出图片', async () => {
  const busy = fixture(); busy.window.__codexIcenterSdkCall = 'other-owner';
  assert.equal((await busy.call()).error.code, 'SDK_BUSY'); assert.equal(busy.window.__codexIcenterSdkCall, 'other-owner');
  const changed = fixture({ decrypt: ({ state }) => { state.userInfo.userId = 'other'; } });
  assert.equal((await changed.call()).error.code, 'ACCOUNT_CHANGED'); assert.equal(changed.window.__codexIcenterSdkCall, undefined);
  const contract = fixture(); contract.contract.decoder.hash = 'different';
  assert.equal((await contract.call()).error.code, 'SDK_CONTRACT_CHANGED'); assert.equal(contract.calls.query, 0);
});
test('解密失败、过大缓存和未知下载不伪装成图片，不自动重试', async () => {
  const corrupt = fixture({ bad: ['original', 'large', 'thumbnail'] });
  assert.equal((await corrupt.call()).error.code, 'IMAGE_DECODE_FAILED'); assert.equal(corrupt.calls.download.length, 0);
  const oversized = fixture({ sourceBytes: 100001 });
  assert.equal((await oversized.call()).error.code, 'IMAGE_TOO_LARGE'); assert.equal(oversized.calls.decrypt.length, 0);
  const unknown = fixture({ cached: [], download: () => { throw Error('native response lost'); } });
  assert.equal((await unknown.call()).error.code, 'IMAGE_DOWNLOAD_UNKNOWN'); assert.equal(unknown.calls.download.length, 1);
  assert.equal(unknown.window.__codexIcenterSdkCall, undefined);
  const wrong = fixture({ cached: [], download: (_args, { message }) => ({ ...message, msgId: 'wrong' }) });
  assert.equal((await wrong.call()).error.code, 'MESSAGE_SCOPE_MISMATCH');
});

async function output(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'icenter-image-output-'));
  t.after(async () => { assert.equal(path.dirname(root), path.resolve(os.tmpdir())); assert.ok(path.basename(root).startsWith('icenter-image-output-')); await fs.rm(root, { recursive: true, force: true }); });
  return path.join(root, 'image.png');
}
function imageResult(extra = {}) {
  return { state: 'exported', accountId, chatId, messageId, requestedVariant: 'best', variant: 'large', mimeType: 'image/png', width: 1, height: 1, bytes: png.length, base64: png.toString('base64'), contentRead: false, ...extra };
}
test('公开读图接口保存 PNG 和哈希，结果不携带二进制，已有输出不覆盖', async t => {
  const outputPath = await output(t); let calls = 0;
  const sdk = new SdkSession({ evaluate: async (fn, input) => {
    calls++; assert.equal(fn, imagePageOperation); assert.equal(input.accountId, accountId);
    return { ok: true, value: input.apply ? imageResult() : { state: 'preview', accountId, chatId, messageId, requestedVariant: 'best', available: [] } };
  } }, { accountId });
  assert.equal((await sdk.readImage({ chatId, messageId, outputPath })).state, 'preview'); await assert.rejects(fs.access(outputPath), { code: 'ENOENT' });
  const result = await sdk.readImage({ chatId, messageId, outputPath, apply: true });
  assert.deepEqual(await fs.readFile(outputPath), png); assert.equal(result.sha256, createHash('sha256').update(png).digest('hex')); assert.equal(result.base64, undefined);
  assert.equal(result.temporary, false); assert.equal(result.cleanupToken, undefined);
  await assert.rejects(sdk.readImage({ chatId, messageId, outputPath, apply: true }), { code: 'OUTPUT_EXISTS' }); assert.equal(calls, 2);
});
test('未指定路径时在系统临时目录生成图片，消费结束后按回执释放', async () => {
  const sdk = new SdkSession({ evaluate: async (_fn, input) => ({ ok: true, value: input.apply ? imageResult() :
    { state: 'preview', accountId, chatId, messageId, requestedVariant: 'best' } }) }, { accountId });
  const preview = await sdk.readImage({ chatId, messageId });
  assert.equal(preview.outputPath, null); assert.equal(preview.temporary, true); assert.equal(preview.cleanupToken, undefined);
  const result = await sdk.readImage({ chatId, messageId, apply: true });
  try {
    assert.equal(result.temporary, true); assert.equal(path.dirname(path.dirname(result.outputPath)), path.resolve(os.tmpdir()));
    assert.deepEqual(await fs.readFile(result.outputPath), png);
    assert.equal((await releaseImage(result)).state, 'preview'); await fs.access(result.outputPath);
    assert.equal((await releaseImage({ ...result, apply: true })).state, 'released');
    await assert.rejects(fs.access(path.dirname(result.outputPath)), { code: 'ENOENT' });
    assert.equal((await releaseImage({ ...result, apply: true })).state, 'absent');
  } finally { await releaseImage({ ...result, apply: true }); }
});
test('释放仅接受本次临时图片的所有权，不删除保存输出或改动后的文件', async t => {
  const sdk = new SdkSession({ evaluate: async () => ({ ok: true, value: imageResult() }) }, { accountId });
  const result = await sdk.readImage({ chatId, messageId, apply: true });
  try {
    await assert.rejects(releaseImage({ ...result, cleanupToken: '00000000-0000-4000-8000-000000000000', apply: true }), { code: 'IMAGE_OUTPUT_NOT_TEMPORARY' });
    const extra = path.join(path.dirname(result.outputPath), 'keep.txt');
    await fs.writeFile(extra, 'caller-owned');
    await assert.rejects(releaseImage({ ...result, apply: true }), { code: 'IMAGE_OUTPUT_CHANGED' });
    assert.equal(await fs.readFile(extra, 'utf8'), 'caller-owned'); await fs.unlink(extra);
    await fs.writeFile(result.outputPath, 'changed');
    await assert.rejects(releaseImage({ ...result, apply: true }), { code: 'IMAGE_OUTPUT_CHANGED' });
    assert.equal(await fs.readFile(result.outputPath, 'utf8'), 'changed'); await fs.writeFile(result.outputPath, png);
    const retainedPath = await output(t), saved = await sdk.readImage({ chatId, messageId, outputPath: retainedPath, apply: true });
    await assert.rejects(releaseImage({ ...saved, cleanupToken: result.cleanupToken, apply: true }), { code: 'IMAGE_OUTPUT_NOT_TEMPORARY' });
    assert.deepEqual(await fs.readFile(retainedPath), png);
  } finally { await releaseImage({ ...result, apply: true }); }
});
test('临时目录替换成链接时拒绝清理，链接目标保持原内容', async t => {
  const sdk = new SdkSession({ evaluate: async () => ({ ok: true, value: imageResult() }) }, { accountId });
  const result = await sdk.readImage({ chatId, messageId, apply: true });
  await releaseImage({ ...result, apply: true });
  const foreignFile = await output(t); await fs.writeFile(foreignFile, png);
  const directory = path.dirname(result.outputPath);
  await fs.symlink(path.dirname(foreignFile), directory, process.platform === 'win32' ? 'junction' : 'dir');
  try {
    await assert.rejects(releaseImage({ ...result, apply: true }), { code: 'IMAGE_OUTPUT_NOT_TEMPORARY' });
    assert.deepEqual(await fs.readFile(foreignFile), png);
  } finally { await fs.unlink(directory); }
});
test('图片写入中断时清理独占创建的部分输出，不遗留临时文件', async t => {
  const open = fs.open, owned = [];
  t.mock.method(fs, 'open', async (...args) => {
    const handle = await open(...args); owned.push(args[0]);
    return { writeFile: async bytes => { await handle.writeFile(bytes.subarray(0, 8)); throw Object.assign(Error('disk full'), { code: 'ENOSPC' }); }, close: () => handle.close() };
  });
  const sdk = new SdkSession({ evaluate: async () => ({ ok: true, value: imageResult() }) }, { accountId });
  await assert.rejects(sdk.readImage({ chatId, messageId, apply: true }), { code: 'IMAGE_OUTPUT_FAILED' });
  assert.equal(owned.length, 1); await assert.rejects(fs.access(path.dirname(owned[0])), { code: 'ENOENT' });
});
test('错误图片结果、断线及非法参数不创建虚假文件', async t => {
  const outputPath = await output(t);
  for (const extra of [{ accountId: 'other' }, { messageId: 'other' }, { base64: 'bm90LWltYWdl', bytes: 9 }, { width: 2 }, { width: 0 }, { variant: 'thumbnail', requestedVariant: 'original' }]) {
    const sdk = new SdkSession({ evaluate: async () => ({ ok: true, value: imageResult(extra) }) }, { accountId });
    await assert.rejects(sdk.readImage({ chatId, messageId, outputPath, apply: true })); await assert.rejects(fs.access(outputPath), { code: 'ENOENT' });
  }
  const invalid = new SdkSession({ evaluate: () => assert.fail('Invalid input must not reach client.') }, { accountId });
  for (const change of [{ variant: 'guess' }, { outputPath: 'relative.png' }, { outputPath: outputPath + '.jpg' }, { apply: 'true' }, { timeoutMs: 0 }]) {
    await assert.rejects(invalid.readImage({ chatId, messageId, outputPath, ...change }), { code: 'INVALID_ARGUMENT' });
  }
  let calls = 0; const broken = new SdkSession({ evaluate: async () => { calls++; throw Object.assign(Error('lost'), { code: 'CDP_DISCONNECTED' }); } }, { accountId });
  await assert.rejects(broken.readImage({ chatId, messageId, outputPath, apply: true }), { code: 'IMAGE_READ_UNKNOWN' }); assert.equal(calls, 1);
});
test('图片消息描述保留空正文与身份，文本消息不增加附件', () => {
  const image = withMessageContent({ id: 'image', clientType: 3, text: '' });
  assert.deepEqual(image.attachments, [{ kind: 'image', state: 'not-read' }]); assert.equal(image.text, ''); assert.equal(image.id, 'image');
  assert.equal(withMessageContent({ id: 'text', clientType: 1, text: 'hello' }).attachments, undefined);
});
