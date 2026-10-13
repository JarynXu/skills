const assert = require('node:assert/strict');
const { test } = require('node:test');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const vm = require('node:vm');
const { CdpClient, listTargets, localUrl } = require('../scripts/cdp.cjs');
const { parseArgs, pageKind, currentPage } = require('../scripts/client.cjs');

class Socket {
  constructor() { this.sent = []; Socket.last = this; }
  send(text) { this.sent.push(JSON.parse(text)); }
  close() { this.onclose?.(); }
  reply(message) { this.onmessage({ data: JSON.stringify(message) }); }
}

async function connected(timeoutMs = 1000) {
  const client = new CdpClient('ws://127.0.0.1:64758/devtools/page/a', { WebSocketImpl: Socket, timeoutMs });
  const socket = Socket.last;
  socket.onopen();
  await client.ready;
  return { client, socket };
}

test('request IDs correlate responses received out of order; events do not complete requests', async () => {
  const { client, socket } = await connected();
  try {
    const first = client.send('Runtime.evaluate', { expression: 'first()' });
    const second = client.send('DOM.getDocument');
    await Promise.resolve();
    assert.deepEqual(socket.sent.map(r => r.id), [1, 2]);
    socket.reply({ method: 'Page.loadEventFired', params: {} });
    assert.equal(client.pending.size, 2);
    socket.reply({ id: 2, result: { root: 20 } });
    socket.reply({ id: 1, result: { value: 10 } });
    assert.deepEqual(await second, { root: 20 });
    assert.deepEqual(await first, { value: 10 });
    assert.equal(client.pending.size, 0);
  } finally { client.close(); }
});

test('protocol errors and missing results reject their request', async () => {
  const { client, socket } = await connected();
  try {
    const error = client.send('Unknown.command');
    const malformed = client.send('Runtime.evaluate');
    const a = assert.rejects(error, e => e.code === 'CDP_PROTOCOL_ERROR' && e.details.protocolCode === -32601);
    const b = assert.rejects(malformed, e => e.code === 'CDP_BAD_RESPONSE');
    await Promise.resolve();
    socket.reply({ id: 1, error: { code: -32601, message: 'Method not found' } });
    socket.reply({ id: 2 });
    await Promise.all([a, b]);
  } finally { client.close(); }
});

test('disconnect rejects all pending requests and prevents another transmission', async () => {
  const { client, socket } = await connected();
  const a = assert.rejects(client.send('A'), e => e.code === 'CDP_DISCONNECTED');
  const b = assert.rejects(client.send('B'), e => e.code === 'CDP_DISCONNECTED');
  await Promise.resolve();
  socket.onclose();
  await Promise.all([a, b]);
  await assert.rejects(client.send('C'), e => e.code === 'CDP_DISCONNECTED');
  assert.equal(socket.sent.length, 2);
  assert.equal(client.pending.size, 0);
});

test('malformed WebSocket JSON fails the connection instead of looking like an empty result', async () => {
  const { client, socket } = await connected();
  const pending = assert.rejects(client.send('A'), e => e.code === 'CDP_BAD_RESPONSE');
  await Promise.resolve();
  socket.onmessage({ data: '{broken' });
  await pending;
  await assert.rejects(client.send('B'), e => e.code === 'CDP_BAD_RESPONSE');
});

test('a timed out write is transmitted once and late results do not turn it into success', async () => {
  const { client, socket } = await connected(25);
  try {
    await assert.rejects(client.send('Runtime.evaluate', { expression: 'sendMail()' }), e => e.code === 'CDP_COMMAND_TIMEOUT' && /side effects/.test(e.message));
    assert.equal(socket.sent.length, 1);
    assert.equal(client.pending.size, 0);
    socket.reply({ id: 1, result: { sent: true } });
    assert.equal(socket.sent.length, 1);
    assert.equal(client.pending.size, 0);
  } finally { client.close(); }
});

test('connection failure rejects readiness without transmitting a command', async () => {
  const client = new CdpClient('ws://127.0.0.1:64758/a', { WebSocketImpl: Socket, timeoutMs: 1000 });
  const socket = Socket.last;
  const pending = assert.rejects(client.send('A'), e => e.code === 'CDP_DISCONNECTED');
  socket.onerror();
  await pending;
  assert.deepEqual(socket.sent, []);
});

