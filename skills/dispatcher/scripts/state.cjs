const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const { createServer } = require('node:net');
const { setTimeout: delay } = require('node:timers/promises');

class DispatchError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
function fail(code, message) { throw new DispatchError(code, message); }
function jsonCopy(value) {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) fail('INVALID_JSON', 'A JSON value is required.');
  return JSON.parse(serialized);
}
function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
  return JSON.stringify(value);
}
async function atomicJson(file, value) {
  const temporary = file + '.' + randomUUID() + '.tmp';
  let handle;
  try {
    handle = await fs.open(temporary, 'wx');
    await handle.writeFile(JSON.stringify(value, null, 2) + '\n');
    await handle.sync();
    await handle.close(); handle = null;
    await fs.rename(temporary, file);
  } finally {
    await handle?.close();
    await fs.rm(temporary, { force: true });
  }
}

// 命名管道的所有权由内核回收；进程退出不需要删除锁文件或判断陈旧 PID。
async function withState(stateDir, operation) {
  if (process.platform !== 'win32') fail('UNSUPPORTED_PLATFORM', 'Dispatcher state transactions require Windows named pipes.');
  await fs.mkdir(stateDir, { recursive: true });
  const real = (await fs.realpath(stateDir)).toLowerCase();
  if (real !== path.resolve(stateDir).toLowerCase()) fail('STATE_PATH_CHANGED', 'The state directory changed its real path.');
  for (const name of ['dispatcher-state.json']) {
    try { if ((await fs.lstat(path.join(stateDir, name))).isSymbolicLink()) fail('INVALID_STATE_PATH', 'The state file must not be a symbolic link.'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const pipe = '\\\\.\\pipe\\codex-dispatcher-' + createHash('sha256').update(real).digest('hex');
  const deadline = Date.now() + 5000;
  let server;
  while (!server) {
    const candidate = createServer(socket => socket.destroy());
    try {
      await new Promise((resolve, reject) => {
        candidate.once('error', reject);
        candidate.listen({ path: pipe, exclusive: true }, resolve);
      });
      server = candidate;
    } catch (error) {
      candidate.close();
      if (!['EADDRINUSE', 'EACCES'].includes(error.code)) throw error;
      if (Date.now() >= deadline) fail('STATE_BUSY', 'Another dispatcher transaction has not finished.');
      await delay(25);
    }
  }
  try {
    const file = path.join(stateDir, 'dispatcher-state.json');
    let state;
    try { state = JSON.parse(await fs.readFile(file, 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') fail('INVALID_STATE', 'The state cannot be read as JSON; preserve it for inspection.'); state = { version: 1, sequence: 0, entries: [] }; }
    validateState(state);
    const result = await operation(state);
    validateState(state);
    if (result.save) await atomicJson(file, state);
    return jsonCopy(result.value);
  } finally { await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
}
function validateState(state) {
  const uuid = value => /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(value || '');
  const evidence = value => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length;
  const roots = value => Array.isArray(value) && value.every(root => typeof root === 'string' && path.isAbsolute(root));
  if (state?.version !== 1 || !Number.isSafeInteger(state.sequence) || state.sequence < 0 || !Array.isArray(state.entries)) fail('INVALID_STATE', 'Preserve and inspect the dispatcher state.');
  const ids = new Set(), ordinals = new Set();
  for (const entry of state.entries) {
    const decision = entry?.decision;
    const reserved = ['dispatching', 'active', 'unknown'].includes(entry?.state);
    if (!entry || entry.event?.version !== 2 || typeof entry.event.sourceId !== 'string' || !entry.event.sourceId.trim() ||
        !/^[a-f0-9]{64}$/.test(entry.event.eventId || '') || ids.has(entry.event.eventId) ||
        !Number.isSafeInteger(entry.ordinal) || entry.ordinal < 1 || entry.ordinal > state.sequence || ordinals.has(entry.ordinal) ||
        !['imported', 'waiting', 'dispatching', 'active', 'unknown', 'not_sent', 'completed'].includes(entry.state) ||
        !roots(entry.claims) || (!reserved && entry.claims.length) ||
        (entry.state === 'imported' ? decision !== undefined : !decision ||
          Number(Object.hasOwn(decision, 'threadId')) + Number(Object.hasOwn(decision, 'projectId')) !== 1 ||
          (Object.hasOwn(decision, 'threadId') ? !uuid(decision.threadId) : !(decision.projectId === null || uuid(decision.projectId))) ||
          typeof decision.prompt !== 'string' || !decision.prompt.trim() || !roots(decision.workspaces)) ||
        (['dispatching', 'active', 'unknown', 'not_sent', 'completed'].includes(entry.state) && (!uuid(entry.attemptId) || !uuid(entry.threadId))) ||
        (decision?.threadId && entry.threadId && decision.threadId !== entry.threadId) ||
        (entry.state === 'completed' ? !evidence(entry.completion?.evidence) || entry.completion.threadId !== entry.threadId || entry.completion.attemptId !== entry.attemptId : entry.completion !== undefined)) fail('INVALID_STATE', 'Preserve and inspect the dispatcher entry.');
    ids.add(entry.event.eventId); ordinals.add(entry.ordinal);
  }
}
module.exports = { DispatchError, fail, jsonCopy, canonical, withState };
