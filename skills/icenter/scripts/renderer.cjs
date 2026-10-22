const { ClientError, CdpClient, listTargets } = require('./cdp.cjs');

// 此函数随任务发送到渲染进程；对象引用只在当前调用中有效。
function rendererTools(scope) {
  const fail = (code, message) => { const error = new Error(message); error.code = code; throw error; };
  const app = () => document.querySelector('#app')?.__vue_app__;
  const check = () => {
    if (typeof process === 'undefined' || !process.argv.includes('IS_MAIN_WINDOW')) fail('WRONG_WINDOW', 'Expected the iCenter main window.');
    const state = app()?.config?.globalProperties?.$store?.state;
    if (!state?.userInfo || !state.chatInfo) fail('UNSUPPORTED_SCHEMA', 'The signed-in page state is unavailable.');
    if (!state.userInfo.userId) fail('NOT_SIGNED_IN', 'No signed-in account.');
    if (state.userInfo.userId !== scope.accountId) fail('ACCOUNT_CHANGED', 'The signed-in account changed.');
    if (scope.chatId && state.chatInfo.chatSelectUri !== scope.chatId) fail('CHAT_CHANGED', 'The selected conversation changed.');
    return { accountId: state.userInfo.userId, chatId: state.chatInfo.chatSelectUri || null };
  };
  const visible = element => typeof element?.getClientRects === 'function' && !!element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden';
  const elements = selector => { check(); return [...document.querySelectorAll(selector)].filter(visible); };
  const element = (selector, text) => {
    const matches = elements(selector).filter(e => text == null || e.textContent.trim() === text);
    if (matches.length !== 1) fail('CONTROL_NOT_UNIQUE', 'Expected one visible control with the observed selector and text.');
    return matches[0];
  };
  const component = (selector, method) => {
    check();
    const nodes = elements(selector), matches = new Set(), visited = new Set();
    function walk(vnode) {
      if (!vnode || typeof vnode !== 'object' || visited.has(vnode)) return;
      visited.add(vnode);
      if (Array.isArray(vnode)) { vnode.forEach(walk); return; }
      if (vnode.component) {
        const current = vnode.component, root = current.vnode?.el;
        if (visible(root) && nodes.some(node => root === node || root.contains?.(node)) && typeof current.type.methods?.[method] === 'function') matches.add(current.proxy);
        walk(current.subTree);
      }
      if (Array.isArray(vnode.children)) vnode.children.forEach(walk);
      if (vnode.suspense) walk(vnode.suspense.activeBranch);
    }
    walk(app()?._container?._vnode);
    if (matches.size !== 1) fail('COMPONENT_NOT_UNIQUE', 'Expected one visible component implementing the observed method.');
    return [...matches][0];
  };
  check();
  return { check, visible, elements, element, component };
}

class RendererSession {
  constructor(connection, targetId, scope) {
    this.connection = connection;
    this.targetId = targetId;
    this.scope = Object.freeze({ ...scope });
  }

  static async connect({ port, targetId, accountId, chatId, timeoutMs = 15000 }) {
    if (typeof accountId !== 'string' || !accountId || typeof targetId !== 'string' || !targetId || (chatId !== undefined && (typeof chatId !== 'string' || !chatId))) {
      throw new ClientError('SCOPE_REQUIRED', 'An observed main target ID and account ID are required; chat ID must be nonempty when supplied.');
    }
    const target = (await listTargets(port, timeoutMs, { allPages: true })).find(page => page.id === targetId);
    if (!target) throw new ClientError('TARGET_NOT_FOUND', 'Rediscover the intended main page.');
    const connection = await CdpClient.connect(target.webSocketDebuggerUrl, { timeoutMs });
    const session = new RendererSession(connection, targetId, { accountId, ...(chatId === undefined ? {} : { chatId }) });
    try { await session.run(tools => tools.check()); return session; }
    catch (error) { session.close(); throw error; }
  }

