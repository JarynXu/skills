const { createHash } = require('node:crypto');

const MAX_PENDING_MESSAGES = 10000;
const MAX_SEEN_IDS = 100000;
const STATE_KEYS = ['version', 'accountId', 'quietMs', 'maxWaitMs', 'sources', 'openBatches', 'batches', 'seenIds'];
const BATCH_KEYS = ['id', 'accountId', 'chatId', 'senderId', 'records', 'firstObservedAt', 'lastObservedAt', 'closedAt', 'reason', 'triggered'];
const OPEN_KEYS = ['id', 'accountId', 'chatId', 'senderId', 'records', 'firstObservedAt', 'lastObservedAt', 'triggered'];

function fail(code, message) {
  throw Object.assign(new Error(message), { code });
}

function object(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
}

function exactKeys(value, keys) {
  return object(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}

function jsonValue(value, ancestors = new Set()) {
  if (value === null || ['string', 'boolean'].includes(typeof value)) return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (!value || typeof value !== 'object' || ancestors.has(value) || !Array.isArray(value) && !object(value)) fail('INVALID_BATCH_RECORD', 'Records and state must contain JSON data.');
  const next = new Set(ancestors).add(value);
  for (const item of Array.isArray(value) ? value : Object.values(value)) jsonValue(item, next);
}

function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u.test(value)) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function digest(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function recordIdentity(record, accountId) {
  if (!object(record) || record.accountId !== accountId) fail('BATCH_SCOPE_MISMATCH', 'Every notification record must match the batch account.');
  if (record.incoming !== true || !Object.hasOwn(record, 'message')) return null;
  const message = record.message;
  if (!object(message) || typeof record.chatId !== 'string' || !record.chatId || typeof record.id !== 'string' || !record.id ||
      message.id !== record.id || typeof message.senderId !== 'string' || !message.senderId || typeof message.text !== 'string' || timestamp(message.observedAt) === null) {
    fail('INVALID_BATCH_RECORD', 'An incoming message needs matching IDs, sender, text and ISO observation time.');
  }
  const stableKey = JSON.stringify([accountId, record.chatId, record.id]);
  return { stableKey, key: digest(stableKey), senderId: message.senderId, signature: digest(JSON.stringify([message.senderId, message.text])), at: timestamp(message.observedAt) };
}

function checkedConfig({ accountId, quietMs, maxWaitMs, sources }) {
  if (typeof accountId !== 'string' || !accountId) fail('INVALID_BATCH_ARGUMENT', 'A nonempty account ID is required.');
  if (!Number.isInteger(quietMs) || quietMs < 0 || quietMs > 60000 || !Number.isInteger(maxWaitMs) || maxWaitMs <= 0 || maxWaitMs < quietMs) {
    fail('INVALID_BATCH_ARGUMENT', 'quietMs must be 0..60000 and maxWaitMs must be positive and at least quietMs.');
  }
  if (!Array.isArray(sources)) fail('INVALID_BATCH_ARGUMENT', 'Notification sources must be an array.');
  try { jsonValue(sources); }
  catch { fail('INVALID_BATCH_ARGUMENT', 'Notification sources must contain JSON data.'); }
  for (const source of sources) {
    if (!object(source)) fail('INVALID_BATCH_ARGUMENT', 'Each notification source must be an object.');
    const kind = source.kind || 'conversation';
    if (['group', 'group-mention'].includes(kind)) {
      if (typeof source.chatId !== 'string' || !source.chatId || source.trigger !== undefined && !['mention', 'all'].includes(source.trigger)) {
        fail('INVALID_BATCH_ARGUMENT', 'A group source needs a chat ID and an optional mention/all trigger.');
      }
    } else if (source.trigger !== undefined) fail('INVALID_BATCH_ARGUMENT', 'Only group sources accept a trigger mode.');
  }
  return { accountId, quietMs, maxWaitMs, sources: structuredClone(sources) };
}

function groupKey(accountId, chatId, senderId) {
  return JSON.stringify([accountId, chatId, senderId]);
}

function messageTriggered(state, record) {
  const source = state.sources.find(item => item.chatId === record.chatId && ['group', 'group-mention'].includes(item.kind || 'conversation'));
  if (!source || (source.trigger || 'all') === 'all') return true;
  const mention = record.message.mention;
  if (!object(mention) || mention.state === 'unavailable' || !Array.isArray(mention.userIds) || !Array.isArray(mention.unionIds)) return null;
  return ['userIds', 'unionIds'].some(key => mention[key].some(id => typeof id === 'string' && id && id !== '#' && id !== 'all'));
}

function batchTriggered(state, records) {
  let unknown = false;
  for (const record of records) {
    const value = messageTriggered(state, record);
    if (value === true) return true;
    if (value === null) unknown = true;
  }
  return unknown ? null : false;
}

function combineTrigger(current, next) {
  if (current === true || next === true) return true;
  if (current === null || next === null) return null;
  return false;
}

function batchId(accountId, chatId, senderId, firstRecord) {
  return digest(JSON.stringify(['message-batch-v1', accountId, chatId, senderId, firstRecord.id]));
}

function deadlineOf(state, group) {
  return Math.min(Date.parse(group.lastObservedAt) + state.quietMs, Date.parse(group.firstObservedAt) + state.maxWaitMs);
}

function closeReason(state, group) {
  return Date.parse(group.firstObservedAt) + state.maxWaitMs <= Date.parse(group.lastObservedAt) + state.quietMs ? 'max-wait' : 'quiet';
}

function seal(state, group, closedAt, reason) {
  const index = state.openBatches.indexOf(group);
  if (index >= 0) state.openBatches.splice(index, 1);
  state.batches.push({ id: group.id, accountId: group.accountId, chatId: group.chatId, senderId: group.senderId,
    records: group.records, firstObservedAt: group.firstObservedAt, lastObservedAt: group.lastObservedAt,
    closedAt, reason, triggered: group.triggered });
}

function recordCount(state) {
  return [...state.openBatches, ...state.batches].reduce((sum, batch) => sum + batch.records.length, 0);
}

function commitState(target, source) {
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, source);
}