test('evaluation preserves arguments as data and returns the serializable result', async () => {
  const { client, socket } = await connected();
  try {
    const value = '中文 "quoted"\n${neverExecuted}';
    const pending = client.evaluate(input => ({ input }), value);
    await Promise.resolve();
    const request = socket.sent[0];
    assert.equal(request.method, 'Runtime.evaluate');
    assert.equal(request.params.awaitPromise, true);
    assert.deepEqual(Function(`return ${request.params.expression}`)(), { input: value });
    socket.reply({ id: request.id, result: { result: { value: { input: value } } } });
    assert.deepEqual(await pending, { input: value });
  } finally { client.close(); }
});

test('evaluation exceptions and absent values remain failures', async () => {
  const { client, socket } = await connected();
  try {
    const a = assert.rejects(client.evaluate(() => 1), e => e.code === 'EVALUATION_FAILED');
    await Promise.resolve();
    socket.reply({ id: 1, result: { exceptionDetails: { text: 'Uncaught error' } } });
    await a;
    const b = assert.rejects(client.evaluate(() => undefined), e => e.code === 'CDP_BAD_RESPONSE');
    await Promise.resolve();
    socket.reply({ id: 2, result: { result: { type: 'undefined' } } });
    await b;
  } finally { client.close(); }
});

test('endpoints must be loopback, use the expected protocol and contain no credentials', () => {
  assert.equal(localUrl('ws://127.0.0.1:64758/a', 'ws:').hostname, '127.0.0.1');
  for (const value of ['ws://example.com/a', 'ws://user:pass@localhost/a', 'http://localhost/a', 'garbage']) {
    assert.throws(() => localUrl(value, 'ws:'), e => e.code === 'INVALID_ENDPOINT');
  }
});

