const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const os = require('node:os');
const script = path.resolve(__dirname, '../scripts/icenter.cjs');

test('真实 CLI 从任意工作目录输出可解析帮助，无需 npm install', () => {
  const run = spawnSync(process.execPath, [script, 'help'], { cwd: os.tmpdir(), encoding: 'utf8' });
  assert.equal(run.status, 0); assert.ok(JSON.parse(run.stdout).commands.send);
});
test('真实 CLI 拒绝未知参数、缺失作用域和非法数值', () => {
  for (const args of [ ['send', '--unrecognized'], ['send', '--port', '1'], ['status', '--port', '0'], ['read', '--port', '1', '--account', 'self', '--chat', 'peer', '--limit', 'abc'] ]) {
    const run = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
    assert.equal(run.status, 1); assert.equal(JSON.parse(run.stdout).ok, false);
  }
});