function validateSourceList(sources) {
  try { checkedConfig({ accountId: 'validation-account', quietMs: 0, maxWaitMs: 1, sources }); }
  catch { fail('INVALID_BATCH_STATE', 'The saved source configuration is invalid.'); }
}

function validateBatchState(state) {
  if (!exactKeys(state, STATE_KEYS) || state.version !== 1 || typeof state.accountId !== 'string' || !state.accountId ||
      !Number.isInteger(state.quietMs) || state.quietMs < 0 || state.quietMs > 60000 || !Number.isInteger(state.maxWaitMs) || state.maxWaitMs <= 0 || state.maxWaitMs < state.quietMs ||
      !Array.isArray(state.sources) || !Array.isArray(state.openBatches) || !Array.isArray(state.batches) || !Array.isArray(state.seenIds) || state.seenIds.length > MAX_SEEN_IDS) {
    fail('INVALID_BATCH_STATE', 'The saved message batch state is invalid.');
  }
  try { jsonValue(state); }
  catch { fail('INVALID_BATCH_STATE', 'The saved message batch state is not valid JSON data.'); }
  validateSourceList(state.sources);
  const seen = new Map();
  for (const item of state.seenIds) {
    if (!exactKeys(item, ['key', 'signature']) || !/^[a-f0-9]{64}$/u.test(item.key) || !/^[a-f0-9]{64}$/u.test(item.signature) || seen.has(item.key)) {
      fail('INVALID_BATCH_STATE', 'The saved message deduplication index is invalid.');
    }
    seen.set(item.key, item.signature);
  }
  const owned = new Set();
  let pending = 0;
  const validateGroup = (group, closed) => {
    if (!exactKeys(group, closed ? BATCH_KEYS : OPEN_KEYS) || group.accountId !== state.accountId || typeof group.chatId !== 'string' || !group.chatId ||
        typeof group.senderId !== 'string' || !group.senderId || !Array.isArray(group.records) || !group.records.length || ![true, false, null].includes(group.triggered)) {
      fail('INVALID_BATCH_STATE', 'A saved message batch is malformed.');
    }
    if (closed && (!['quiet', 'max-wait', 'coverage-gap'].includes(group.reason) || timestamp(group.closedAt) === null)) fail('INVALID_BATCH_STATE', 'A closed message batch has an invalid closure.');
    const times = [];
    for (const record of group.records) {
      let identity;
      try { identity = recordIdentity(record, state.accountId); }
      catch { fail('INVALID_BATCH_STATE', 'A saved message record is malformed or outside its account.'); }
      if (!identity || record.chatId !== group.chatId || record.message.senderId !== group.senderId || owned.has(identity.key) || seen.get(identity.key) !== identity.signature) {
        fail('INVALID_BATCH_STATE', 'A saved message is duplicated, out of scope or missing from the deduplication index.');
      }
      owned.add(identity.key); times.push(identity.at);
    }
    const first = Math.min(...times), last = Math.max(...times);
    if (timestamp(group.firstObservedAt) !== first || timestamp(group.lastObservedAt) !== last || group.id !== batchId(group.accountId, group.chatId, group.senderId, group.records[0]) ||
        group.triggered !== batchTriggered(state, group.records)) {
      fail('INVALID_BATCH_STATE', 'A saved message batch has inconsistent identity or timestamps.');
    }
    if (closed && (timestamp(group.closedAt) < last || group.reason !== 'coverage-gap' && group.reason !== closeReason(state, group))) fail('INVALID_BATCH_STATE', 'A closed message batch has an inconsistent closure time or reason.');
    pending += group.records.length;
  };
  const groupKeys = new Set();
  for (const group of state.openBatches) {
    validateGroup(group, false);
    const key = groupKey(group.accountId, group.chatId, group.senderId);
    if (groupKeys.has(key)) fail('INVALID_BATCH_STATE', 'A sender and chat may have only one open batch.');
    groupKeys.add(key);
  }
  const batchIds = new Set();
  for (const batch of state.batches) {
    validateGroup(batch, true);
    if (batchIds.has(batch.id)) fail('INVALID_BATCH_STATE', 'Closed batch IDs must be unique.');
    batchIds.add(batch.id);
  }
  if (pending > MAX_PENDING_MESSAGES) fail('INVALID_BATCH_STATE', 'The saved state exceeds the pending message limit.');
  return true;
}

