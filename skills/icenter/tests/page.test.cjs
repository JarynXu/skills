const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { pageOperation } = require('../scripts/page.cjs');
const { callPage } = require('../scripts/client.cjs');

// 固定版本的最小契约替身；真实 DOM 与客户端验证另行记录。
function fixture() {
  const account = 'sip:self@example.test'; const chat = 'sip:peer@example.test';
  const state = { userInfo: { userId: account, userName: '同名用户', unionId: 'U1' },
    chatInfo: { chatSelectUri: chat, chatList: [{ chatRoomUri: chat, chatRoomNameCn: '同名用户', chatRoomType: 0, messageReplyInfo: null }] },
    messageInfo: { messageList: [] } };
  let clicks = 0; let richDraft = false;
  const send = { getClientRects: () => [1], click: () => clicks++ };
  const composer = { querySelectorAll: () => [send] };
  const editor = { textContent: '', getClientRects: () => [1], closest: () => composer,
    getAttribute: () => 'true', querySelector: () => richDraft ? {} : null, dispatchEvent: () => {} };
  const row = { dataset: { id: chat }, getClientRects: () => [1], click: () => { state.chatInfo.chatSelectUri = chat; clicks++; } };
  const context = { process: { argv: ['IS_MAIN_WINDOW'], resourcesPath: '/resources' },
    require: () => ({ version: '12.1.0' }), Event: class {}, getComputedStyle: () => ({ visibility: 'visible' }),
    document: { querySelector: () => ({ __vue_app__: { config: { globalProperties: { $store: { state } } } } }),
      querySelectorAll: selector => selector === 'li.ChatInfo' ? [row] : [editor] } };
  return { state, context, editor, scope: { accountId: account, chatId: chat }, get clicks() { return clicks; },
    rich: () => { richDraft = true; }, call: (operation, input = {}) => vm.runInNewContext(`(${pageOperation})(${JSON.stringify(operation)},${JSON.stringify(input)})`, context) };
}

test('JSON 调用的默认参数必须是对象，状态查询不能收到 null', async () => {
  await callPage({ evaluate: async (fn, operation, input) => {
    assert.deepEqual(JSON.parse(JSON.stringify([input])), [{}]); return { ok: true, value: 1 };
  } }, 'status');
});
test('账户来自登录状态，别名完整性不虚构', () => {
  const f = fixture(); const r = f.call('status');
  assert.equal(r.value.account.id, f.scope.accountId); assert.equal(r.value.account.aliasesComplete, false);
  assert.equal(r.value.account.linkedUnionId, 'U1'); assert.equal(r.value.account.email, undefined);
});
test('辅助窗口与未适配版本拒绝执行', () => {
  const f = fixture(); f.context.process.argv = ['IS_Image_WINDOW'];
  assert.equal(f.call('identify').value.role, 'other'); assert.equal(f.call('status').error.code, 'WRONG_WINDOW');
  f.context.process.argv = ['IS_MAIN_WINDOW']; f.context.require = () => ({ version: '13.0.0' });
  assert.equal(f.call('status').error.code, 'UNSUPPORTED_VERSION');
});
test('目标账户或当前会话变化时不写编辑器', () => {
  const f = fixture();
  assert.equal(f.call('send', { ...f.scope, accountId: 'other', text: 'hello', apply: true }).error.code, 'ACCOUNT_CHANGED');
  f.state.chatInfo.chatSelectUri = 'other';
  assert.equal(f.call('send', { ...f.scope, text: 'hello', apply: true }).error.code, 'CHAT_CHANGED');
  assert.equal(f.editor.textContent, ''); assert.equal(f.clicks, 0);
});
test('文本草稿、富内容与引用分别阻止覆盖', () => {
  for (const mode of ['text', 'rich', 'reply']) {
    const f = fixture();
    if (mode === 'text') f.editor.textContent = 'user draft';
    if (mode === 'rich') f.rich();
    if (mode === 'reply') f.state.chatInfo.chatList[0].messageReplyInfo = { id: 'quoted' };
    assert.equal(f.call('send', { ...f.scope, text: 'new text', apply: true }).error.code, 'DRAFT_PRESENT');
    assert.equal(f.clicks, 0);
    if (mode === 'text') assert.equal(f.editor.textContent, 'user draft');
  }
});
test('预览不编辑，执行保留正文特殊字符与换行', () => {
  const f = fixture(); const input = { ...f.scope, text: '<>&"\n中文\n' };
  assert.equal(f.call('send', input).value.state, 'preview'); assert.equal(f.editor.textContent, '');
  assert.equal(f.call('send', { ...input, apply: true }).value.state, 'send-requested');
  assert.equal(f.editor.textContent, input.text); assert.equal(f.clicks, 1);
});
test('输入事件改变作用域后不点击发送', () => {
  const f = fixture(); f.editor.dispatchEvent = () => { f.state.chatInfo.chatSelectUri = 'other'; };
  assert.equal(f.call('send', { ...f.scope, text: 'hello', apply: true }).error.code, 'COMPOSER_CHANGED');
  assert.equal(f.clicks, 0); assert.equal(f.editor.textContent, 'hello');
});
test('旧会话消息加载残留不能归到新会话', () => {
  const f = fixture(); f.state.messageInfo.messageList = [{ chatRoomUri: 'other', data_owner: f.scope.accountId }];
  assert.equal(f.call('read', f.scope).error.code, 'MESSAGE_SCOPE_MISMATCH');
});
test('消息序列缺失不能返回成功空列表', () => {
  const f = fixture(); f.state.messageInfo.messageList = null;
  assert.equal(f.call('read', f.scope).error.code, 'UNSUPPORTED_SCHEMA');
});

test('同名个人和群聊按 ID 保留；名称和部分名称不能作为目标', () => {
  const f = fixture();
  f.state.chatInfo.chatList.push({ chatRoomUri: 'group', chatRoomNameCn: '同名用户', chatRoomType: 1 });
  assert.equal(f.call('chats', { accountId: f.scope.accountId }).value.chats.length, 2);
  assert.equal(f.call('select', { ...f.scope, chatId: '同名用户', apply: true }).error.code, 'CHAT_NOT_UNIQUE');
  assert.equal(f.call('select', { ...f.scope, chatId: '同名', apply: true }).error.code, 'CHAT_NOT_UNIQUE');
  assert.equal(f.call('select', { ...f.scope }).value.chat.id, f.scope.chatId);
  assert.equal(f.clicks, 0);
});
