const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { createServer, createConnection } = require('node:net');
const { randomUUID } = require('node:crypto');
const { setTimeout: delay } = require('node:timers/promises');
const { RuntimeError: ClientError, errorInfo } = require('./errors.cjs');
const { atomicJson, readJson, digest } = require('./persistence.cjs');
const { NativeCodexQueue } = require('./codex-queue.cjs');
const output = value => process.stdout.write(JSON.stringify(value) + '\n');
const alive = pid => { try { process.kill(pid, 0); return true; } catch (error) { return error.code === 'EPERM'; } };

async function canonicalPath(file) {
  const tail = [];
  let current = path.resolve(file);
  while (true) {
    try { return path.join(await fs.realpath(current), ...tail.reverse()); }
    catch (error) {
      if (error.code !== 'ENOENT' || path.dirname(current) === current) throw error;
      tail.push(path.basename(current)); current = path.dirname(current);
    }
  }
}
const pathIdentity = file => process.platform === 'win32' ? file.toLowerCase() : file;

async function lockPipe(config) {
  if (process.platform !== 'win32') throw new ClientError('UNSUPPORTED_PLATFORM', 'The listener process lock requires Windows named pipes.');
  const identity = pathIdentity(await canonicalPath(config.stateDir));
  return '\\\\.\\pipe\\' + (config.lockPrefix || 'codex-watcher-') + digest(identity);
}

// 查询只连接现有管道，不取得独占权；无响应与没有持有者是不同结果。
async function queryOwner(config, request = { command: 'owner' }) {
  const pipe = await lockPipe(config);
  return new Promise(resolve => {
    const socket = createConnection(pipe);
    let data = '', finished = false;
    const finish = result => { if (finished) return; finished = true; clearTimeout(timer); socket.destroy(); resolve(result); };
    const timer = setTimeout(() => finish({ ownership: 'unknown', error: { code: 'OWNER_QUERY_TIMEOUT' } }), 1000);
    socket.setEncoding('utf8');
    socket.on('connect', () => socket.write(JSON.stringify(request) + '\n'));
    socket.on('error', error => finish(['ENOENT', 'ECONNREFUSED'].includes(error.code) ? { ownership: 'absent' } : { ownership: 'unknown', error: errorInfo(error) }));
    socket.on('end', () => finish({ ownership: 'unknown', error: { code: 'INVALID_OWNER_RESPONSE' } }));
    socket.on('data', chunk => {
      data += chunk;
      if (data.length > 4096) { finish({ ownership: 'unknown', error: { code: 'INVALID_OWNER_RESPONSE' } }); return; }
      if (!data.includes('\n')) return;
      try {
        const response = JSON.parse(data.slice(0, data.indexOf('\n')));
        if (response.version !== 1 || !Number.isInteger(response.owner?.pid) || response.owner.pid <= 0 || typeof response.owner.token !== 'string' || !response.owner.token) throw new Error('Invalid owner');
        finish({ ...response, ownership: 'owned' });
      } catch { finish({ ownership: 'unknown', error: { code: 'INVALID_OWNER_RESPONSE' } }); }
    });
  });
}

async function acquireLock(config, { onStop } = {}) {
  const pipe = await lockPipe(config);
  await fs.mkdir(config.stateDir, { recursive: true });
  const file = path.join(config.stateDir, 'listener.lock');
  const owner = { pid: process.pid, token: randomUUID(), startedAt: new Date().toISOString() };
  // 内核管道持有单写者权；磁盘文件仅记录所有者，进程崩溃不会留下内核锁。
  const sockets = new Set();
  let released = false;
  const server = createServer(socket => {
    sockets.add(socket); socket.once('close', () => sockets.delete(socket));
    socket.on('error', () => socket.destroy()); socket.setTimeout(1000, () => socket.destroy()); socket.setEncoding('utf8');
    let data = '';
    socket.on('data', chunk => {
      data += chunk;
      if (data.length > 4096) { socket.destroy(); return; }
      if (!data.includes('\n')) return;
      socket.removeAllListeners('data');
      let request;
      try { request = JSON.parse(data.slice(0, data.indexOf('\n'))); } catch { socket.destroy(); return; }
      if (!['owner', 'stop'].includes(request?.command)) { socket.destroy(); return; }
      const accepted = request.command === 'stop' && request.token === owner.token && typeof onStop === 'function' && !released;
      // 停止请求绑定此连接的持有者；令牌不从磁盘取得，也不会作用于继任实例。
      socket.end(JSON.stringify({ version: 1, owner, stopSupported: typeof onStop === 'function', ...(request.command === 'stop' ? { stopAccepted: accepted } : {}) }) + '\n', () => { if (accepted) onStop(); });
    });
  });
  try {
    await new Promise((resolve, reject) => {
      const failed = error => { server.removeListener('listening', ready); reject(error); };
      const ready = () => { server.removeListener('error', failed); resolve(); };
      server.once('error', failed); server.once('listening', ready); server.listen({ path: pipe, exclusive: true });
    });
  } catch (error) {
    if (['EADDRINUSE', 'EACCES'].includes(error.code)) throw new ClientError('LISTENER_ALREADY_RUNNING', 'Another process owns the listener kernel lock.');
    throw error;
  }
  server.unref();
  const close = () => new Promise((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); for (const socket of sockets) socket.destroy(); });
  try {
    await atomicJson(file, owner);
  } catch (error) { await close(); throw error; }
  return { owner, release: async () => {
    if (released) return; released = true;
    try { if ((await readJson(file))?.token === owner.token) await fs.unlink(file); }
    finally { await close(); }
  } };
}

