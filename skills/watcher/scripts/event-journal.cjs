const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { atomicJson, readJson, jsonFiles, digest, canonicalJson } = require('./persistence.cjs');
const { RuntimeError } = require('./errors.cjs');
const recordKeys = event => event.recordKeys;
const MAX_EVENTS = 10000, MAX_EVENT_BYTES = 64 * 1024 * 1024;
const encodedBytes = value => Buffer.byteLength(JSON.stringify(value, null, 2) + '\n');

// 分组与时间来自来源契约；计时和持久化不依赖消息平台。
function quietRounds(entries, quietMs, groupOf, timeOf) {
  const groups = new Map();
  for (const entry of entries) {
    const key = groupOf(entry[1]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  const rounds = [];
  for (const group of groups.values()) {
    let round = [];
    for (const entry of group) {
      if (round.length && quietMs > 0 && timeOf(entry[1]) - timeOf(round.at(-1)[1]) >= quietMs) { rounds.push(round); round = []; }
      round.push(entry);
    }
    if (round.length) rounds.push(round);
  }
  return rounds;
}

class EventJournal {
  constructor(config) {
    this.config = config; this.root = config.stateDir;
    this.batches = new Map(); this.receipts = new Map(); this.assigned = new Set();
    this.eventBytes = 0;
  }

  async openIdentity(signature) {
    const file = path.join(this.root, 'identity.json');
    this.identity = await readJson(file);
    if (this.identity && (this.identity.version !== 2 || this.identity.signature !== signature)) throw new RuntimeError('LISTENER_CONFIG_CHANGED', 'The saved source mapping or journal version differs; preserve it and establish an explicit migration.');
    if (!this.identity) {
      this.identity = { version: 2, ownerId: randomUUID(), signature };
      await atomicJson(file, this.identity);
    }
  }

  async openEvents(validateSource) {
    for (const { file, value } of await jsonFiles(path.join(this.root, 'batches'))) {
      if (!value || value.version !== 2 || !/^[a-f0-9]{64}$/.test(value.eventId || '') || path.basename(file) !== value.eventId + '.json' || !Array.isArray(recordKeys(value)) || !recordKeys(value).length || !Number.isSafeInteger(value.order) || value.order < 1 || [...this.batches.values()].some(event => event.order === value.order)) throw new RuntimeError('INVALID_LISTENER_STATE', 'A saved event has an invalid identity, record list or persisted order.');
      validateSource(value);
      if (this.batches.size >= MAX_EVENTS || this.eventBytes + encodedBytes(value) > MAX_EVENT_BYTES) throw new RuntimeError('EVENT_CAPACITY_REACHED', 'The retained journal exceeds its declared event or byte capacity; preserve data and reconcile the instance.');
      this.batches.set(value.eventId, value);
      this.eventBytes += encodedBytes(value);
      recordKeys(value).forEach(key => this.assigned.add(key));
      const receipt = await readJson(this.receiptPath(value.eventId));
      if (receipt && (!['dispatching', 'queued', 'unknown', 'pending', 'handled'].includes(receipt.state) || receipt.eventId !== value.eventId)) throw new RuntimeError('INVALID_LISTENER_STATE', 'A saved delivery receipt is invalid.');
      if (receipt) this.receipts.set(value.eventId, receipt);
    }
  }

  async publish(batch) {
    const previous = await readJson(this.batchPath(batch.eventId));
    if (previous && (previous.threadId !== batch.threadId || previous.sourceId !== batch.sourceId || digest(recordKeys(previous)) !== digest(recordKeys(batch)) || canonicalJson(previous.payload ?? previous.items) !== canonicalJson(batch.payload ?? batch.items))) throw new RuntimeError('EVENT_ID_CONFLICT', 'A stable event ID already belongs to different input.');
    if (!previous) {
      batch = { ...batch, order: [...this.batches.values()].reduce((maximum, event) => Math.max(maximum, event.order), 0) + 1 };
      if (this.batches.size >= MAX_EVENTS || this.eventBytes + encodedBytes(batch) > MAX_EVENT_BYTES) throw new RuntimeError('EVENT_CAPACITY_REACHED', 'Retained event capacity reached; this input was not confirmed. Archive the stopped instance after consumer reconciliation and use a new state directory.');
      await atomicJson(this.batchPath(batch.eventId), batch, { exclusive: true });
      this.eventBytes += encodedBytes(batch);
    }
    const saved = previous || batch;
    this.batches.set(saved.eventId, saved);
    recordKeys(saved).forEach(key => this.assigned.add(key));
    return saved;
  }

  batchPath(eventId) { return path.join(this.root, 'batches', eventId + '.json'); }
  receiptPath(eventId) { return path.join(this.root, 'receipts', eventId + '.json'); }

  orderedEvents() { return [...this.batches.values()].sort((a, b) => a.order - b.order); }

  async receipt(eventId, value) {
    if (!this.batches.has(eventId)) throw new RuntimeError('BATCH_NOT_FOUND', 'No persisted event has this ID.');
    const receipt = { ...value, eventId, updatedAt: new Date().toISOString() };
    await atomicJson(this.receiptPath(eventId), receipt);
    this.receipts.set(eventId, receipt);
  }

  deliverySummary() {
    return {
      queuedBatches: [...this.receipts.values()].filter(item => item.state === 'queued').length,
      retainedEventBytes: this.eventBytes,
      eventCapacity: { count: MAX_EVENTS, bytes: MAX_EVENT_BYTES },
      pendingBatches: [...this.batches.keys()].filter(id => !this.receipts.has(id) || this.receipts.get(id).state === 'pending').length,
      uncertainBatches: [...this.receipts.values()].filter(item => ['unknown', 'dispatching'].includes(item.state)).map(item => item.eventId)
    };
  }
}

module.exports = { EventJournal, quietRounds, recordKeys };
