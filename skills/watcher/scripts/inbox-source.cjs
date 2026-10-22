const fs = require('node:fs/promises');
const path = require('node:path');
const { EventJournal, quietRounds, recordKeys } = require('./event-journal.cjs');
const { atomicJson, digest, jsonFiles } = require('./persistence.cjs');
const { RuntimeError } = require('./errors.cjs');
const MAX_RECORDS = 10000, MAX_RECORD_BYTES = 64 * 1024 * 1024;
const recordBytes = value => Buffer.byteLength(JSON.stringify(value, null, 2) + '\n');

class InboxStore extends EventJournal {
  constructor(config, { now = Date.now } = {}) { super(config); this.now = now; this.records = new Map(); this.files = new Map(); this.ordinal = 0; this.retainedRecordBytes = 0; }

  async open() {
    for (const name of ['messages', 'batches', 'receipts']) await fs.mkdir(path.join(this.root, name), { recursive: true });
    await this.openIdentity(digest([this.config.source, this.config.targetThreadId, this.config.debounceMs]));
    for (const { file, value } of await jsonFiles(path.join(this.root, 'messages'))) {
      if (!value || value.record?.sourceId !== this.config.source.id || typeof value.record.id !== 'string' || typeof value.record.text !== 'string' ||
        !Number.isInteger(value.ordinal) || value.ordinal < 1 || !Number.isFinite(Date.parse(value.receivedAt)) ||
        path.basename(file) !== digest([this.config.source.id, value.record.id]) + '.json' || !/^[a-f0-9]{64}$/.test(value.sourceHash || '') || !/^[a-z0-9_.-]+\.json$/i.test(value.sourceFile || '')) throw new RuntimeError('INVALID_LISTENER_STATE', 'An inbox record has invalid source identity, content or position.');
      const key = digest([this.config.source.id, value.record.id]);
      if (this.records.size >= MAX_RECORDS || this.retainedRecordBytes + recordBytes(value) > MAX_RECORD_BYTES) throw new RuntimeError('SOURCE_CAPACITY_REACHED', 'Retained inbox record capacity exceeded; preserve and reconcile this instance.');
      this.records.set(key, value); this.files.set(value.sourceFile, value.sourceHash); this.ordinal = Math.max(this.ordinal, value.ordinal);
      this.retainedRecordBytes += recordBytes(value);
    }
    await this.openEvents(event => {
      if (event.version !== 2 || !this.config.eventContract.matches(event) || !Array.isArray(event.items) || recordKeys(event).some(key => !this.records.has(key))) throw new RuntimeError('INVALID_LISTENER_STATE', 'An inbox event has a mismatched source, target or record.');
    });
  }

  async acceptFile(file, raw, observedAt) {
    const sourceHash = digest(raw);
    if (this.files.has(file)) {
      if (this.files.get(file) !== sourceHash) throw new RuntimeError('SOURCE_RECORD_CHANGED', 'An immutable inbox file was changed after capture.', { file });
      return false;
    }
    let input;
    try { input = JSON.parse(raw); } catch { throw new RuntimeError('INVALID_SOURCE_RECORD', 'Publish complete JSON files using atomic rename.', { file }); }
    if (!input || Array.isArray(input) || Object.keys(input).some(key => !['id', 'groupKey', 'text'].includes(key)) || typeof input.id !== 'string' || !input.id || input.id.length > 256 ||
      typeof input.text !== 'string' || input.text.length > 65536 || (input.groupKey !== undefined && (typeof input.groupKey !== 'string' || !input.groupKey || input.groupKey.length > 256))) throw new RuntimeError('INVALID_SOURCE_RECORD', 'An inbox item accepts id, text and optional groupKey.', { file });
    const key = digest([this.config.source.id, input.id]);
    const previous = this.records.get(key);
    if (previous) {
      throw new RuntimeError('SOURCE_ID_CONFLICT', 'An item ID cannot be reused under another immutable file name.', { file });
    }
    const record = { sourceId: this.config.source.id, id: input.id, groupKey: input.groupKey || input.id, text: input.text,
      contentState: input.text.trim() ? 'available' : 'needs-source-read', observedAt };
    const value = { ordinal: this.ordinal + 1, capturedAt: observedAt, receivedAt: observedAt, sourceFile: file, sourceHash, record };
    if (this.records.size >= MAX_RECORDS || this.retainedRecordBytes + recordBytes(value) > MAX_RECORD_BYTES) throw new RuntimeError('SOURCE_CAPACITY_REACHED', 'Retained inbox record capacity reached; preserve source input and reconcile the stopped instance.');
    await atomicJson(path.join(this.root, 'messages', key + '.json'), value, { exclusive: true });
    this.retainedRecordBytes += recordBytes(value);
    this.records.set(key, value); this.files.set(file, sourceHash); this.ordinal++;
    return true;
  }