async function status(config) {
  const state = await readJson(path.join(config.stateDir, 'status.json'));
  let lock, lockRecord;
  try { lock = await readJson(path.join(config.stateDir, 'listener.lock')); }
  catch (error) { if (!(error instanceof SyntaxError)) throw error; lockRecord = 'unreadable'; }
  const observed = await queryOwner(config), owner = observed.owner;
  lockRecord ||= !lock ? 'missing' : observed.ownership === 'unknown' ? 'unverified' : owner?.token === lock.token && owner.pid === lock.pid ? 'matched' : 'stale';
  const matching = !!owner && state?.token === owner.token && state.pid === owner.pid;
  const age = Date.now() - Date.parse(state?.updatedAt);
  const fresh = matching && age >= 0 && age < Math.max(30000, config.pollMs * 3);
  let observedState = state?.state === 'failed' ? 'failed' : 'stopped';
  if (observed.ownership === 'unknown') observedState = 'ownership-unknown';
  else if (owner) observedState = !matching ? 'starting' : fresh ? state.state : 'unresponsive';
  return { ...(state || {}), ...(owner || {}), state: observedState,
    ownership: observed.ownership, lockRecord, observedProcessAlive: !!owner && alive(owner.pid), recordedProcessAlive: Number.isInteger(lock?.pid) && lock.pid > 0 && alive(lock.pid), fresh,
    ...(observed.error ? { ownershipError: observed.error } : {}) };
}

// 队列提交的超时和断线保留为未知；收到消费者处理结果或人工核对后才能推进。
async function deliver(store, queue, config, emit = output) {
  for (const batch of store.orderedEvents()) {
    const eventId = batch.eventId;
    const receipt = store.receipts.get(eventId);
    if (receipt?.state === 'queued' || receipt?.state === 'handled') continue;
    if (receipt && ['unknown', 'dispatching'].includes(receipt.state)) {
      const handled = await readJson(path.join(store.root, 'consumer', eventId + '.json'));
      if (handled?.eventId === eventId && handled.threadId === batch.threadId && ['accepted', 'ignored', 'attention', 'completed'].includes(handled.outcome)) {
        await store.receipt(eventId, { state: 'handled', outcome: handled.outcome });
        continue;
      }
      return;
    }
    await store.receipt(eventId, { state: 'dispatching' });
    try {
      const confirmed = await queue.notify(batch, store.batchPath(eventId), config.configFile);
      if (!confirmed || confirmed.threadId !== batch.threadId) throw new ClientError('NOTIFY_UNKNOWN', 'The notification backend returned no matching target receipt.');
      await store.receipt(eventId, { ...confirmed, state: 'queued' });
      emit({ event: 'queued', eventId, threadId: batch.threadId });
    } catch (error) {
      await store.receipt(eventId, { state: 'unknown', error: errorInfo(error) });
      emit({ event: 'notification-unknown', eventId, error: errorInfo(error) });
      return;
    }
  }
}

// 运行时拥有等待、投递与退出；来源适配器拥有采集、连续性与外部操作。
async function run(config, { source, queue = new NativeCodexQueue(config.wake.executable), emit = output, signal } = {}) {
  if (!source || typeof source.createStore !== 'function') throw new ClientError('SOURCE_REQUIRED', 'Compose a source adapter before starting.');
  const controller = new AbortController();
  const abort = () => controller.abort();
  const lock = await acquireLock(config, { onStop: abort });
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) abort();
  process.once('SIGINT', abort); process.once('SIGTERM', abort);
  let connection, store, lastStatus = 0, ready = false;
  const writeStatus = async (state, error) => {
    await atomicJson(path.join(config.stateDir, 'status.json'), { version: 2, ...lock.owner, ...(source.identity?.() || {}), state,
      updatedAt: new Date().toISOString(), ...(store ? store.summary() : {}), ...(error ? { error: errorInfo(error) } : {}) });
    lastStatus = Date.now();
  };
  let failure;
  try {
    store = source.createStore();
    await store.open();
    await writeStatus('starting');
    await queue.check();
    if (!controller.signal.aborted) connection = await source.connect();
    while (!controller.signal.aborted) {
      const checkedAt = await source.collect(connection, store, emit);
      if (!Number.isFinite(checkedAt)) throw new ClientError('UNSUPPORTED_SCHEMA', 'A source capture needs a finite observation time.');
      await deliver(store, queue, config, emit);
      const state = store.summary().sourceCoverageError ? 'source-coverage-blocked' : store.summary().uncertainBatches.length ? 'notification-blocked' : 'listening';
      if (!ready || Date.now() - lastStatus >= 5000) await writeStatus(state);
      if (!ready) {
        ready = true;
        emit({ event: state, pid: process.pid, ...(source.describe?.() || {}) });
      }
      await delay(config.pollMs, undefined, { signal: controller.signal });
    }
  } catch (error) {
    if (error.name !== 'AbortError') failure = error;
  } finally {
    signal?.removeEventListener('abort', abort);
    process.removeListener('SIGINT', abort); process.removeListener('SIGTERM', abort);
    try {
      // 清理连接前保存最后一次可读输入；来源的注销不是 watcher 停止的一部分。
      if (connection) {
        try { if (!failure) await source.collect(connection, store, emit); }
        catch (error) { failure = error; }
        try { await source.close(connection); }
        catch (error) { failure = failure ? new ClientError('SOURCE_CLEANUP_FAILED', 'The watcher failed and its source connection could not close.', { primary: errorInfo(failure), cleanup: errorInfo(error) }) : error; }
      }
      await writeStatus(failure ? 'failed' : 'stopped', failure);
      emit(failure ? { event: 'failed', error: errorInfo(failure) } : { event: 'stopped', reason: 'requested', ...store.summary() });
    } finally { await lock.release(); }
  }
  if (failure) throw failure;
}

