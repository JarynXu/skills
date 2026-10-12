const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const execute = promisify(execFile);
const script = path.resolve(__dirname, '../scripts/icenter.cjs');

async function setup(t) {
  let upgrades = 0;
  const server = http.createServer((request, response) => {
    assert.equal(request.url, '/json/list');
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify([
      { id: 'main', type: 'page', url: 'app://./index.html', webSocketDebuggerUrl: 'ws://127.0.0.1:12345/main' },
      { id: 'workbench', type: 'webview', url: 'https://fixture.invalid/app', title: 'Workbench', webSocketDebuggerUrl: 'ws://127.0.0.1:12345/workbench' },
      { id: 'worker', type: 'worker', url: 'https://fixture.invalid/worker' },
    ]));
  });
  server.on('upgrade', (_request, socket) => { upgrades++; socket.destroy(); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'icenter-cdp-'));
  const parameters = path.join(directory, 'parameters.json');
  t.after(async () => { await fs.rm(parameters, { force: true }); await fs.rmdir(directory); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  return { port: String(server.address().port), parameters, upgrades: () => upgrades };
}
async function cli(args, socketFixture = false) {
  const prefix = socketFixture ? ['--require', path.join(__dirname, 'cdp-socket-fixture.cjs')] : [];
  try {
    const result = await execute(process.execPath, [...prefix, script, ...args], { encoding: 'utf8', timeout: 10000, cwd: os.tmpdir() });
    return { status: 0, value: JSON.parse(result.stdout) };
  } catch (error) { return { status: error.code, value: JSON.parse(error.stdout) }; }
}
test('targets --all 包含工作台 webview，排除非页面目标', async t => {
  const fixture = await setup(t);
  const result = await cli(['targets', '--port', fixture.port, '--all']);
  assert.equal(result.status, 0); assert.deepEqual(result.value.targets.map(page => page.id), ['main', 'workbench']);
});
test('通用 CDP 预览只发现目标，不创建 WebSocket 或执行请求', async t => {
  const fixture = await setup(t);
  const result = await cli(['cdp', '--port', fixture.port, '--target-id', 'workbench', '--method', 'DOM.getDocument']);
  assert.equal(result.status, 0); assert.deepEqual(result.value, { state: 'preview', targetId: 'workbench', method: 'DOM.getDocument', params: {} });
  assert.equal(fixture.upgrades(), 0);
});
test('通用 CDP 请求发送到明确页面，保留 UTF-8 参数且不调用 Vue 适配器', async t => {
  const fixture = await setup(t);
  const params = { expression: "'中文\\n`$()'", returnByValue: true, awaitPromise: true };
  await fs.writeFile(fixture.parameters, JSON.stringify(params));
  const result = await cli(['cdp', '--port', fixture.port, '--target-id', 'workbench', '--method', 'Runtime.evaluate', '--params-file', fixture.parameters, '--apply'], true);
  assert.equal(result.status, 0); assert.equal(result.value.state, 'executed');
  assert.deepEqual(result.value.result, { endpoint: 'ws://127.0.0.1:12345/workbench', method: 'Runtime.evaluate', params });
});
test('通用 CDP 拒绝未知目标、非法方法与非对象参数', async t => {
  const fixture = await setup(t);
  await fs.writeFile(fixture.parameters, '[]');
  for (const [args, code] of [
    [['--target-id', 'missing', '--method', 'DOM.getDocument'], 'TARGET_NOT_FOUND'],
    [['--target-id', 'main', '--method', 'invalid'], 'INVALID_ARGUMENT'],
    [['--target-id', 'main', '--method', 'DOM.getDocument', '--params-file', fixture.parameters], 'INVALID_ARGUMENT'],
  ]) {
    const result = await cli(['cdp', '--port', fixture.port, ...args, '--apply']);
    assert.equal(result.status, 1); assert.equal(result.value.error.code, code);
  }
});
test('通用 CDP 传播协议拒绝，不把请求记为执行成功', async t => {
  const fixture = await setup(t);
  const result = await cli(['cdp', '--port', fixture.port, '--target-id', 'main', '--method', 'Fixture.error', '--apply'], true);
  assert.equal(result.status, 1); assert.equal(result.value.error.code, 'CDP_PROTOCOL_ERROR');
  assert.equal(result.value.error.details.protocolCode, -32601);
});