test('discovery keeps CEF pages and webviews, rejects invalid identities and endpoint responses', async () => {
  let status = 200;
  let body;
  const server = http.createServer((req, res) => { res.writeHead(status); res.end(body); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  try {
    body = JSON.stringify([
      { id: 'a', type: 'page', url: 'file:///D:/app/template/a.html', webSocketDebuggerUrl: `ws://127.0.0.1:${port}/a` },
      { id: 'b', type: 'webview', url: 'file:///D:/app/template/b.html', webSocketDebuggerUrl: `ws://127.0.0.1:${port}/b` },
      { type: 'worker' },
    ]);
    assert.deepEqual((await listTargets(port)).map(t => t.id), ['a', 'b']);
    body = JSON.stringify([{ type: 'page', webSocketDebuggerUrl: `ws://127.0.0.1:${port}/a` }]);
    await assert.rejects(listTargets(port), e => e.code === 'CDP_BAD_RESPONSE');
    body = JSON.stringify([{ id: 'a', type: 'page', webSocketDebuggerUrl: 'ws://example.com/a' }]);
    await assert.rejects(listTargets(port), e => e.code === 'INVALID_ENDPOINT');
    body = '{bad';
    await assert.rejects(listTargets(port), e => e.code === 'CDP_BAD_RESPONSE');
    body = '{}';
    await assert.rejects(listTargets(port), e => e.code === 'CDP_BAD_RESPONSE');
    status = 500;
    await assert.rejects(listTargets(port), e => e.code === 'CDP_HTTP_ERROR');
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});

test('CLI requires an explicit PID and valid options; operations default to preview', () => {
  const options = parseArgs(['bridge', '--pid', '123', '--command', 'sendcompose']);
  assert.equal(options.apply, false);
  assert.equal(options.pid, 123);
  assert.equal(options.port, 64758);
  for (const args of [[], ['targets', '--pid', '0'], ['targets', '--pid', '1', '--port', '80'], ['bridge', '--pid', '1', '--pid', '2'], ['targets', '--pid', '1', '--port', '64758', '--port', '64759'], ['targets', '--pid', '1', '--unknown', 'x']]) {
    assert.throws(() => parseArgs(args), e => e.code === 'ARGUMENT');
  }
});

test('page classification confines template pages to the current installation and rejects web content', () => {
  const executable = path.join('D:/Client', 'CMClient.exe');
  assert.equal(pageKind('file:///D:/Client/app/template/readMail/index.html', executable), 'template');
  assert.equal(pageKind('file:///C:/Users/a/temp/temp_123/compose/new.html', executable), 'compose');
  for (const url of ['https://example.com/app/template/index.html', 'file://server/Client/app/template/index.html', 'file:///D:/Other/app/template/a.html', 'file:///D:/Client/app/template-other/a.html', 'file:///D:/Client/app/template/../../outside.html', 'file:///D:/Client/app/template/%2e%2e%2foutside.html', 'file:///D:/Client/app/template/%zz.html']) {
    assert.equal(pageKind(url, executable), null);
  }
});

test('a changed URL or missing native bridge rejects a stale target', async () => {
  const url = 'file:///D:/Client/app/template/a.html';
  await currentPage({ evaluate: async () => ({ href: url, bridge: 'function' }) }, url);
  for (const state of [{ href: url + '?other', bridge: 'function' }, { href: url, bridge: 'undefined' }]) {
    await assert.rejects(currentPage({ evaluate: async () => state }, url), e => e.code === 'STALE_PAGE');
  }
});

// The external client is modeled here; these checks do not establish real delivery.
function bridgeFixture() {
  const calls = [];
  const url = 'file:///C:/Users/a/temp/temp_123/compose/new.html';
  const target = { id: 'current', url, type: 'page', webSocketDebuggerUrl: 'ws://127.0.0.1:64758/current' };
  const page = {
    location: { href: url },
    window: { CM: (command, params) => calls.push({ command, params }) },
    document: { body: { innerText: '' }, querySelectorAll: () => [] },
  };
  const owner = { client: { pid: 123, executable: 'D:/Client/CMClient.exe' }, cdp: { status: 'ready' } };
  const external = {
    ...require('../scripts/cdp.cjs'),
    listTargets: async () => [target],
    CdpClient: { connect: async () => ({
      evaluate: async (fn, ...args) => vm.runInNewContext(`(${fn.toString()})(...args)`, { ...page, args }),
      close() {},
    }) },
  };
  const filename = path.join(__dirname, '../scripts/client.cjs');
  const context = {
    module: { exports: {} }, __dirname: path.dirname(filename), URL,
    require: name => name === './cdp.cjs' ? external : name === 'node:child_process' ? { spawnSync: () => ({ status: 0, stdout: JSON.stringify(owner) }) } : require(name),
  };
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), context, { filename });
  const api = context.module.exports;
  const options = () => api.parseArgs(['bridge', '--pid', '123', '--target', target.id, '--url', target.url, '--command', 'sendcompose']);
  return { api, options, calls, page, target };
}

test('empty-body compose preview dispatches nothing; applying sends one bridge request', async () => {
  const { api, options, calls } = bridgeFixture();
  assert.equal((await api.execute(options())).status, 'preview');
  assert.deepEqual(calls, []);
  assert.equal((await api.execute({ ...options(), apply: true })).status, 'dispatched');
  assert.deepEqual(calls, [{ command: 'sendcompose', params: '{}' }]);
});

test('an optional mismatching body marker blocks dispatch without changing content', async () => {
  const { api, options, calls, page } = bridgeFixture();
  await assert.rejects(api.execute({ ...options(), apply: true, marker: 'absent' }), e => e.code === 'WRONG_COMPOSE');
  assert.deepEqual(calls, []);
  assert.equal(page.document.body.innerText, '');
});

test('stale targets, navigated pages and non-compose pages block send before the bridge', async () => {
  const { api, options, calls, page, target } = bridgeFixture();
  await assert.rejects(api.execute({ ...options(), target: 'old', apply: true }), e => e.code === 'STALE_PAGE');
  page.location.href += '?changed';
  await assert.rejects(api.execute({ ...options(), apply: true }), e => e.code === 'STALE_PAGE');
  target.url = page.location.href = 'file:///D:/Client/app/template/readMail/index.html';
  await assert.rejects(api.execute({ ...options(), apply: true }), e => e.code === 'ARGUMENT');
  assert.deepEqual(calls, []);
});