async function start(config) {
  const existing = await status(config);
  if (existing.ownership === 'owned') throw new ClientError('LISTENER_ALREADY_RUNNING', 'A process already owns this listener.', { pid: existing.pid });
  if (existing.ownership === 'unknown') throw new ClientError('LISTENER_OWNERSHIP_UNKNOWN', 'The listener owner could not be verified.', existing.ownershipError);
  await fs.mkdir(config.stateDir, { recursive: true });
  const log = await fs.open(path.join(config.stateDir, 'listener.log'), 'a', 0o600);
  let child;
  const launchedAt = Date.now();
  try {
    child = spawn(process.execPath, [config.commandFile || path.join(__dirname, 'trigger.cjs'), 'run', '--config', config.configFile, '--apply'], { detached: true, windowsHide: true, stdio: ['ignore', log.fd, log.fd] });
    child.unref();
  } finally { await log.close(); }
  let launchError;
  child.once('error', error => { launchError = error; });
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (launchError) throw launchError;
    const state = await status(config);
    if (state.pid === child.pid && state.fresh && ['listening', 'notification-blocked', 'source-coverage-blocked'].includes(state.state)) return { ...state, stateDir: config.stateDir };
    if (state.pid === child.pid && Date.parse(state.startedAt) >= launchedAt && state.state === 'failed') throw new ClientError('LISTENER_START_FAILED', 'The listener reported a startup failure.', state.error);
    if (child.exitCode !== null || child.signalCode !== null) throw new ClientError('LISTENER_START_FAILED', 'The child process exited before confirming readiness; inspect listener.log.', { pid: child.pid, exitCode: child.exitCode, signalCode: child.signalCode });
    await delay(150);
  }
  throw new ClientError('LISTENER_START_UNKNOWN', 'The process started but did not confirm readiness; inspect status and the log before starting another process.', { pid: child.pid });
}

async function stop(config) {
  const active = await queryOwner(config);
  if (active.ownership === 'unknown') throw new ClientError('LISTENER_OWNERSHIP_UNKNOWN', 'The listener owner could not be verified.', active.error);
  if (active.ownership === 'owned') {
    if (!active.stopSupported) throw new ClientError('LISTENER_NOT_STOPPABLE', 'The current lock owner is a maintenance operation or an incompatible runtime.', { pid: active.owner.pid });
    const requested = await queryOwner(config, { command: 'stop', token: active.owner.token });
    if (requested.ownership === 'absent' || requested.ownership === 'owned' && requested.owner.token !== active.owner.token) return status(config);
    if (!requested.stopAccepted) throw new ClientError('LISTENER_STOP_UNKNOWN', 'The listener did not confirm the stop request.', requested.error);
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) {
      const current = await queryOwner(config);
      if (current.ownership === 'absent' || current.ownership === 'owned' && current.owner.token !== active.owner.token) return status(config);
      await delay(150);
    }
    return { state: 'stop-requested', pid: active.owner.pid, note: 'Termination is not confirmed; inspect before restarting.' };
  }
  const lock = await acquireLock(config);
  try {
    const previous = await readJson(path.join(config.stateDir, 'status.json'));
    const result = { ...previous, ...lock.owner, state: 'stopped', updatedAt: new Date().toISOString(), sourceSubscription: 'preserved' };
    await atomicJson(path.join(config.stateDir, 'status.json'), result);
    return { ...result, ownership: 'absent', lockRecord: 'missing', observedProcessAlive: false, fresh: false };
  } finally { await lock.release(); }
}

module.exports = { canonicalPath, acquireLock, status, deliver, run, start, stop };
