const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { nativePageOperation } = require('../native-page.cjs');
const accountId = 'sip:owner@example.test', chatId = 'sip:self@example.test';
const input = { accountId, chatId, text: 'A plain message', apply: true };
function fixture({ version = '12.1.0', transfer = 'confirmed', afterSend, queryIds = ['native-id'], queryChat = chatId, sanitize = value => value } = {}) {
  const calls = [], state = { userInfo: { userId: accountId }, chatInfo: { chatSelectUri: 'sip:unrelated@example.test', chatList: [{ chatRoomUri: chatId, chatRoomType: 0 }] } };
  const message = id => ({ msgId: id, data_owner: accountId, chatRoomUri: queryChat, sendUri: accountId, content: input.text, msgType: 1, time: 'fixture', msgFromReceive: false,
    isMessageTransSuccess: () => transfer === 'confirmed', isMessageTransFailed: () => transfer === 'failed', isMessageTransing: () => transfer === 'pending', isMessageTransInit: () => false });
  let backingState = state;
  const service = { async sendTextMsg(...args) { calls.push(args); afterSend?.(state, next => { backingState = next; }); return message('native-id'); }, async queryMsgByMsgIdList(items) { calls.push(items); return { success: 1, aMessagesList: queryIds.map(message) }; } };
  class QueryItem { constructor(id) { this.msgId = id; } }
  const loader = { c: { '1bb8': { exports: { a: service } }, d88a: { exports: { Lb: QueryItem } }, '16f8': { exports: { z: sanitize } } }, m: {}, s: 0 };
  const chunks = []; chunks.push = entry => {
    Array.prototype.push.call(chunks, entry);
    for (const [id, factory] of Object.entries(entry[1])) { loader.m[id] = factory; loader.c[id] = {}; factory({}, {}, loader); }
  };
  const context = vm.createContext({ window: { webpackJsonp: chunks }, document: { querySelector: selector => { assert.equal(selector, '#app'); return { __vue_app__: { config: { globalProperties: { $store: { state: backingState } } } } }; } },
    process: { argv: ['IS_MAIN_WINDOW'], resourcesPath: '/fixture' }, require: () => ({ version }), Date, Math });
  vm.runInContext('globalThis.operation = ' + nativePageOperation.toString(), context);
  return { state, calls, loader, chunks, async call(operation, value = input) {
    context.op = operation; context.value = value;
    return JSON.parse(JSON.stringify(await vm.runInContext('operation(op,value)', context)));
  } };
}
test('SDK 发送取得客户端确认，不访问编辑器或切换聊天，临时桥接被释放', async () => {
  const f = fixture(), result = await f.call('send');
  assert.equal(result.ok, true); assert.equal(result.value.state, 'client-confirmed'); assert.equal(result.value.message.id, 'native-id');
  assert.equal(result.value.transport, 'client-sdk'); assert.equal(f.state.chatInfo.chatSelectUri, 'sip:unrelated@example.test');
  assert.equal(f.calls.length, 1); assert.deepEqual(f.calls[0].slice(0, 2), [input.text, chatId]);
  assert.ok(Object.values(f.calls[0][2]).every(value => value === false));
  assert.equal(f.chunks.length, 0); assert.equal(f.loader.s, 0); assert.deepEqual(Object.keys(f.loader.m), []);
});
test('发送预览不调用 SDK', async () => {
  const f = fixture(), result = await f.call('send', { ...input, apply: false });
  assert.equal(result.value.state, 'preview'); assert.equal(f.calls.length, 0);
});
test('账户、目标和文本验证失败发生在发送前', async () => {
  for (const value of [{ ...input, accountId: 'other' }, { ...input, chatId: 'missing' }, { ...input, text: '' }, { ...input, text: 'bad\u0000text' }]) {
    const f = fixture(), result = await f.call('send', value);
    assert.equal(result.ok, false); assert.equal(result.error.details.phase, 'not-edited'); assert.equal(f.calls.length, 0);
  }
  const f = fixture({ sanitize: value => value.replace('plain', 'changed') });
  assert.equal((await f.call('send')).error.code, 'TEXT_WOULD_CHANGE'); assert.equal(f.calls.length, 0);
});
test('发送后账户变化、失败和未确认不能报告成功，也不重发', async () => {
  for (const [options, code] of [[{ afterSend: state => { state.userInfo.userId = 'other'; } }, 'ACCOUNT_CHANGED'],
    [{ afterSend: (state, replace) => replace({ ...state, userInfo: { userId: 'other' } }) }, 'ACCOUNT_CHANGED'], [{ transfer: 'failed' }, 'SEND_FAILED'], [{ transfer: 'pending' }, 'SEND_UNKNOWN']]) {
    const f = fixture(options), result = await f.call('send');
    assert.equal(result.ok, false); assert.equal(result.error.code, code); assert.equal(result.error.details.phase, 'send-requested'); assert.equal(f.calls.length, 1);
  }
});
test('按 ID 查询保留覆盖和缺失事实，不读取其他聊天', async () => {
  const f = fixture(), result = await f.call('read-by-ids', { accountId, chatId, messageIds: ['native-id', 'missing'] });
  assert.equal(result.value.coverage, 'requested-message-ids'); assert.deepEqual(result.value.missingIds, ['missing']); assert.equal(result.value.messages[0].id, 'native-id');
  const wrong = fixture({ queryChat: 'other' }); assert.equal((await wrong.call('read-by-ids', { accountId, chatId, messageIds: ['native-id'] })).error.code, 'MESSAGE_SCOPE_MISMATCH');
  const unexpected = fixture({ queryIds: ['unrequested'] }); assert.equal((await unexpected.call('read-by-ids', { accountId, chatId, messageIds: ['native-id'] })).error.code, 'MESSAGE_SCOPE_MISMATCH');
});
test('未知操作、未知版本、缺失 SDK 和非法 ID 不执行效果', async () => {
  for (const [f, operation, value, code] of [[fixture(), 'arbitrary', input, 'UNKNOWN_OPERATION'], [fixture({ version: 'future' }), 'send', input, 'UNSUPPORTED_VERSION'],
    [fixture(), 'read-by-ids', { accountId, chatId, messageIds: ['duplicate', 'duplicate'] }, 'INVALID_MESSAGE_IDS']]) {
    assert.equal((await f.call(operation, value)).error.code, code); assert.equal(f.calls.length, 0);
  }
  const f = fixture(); delete f.loader.c['1bb8']; assert.equal((await f.call('send')).error.code, 'UNSUPPORTED_SCHEMA'); assert.equal(f.calls.length, 0);
});
