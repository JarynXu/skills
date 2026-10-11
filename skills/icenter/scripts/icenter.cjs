#!/usr/bin/env node
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { parseArgs } = require('node:util');
const { randomUUID } = require('node:crypto');
const { TextDecoder } = require('node:util');
const { ClientError } = require('./cdp.cjs');
const { connect, discover, select, sendText, watch } = require('./client.cjs');

const optionsByCommand = {
  connections: [], targets: ['port'], status: ['port', 'target-id'],
  chats: ['port', 'target-id', 'account', 'query'],
  select: ['port', 'target-id', 'account', 'chat', 'apply'],
  read: ['port', 'target-id', 'account', 'chat', 'limit'],
  send: ['port', 'target-id', 'account', 'chat', 'text-file', 'apply'],
  watch: ['port', 'target-id', 'account', 'chat', 'duration-seconds', 'idle-seconds', 'checkpoint'],
};
const output = value => process.stdout.write(JSON.stringify(value) + '\n');
const integer = (value, name, min, max) => {
  if (!/^\d+$/.test(String(value)) || Number(value) < min || Number(value) > max) throw new ClientError('INVALID_ARGUMENT', `${name} must be an integer from ${min} to ${max}.`);
  return Number(value);
};
const required = (values, key) => {
  if (!values[key]) throw new ClientError('MISSING_ARGUMENT', `--${key} is required.`);
  return values[key];
};

async function main(argv) {
  const command = argv[0];
  if (!command || command === '--help' || command === 'help') {
    output({ commands: optionsByCommand, defaults: { limit: 50, watchDurationSeconds: 60, watchIdleSeconds: 30 }, note: 'select/send preview by default; --apply executes. All IDs come from the observed client. See references/tools.md.' });
    return;
  }
  if (!Object.hasOwn(optionsByCommand, command)) throw new ClientError('UNKNOWN_COMMAND', `Unknown command: ${command}`);
  const schema = Object.fromEntries(optionsByCommand[command].map(key => [key, { type: key === 'apply' ? 'boolean' : 'string' }]));
  const { values } = parseArgs({ args: argv.slice(1), options: schema, allowPositionals: false, strict: true });
  if (command === 'connections') {
    if (process.platform !== 'win32') throw new ClientError('UNSUPPORTED_PLATFORM', 'Connection discovery requires Windows PowerShell; use an explicit CDP port on other hosts.');
    const raw = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-File', path.join(__dirname, 'connection.ps1'), '-Action', 'probe'], { encoding: 'utf8', timeout: 15000, windowsHide: true });
    output(JSON.parse(raw.replace(/^\uFEFF/, ''))); return;
  }
  const port = integer(required(values, 'port'), 'port', 1, 65535);
  if (command === 'targets') { output({ targets: (await discover(port)).map(({ id, role }) => ({ id, role })) }); return; }
  const scope = command === 'status' ? {} : { accountId: required(values, 'account') };
  if (['select', 'read', 'send', 'watch'].includes(command)) scope.chatId = required(values, 'chat');
  const limit = command === 'read' ? integer(values.limit ?? '50', 'limit', 1, 10000) : null;
  let text;
  if (command === 'send') {
    const bytes = await fs.readFile(required(values, 'text-file'));
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/\r\n/g, '\n');
    if (!text.trim()) throw new ClientError('EMPTY_MESSAGE', 'The message file is empty.');
  }
  let monitor;
  if (command === 'watch') {
    monitor = { durationMs: integer(values['duration-seconds'] ?? '60', 'duration-seconds', 1, 43200) * 1000,
      idleMs: integer(values['idle-seconds'] ?? '30', 'idle-seconds', 1, 43200) * 1000,
      emit: value => new Promise((resolve, reject) => process.stdout.write(JSON.stringify(value) + '\n', error => error ? reject(error) : resolve())) };
    if (values.checkpoint) {
      try { monitor.checkpoint = JSON.parse(await fs.readFile(values.checkpoint, 'utf8')); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (monitor.checkpoint === null) throw new ClientError('INVALID_CHECKPOINT', 'The checkpoint file must contain a checkpoint object, not null.');
      // 先完成 stdout 事件输出，再移动检查点；崩溃恢复允许重复，不能保证恰好一次。
      monitor.save = async checkpoint => {
        const temporary = values.checkpoint + '.' + randomUUID() + '.tmp';
        const handle = await fs.open(temporary, 'wx');
        try {
          try { await handle.writeFile(JSON.stringify(checkpoint)); } finally { await handle.close(); }
          await fs.rename(temporary, values.checkpoint);
        }
        finally { await fs.rm(temporary, { force: true }); }
      };
    }
  }
  const client = await connect(port, values['target-id']);
  try {
    if (command === 'status') output({ targetId: client.targetId, ...(await client.call('status')) });
    if (command === 'chats') {
      const result = await client.call('chats', scope);
      if (values.query) result.chats = result.chats.filter(chat => chat.name?.includes(values.query) || chat.id === values.query);
      output(result);
    }
    if (command === 'select') output(await select(client, scope, !!values.apply));
    if (command === 'read') {
      const result = await client.call('read', scope);
      const loadedCount = result.messages.length;
      result.messages = result.messages.slice(-limit);
      output({ ...result, loadedCount, returnedCount: result.messages.length });
    }
    if (command === 'send') output(await sendText(client, scope, text, !!values.apply));
    if (command === 'watch') {
      const controller = new AbortController(); const stop = () => controller.abort();
      process.once('SIGINT', stop); process.once('SIGTERM', stop);
      try { await watch(client, scope, { ...monitor, signal: controller.signal }); }
      finally { process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop); }
    }
  } finally { client.close(); }
}

if (require.main === module) main(process.argv.slice(2)).catch(error => {
  output({ ok: false, error: { code: error.code || 'TOOL_ERROR', message: error.message, ...(error.details === undefined ? {} : { details: error.details }) } });
  process.exitCode = 1;
});

module.exports = { main };
