const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { EventJournal } = require('./event-journal.cjs');
const { atomicJson, readJson, digest, canonicalJson } = require('./persistence.cjs');
const { RuntimeError, errorInfo } = require('./errors.cjs');

class ReceiverStore extends EventJournal {
  async open() {
    for (const name of ['batches', 'receipts', 'source-errors']) await fs.mkdir(path.join(this.root, name), { recursive: true });
    await this.openIdentity(digest(canonicalJson([this.config.source, this.config.targetThreadId])));
    await this.openEvents(event => {
      if (event.sourceId !== this.config.source.id || event.threadId !== this.config.targetThreadId ||
        typeof event.payload?.id !== 'string' || !event.payload.id || event.eventId !== digest([this.config.source.id, event.payload.id]) ||
        canonicalJson(event.recordKeys) !== canonicalJson([event.payload.id]) || event.sourceRef?.kind !== 'receiver' || event.sourceRef.batchId !== event.payload.id) throw new RuntimeError('INVALID_LISTENER_STATE', 'A saved receiver event differs from its source identity or opaque batch.');
    });
    this.coverageError = await readJson(path.join(this.root, 'coverage-error.json'));
    const resolution = await readJson(path.join(this.root, 'coverage-resolution.json'));
    if (resolution?.coverageId === this.coverageError?.coverageId) this.coverageError = null;
  }

  async acceptBatch(batch) {
    let payload;
    try { payload = JSON.parse(canonicalJson(batch)); }
    catch (error) { throw new RuntimeError('INVALID_RECEIVER_BATCH', 'A ready batch must contain complete JSON data.', errorInfo(error)); }
    if (!payload || Array.isArray(payload) || typeof payload.id !== 'string' || !payload.id) throw new RuntimeError('INVALID_RECEIVER_BATCH', 'A ready batch needs a nonempty stable string id.');
    return this.publish({ version: 2, eventId: digest([this.config.source.id, payload.id]), sourceId: this.config.source.id,
      threadId: this.config.targetThreadId, recordKeys: [payload.id], sourceRef: { kind: 'receiver', batchId: payload.id },
      payload, createdAt: new Date().toISOString() });
  }

  async markCoverageError(error) {
    const value = { version: 1, coverageId: randomUUID(), sourceId: this.config.source.id, error: errorInfo(error), observedAt: new Date().toISOString() };
    await this.saveSourceEvidence(digest([value.sourceId, canonicalJson(value.error)]), value);
    await atomicJson(path.join(this.root, 'coverage-error.json'), value);
    this.coverageError = value;
  }

  async saveSourceEvidence(key, value) {
    const file = path.join(this.root, 'source-errors', key + '.json');
    if (!await readJson(file)) {
      const files = await fs.readdir(path.join(this.root, 'source-errors'));
      const sizes = await Promise.all(files.map(name => fs.stat(path.join(this.root, 'source-errors', name)).then(stat => stat.size)));
      if (files.length >= 1000 || sizes.reduce((sum, size) => sum + size, 0) + Buffer.byteLength(JSON.stringify(value, null, 2) + '\n') > 4 * 1024 * 1024) throw new RuntimeError('SOURCE_ERROR_CAPACITY_REACHED', 'Source error retention capacity reached; preserve the stopped instance and source buffer.');
      await atomicJson(file, value, { exclusive: true });
    }
  }

  async resolveCoverageError(reason) {
    if (typeof reason !== 'string' || !reason.trim()) throw new RuntimeError('RECONCILIATION_REASON_REQUIRED', 'Source reconciliation needs checked coverage or starting-point evidence from its owner.');
    const active = await readJson(path.join(this.root, 'coverage-error.json'));
    if (!active?.coverageId) throw new RuntimeError('SOURCE_ERROR_NOT_FOUND', 'There is no source coverage error to reconcile.');
    const existing = await readJson(path.join(this.root, 'coverage-resolution.json'));
    if (existing?.coverageId === active.coverageId) {
      if (existing.reason !== reason.trim()) throw new RuntimeError('SOURCE_ALREADY_RECONCILED', 'The source error already has different reconciliation evidence.');
      this.coverageError = null; return existing;
    }
    const resolution = { version: 1, coverageId: active.coverageId, sourceId: this.config.source.id, reason: reason.trim(), resolvedAt: new Date().toISOString(), error: active };
    await this.saveSourceEvidence(digest(['resolution', active.coverageId]), resolution);
    await atomicJson(path.join(this.root, 'coverage-resolution.json'), resolution);
    this.coverageError = null;
    return resolution;
  }

  summary() { return { capturedBatches: this.batches.size, ...(this.coverageError ? { sourceCoverageError: this.coverageError } : {}), ...this.deliverySummary() }; }
}

// 工厂由可信装配提供；事件载荷不能选择模块、选项或目标。
function createReceiverSource(config, { openReceiver } = {}) {
  return {
    createStore: () => new ReceiverStore(config),
    identity: () => ({ sourceId: config.source.id }),
    describe: () => ({ coverage: 'source-owned-ready-batches', sourceId: config.source.id }),
    async connect() {
      let factory = openReceiver;
      if (!factory) {
        const module = require(config.source.module);
        factory = module[config.source.export];
      }
      if (typeof factory !== 'function') throw new RuntimeError('INVALID_RECEIVER_FACTORY', 'The explicitly configured receiver export is not a function.');
      const receiver = await factory(JSON.parse(canonicalJson(config.source.options === undefined ? {} : config.source.options)));
      if (!receiver || ['read', 'confirm', 'close'].some(name => typeof receiver[name] !== 'function')) {
        await receiver?.close?.();
        throw new RuntimeError('INVALID_RECEIVER', 'A receiver must provide read, confirm and close.');
      }
      return receiver;
    },
    async collect(receiver, store, emit) {
      const observedAt = Date.now();
      let result;
      try { result = await receiver.read(); }
      catch (error) { await store.markCoverageError(error); throw error; }
      if (!result || !Array.isArray(result.batches)) throw new RuntimeError('INVALID_RECEIVER_RESULT', 'Receiver read must return a batches array and optional error.');
      // 一次读取的全部批次和覆盖错误在任何确认之前落盘。
      const saved = [];
      for (const batch of result.batches) saved.push(await store.acceptBatch(batch));
      const error = result.error == null ? null : new RuntimeError('SOURCE_COVERAGE_ERROR', 'The receiver reported incomplete source coverage.', JSON.parse(canonicalJson(result.error instanceof Error ? errorInfo(result.error) : result.error)));
      if (error) await store.markCoverageError(error);
      for (const event of new Map(saved.map(event => [event.eventId, event])).values()) if (await receiver.confirm(event.payload.id) !== true) throw new RuntimeError('SOURCE_CONFIRM_UNKNOWN', 'The persisted batch did not receive a positive source confirmation.', { batchId: event.payload.id });
      if (result.batches.length) emit({ event: 'captured', batches: result.batches.length });
      if (error) throw error;
      return observedAt;
    },
    // close 释放连接，保留来源订阅和待取缓冲；注销由来源技能负责。
    async close(receiver) { await receiver.close(); }
  };
}

module.exports = { ReceiverStore, createReceiverSource };