  // 回调没有闭包；参数通过 JSON 传递。异步回调在写入前调用 tools.check()。
  async run(task, ...args) {
    if (typeof task !== 'function') throw new ClientError('INVALID_ARGUMENT', 'Renderer tasks must be functions.');
    const result = await this.connection.send('Runtime.evaluate', {
      expression: `(async()=>{try{return {ok:true,value:await (${task.toString()})((${rendererTools.toString()})(JSON.parse(${JSON.stringify(JSON.stringify(this.scope))})),...JSON.parse(${JSON.stringify(JSON.stringify(args))}))};}catch(error){return {ok:false,error:{code:error.code||'RENDERER_FAILED',message:error.message}};}})()`,
      returnByValue: true, awaitPromise: true,
    });
    if (result.exceptionDetails) throw new ClientError('EVALUATION_FAILED', result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    const response = result.result?.value;
    if (!response || typeof response.ok !== 'boolean') throw new ClientError('CDP_BAD_RESPONSE', 'The renderer task returned no operation result.');
    if (!response.ok) throw new ClientError(response.error.code, response.error.message);
    return response.value;
  }

  async inspect(selector, limit = 20) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new ClientError('INVALID_ARGUMENT', 'Inspection limit must be from 1 to 100.');
    return this.run((tools, selector, limit) => {
      const matches = tools.elements(selector);
      return { ...tools.check(), matched: matches.length, nodes: matches.slice(0, limit).map(e => ({
        tag: e.tagName, id: e.id, className: e.getAttribute('class'), text: (e.innerText ?? e.textContent).trim().slice(0, 600),
        title: e.getAttribute('title'), role: e.getAttribute('role'), placeholder: e.getAttribute('placeholder'),
        checked: 'checked' in e ? e.checked : e.getAttribute('aria-checked'),
        disabled: e.disabled === true || e.getAttribute('aria-disabled') === 'true',
        data: { ...e.dataset },
      })) };
    }, selector, limit);
  }

  // 坐标取自本次 DOM；多次协议请求之间的用户操作仍可能改变页面。
  async click(selector, { text, button = 'left', apply = false } = {}) {
    if (!['left', 'right'].includes(button)) throw new ClientError('INVALID_ARGUMENT', 'Use the left or right mouse button.');
    if (apply) await this.connection.send('Page.bringToFront');
    const point = await this.run((tools, selector, text) => {
      const e = tools.element(selector, text);
      if (e.disabled || e.getAttribute('aria-disabled') === 'true') throw Error('Control is disabled');
      const r = e.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }, selector, text);
    if (!apply) return { state: 'preview', targetId: this.targetId, ...this.scope, selector, text, button };
    await this.run(tools => tools.check());
    try {
      for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
        await this.connection.send('Input.dispatchMouseEvent', { type, ...point, ...(type === 'mouseMoved' ? {} : { button, clickCount: 1 }) });
      }
      await this.run(tools => tools.check());
      return { state: 'input-dispatched', targetId: this.targetId, ...this.scope, selector, button };
    } catch (error) { throw new ClientError('ACTION_UNKNOWN', 'Input may have changed the client. Inspect the result before repeating.', { cause: error.code }); }
  }

  async fill(selector, text, { replace = false, apply = false } = {}) {
    if (typeof text !== 'string') throw new ClientError('INVALID_ARGUMENT', 'Input text must be a string.');
    return this.run((tools, selector, text, replace, apply) => {
      const e = tools.element(selector);
      if (!['INPUT', 'TEXTAREA'].includes(e.tagName) || (e.tagName === 'INPUT' && !['text', 'search', 'email', 'tel', 'url', 'number'].includes(e.type || 'text')) || e.disabled || e.readOnly) throw Error('Expected an editable text input');
      if (e.value && e.value !== text && !replace) throw Error('Input contains existing text; replacement requires an explicit choice');
      if (!apply) return { state: 'preview', ...tools.check(), selector, text };
      tools.check();
      const proto = e.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(e, text);
      e.dispatchEvent(new Event('input', { bubbles: true }));
      return { state: 'input-dispatched', ...tools.check(), selector, value: e.value };
    }, selector, text, replace, apply);
  }

  close() { this.connection.close(); }
}

module.exports = { RendererSession, rendererTools };
