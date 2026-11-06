const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { randomUUID } = require('node:crypto');
const { promisify } = require('node:util');
const exec = promisify(require('node:child_process').execFile);
const trigger = path.join(__dirname, '../scripts/trigger.cjs');

test('标准 CLI 登记两个实例，核对目标，按原配置停止或恢复单项', { skip: process.platform !== 'win32', timeout: 30000 }, async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'watcher-catalog-'));
  const serverFile = path.join(root, 'app-tools.cjs'), moduleFile = path.join(root, 'receiver.cjs');
  const configHome = path.join(root, 'codex'), configs = [];
  const env = { ...process.env, CODEX_HOME: configHome, CODEX_THREAD_ID: randomUUID(), CODEX_APP_TOOLS_PIPE_PATH: path.join(root, 'simulated-host') };
  const cli = async (...args) => JSON.parse((await exec(process.execPath, [trigger, ...args], { env, windowsHide: true })).stdout);
  const command = (name, file) => cli(name, '--config', file, '--apply');
  t.after(async () => {
    for (const c of configs) await command('stop', c.file);
    assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('watcher-catalog-'));
    await fs.rm(root, { recursive: true, force: true });
  });
  await fs.writeFile(serverFile, `
    const lines = require('node:readline').createInterface({input:process.stdin});
    lines.on('line', line => {
      const message = JSON.parse(line);
      if (!message.id) return;
      let result;
      if (message.method === 'initialize') result = {protocolVersion:'2024-11-05', capabilities:{tools:{}}};
      else if (message.method === 'tools/list') result = {tools:[{name:'read_thread'},{name:'send_message_to_thread'}]};
      else {
        if (message.params.name !== 'read_thread') throw Error('An idle instance tried to notify.');
        const thread = {id:message.params.arguments.threadId, kind:'codex', hostId:'local', status:{type:'idle'}};
        result = {content:[{type:'text',text:JSON.stringify({thread,turns:[]})}]};
      }
      process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:message.id,result})+'\\n');
    });`);
  await fs.writeFile(moduleFile, 'exports.open = async options => ({describe: () => ({ownerId:options.id}), read: async () => ({batches:[]}), confirm:async () => true, close:async () => {}});');
  for (const id of ['first', 'second']) {
    const file = path.join(root, id + '.json'), targetThreadId = randomUUID();
    const sourceId = id === 'first' ? id : id.repeat(1000);
    const value = { version: 2, stateDir: path.join(root, id), pollMs: 250, targetThreadId, wake: { backend: 'app-tools', serverFile },
      source: { id: sourceId, kind: 'receiver', module: moduleFile, export: 'open', options: { id: sourceId } } };
    await fs.writeFile(file, JSON.stringify(value)); configs.push({ file, value });
  }
  const [a,b] = configs;
  assert.deepEqual((await cli('list')).instances, []);
  const ready = await Promise.all(configs.map(c => command('start', c.file)));
  assert.ok(ready.every(item => item.state === 'listening' && item.fresh));
  const rows = (await cli('list')).instances;
  assert.equal(rows.length, 2); assert.ok(rows.every(item => item.subscription.ownerId === item.sourceId && item.lastObservationAt && item.pendingBatches === 0));
  assert.equal((await cli('list','--thread',a.value.targetThreadId)).instances[0].configFile, a.file);
  const alias = path.join(root, 'wrong.json');
  await fs.writeFile(alias, JSON.stringify({ ...a.value, targetThreadId: b.value.targetThreadId }));
  await assert.rejects(command('stop', alias), error => JSON.parse(error.stdout).error.code === 'LISTENER_CONFIG_CHANGED');
  await assert.rejects(command('register', alias), error => JSON.parse(error.stdout).error.code === 'LISTENER_CONFIG_CHANGED');
  await command('stop', a.file);
  assert.equal((await cli('status', '--config', b.file)).state, 'listening');
  await command('start', a.file);
  assert.equal((await command('register', a.file)).state, 'registered');
  assert.equal((await cli('list')).instances.length, 2);
});
