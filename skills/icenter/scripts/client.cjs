const { setTimeout: delay } = require('node:timers/promises');
const { ClientError, CdpClient, listTargets } = require('./cdp.cjs');
const { pageOperation } = require('./page.cjs');
const { MessageCursor, requireScope } = require('./contracts.cjs');

async function callPage(connection, operation, input = {}) {
  const result = await connection.evaluate(pageOperation, operation, input);
  if (!result || typeof result.ok !== 'boolean') throw new ClientError('INVALID_CLIENT_RESULT', 'The client returned an invalid operation result.');
  if (!result.ok) throw new ClientError(result.error.code, result.error.message, result.error.details);
  return result.value;
}

async function discover(port) {
  const result = [];
  for (const target of await listTargets(port)) {
    const connection = await CdpClient.connect(target.webSocketDebuggerUrl);
    try { result.push({ ...target, ...(await callPage(connection, 'identify')) }); }
    finally { connection.close(); }
  }
  return result;
}

async function connect(port, targetId) {
  const targets = (await discover(port)).filter(target => target.role === 'main' && (!targetId || target.id === targetId));
  if (targets.length !== 1) throw new ClientError('MAIN_WINDOW_NOT_UNIQUE', 'Select one iCenter main-window target.', { candidates: targets.map(t => ({ id: t.id, role: t.role })) });
  const connection = await CdpClient.connect(targets[0].webSocketDebuggerUrl);
  return { targetId: targets[0].id, call: (operation, input) => callPage(connection, operation, input), close: () => connection.close() };
}

async function select(client, scope, apply) {
  const result = await client.call('select', { ...scope, apply });
  if (!apply) return result;
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const status = await client.call('status', { accountId: scope.accountId });
    if (status.activeChatId === scope.chatId) return { ...result, state: 'selected' };
    await delay(200);
  }
  throw new ClientError('SELECTION_UNKNOWN', 'The client did not confirm the selected conversation. Inspect the UI before retrying.');
}

async function sendText(client, scope, text, apply, { timeoutMs = 15000, pollMs = 300 } = {}) {
  let submitted;
  try { submitted = await client.call('send', { ...scope, text, apply }); }
  catch (error) {
    if (apply && error.details?.phase !== 'not-edited') {
      throw new ClientError('SEND_UNKNOWN', 'The send operation did not finish reliably. Inspect the draft and history; do not send again automatically.', { cause: error.code, phase: error.details?.phase || 'unknown', ...scope });
    }
    throw error;
  }
  if (!apply) return submitted;
  const beforeIds = new Set(submitted.beforeIds);
  const deadline = Date.now() + timeoutMs;
  let observed = null;
  try {
    while (Date.now() < deadline) {
      const snapshot = await client.call('read', scope);
      requireScope(snapshot, scope.accountId, scope.chatId);
      const matches = snapshot.messages.filter(message => !beforeIds.has(message.id) && message.senderId === scope.accountId && message.text === text);
      if (matches.length > 1) throw new ClientError('AMBIGUOUS_SEND', 'More than one new message matches this send.');
      if (matches.length === 1) {
        observed = matches[0];
        if (observed.transfer === 'confirmed') return { state: 'client-confirmed', ...scope, message: observed, receipt: 'recipient-delivery-and-reading-not-verified' };
        if (observed.transfer === 'failed') throw new ClientError('SEND_FAILED', 'The client reports that sending failed.', { ...scope, message: observed });
      }
      await delay(pollMs);
    }
  } catch (error) {
    if (error.code === 'SEND_FAILED') throw error;
    throw new ClientError('SEND_UNKNOWN', 'Sending was requested but could not be verified. Inspect the original conversation before any retry.', { cause: error.code, ...scope, observed });
  }
  throw new ClientError('SEND_UNKNOWN', 'No confirmed matching message appeared before the deadline. Inspect the draft and history before any retry.', { ...scope, observed });
}

// 监控调用者拥有输出与检查点；循环只维护有界游标和时间契约。
async function watch(client, scope, { durationMs, idleMs, pollMs = 1000, checkpoint = null, emit, save = async () => {}, signal }) {
  if (!(durationMs > 0) || !(idleMs > 0) || !(pollMs > 0)) throw new ClientError('INVALID_DURATION', 'Watch duration, idle duration and poll interval must be positive.');
  const cursor = new MessageCursor(scope.accountId, scope.chatId, checkpoint);
  const start = Date.now();
  let lastActivity = start;
  let announced = false;
  while (!signal?.aborted) {
    const snapshot = await client.call('read', scope);
    const added = cursor.advance(snapshot);
    if (!announced) {
      await emit({ event: 'started', ...scope, coverage: 'loaded-message-window', resumed: checkpoint !== null });
      announced = true;
    }
    if (added.length) {
      await emit({ event: 'messages', ...scope, messages: added });
      lastActivity = Date.now();
    }
    await save(cursor.checkpoint());
    const now = Date.now();
    const reason = now - start >= durationMs ? 'duration' : now - lastActivity >= idleMs ? 'idle' : null;
    if (reason) { await emit({ event: 'stopped', reason, checkpoint: cursor.checkpoint() }); return; }
    try { await delay(Math.min(pollMs, durationMs - (now - start), idleMs - (now - lastActivity)), undefined, { signal }); }
    catch (error) { if (error.name !== 'AbortError') throw error; }
  }
  await emit({ event: 'stopped', reason: 'cancelled', checkpoint: cursor.checkpoint() });
}

module.exports = { connect, discover, select, sendText, watch, callPage };
