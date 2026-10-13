// 本机 CDP 连接拥有请求计时器；断开时拒绝全部在途请求。
class ClientError extends Error {
  constructor(code, message, details) {
    super(message);
    this.name = 'ClientError';
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

function localUrl(value, protocol) {
  let url;
  try { url = new URL(value); } catch { throw new ClientError('INVALID_ENDPOINT', 'Expected a local CDP URL.'); }
  if (url.protocol !== protocol || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.username || url.password) {
    throw new ClientError('INVALID_ENDPOINT', 'CDP endpoints must use loopback without credentials.');
  }
  return url;
}

async function listTargets(port, timeoutMs = 5000) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new ClientError('INVALID_PORT', 'Port must be between 1 and 65535.');
  let response;
  try {
    response = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(timeoutMs), redirect: 'error' });
  } catch (error) {
    throw new ClientError('CDP_UNREACHABLE', 'The local CDP endpoint did not respond.', { cause: error.message });
  }
  if (!response.ok) throw new ClientError('CDP_HTTP_ERROR', `CDP discovery returned HTTP ${response.status}.`);
  let targets;
  try { targets = await response.json(); } catch { throw new ClientError('CDP_BAD_RESPONSE', 'CDP discovery returned invalid JSON.'); }
  if (!Array.isArray(targets)) throw new ClientError('CDP_BAD_RESPONSE', 'CDP discovery must return an array.');
  return targets.filter(target => ['page', 'webview'].includes(target.type))
    .map(target => {
      if (typeof target.id !== 'string' || typeof target.webSocketDebuggerUrl !== 'string') {
        throw new ClientError('CDP_BAD_RESPONSE', 'A page target has no identity or endpoint.');
      }
      localUrl(target.webSocketDebuggerUrl, 'ws:');
      return { id: target.id, type: target.type, title: target.title, url: target.url, webSocketDebuggerUrl: target.webSocketDebuggerUrl };
    });
}

class CdpClient {
  constructor(url, { timeoutMs = 5000, WebSocketImpl = globalThis.WebSocket } = {}) {
    localUrl(url, 'ws:');
    if (typeof WebSocketImpl !== 'function') throw new ClientError('UNSUPPORTED_RUNTIME', 'This tool requires Node.js with the built-in WebSocket API.');
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new ClientError('INVALID_TIMEOUT', 'timeoutMs must be positive.');
    this.timeoutMs = timeoutMs;
    this.nextId = 0;
    this.pending = new Map();
    this.terminalError = null;
    this.socket = new WebSocketImpl(url);
    this.ready = new Promise((resolve, reject) => {
      this.resolveReady = resolve;
      this.rejectReady = reject;
    });
    // 连接可能在调用者等待前失败；保留原 Promise 的拒绝状态。
    this.ready.catch(() => {});
    this.connectTimer = setTimeout(() => this.fail(new ClientError('CDP_CONNECT_TIMEOUT', 'CDP connection timed out.')), timeoutMs);
    this.socket.onopen = () => {
      if (this.terminalError) { this.socket.close(); return; }
      clearTimeout(this.connectTimer);
      this.resolveReady();
    };
    this.socket.onerror = () => this.fail(new ClientError('CDP_DISCONNECTED', 'The CDP WebSocket reported an error.'));
    this.socket.onclose = () => this.fail(new ClientError('CDP_DISCONNECTED', 'The CDP WebSocket closed.'));
    this.socket.onmessage = event => {
      let message;
      try { message = JSON.parse(event.data); } catch {
        this.fail(new ClientError('CDP_BAD_RESPONSE', 'CDP returned malformed JSON.'));
        return;
      }
      if (!message || typeof message !== 'object') {
        this.fail(new ClientError('CDP_BAD_RESPONSE', 'CDP returned an invalid message.'));
        return;
      }
      if (!Object.hasOwn(message, 'id')) return;
      const request = this.pending.get(message.id);
      if (!request) return;
      this.pending.delete(message.id);
      clearTimeout(request.timer);
      if (message.error) request.reject(new ClientError('CDP_PROTOCOL_ERROR', message.error.message || 'CDP command failed.', { protocolCode: message.error.code }));
      else if (!Object.hasOwn(message, 'result')) request.reject(new ClientError('CDP_BAD_RESPONSE', 'CDP response has neither result nor error.'));
      else request.resolve(message.result);
    };
  }

  static async connect(url, options) {
    const client = new CdpClient(url, options);
    await client.ready;
    return client;
  }

  async send(method, params = {}) {
    await this.ready;
    if (this.terminalError) throw this.terminalError;
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new ClientError('CDP_COMMAND_TIMEOUT', `CDP command timed out: ${method}. Its side effects may have occurred.`));
      }, this.timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      try { this.socket.send(JSON.stringify({ id, method, params })); } catch (error) {
        this.fail(new ClientError('CDP_DISCONNECTED', 'CDP command could not be transmitted.', { cause: error.message }));
      }
    });
  }

  async evaluate(fn, ...args) {
    const response = await this.send('Runtime.evaluate', {
      expression: `(${fn.toString()})(...${JSON.stringify(args)})`,
      returnByValue: true,
      awaitPromise: true,
    });
    if (response.exceptionDetails) {
      throw new ClientError('EVALUATION_FAILED', response.exceptionDetails.exception?.description || response.exceptionDetails.text || 'Client evaluation failed.');
    }
    if (!response.result || !Object.hasOwn(response.result, 'value')) throw new ClientError('CDP_BAD_RESPONSE', 'Client operation returned no serializable value.');
    return response.result.value;
  }

  close() {
    this.fail(new ClientError('CDP_CLOSED', 'The caller closed the CDP connection.'));
  }

  fail(error) {
    if (this.terminalError) return;
    this.terminalError = error;
    clearTimeout(this.connectTimer);
    this.rejectReady(error);
    for (const request of this.pending.values()) {
      clearTimeout(request.timer);
      request.reject(error);
    }
    this.pending.clear();
    try { this.socket.close(); } catch { /* 终态已记录，关闭不替换原始错误。 */ }
  }
}

module.exports = { ClientError, CdpClient, listTargets, localUrl };
