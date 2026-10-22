const fs = require('node:fs/promises');
const path = require('node:path');
const net = require('node:net');
const os = require('node:os');
const { createHash, randomUUID } = require('node:crypto');
const { setTimeout: delay } = require('node:timers/promises');
const { openNotifications, subscriptionScope, ClientError } = require('./notifications.cjs');
const { createBatchState, validateBatchState, ingestRecords, releaseReady, interruptBatches, confirmBatch, nextReadyAt } = require('./message-batches.cjs');

const fail = (code, message, details) => { throw new ClientError(code, message, details); };
const copy = value => structuredClone(value);
const fingerprint = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const errorInfo = error => ({ code: error.code || 'RECEIVER_FAILED', message: error.message, ...(error.details ? { details: error.details } : {}) });
const MAX_STATE_BYTES = 32 * 1024 * 1024;

async function privateDirectory(stateDir, create = false) {
  if (typeof stateDir !== 'string' || !path.isAbsolute(stateDir)) fail('INVALID_RECEIVER_SCOPE', 'Use an absolute persistent state directory.');
  const requested = path.resolve(stateDir);
  const check = async directory => {
    if (directory === path.parse(directory).root) fail('INVALID_RECEIVER_SCOPE', 'The filesystem root cannot hold receiver state.');
    for (let current = directory;; current = path.dirname(current)) {
      for (const marker of ['.git', 'SKILL.md']) {
        try { await fs.lstat(path.join(current, marker)); }
        catch (error) { if (error.code === 'ENOENT') continue; throw error; }
        fail('INVALID_RECEIVER_SCOPE', 'Receiver state must be outside Git worktrees and skill packages.');
      }
      if (current === path.dirname(current)) break;
    }
  };
  await check(requested);
  let existing = requested;
  const missing = [];
  for (;;) {
    try {
      const info = await fs.stat(existing);
      if (!info.isDirectory()) fail('INVALID_RECEIVER_SCOPE', 'The receiver state path must be a directory.');
      break;
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    missing.unshift(path.basename(existing)); existing = path.dirname(existing);
  }
  const resolved = path.join(await fs.realpath(existing), ...missing);
  await check(resolved);
  if (!create) return resolved;
  await fs.mkdir(resolved, { recursive: true });
  const directory = await fs.realpath(resolved);
  await check(directory);
  return directory;
}

function coverageError(state, error) {
  const { id, ...previous } = state.error || {};
  if (state.error && fingerprint(previous) === fingerprint(error)) return;
  interruptBatches(state.grouping);
  state.error = { ...copy(error), id: randomUUID() };
}

// 接收器拥有归集和恢复状态；连接参数不参与持久身份，允许同账户重连到新端口。
function receiverScope(options) {
  const { accountId, sources, mentionIdentity, quietMs = 3000, maxWaitMs = 30000 } = options;
  if (Object.hasOwn(options, 'mentionWindows') || Object.hasOwn(options, 'followups')) fail('INVALID_RECEIVER_SCOPE', 'The receiver owns continuation state; do not supply legacy windows.');
  if (!Array.isArray(sources) || !sources.length) fail('INVALID_RECEIVER_SCOPE', 'Configure at least one verified message source.');
  const nativeSources = sources.map(source => {
    if (!source || typeof source !== 'object' || Array.isArray(source)) fail('INVALID_RECEIVER_SCOPE', 'Invalid message source.');
    if (Object.hasOwn(source, 'followups')) fail('INVALID_RECEIVER_SCOPE', 'The receiver owns continuous input; do not supply followups.');
    if (Object.hasOwn(source, 'trigger') && (source.kind !== 'group' || !['all', 'mention'].includes(source.trigger))) fail('INVALID_RECEIVER_SCOPE', 'Only group sources accept trigger all or mention.');
    const { trigger, ...native } = source;
    return native;
  });
  const validated = subscriptionScope({ ownerId: 'validation', generationId: 'validation', accountId,
    sources: nativeSources, ...(mentionIdentity ? { mentionIdentity } : {}) });
  if (!Number.isInteger(quietMs) || quietMs < 0 || quietMs > 60000 || !Number.isInteger(maxWaitMs) || maxWaitMs < Math.max(1, quietMs) || maxWaitMs > 300000) {
    fail('INVALID_RECEIVER_SCOPE', 'quietMs must be 0..60000; maxWaitMs must be positive, at least quietMs and at most 300000.');
  }
  return { accountId: validated.accountId, sources: copy(sources), mentionIdentity: copy(mentionIdentity || null), quietMs, maxWaitMs };
}

function nativeScope(state) {
  return { ownerId: state.ownerId, accountId: state.scope.accountId, generationId: randomUUID(),
    sources: state.scope.sources.map(({ trigger, ...source }) => source),
    ...(state.scope.mentionIdentity ? { mentionIdentity: state.scope.mentionIdentity } : {}) };
}

async function acquireLock(directory) {
  const identity = fingerprint(process.platform === 'win32' ? directory.toLowerCase() : directory);
  const address = process.platform === 'win32' ? '\\\\.\\pipe\\icenter-receiver-' + identity : path.join(os.tmpdir(), 'icenter-receiver-' + identity + '.sock');
  const server = net.createServer(socket => socket.end());
  await new Promise((resolve, reject) => {
    server.once('error', error => reject(new ClientError(error.code === 'EADDRINUSE' ? 'RECEIVER_BUSY' : 'RECEIVER_LOCK_FAILED', 'The receiver state requires one active owner.', { cause: error.code })));
    server.listen(address, resolve);
  });
  server.unref();
  return () => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}

async function saveState(file, state) {
  const content = JSON.stringify(state);
  if (Buffer.byteLength(content) > MAX_STATE_BYTES) fail('RECEIVER_CAPACITY', 'The receiver checkpoint exceeds 32 MiB; retain it and start a separately reconciled observation.');
  const temporary = file + '.' + randomUUID() + '.tmp';
  let handle;
  try {
    handle = await fs.open(temporary, 'wx', 0o600);
    await handle.writeFile(content, 'utf8');
    await handle.sync();
    await handle.close(); handle = undefined;
    await fs.rename(temporary, file);
  } finally {
    await handle?.close();
    await fs.unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
}

async function loadState(file, scope) {
  let content;
  try {
    const info = await fs.lstat(file);
    if (!info.isFile() || info.isSymbolicLink() || info.size > MAX_STATE_BYTES) fail('INVALID_RECEIVER_STATE', 'The checkpoint must be a regular file within the receiver capacity.');
    content = await fs.readFile(file, 'utf8');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (content === undefined) return { restored: false, state: { version: 2, scope, ownerId: randomUUID(), generationId: null, baseline: null, checkpoint: 0, error: null, reconciliations: [], grouping: createBatchState(scope) } };
  let state;
  try { state = JSON.parse(content); } catch { fail('INVALID_RECEIVER_STATE', 'The saved checkpoint is not valid JSON.'); }
  if (![1, 2].includes(state?.version) || typeof state.ownerId !== 'string' || !state.ownerId || !Number.isInteger(state.checkpoint) || state.checkpoint < 0 ||
      !(state.generationId === null || (typeof state.generationId === 'string' && state.generationId)) ||
      !(state.baseline === null || Array.isArray(state.baseline)) ||
      !(state.error === null || (typeof state.error?.code === 'string' && typeof state.error.message === 'string'))) fail('INVALID_RECEIVER_STATE', 'The saved checkpoint has invalid ownership or coverage state.');
  if (fingerprint(state.scope) !== fingerprint(scope)) fail('RECEIVER_CONFIG_CHANGED', 'The state directory belongs to a different account, source or grouping policy. Preserve it and use the original configuration.');
  validateBatchState(state.grouping);
  if (state.grouping.accountId !== scope.accountId || state.grouping.quietMs !== scope.quietMs || state.grouping.maxWaitMs !== scope.maxWaitMs || fingerprint(state.grouping.sources) !== fingerprint(scope.sources)) fail('INVALID_RECEIVER_STATE', 'The saved groups do not match the receiver account and policy.');
  if (state.version === 1) {
    state.version = 2; state.reconciliations = [];
    if (state.error) { state.error.id = randomUUID(); interruptBatches(state.grouping); }
  }
  if (state.error && (typeof state.error.id !== 'string' || !state.error.id) || !Array.isArray(state.reconciliations) ||
      state.reconciliations.some(item => typeof item?.error?.id !== 'string' || !item.error.id || typeof item.evidence !== 'string' || !item.evidence.trim() ||
        typeof item.generationId !== 'string' || !Array.isArray(item.baseline) || !Number.isFinite(Date.parse(item.reconciledAt)))) {
    fail('INVALID_RECEIVER_STATE', 'The saved coverage recovery record is invalid.');
  }
  return { restored: true, state };
}

class MessageReceiver {
  #session; #file; #state; #unlock; #ownsSession; #deadline; #tail = Promise.resolve(); #closing = false; #closed = false; #closePromise; #abort = new AbortController();

  constructor({ session, file, state, unlock, ownsSession }) {
    this.#session = session; this.#file = file; this.#state = state; this.#unlock = unlock; this.#ownsSession = ownsSession;
    this.#deadline = nextReadyAt(state.grouping);
  }

  // 显式传入的会话为借用资源；工厂创建的会话由接收器关闭。
  static async open(options, ownsSession = false) {
    const { session, stateDir } = options;
    if (!session || !['subscribe', 'readPending', 'confirm', 'unsubscribe'].every(name => typeof session[name] === 'function')) fail('INVALID_RECEIVER_SCOPE', 'A native notification session is required.');
    const scope = receiverScope(options);
    const directory = await privateDirectory(stateDir, true), unlock = await acquireLock(directory), file = path.join(directory, 'receiver.json');
    try {
      let { state, restored } = await loadState(file, scope);
      // 订阅前保存所有者，进程在建立订阅后中断仍能接回相同资源。
      await saveState(file, state);
      const installed = await session.subscribe(nativeScope(state));
      if (typeof installed.generationId !== 'string' || !installed.generationId || !Array.isArray(installed.baseline)) fail('INVALID_CLIENT_RESULT', 'The subscription has no verified generation or baseline.');
      const next = copy(state);
      if (restored && (!installed.reused || state.generationId && state.generationId !== installed.generationId)) {
        coverageError(next, { code: 'LISTENER_LOST', message: 'The previous native subscription was lost. Saved inputs remain available; the interval needs history reconciliation.',
          details: { previousGenerationId: state.generationId, previousBaseline: state.baseline, checkpoint: state.checkpoint, baseline: installed.baseline,
            previousError: state.error ? { code: state.error.code, message: state.error.message } : null } });
        next.checkpoint = 0;
      }
      next.generationId = installed.generationId; next.baseline = installed.baseline;
      await saveState(file, next); state = next;
      return new MessageReceiver({ session, file, state, unlock, ownsSession });
    } catch (error) { await unlock(); throw error; }
  }

  #serialized(action) {
    if (this.#closing || this.#closed) return Promise.reject(new ClientError('RECEIVER_CLOSED', 'The receiver is closed.'));
    const task = this.#tail.then(action);
    this.#tail = task.catch(() => {});
    return task;
  }

  #owner() { return { ownerId: this.#state.ownerId, accountId: this.#state.scope.accountId }; }

  #snapshot() {
    return copy({ batches: this.#state.grouping.batches, error: this.#state.error,
      nextReadyAt: this.#state.error ? null : this.#deadline,
      accountId: this.#state.scope.accountId, generationId: this.#state.generationId, baseline: this.#state.baseline });
  }

  async #collect(verifyRecovery = false) {
    let snapshot;
    try { snapshot = await this.#session.readPending(this.#owner()); }
    catch (error) {
      if (['LISTENER_LOST', 'ACCOUNT_CHANGED', 'LISTENER_ACCOUNT_UNKNOWN'].includes(error.code)) {
        const next = copy(this.#state); coverageError(next, errorInfo(error));
        await saveState(this.#file, next); this.#state = next;
        if (verifyRecovery) fail('RECEIVER_NOT_READY', 'Restore a readable subscription for the configured account before reconciliation.', this.#state.error);
        return this.#snapshot();
      }
      throw error;
    }
    if (!Array.isArray(snapshot.records) || !Number.isInteger(snapshot.sequence) || !Number.isInteger(snapshot.acknowledged) || !Number.isFinite(snapshot.checkedAt)) fail('INVALID_CLIENT_RESULT', 'The notification snapshot has invalid sequence or time.');
    // 空闲轮询不复制或重写已见消息索引；未知来源确认仍按已持久检查点重试。
    if (snapshot.sequence === this.#state.checkpoint && snapshot.acknowledged <= this.#state.checkpoint &&
        !snapshot.error && (this.#state.error || this.#deadline === null || this.#deadline > snapshot.checkedAt)) {
      if (snapshot.acknowledged < this.#state.checkpoint) await this.#session.confirm({ ...this.#owner(), sequence: this.#state.checkpoint });
      return this.#snapshot();
    }
    const next = copy(this.#state);
    const records = snapshot.records.filter(record => record.sequence > next.checkpoint);
    let expected = next.checkpoint + 1;
    const contiguous = records.every(record => record.sequence === expected++);
    if (snapshot.acknowledged > next.checkpoint || snapshot.sequence < next.checkpoint || !contiguous ||
        (records.length ? records.at(-1).sequence !== snapshot.sequence : snapshot.sequence > next.checkpoint)) {
      coverageError(next, { code: 'RECEIVER_SEQUENCE_GAP', message: 'Native notification positions no longer match the saved checkpoint.' });
      await saveState(this.#file, next); this.#state = next;
      if (verifyRecovery) fail('RECEIVER_NOT_READY', 'Rebuild the subscription and reconcile its sequence gap before resuming.', next.error);
      return this.#snapshot();
    }
    if (snapshot.error) coverageError(next, snapshot.error);
    if (records.length) ingestRecords(next.grouping, records);
    next.checkpoint = Math.max(next.checkpoint, snapshot.sequence);
    // 覆盖已中断时保留原始输入，不把等待超时当成内容完整的证据。
    const due = next.error ? null : nextReadyAt(next.grouping);
    const release = due !== null && due <= snapshot.checkedAt;
    if (release) releaseReady(next.grouping, snapshot.checkedAt);
    if (records.length || release || fingerprint(next.error) !== fingerprint(this.#state.error) || next.checkpoint !== this.#state.checkpoint) {
      await saveState(this.#file, next); this.#state = next;
      this.#deadline = nextReadyAt(next.grouping);
    }
    if (next.checkpoint > snapshot.acknowledged) await this.#session.confirm({ ...this.#owner(), sequence: next.checkpoint });
    if (verifyRecovery && snapshot.error) fail('RECEIVER_NOT_READY', 'The native subscription still reports a coverage error; stop and reopen it before reconciliation.', next.error);
    return this.#snapshot();
  }

  read() { return this.#serialized(() => this.#collect()); }

  // 下一批只交付快照，不消费；调用方持久接收后才能 confirm。
  async next({ timeoutMs = 60000, signal } = {}) {
    if (!Number.isInteger(timeoutMs) || timeoutMs < 0 || timeoutMs > 3600000) fail('INVALID_RECEIVER_SCOPE', 'timeoutMs must be 0..3600000.');
    const until = Date.now() + timeoutMs;
    const combined = signal ? AbortSignal.any([signal, this.#abort.signal]) : this.#abort.signal;
    for (;;) {
      combined.throwIfAborted();
      const result = await this.read();
      if (result.error || result.batches.length || Date.now() >= until) return { ...result, timedOut: !result.error && !result.batches.length };
      const wait = Math.max(1, Math.min(500, until - Date.now(), result.nextReadyAt === null ? 500 : result.nextReadyAt - Date.now()));
      await delay(wait, undefined, { signal: combined });
    }
  }

  confirm(batchId) {
    return this.#serialized(async () => {
      const next = copy(this.#state);
      const result = confirmBatch(next.grouping, batchId);
      await saveState(this.#file, next); this.#state = next;
      return result;
    });
  }

  // 证据来自调用方的历史核对；此操作只恢复接收，不补写历史消息或宣称历史完整。
  reconcile({ errorId, evidence } = {}) {
    return this.#serialized(async () => {
      if (typeof errorId !== 'string' || !errorId || typeof evidence !== 'string' || !evidence.trim() || evidence.length > 4096) {
        fail('INVALID_RECONCILIATION', 'Provide the current coverage error ID and up to 4096 characters of reconciliation evidence.');
      }
      const prior = this.#state.reconciliations.find(item => item.error.id === errorId);
      if (prior) {
        if (prior.evidence !== evidence) fail('RECONCILIATION_CONFLICT', 'This error already has a different recovery record.');
        return copy(prior);
      }
      if (this.#state.error?.id !== errorId) fail('STALE_COVERAGE_ERROR', 'Read the current coverage error before reconciliation.');
      await this.#collect(true);
      if (this.#state.error?.id !== errorId) fail('STALE_COVERAGE_ERROR', 'Coverage changed during reconciliation; inspect the new error.');
      const next = copy(this.#state);
      interruptBatches(next.grouping);
      const receipt = { error: next.error, evidence, generationId: next.generationId, baseline: next.baseline, reconciledAt: new Date().toISOString() };
      next.reconciliations.push(receipt); next.error = null;
      await saveState(this.#file, next); this.#state = next; this.#deadline = nextReadyAt(next.grouping);
      return copy(receipt);
    });
  }

  // 检查已保存内容不读客户端，不推进静默期限，也不清除覆盖错误。
  inspect() { return this.#serialized(async () => ({ ...this.#snapshot(), pending: copy(this.#state.grouping.openBatches), reconciliations: copy(this.#state.reconciliations) })); }

  async stop() {
    await this.#serialized(async () => {
      await this.#collect();
      const next = copy(this.#state);
      if (!next.error) coverageError(next, { code: 'OBSERVATION_STOPPED', message: 'Observation was stopped. A later subscription has a new coverage interval.' });
      await saveState(this.#file, next); this.#state = next;
      await this.#session.unsubscribe(this.#owner());
    });
    await this.close();
  }

  close() {
    if (this.#closePromise) return this.#closePromise;
    this.#closing = true; this.#abort.abort();
    this.#closePromise = this.#tail.then(async () => {
      try { if (this.#ownsSession) await this.#session.close(); }
      finally { await this.#unlock(); this.#closed = true; }
    });
    return this.#closePromise;
  }
}

async function openMessageReceiver(options) {
  // 先检查范围，避免非法输入建立客户端连接。
  receiverScope(options);
  await privateDirectory(options.stateDir);
  const session = await openNotifications({ port: options.port, targetId: options.targetId });
  try { return await MessageReceiver.open({ ...options, session }, true); }
  catch (error) { await session.close(); throw error; }
}

module.exports = { openMessageReceiver, MessageReceiver };
