const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { RendererSession } = require('../scripts/renderer.cjs');

// 替身执行实际序列化表达式，覆盖身份、DOM、组件树与协议的边界。
function fixture() {
  const state = { userInfo: { userId: 'self' }, chatInfo: { chatSelectUri: 'chat' } };
  const nodes = new Map();
  const valueSet = function (value) { this.value = value; };
  class Input {}
  Object.defineProperty(Input.prototype, 'value', { set: valueSet });
  const app = { config: { globalProperties: { $store: { state } } }, _container: { _vnode: {} } };
  const root = { __vue_app__: app };
  const context = { process: { argv: ['IS_MAIN_WINDOW'] }, Set, Date, Error, JSON,
    document: { querySelector: () => root, querySelectorAll: s => nodes.get(s) || [] },
    getComputedStyle: () => ({ visibility: 'visible' }), HTMLInputElement: Input, HTMLTextAreaElement: Input,
    Event: class { constructor(type) { this.type = type; } } };
  const requests = [];
  const connection = { send: async (method, params) => {
    requests.push({ method, params });
    if (method === 'Runtime.evaluate') return { result: { value: await vm.runInNewContext(params.expression, context) } };
    return {};
  }, close: () => { connection.closed = true; } };
  const session = new RendererSession(connection, 'main', { accountId: 'self', chatId: 'chat' });
  const node = (overrides = {}) => ({ tagName: 'INPUT', type: 'text', value: '', textContent: '按钮', dataset: {},
    getClientRects: () => [1], getBoundingClientRect: () => ({ x: 10, y: 20, width: 30, height: 40 }),
    getAttribute: () => null, dispatchEvent: () => {}, ...overrides });
  return { session, state, nodes, node, app, root, context, requests, connection };
}

test('页面任务核对主窗口、登录账户与绑定会话', async () => {
  const f = fixture();
  f.state.userInfo.userId = 'other';
  await assert.rejects(f.session.run(t => t.check()), { code: 'ACCOUNT_CHANGED' });
  f.state.userInfo.userId = 'self'; f.state.chatInfo.chatSelectUri = 'other';
  await assert.rejects(f.session.run(t => t.check()), { code: 'CHAT_CHANGED' });
  f.context.process.argv = ['IS_Image_WINDOW'];
  await assert.rejects(f.session.run(t => t.check()), { code: 'WRONG_WINDOW' });
});
test('同次任务重新检查替换后的应用，不能使用旧账户引用', async () => {
  const f = fixture();
  await assert.rejects(f.session.run(t => {
    document.querySelector('#app').__vue_app__ = { config: { globalProperties: { $store: { state: { userInfo: { userId: 'other' }, chatInfo: {} } } } } };
    return t.check();
  }), { code: 'ACCOUNT_CHANGED' });
});
test('隐藏节点不参与选择；可见同名控件歧义拒绝点击', async () => {
  const f = fixture(); f.nodes.set('.button', [f.node(), f.node({ getClientRects: () => [] })]);
  await f.session.click('.button');
  assert.equal(f.requests.some(r => r.method.startsWith('Input.')), false);
  f.nodes.set('.button', [f.node(), f.node()]);
  await assert.rejects(f.session.click('.button', { apply: true }), { code: 'CONTROL_NOT_UNIQUE' });
});
test('CDP 点击使用当前 DOM，右键参数与执行状态保留', async () => {
  const f = fixture(); f.nodes.set('.button', [f.node()]);
  assert.equal((await f.session.click('.button', { button: 'right', apply: true })).state, 'input-dispatched');
  const events = f.requests.filter(r => r.method === 'Input.dispatchMouseEvent').map(r => r.params);
  assert.equal(events.length, 3); assert.equal(events[1].button, 'right');
  assert.equal(events[1].x, 25); assert.equal(events[1].y, 40);
});
test('点击后账户变化报告动作未知，不冒充没有副作用', async () => {
  const f = fixture(); f.nodes.set('.button', [f.node()]);
  const original = f.connection.send;
  f.connection.send = async (method, params) => { const result = await original(method, params); if (method === 'Input.dispatchMouseEvent' && params.type === 'mouseReleased') f.state.userInfo.userId = 'other'; return result; };
  await assert.rejects(f.session.click('.button', { apply: true }), { code: 'ACTION_UNKNOWN' });
});
test('文本输入预览和覆盖契约，保留中文与特殊字符', async () => {
  const f = fixture(); const input = f.node({ value: '已有搜索' }); f.nodes.set('.search', [input]);
  await assert.rejects(f.session.fill('.search', '新查询', { apply: true }));
  assert.equal(input.value, '已有搜索');
  assert.equal((await f.session.fill('.search', '中文<>&"', { replace: true })).state, 'preview');
  assert.equal(input.value, '已有搜索');
  assert.equal((await f.session.fill('.search', '中文<>&"', { replace: true, apply: true })).value, '中文<>&"');
});
test('密码、文件、复选框和只读输入不能通过文本工具改写', async () => {
  for (const attrs of [{ type: 'password' }, { type: 'file' }, { type: 'checkbox' }, { readOnly: true }]) {
    const f = fixture(); const input = f.node(attrs); f.nodes.set('.input', [input]);
    await assert.rejects(f.session.fill('.input', 'new', { apply: true })); assert.equal(input.value, '');
  }
});
test('从可见子节点定位无类名组件，跳过注释并遍历嵌套节点数组', async () => {
  const f = fixture(); const leaf = f.node(); f.nodes.set('.title', [leaf]);
  const container = f.node({ contains: e => e === leaf }); const proxy = { operation: () => 'observed-result' };
  const component = { vnode: { el: container }, type: { methods: { operation() {} } }, proxy, subTree: {} };
  f.app._container._vnode = { children: [[{ component }], { component: { vnode: { el: {} }, type: {}, subTree: {} } }] };
  assert.equal(await f.session.run(t => t.component('.title', 'operation').operation()), 'observed-result');
  f.app._container._vnode.children.push({ component: { ...component, proxy: { operation() {} } } });
  await assert.rejects(f.session.run(t => t.component('.title', 'operation').operation()), { code: 'COMPONENT_NOT_UNIQUE' });
});
test('检查结果保留总匹配数与截取范围，不包含隐藏项的正文', async () => {
  const f = fixture(); f.nodes.set('.items', [f.node({ innerText: '可见', textContent: '可见隐藏' }), f.node()]);
  const result = await f.session.inspect('.items', 1);
  assert.equal(result.matched, 2); assert.equal(result.nodes.length, 1); assert.equal(result.nodes[0].text, '可见');
});
test('协议异常、任务错误及关闭保持可见状态', async () => {
  const f = fixture(); await assert.rejects(f.session.run(() => { throw new Error('actual failure'); }), /actual failure/);
  await assert.rejects(f.session.run('not a function'), { code: 'INVALID_ARGUMENT' });
  f.connection.send = async () => ({ exceptionDetails: { text: 'context destroyed' } });
  await assert.rejects(f.session.run(() => 1), { code: 'EVALUATION_FAILED' });
  f.session.close(); assert.equal(f.connection.closed, true);
});
