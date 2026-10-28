const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs/promises');
const { writeImageOutput } = require('../scripts/image-output.cjs');
const { clientVersion } = require('../scripts/client-version.json');
const script = path.resolve(__dirname, '../scripts/icenter.cjs');

test('真实 CLI 从任意工作目录输出可解析帮助，无需 npm install', () => {
  const run = spawnSync(process.execPath, [script, 'help'], { cwd: os.tmpdir(), encoding: 'utf8' });
  assert.equal(run.status, 0); assert.ok(JSON.parse(run.stdout).commands.send.includes('suffix-file')); assert.ok(JSON.parse(run.stdout).commands['read-image']); assert.ok(JSON.parse(run.stdout).commands['release-image']);
  assert.ok(JSON.parse(run.stdout).commands['user-status']); assert.ok(JSON.parse(run.stdout).commands['set-user-status'].includes('expected-custom-id'));
});
test('SDK 目录、枚举和网页目录报告同一参考客户端版本', () => {
  for (const args of [['sdk-list'], ['sdk-enum', '--name', '14ce.R'], ['web-list']]) {
    const run = spawnSync(process.execPath, [script, ...args], { cwd: os.tmpdir(), encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr); assert.equal(JSON.parse(run.stdout).clientVersion, clientVersion);
  }
});
test('真实 CLI 预览和释放临时图片无需连接客户端', async () => {
  const result = await writeImageOutput(Buffer.from('owned output'));
  const args = [script, 'release-image', '--output-file', result.outputPath, '--cleanup-token', result.cleanupToken];
  try {
    const preview = spawnSync(process.execPath, args, { cwd: os.tmpdir(), encoding: 'utf8' });
    assert.equal(preview.status, 0); assert.equal(JSON.parse(preview.stdout).state, 'preview'); await fs.access(result.outputPath);
    const applied = spawnSync(process.execPath, [...args, '--apply'], { cwd: os.tmpdir(), encoding: 'utf8' });
    assert.equal(applied.status, 0); assert.equal(JSON.parse(applied.stdout).state, 'released');
    await assert.rejects(fs.access(path.dirname(result.outputPath)), { code: 'ENOENT' });
  } finally {
    spawnSync(process.execPath, [...args, '--apply'], { encoding: 'utf8' });
  }
});
test('真实 CLI 拒绝未知参数、缺失作用域和非法数值', () => {
  for (const args of [ ['send', '--unrecognized'], ['send', '--port', '1'], ['status', '--port', '0'], ['read', '--port', '1', '--account', 'self', '--chat', 'peer', '--limit', 'abc'] ]) {
    const run = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
    assert.equal(run.status, 1); assert.equal(JSON.parse(run.stdout).ok, false);
  }
});
test('真实 CLI 在连接前拒绝空后缀、NUL 和损坏的 UTF-8 文件', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'icenter-suffix-test-'));
  assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir()));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const body = path.join(directory, 'body.txt'), suffix = path.join(directory, 'suffix.txt');
  await fs.writeFile(body, '正文');
  for (const [content, code] of [[' \n', 'INVALID_ARGUMENT'], ['by\u0000助手', 'INVALID_ARGUMENT'], [Buffer.from([0xff]), 'ERR_ENCODING_INVALID_ENCODED_DATA']]) {
    await fs.writeFile(suffix, content);
    const run = spawnSync(process.execPath, [script, 'send', '--port', '1', '--account', 'self', '--chat', 'peer', '--text-file', body, '--suffix-file', suffix], { encoding: 'utf8' });
    assert.equal(run.status, 1); assert.equal(JSON.parse(run.stdout).error.code, code);
  }
});