  pendingRecords() { return [...this.records].filter(([key]) => !this.assigned.has(key)).sort((a, b) => a[1].ordinal - b[1].ordinal); }

  async createBatches({ quietMs = 0, now = this.now() } = {}) {
    const created = [];
    const timeOf = item => Date.parse(item.receivedAt);
    for (const entries of quietRounds(this.pendingRecords(), quietMs, item => item.record.groupKey, timeOf)) {
      const lastAt = Math.max(...entries.map(([, item]) => timeOf(item)));
      if (now - lastAt < quietMs) continue;
      const keys = entries.map(([key]) => key), first = entries[0][1].record;
      const eventId = digest([this.config.targetThreadId, keys]);
      const event = { version: 2, eventId, sourceId: this.config.source.id, threadId: this.config.targetThreadId,
        sourceRef: { kind: 'json-inbox', files: entries.map(([, item]) => item.sourceFile) }, groupKey: first.groupKey,
        quietMs, lastReceivedAt: new Date(lastAt).toISOString(), createdAt: new Date(this.now()).toISOString(), recordKeys: keys, items: entries.map(([, item]) => item.record) };
      await this.publish(event); created.push(event);
    }
    return created;
  }

  summary() { return { capturedMessages: this.records.size, pendingMessages: this.pendingRecords().length, retainedRecordBytes: this.retainedRecordBytes, ...this.deliverySummary() }; }
}

function bindInboxConfig(config) {
  return { ...config, eventTargets: [config.targetThreadId], eventContract: {
    matches: event => event.version === 2 && event.sourceId === config.source.id && event.threadId === config.targetThreadId,
    isControl: () => false,
    needsContent: event => !Array.isArray(event.items) || !event.items.length || event.items.some(item => item.contentState !== 'available'),
    receiptIdentity: event => ({ sourceId: event.sourceId })
  } };
}

function createInboxSource(config) {
  const verifyDirectory = async connection => {
    const resolved = await fs.realpath(config.source.directory);
    const stat = await fs.stat(resolved, { bigint: true });
    if (resolved !== connection.directory || !stat.isDirectory() || stat.dev.toString() !== connection.device || stat.ino.toString() !== connection.inode) throw new RuntimeError('SOURCE_PATH_CHANGED', 'The active inbox directory changed its resolved identity.');
  };
  return {
    createStore: () => new InboxStore(config),
    identity: () => ({ sourceId: config.source.id }),
    describe: () => ({ coverage: 'immutable-json-inbox', sourceId: config.source.id }),
    async connect() {
      const resolved = await fs.realpath(config.source.directory);
      const stat = await fs.stat(resolved, { bigint: true });
      if (resolved !== config.source.directory || !stat.isDirectory()) throw new RuntimeError('SOURCE_PATH_CHANGED', 'The inbox directory changed its resolved identity.');
      return { directory: resolved, device: stat.dev.toString(), inode: stat.ino.toString() };
    },
    async collect(connection, store, emit) {
      const checkedAt = Date.now(), observedAt = new Date(checkedAt).toISOString();
      await verifyDirectory(connection);
      let count = 0;
      for (const file of (await fs.readdir(connection.directory)).filter(name => /^[a-z0-9_.-]+\.json$/i.test(name)).sort()) {
        const target = path.join(connection.directory, file), stat = await fs.lstat(target);
        if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1024 * 1024) throw new RuntimeError('INVALID_SOURCE_RECORD', 'Inbox JSON must be regular files up to 1 MiB.', { file });
        const raw = await fs.readFile(target, 'utf8');
        await verifyDirectory(connection);
        if (await store.acceptFile(file, raw, observedAt)) count++;
      }
      if (count) emit({ event: 'captured', items: count });
      await store.createBatches({ quietMs: config.debounceMs, now: checkedAt });
      return checkedAt;
    },
    // 目录采集不拥有持续连接或远端订阅；没有需要撤销的外部资源。
    async close() {}
  };
}

module.exports = { InboxStore, bindInboxConfig, createInboxSource };
