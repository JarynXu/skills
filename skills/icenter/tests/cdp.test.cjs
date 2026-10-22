const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { CdpClient, listTargets } = require('../scripts/cdp.cjs');

function connection(timeoutMs = 1000) {
  let socket;
  class Socket {
    constructor() { socket = this; this.sent = []; }
    send(raw) { this.sent.push(JSON.parse(raw)); }
    close() { this.onclose?.({}); }
  }
  const client = new CdpClient('ws://127.0.0.1:12345/fixture', { WebSocketImpl: Socket, timeoutMs });
  return { client, socket };
}

test('握手失败拒绝等待连接的命令', async () => {
  const { client, socket } = connection();
  const pending = client.send('Runtime.enable');
  socket.onerror({});
  await assert.rejects(pending, { code: 'CDP_DISCONNECTED' });
  assert.equal(client.pending.size, 0);
});
test('握手超时关闭连接', async () => {
  const { client } = connection(20);
  await assert.rejects(client.ready, { code: 'CDP_CONNECT_TIMEOUT' });
});
test('协议错误保留错误码，不解析为成功', async () => {
  const { client, socket } = connection(); socket.onopen({});
  const pending = client.send('Fixture.invalid'); await Promise.resolve();
  socket.onmessage({ data: JSON.stringify({ id: socket.sent[0].id, error: { code: -32601, message: 'Method not found' } }) });
  await assert.rejects(pending, error => error.code === 'CDP_PROTOCOL_ERROR' && error.details.protocolCode === -32601);
  client.close();
});
test('断开拒绝在途命令并释放请求', async () => {
  const { client, socket } = connection(); socket.onopen({});
  const pending = client.send('Runtime.enable'); await Promise.resolve(); socket.onclose({});
  await assert.rejects(pending, { code: 'CDP_DISCONNECTED' });
  assert.equal(client.pending.size, 0);
});
test('命令超时保留副作用未知语义', async () => {
  const { client, socket } = connection(20); socket.onopen({});
  await assert.rejects(client.send('Input.dispatchMouseEvent'), error => error.code === 'CDP_COMMAND_TIMEOUT' && /side effects/.test(error.message));
  assert.equal(client.pending.size, 0); client.close();
});
test('主动关闭可重复调用并拒绝后续命令', async () => {
  const { client, socket } = connection(); socket.onopen({}); client.close(); client.close();
  await assert.rejects(client.send('Runtime.enable'), { code: 'CDP_CLOSED' });
});
test('乱序响应按请求 ID 分配', async () => {
  const { client, socket } = connection(); socket.onopen({});
  const first = client.send('one'), second = client.send('two'); await Promise.resolve();
  socket.onmessage({ data: JSON.stringify({ id: socket.sent[1].id, result: { value: 2 } }) });
  socket.onmessage({ data: JSON.stringify({ id: socket.sent[0].id, result: { value: 1 } }) });
  assert.deepEqual(await first, { value: 1 }); assert.deepEqual(await second, { value: 2 }); client.close();
});
test('损坏的响应使连接失败', async () => {
  const { client, socket } = connection(); socket.onopen({});
  const pending = client.send('Runtime.enable'); await Promise.resolve(); socket.onmessage({ data: '{bad' });
  await assert.rejects(pending, { code: 'CDP_BAD_RESPONSE' });
});
test('页面异常不能被当作空值', async () => {
  const { client, socket } = connection(); socket.onopen({});
  const pending = client.evaluate(() => 1); await Promise.resolve();
  socket.onmessage({ data: JSON.stringify({ id: socket.sent[0].id, result: { exceptionDetails: { text: 'Execution failed' } } }) });
  await assert.rejects(pending, { code: 'EVALUATION_FAILED' }); client.close();
});
test('CDP 端点限制在回环地址', () => {
  assert.throws(() => new CdpClient('ws://example.com/devtools/page/1'), { code: 'INVALID_ENDPOINT' });
});

test('JSON 参数保留 __proto__ 为数据，不转成 JavaScript 原型',async()=>{
  const vm=require('node:vm');
  const client=Object.create(CdpClient.prototype);
  client.send=async(method,params)=>({result:{value:vm.runInNewContext(params.expression)}});
  const result=await client.evaluate(value=>({own:Object.hasOwn(value,'__proto__'),inherited:value.injected??null,data:value.__proto__.injected}),JSON.parse('{"__proto__":{"injected":"data"}}'));
  assert.deepEqual(JSON.parse(JSON.stringify(result)),{own:true,inherited:null,data:'data'});
});
test('真实 HTTP 发现路径过滤非主页面并保留多目标', async t => {
  const server = http.createServer((req, res) => {
    assert.equal(req.url, '/json/list');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify([
      { id: 'main1', type: 'page', url: 'app://./index.html', webSocketDebuggerUrl: 'ws://127.0.0.1:12345/main1' },
      { id: 'main2', type: 'page', url: 'app://./index.html', webSocketDebuggerUrl: 'ws://127.0.0.1:12345/main2' },
      { id: 'login', type: 'page', url: 'app://./login.html' },
    ]));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  assert.deepEqual((await listTargets(server.address().port)).map(page => page.id), ['main1', 'main2']);
});
