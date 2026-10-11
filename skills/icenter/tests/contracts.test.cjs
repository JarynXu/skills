const test = require('node:test');
const assert = require('node:assert/strict');
const { requireScope, MessageCursor } = require('../scripts/contracts.cjs');

const snapshot = messages => ({ accountId: 'me', chatId: 'group-1', messages });
const message = (id, content = 'same text') => ({ id, content });

test('损坏的检查点不能静默重建基线', () => {
  for (const checkpoint of [false, 0, [], { version: 1, accountId: 'me', chatId: 'group-1', lastId: '' }]) {
    assert.throws(() => new MessageCursor('me', 'group-1', checkpoint), { code: 'INVALID_CHECKPOINT' });
  }
});

test('账户切换和会话切换各自报告失败', () => {
  assert.throws(() => requireScope(snapshot([]), 'other', 'group-1'), { code: 'ACCOUNT_CHANGED' });
  assert.throws(() => requireScope(snapshot([]), 'me', 'group-2'), { code: 'CHAT_CHANGED' });
});
test('同一正文的不同消息 ID 不合并', () => {
  const cursor = new MessageCursor('me', 'group-1');
  assert.deepEqual(cursor.advance(snapshot([message('1')])), []);
  assert.deepEqual(cursor.advance(snapshot([message('1'), message('2'), message('3')])), [message('2'), message('3')]);
  assert.deepEqual(cursor.advance(snapshot([message('1'), message('2'), message('3')])), []);
});
test('恢复游标返回锚点之后的消息', () => {
  const before = new MessageCursor('me', 'group-1');
  before.advance(snapshot([message('1')]));
  const after = new MessageCursor('me', 'group-1', before.checkpoint());
  assert.deepEqual(after.advance(snapshot([message('1'), message('2')])), [message('2')]);
});
test('游标不能跨账户或跨会话使用', () => {
  const cursor = new MessageCursor('me', 'group-1');
  cursor.advance(snapshot([message('1')]));
  assert.throws(() => new MessageCursor('other', 'group-1', cursor.checkpoint()), { code: 'ACCOUNT_CHANGED' });
  assert.throws(() => cursor.advance({ ...snapshot([message('2')]), chatId: 'group-2' }), { code: 'CHAT_CHANGED' });
});
test('缺少连续锚点时报告遗漏，不重新建立基线掩盖缺口', () => {
  const cursor = new MessageCursor('me', 'group-1');
  cursor.advance(snapshot([message('1')]));
  assert.throws(() => cursor.advance(snapshot([message('3')])), { code: 'MONITOR_GAP' });
  assert.equal(cursor.checkpoint().lastId, '1');
});
test('消息 ID 缺失或重复不能被当作有效读取', () => {
  const cursor = new MessageCursor('me', 'group-1');
  assert.throws(() => cursor.advance(snapshot([message('')])), { code: 'INVALID_MESSAGE_IDENTITY' });
  assert.throws(() => cursor.advance(snapshot([message('1'), message('1')])), { code: 'INVALID_MESSAGE_IDENTITY' });
});
test('空会话中的第一条消息被观察到', () => {
  const cursor = new MessageCursor('me', 'group-1');
  cursor.advance(snapshot([]));
  assert.deepEqual(cursor.advance(snapshot([message('1')])), [message('1')]);
});
