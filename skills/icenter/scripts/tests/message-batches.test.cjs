const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { createBatchState, validateBatchState, ingestRecords, releaseReady, confirmBatch, nextReadyAt } = require('../message-batches.cjs');

const accountId = 'sip:owner@example.test';
const iso = value => new Date(value).toISOString();
function state({ quietMs = 1000, maxWaitMs = 5000, sources = [] } = {}) {
  return createBatchState({ accountId, quietMs, maxWaitMs, sources });
}
function record(id, { account = accountId, chat = 'sip:room@example.test', sender = 'sip:sender@example.test', at = 10000, text = 'unknown body', incoming = true, message = {}, ...rest } = {}) {
  return { accountId: account, chatId: chat, id, incoming, ...rest,
    ...(message === null ? {} : { message: { id, senderId: sender, text, observedAt: iso(at), ...message } }) };
}
function expectCode(action, code) {
  assert.throws(action, error => error.code === code);
}

test('单聊消息按账户、会话和发送者独立归集，交错消息不串组', () => {
  const current = state();
  const first = record('a', { at: 10000 });
  const otherSender = record('b', { at: 10100, sender: 'sip:other@example.test' });
  const otherChat = record('c', { at: 10200, chat: 'sip:other-room@example.test' });
  ingestRecords(current, [first, otherSender, otherChat]);
  assert.equal(current.openBatches.length, 3);
  assert.deepEqual(current.openBatches.map(item => item.records.length), [1, 1, 1]);
  assert.equal(current.openBatches[0].records[0].message.text, 'unknown body');
  assert.equal(nextReadyAt(current), 11000);
  assert.equal(validateBatchState(current), true);
});

test('账户范围要求作用于所有输入记录，跨账户记录拒绝且不修改状态', () => {
  const current = state();
  ingestRecords(current, [record('first')]);
  const before = JSON.stringify(current);
  expectCode(() => ingestRecords(current, [record('outgoing', { account: 'sip:other@example.test', incoming: false })]), 'BATCH_SCOPE_MISMATCH');
  assert.equal(JSON.stringify(current), before);
  assert.deepEqual(ingestRecords(current, [record('outgoing', { incoming: false, chat: '', sender: '' })]), []);
});

test('重复通知不延长静默窗口，正文或发送者冲突显式失败', () => {
  const current = state();
  const original = record('stable', { at: 10000, text: 'original' });
  ingestRecords(current, [original]);
  ingestRecords(current, [record('stable', { at: 10900, text: 'original' })]);
  assert.equal(current.openBatches[0].lastObservedAt, iso(10000));
  assert.equal(nextReadyAt(current), 11000);
  expectCode(() => ingestRecords(current, [record('stable', { at: 10500, text: 'changed' })]), 'BATCH_MESSAGE_CONFLICT');
  expectCode(() => ingestRecords(current, [record('stable', { at: 10500, sender: 'sip:changed@example.test', text: 'original' })]), 'BATCH_MESSAGE_CONFLICT');
});

test('静默截止使用左闭边界并先封旧组，再把越界消息放入新批次', () => {
  const current = state({ quietMs: 1000, maxWaitMs: 5000 });
  ingestRecords(current, [record('first', { at: 10000 })]);
  ingestRecords(current, [record('within', { at: 10999 })]);
  assert.equal(current.openBatches[0].records.length, 2);
  assert.deepEqual(releaseReady(current, 11998), []);
  const ready = releaseReady(current, 11999);
  assert.equal(ready.length, 1);
  assert.equal(ready[0].reason, 'quiet');
  assert.equal(ready[0].closedAt, iso(11999));

  const boundary = state({ quietMs: 1000, maxWaitMs: 5000 });
  ingestRecords(boundary, [record('old', { at: 20000 })]);
  const pending = ingestRecords(boundary, [record('new', { at: 21000 })]);
  assert.equal(pending.length, 1);
  assert.equal(pending[0].reason, 'quiet');
  assert.equal(pending[0].records[0].id, 'old');
  assert.equal(boundary.openBatches[0].records[0].id, 'new');
});

test('持续输入在最大等待截止切批，下一条消息进入新批次', () => {
  const current = state({ quietMs: 1000, maxWaitMs: 2500 });
  ingestRecords(current, [record('one', { at: 30000 })]);
  ingestRecords(current, [record('two', { at: 30900 })]);
  ingestRecords(current, [record('three', { at: 31800 })]);
  assert.equal(nextReadyAt(current), 32500);
  const ready = ingestRecords(current, [record('four', { at: 32500 })]);
  assert.equal(ready.length, 1);
  assert.equal(ready[0].reason, 'max-wait');
  assert.deepEqual(ready[0].records.map(item => item.id), ['one', 'two', 'three']);
  assert.deepEqual(current.openBatches[0].records.map(item => item.id), ['four']);
  assert.equal(nextReadyAt(current), 33500);
});

test('JSON 恢复保持批次稳定 ID，确认只删除待交付批次且去重索引保留', () => {
  const original = state({ quietMs: 100, maxWaitMs: 500 });
  ingestRecords(original, [record('one', { at: 40000 }), record('two', { at: 40050 })]);
  const restored = JSON.parse(JSON.stringify(original));
  assert.equal(validateBatchState(restored), true);
  const ready = releaseReady(restored, 40150);
  assert.equal(ready.length, 1);
  const stableId = ready[0].id;

  const separatelyRestored = JSON.parse(JSON.stringify(original));
  const laterClosure = releaseReady(separatelyRestored, 40300);
  assert.equal(laterClosure[0].id, stableId);
  assert.equal(confirmBatch(restored, stableId), true);
  assert.equal(confirmBatch(restored, stableId), false);
  assert.equal(restored.seenIds.length, 2);
  assert.deepEqual(releaseReady(restored, 90000), []);
  ingestRecords(restored, [record('one', { at: 90000 }), record('two', { at: 90010 })]);
  assert.deepEqual(restored.batches, []);
  assert.equal(restored.openBatches.length, 0);
});

