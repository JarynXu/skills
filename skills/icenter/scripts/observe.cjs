const { randomUUID } = require('node:crypto');
const { setTimeout: delay } = require('node:timers/promises');
const { ClientError } = require('./cdp.cjs');

async function observe(session, { accountId, chatId, senderIds, durationMs, idleMs, emit, signal }) {
  const owner = { ownerId: randomUUID(), generationId: randomUUID(), accountId };
  const installed = await session.subscribe({ ...owner, sources: [{ kind: 'conversation', chatId, senderIds }] });
  owner.expectedGenerationId = installed.generationId;
  let acknowledged = 0, lastInput = Date.now(), removed = false;
  const deadline = lastInput + durationMs;
  async function drain() {
    const snapshot = await session.readPending(owner);
    for (const record of snapshot.records) {
      if (record.incoming) {
        await emit({ event: 'message', chatId: record.chatId, message: record.message });
        lastInput = Date.now();
      }
      await session.confirm({ ...owner, sequence: record.sequence });
      acknowledged = record.sequence;
    }
    if (snapshot.error) throw new ClientError(snapshot.error.code, snapshot.error.message);
  }
  try {
    await emit({ event: 'started', ...owner, baseline: installed.baseline });
    while (!signal?.aborted && Date.now() < deadline && (!idleMs || Date.now() < lastInput + idleMs)) {
      await drain();
      const wait = Math.min(250, deadline - Date.now(), idleMs ? lastInput + idleMs - Date.now() : Infinity);
      if (wait > 0) await delay(wait);
    }
    const reason = signal?.aborted ? 'requested' : Date.now() >= deadline ? 'deadline' : 'idle';
    await session.seal(owner);
    await drain();
    await session.unsubscribe({ ...owner, afterSequence: acknowledged });
    removed = true;
    await emit({ event: 'ended', reason, acknowledged, ...owner });
  } catch (error) {
    if (!removed) {
      // 输出或连接中断时只移除已经确认的空缓冲，有遗留记录则保留给原所有者取回。
      try { await session.seal(owner); await session.unsubscribe({ ...owner, afterSequence: acknowledged }); removed = true; }
      catch (cleanup) { error.details = { ...error.details, cleanup: cleanup.code || cleanup.message }; }
      error.details = { ...error.details, ...owner, acknowledged, removed };
    }
    throw error;
  }
}

module.exports = { observe };
