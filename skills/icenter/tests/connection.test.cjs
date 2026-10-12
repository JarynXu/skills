const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const fixture = path.join(__dirname, 'connection-fixture.ps1');
const script = path.resolve(__dirname, '../scripts/connection.ps1');

function run(t, scenario) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'icenter-connection-'));
  const executable = path.join(directory, 'iCenter.exe');
  fs.writeFileSync(executable, 'fixture');
  t.after(() => { fs.unlinkSync(executable); fs.rmdirSync(directory); });
  const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-File', fixture,
    '-Scenario', scenario, '-ConnectionScript', script, '-ClientExecutable', executable],
  { cwd: os.tmpdir(), encoding: 'utf8', timeout: 15000 });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  return JSON.parse(result.stdout);
}
const windows = { skip: process.platform !== 'win32' };
test('连接准备复用已开启的 CDP，restart 参数不强制重启', windows, t => {
  const value = run(t, 'reuse');
  assert.equal(value.result.status, 'connected'); assert.equal(value.result.pid, 701);
  assert.equal(value.result.port, 43123); assert.equal(value.result.restarted, false);
  assert.deepEqual(value.calls.started, []); assert.deepEqual(value.calls.stopped, []);
});
test('已有端口无法就绪时保留实例与端口，不重启', windows, t => {
  const value = run(t, 'unreachable');
  assert.match(value.error.message, /^CDP_NOT_READY:/);
  assert.deepEqual(value.error.details, { pid: 701, port: 43123, restarted: false });
  assert.deepEqual(value.calls.started, []); assert.deepEqual(value.calls.stopped, []);
});
test('缺少重启许可与多实例未选择时，不关闭或启动进程', windows, t => {
  for (const [scenario, code] of [['restart-required', 'RESTART_REQUIRED'], ['multiple', 'INSTANCE_NOT_UNIQUE']]) {
    const value = run(t, scenario);
    assert.ok(value.error.message.startsWith(code + ':'));
    assert.deepEqual(value.calls.started, []); assert.deepEqual(value.calls.stopped, []);
  }
});
test('重启限定所选 PID，保留原程序参数并加入回环 CDP', windows, t => {
  const value = run(t, 'selected-restart');
  assert.equal(value.error, null); assert.equal(value.result.restarted, true);
  assert.deepEqual(value.calls.stopped, [702]); assert.deepEqual(value.remainingPids, [701]);
  assert.equal(value.calls.started.length, 1);
  assert.match(value.calls.started[0].arguments, /--user-data-dir="C:\\profile folder" --profile=test/);
  assert.match(value.calls.started[0].arguments, /--remote-debugging-address=127\.0\.0\.1/);
  assert.ok(value.result.port > 0); assert.equal(value.calls.started[0].windowStyle, 'Hidden');
});
test('客户端未运行时支持安装发现与显式程序路径', windows, t => {
  for (const scenario of ['installed-start', 'explicit-start']) {
    const value = run(t, scenario);
    assert.equal(value.error, null); assert.equal(value.result.status, 'started');
    assert.equal(value.result.restarted, false); assert.equal(value.calls.started.length, 1);
    assert.deepEqual(value.calls.stopped, []); assert.deepEqual(value.calls.waited, [value.result.port]);
  }
});
test('多个安装路径不能按扫描顺序选择', windows, t => {
  const value = run(t, 'ambiguous-install');
  assert.match(value.error.message, /^INSTALLATION_NOT_UNIQUE:/);
  assert.deepEqual(value.calls.started, []);
});
test('Windows PowerShell 5.1 执行正常关闭路径，不跳过进程查询', windows, t => {
  const value = run(t, 'normal-close');
  assert.equal(value.error, null);
  assert.deepEqual(value.calls.inspected, [702]); assert.deepEqual(value.calls.stopped, [702]);
  assert.deepEqual(value.remainingPids, [701]); assert.equal(value.result.status, 'started');
});
test('真实进程关闭只停止所选辅助进程，保留另一个进程', windows, t => {
  const value = run(t, 'native-stop');
  assert.deepEqual(value, { selectedStopped: true, otherAlive: true });
});