test('群提及以结构化个人 mention 决定 triggered，连续段前文和未知正文保留', () => {
  const group = 'sip:group@example.test';
  const current = state({ quietMs: 10, maxWaitMs: 100, sources: [{ kind: 'group-mention', chatId: group, trigger: 'mention' }] });
  const prior = record('prior', { chat: group, at: 50000, text: '前文未知正文' });
  const mention = record('mentioned', { chat: group, at: 50005, text: '提及位于连续段末尾', message: { mention: { userIds: [], unionIds: ['sip:owner-union'] } } });
  ingestRecords(current, [prior, mention]);
  const ready = releaseReady(current, 50015);
  assert.equal(ready[0].triggered, true);
  assert.deepEqual(ready[0].records.map(item => item.message.text), ['前文未知正文', '提及位于连续段末尾']);

  const untriggered = state({ quietMs: 0, maxWaitMs: 100, sources: [{ kind: 'group-mention', chatId: group, trigger: 'mention' }] });
  ingestRecords(untriggered, [record('no-mention', { chat: group, at: 60000, text: '正文保留', message: { mention: { userIds: [], unionIds: [] } } })]);
  assert.equal(releaseReady(untriggered, 60000)[0].triggered, false);
  assert.equal(untriggered.batches[0].records[0].message.text, '正文保留');
});

test('原生提及不可用时保留正文并标记未知，肯定提及覆盖同批未知', () => {
  const group = 'sip:group@example.test';
  const current = state({ quietMs: 0, maxWaitMs: 100, sources: [{ kind: 'group-mention', chatId: group, trigger: 'mention' }] });
  ingestRecords(current, [record('unavailable', { chat: group, at: 70000, text: '保留原生正文', message: { mention: { state: 'unavailable', reason: 'native-not-provided' } } })]);
  const unknownBatch = releaseReady(current, 70000)[0];
  assert.equal(unknownBatch.triggered, null);
  assert.equal(unknownBatch.records[0].message.text, '保留原生正文');
  assert.deepEqual(unknownBatch.records[0].message.mention, { state: 'unavailable', reason: 'native-not-provided' });
  assert.equal(validateBatchState(current), true);

  const mixed = state({ quietMs: 10, maxWaitMs: 100, sources: [{ kind: 'group-mention', chatId: group, trigger: 'mention' }] });
  ingestRecords(mixed, [
    record('unknown-first', { chat: group, at: 80000, message: { mention: { state: 'unavailable' } } }),
    record('confirmed-next', { chat: group, at: 80000, message: { mention: { userIds: [], unionIds: ['sip:owner-union'] } } })
  ]);
  assert.equal(releaseReady(mixed, 80010)[0].triggered, true);
  assert.equal(validateBatchState(mixed), true);
});

test('已封批次和恢复状态的重复归属、无效时间及损坏记录拒绝加载', () => {
  const current = state();
  ingestRecords(current, [record('one')]);
  const duplicate = JSON.parse(JSON.stringify(current));
  duplicate.openBatches.push(structuredClone(duplicate.openBatches[0]));
  expectCode(() => validateBatchState(duplicate), 'INVALID_BATCH_STATE');
  const badTime = JSON.parse(JSON.stringify(current));
  badTime.openBatches[0].records[0].message.observedAt = 'not-a-time';
  expectCode(() => validateBatchState(badTime), 'INVALID_BATCH_STATE');
  const badSource = { ...current, sources: [{ kind: 'group-mention', chatId: '', trigger: 'maybe' }] };
  expectCode(() => validateBatchState(badSource), 'INVALID_BATCH_STATE');
});

test('接收保留量达到上限时明确拒绝，不静默淘汰', () => {
  const pending = state({ quietMs: 60000, maxWaitMs: 60000 });
  ingestRecords(pending, Array.from({ length: 10000 }, (_, index) => record('pending-' + index, { at: 1000, sender: 'sip:one@example.test' })));
  expectCode(() => ingestRecords(pending, [record('overflow', { at: 1000 })]), 'RECEIVER_CAPACITY');
  assert.equal(pending.openBatches[0].records.length, 10000);

  const seen = state();
  const hash = value => createHash('sha256').update(value).digest('hex');
  seen.seenIds = Array.from({ length: 100000 }, (_, index) => ({ key: hash('seen-' + index), signature: hash('signature') }));
  expectCode(() => ingestRecords(seen, [record('one')]), 'RECEIVER_CAPACITY');
  assert.equal(seen.seenIds.length, 100000);
});

test('批次配置及 ready 时间拒绝无效值', () => {
  for (const options of [{ quietMs: -1 }, { quietMs: 60001 }, { quietMs: 1000, maxWaitMs: 999 }, { quietMs: 0, maxWaitMs: 0 }]) {
    expectCode(() => state(options), 'INVALID_BATCH_ARGUMENT');
  }
  expectCode(() => nextReadyAt({}), 'INVALID_BATCH_STATE');
  expectCode(() => releaseReady(state(), NaN), 'INVALID_BATCH_ARGUMENT');
});
