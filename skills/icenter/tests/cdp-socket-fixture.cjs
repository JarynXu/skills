// 此替身只验证 CLI 到 CDP 请求的装配；真实 WebSocket 集成另行实测。
globalThis.WebSocket = class {
  constructor(url) { this.url = url; queueMicrotask(() => this.onopen?.({})); }
  send(raw) {
    const request = JSON.parse(raw);
    const response = request.method === 'Fixture.error'
      ? { error: { code: -32601, message: 'Method not found' } }
      : { result: { endpoint: this.url, method: request.method, params: request.params } };
    queueMicrotask(() => this.onmessage?.({ data: JSON.stringify({ id: request.id, ...response }) }));
  }
  close() { this.onclose?.({}); }
};