function createBatchState({ accountId, quietMs, maxWaitMs, sources }) {
  const config = checkedConfig({ accountId, quietMs, maxWaitMs, sources });
  return { version: 1, ...config, openBatches: [], batches: [], seenIds: [] };
}

function ingestRecords(state, records) {
  validateBatchState(state);
  if (!Array.isArray(records)) fail('INVALID_BATCH_ARGUMENT', 'Notification records must be an array.');
  const working = structuredClone(state);
  const prepared = records.map(record => {
    jsonValue(record);
    return { record: structuredClone(record), identity: recordIdentity(record, working.accountId) };
  });
  const seen = new Map(working.seenIds.map(item => [item.key, item.signature]));
  let added = 0;
  for (const { record, identity } of prepared) {
    if (!identity) continue;
    const previous = seen.get(identity.key);
    if (previous !== undefined) {
      if (previous !== identity.signature) fail('BATCH_MESSAGE_CONFLICT', 'A repeated message ID has different text or sender data.');
      continue;
    }
    added++;
    seen.set(identity.key, identity.signature);
  }
  if (working.seenIds.length + added > MAX_SEEN_IDS || recordCount(working) + added > MAX_PENDING_MESSAGES) {
    fail('RECEIVER_CAPACITY', 'The message receiver reached its retained-message limit.');
  }
  const inserted = new Set(working.seenIds.map(item => item.key));
  const openByKey = new Map(working.openBatches.map(group => [groupKey(group.accountId, group.chatId, group.senderId), group]));
  for (const { record, identity } of prepared) {
    if (!identity || inserted.has(identity.key)) continue;
    inserted.add(identity.key);
    const messageKey = identity.key;
    const at = identity.at;
    const key = groupKey(working.accountId, record.chatId, identity.senderId);
    let group = openByKey.get(key);
    if (group) {
      if (at >= deadlineOf(working, group)) {
        seal(working, group, new Date(at).toISOString(), closeReason(working, group));
        openByKey.delete(key);
        group = null;
      }
    }
    if (!group) {
      group = { id: batchId(working.accountId, record.chatId, identity.senderId, record), accountId: working.accountId,
        chatId: record.chatId, senderId: identity.senderId, records: [], firstObservedAt: record.message.observedAt,
        lastObservedAt: record.message.observedAt, triggered: messageTriggered(working, record) };
      working.openBatches.push(group);
      openByKey.set(key, group);
    }
    group.records.push(record);
    group.firstObservedAt = new Date(Math.min(Date.parse(group.firstObservedAt), at)).toISOString();
    group.lastObservedAt = new Date(Math.max(Date.parse(group.lastObservedAt), at)).toISOString();
    group.triggered = combineTrigger(group.triggered, messageTriggered(working, record));
    working.seenIds.push({ key: messageKey, signature: identity.signature });
  }
  validateBatchState(working);
  commitState(state, working);
  return structuredClone(state.batches);
}

function releaseReady(state, now) {
  validateBatchState(state);
  if (!Number.isFinite(now) || !Number.isFinite(new Date(now).getTime())) fail('INVALID_BATCH_ARGUMENT', 'now must be a valid epoch-millisecond number.');
  const working = structuredClone(state);
  for (const group of [...working.openBatches]) {
    if (deadlineOf(working, group) <= now) seal(working, group, new Date(now).toISOString(), closeReason(working, group));
  }
  validateBatchState(working);
  commitState(state, working);
  return structuredClone(state.batches);
}

function confirmBatch(state, batchIdValue) {
  validateBatchState(state);
  if (typeof batchIdValue !== 'string' || !batchIdValue) fail('INVALID_BATCH_ARGUMENT', 'A batch ID is required.');
  const index = state.batches.findIndex(batch => batch.id === batchIdValue);
  if (index < 0) return false;
  state.batches.splice(index, 1);
  validateBatchState(state);
  return true;
}

// 覆盖边界结束未封组，不把中断两侧的消息合并，也不声称静默期已经满足。
function interruptBatches(state) {
  validateBatchState(state);
  for (const group of [...state.openBatches]) seal(state, group, group.lastObservedAt, 'coverage-gap');
  validateBatchState(state);
}

function nextReadyAt(state) {
  validateBatchState(state);
  return state.openBatches.length ? Math.min(...state.openBatches.map(group => deadlineOf(state, group))) : null;
}

module.exports = { createBatchState, validateBatchState, ingestRecords, releaseReady, interruptBatches, confirmBatch, nextReadyAt };
