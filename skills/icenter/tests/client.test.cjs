const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ClientError } = require('../scripts/cdp.cjs');
const { callPage, sendText, watch } = require('../scripts/client.cjs');
const { nativePageOperation } = require('../scripts/native-page.cjs');
const { inspectOrigin, markAutomation } = require('../scripts/message-origin.cjs');
const { sendReply } = require('../scripts/conversation-send.cjs');
const scope = { accountId: 'self', chatId: 'peer' };
const message = (id, transfer = 'confirmed') => ({ id, senderId: 'self', text: 'hello', transfer });
const options = { timeoutMs: 30, pollMs: 1 };

test('写入前拒绝保留原错误；协议响应损坏保留发送未知状态', async () => {
  await assert.rejects(sendText({ call: async () => { throw new ClientError('DRAFT_PRESENT', 'draft', { phase: 'not-edited' }); } }, scope, 'hello', true, options), { code: 'DRAFT_PRESENT' });
  await assert.rejects(sendText({ call: async () => { throw new ClientError('CDP_BAD_RESPONSE', 'bad response'); } }, scope, 'hello', true, options), { code: 'SEND_UNKNOWN' });
});

test('发送预览不读取确认状态', async () => {
  const result = await sendText({ call: async (op, input) => {
    assert.equal(op, 'send'); assert.equal(input.apply, false); return { state: 'preview' };
  } }, scope, 'hello', false);
  assert.equal(result.state, 'preview');
});
test('旧的相同正文不构成本次发送证据，等待新增消息确认', async () => {
  let reads = 0;
  const client = { call: async op => op === 'send' ? { beforeIds: ['old'] } : { ...scope,
    messages: ++reads === 1 ? [message('old')] : [message('old'), message('new', reads === 2 ? 'pending' : 'confirmed')] } };
  const result = await sendText(client, scope, 'hello', true, options);
  assert.equal(result.message.id, 'new'); assert.equal(reads, 3); assert.equal(result.state, 'client-confirmed');
});
test('客户端失败状态不能算发送成功', async () => {
  await assert.rejects(sendText({ call: async op => op === 'send' ? { beforeIds: [] } : { ...scope, messages: [message('new', 'failed')] } }, scope, 'hello', true, options), { code: 'SEND_FAILED' });
});
test('编辑器清空但没有消息证据时保持未知，不重发', async () => {
  let sends = 0;
  await assert.rejects(sendText({ call: async op => op === 'send' ? (++sends, { beforeIds: [] }) : { ...scope, messages: [] } }, scope, 'hello', true, options), { code: 'SEND_UNKNOWN' });
  assert.equal(sends, 1);
});
test('发送命令断连与确认期间切换会话都报告未知', async () => {
  for (const failAt of ['send', 'read']) {
    await assert.rejects(sendText({ call: async op => {
      if (op === failAt) throw new ClientError(failAt === 'send' ? 'CDP_DISCONNECTED' : 'CHAT_CHANGED', 'changed');
      return { beforeIds: [] };
    } }, scope, 'hello', true, options), { code: 'SEND_UNKNOWN' });
  }
});
test('两个新增同文消息不能任取一个确认发送', async () => {
  await assert.rejects(sendText({ call: async op => op === 'send' ? { beforeIds: [] } : { ...scope, messages: [message('a'), message('b')] } }, scope, 'hello', true, options), { code: 'SEND_UNKNOWN' });
});
test('直发能力取得核对后的回执，保留其他会话及草稿，不调用编辑器流程', async () => {
  let calls = 0;
  const client = { call: () => assert.fail('The direct sender must not access the editor.'),
    sendTextDirect: async (recipient, text, apply) => {
      calls++; assert.deepEqual(recipient, scope); assert.equal(text, 'hello'); assert.equal(apply, true);
      return { ...scope, state: 'client-confirmed', message: message('direct-id'), transport: 'client-sdk' };
    } };
  assert.deepEqual(await sendReply(client, scope, 'hello'), { messageId: 'direct-id', transport: 'client-sdk' });
  assert.equal(calls, 1);
});
test('直发回执不符、结果缺失和 SDK 错误都不转入旧流程或重发', async () => {
  const confirmation = { ...scope, state: 'client-confirmed', message: message('direct-id') };
  const results = [undefined, { state: 'pending' }, { beforeIds: [] }, { ...confirmation, chatId: 'other' },
    { ...confirmation, message: { ...message('id'), senderId: 'other' } }, { ...confirmation, message: { ...message('id'), text: 'other' } },
    { ...confirmation, message: message('id', 'pending') }];
  for (const result of results) {
    let sends = 0;
    await assert.rejects(sendText({ sendTextDirect: async () => { sends++; return result; }, call: () => assert.fail('No legacy fallback.') }, scope, 'hello', true), { code: 'SEND_UNKNOWN' });
    assert.equal(sends, 1);
  }
  for (const [source, expected] of [['SEND_FAILED', 'SEND_FAILED'], ['CDP_DISCONNECTED', 'SEND_UNKNOWN']]) {
    let sends = 0;
    await assert.rejects(sendText({ sendTextDirect: async () => { sends++; throw new ClientError(source, 'test'); }, call: () => assert.fail('No legacy fallback.') }, scope, 'hello', true), { code: expected });
    assert.equal(sends, 1);
  }
  await assert.rejects(sendText({ sendTextDirect: async () => { throw new ClientError('SDK_OPERATION_FAILED', 'lost after acceptance', { phase: 'send-requested', acceptedId: 'accepted-id' }); } }, scope, 'hello', true),
    error => error.code === 'SEND_UNKNOWN' && error.details.acceptedId === 'accepted-id');
});
test('来源标记需要显式选择，发送核对完整正文含标记', async () => {
  let sent;
  const client = { sendTextDirect: async (_recipient, text, apply) => {
    sent = text;
    return apply ? { ...scope, state: 'client-confirmed', message: { ...message('id'), text } } : { state: 'preview', text };
  } };
  await sendText(client, scope, 'hello', true); assert.equal(sent, 'hello');
  await sendText(client, scope, 'hello', true, { markOrigin: true }); assert.equal(inspectOrigin(sent).kind, 'automation-marked');
  await assert.rejects(sendText(client, scope, 'hello', true, { markOrigin: 'yes' }), { code: 'INVALID_ARGUMENT' });
});
test('SDK 与窗口读取附加来源信息，证据正文和覆盖字段保留原值', async () => {
  const text = markAutomation('hello');
  const result = await callPage({ evaluate: async (fn, op, input) => {
    assert.equal(fn, nativePageOperation); assert.equal(op, 'read-by-ids'); assert.deepEqual(input, scope);
    return { ok: true, value: { ...scope, missingIds: ['missing'], messages: [{ ...message('id'), text }] } };
  } }, 'read-by-ids', scope);
  assert.equal(result.messages[0].text, text); assert.equal(result.messages[0].origin.kind, 'automation-marked');
  assert.equal(result.messages[0].origin.sampleEligible, false); assert.equal(Object.hasOwn(result.messages[0].origin, 'body'), false);
  assert.deepEqual(result.missingIds, ['missing']);
});
test('监控输出成功后保存检查点，空闲时间随新消息重置', async () => {
  const events = []; const saved = []; let reads = 0; let emitted = false;
  await watch({ call: async () => {
    reads++; return { ...scope, messages: reads < 3 ? [message('a')] : [message('a'), message('b')] };
  } }, scope, { durationMs: 500, idleMs: 35, pollMs: 10,
    emit: async event => { events.push(event); if (event.event === 'messages') emitted = true; },
    save: async checkpoint => { if (checkpoint.lastId === 'b') assert.ok(emitted); saved.push(checkpoint); } });
  assert.equal(events.filter(e => e.event === 'messages').length, 1);
  assert.equal(events.at(-1).reason, 'idle'); assert.ok(reads >= 5); assert.equal(saved.at(-1).lastId, 'b');
});
test('监控切换会话或断连时中断，不输出伪造空结果', async () => {
  for (const mode of ['scope', 'disconnect']) {
    await assert.rejects(watch({ call: async () => {
      if (mode === 'disconnect') throw new ClientError('CDP_DISCONNECTED', 'disconnected');
      return { ...scope, chatId: 'other', messages: [] };
    } }, scope, { durationMs: 20, idleMs: 10, emit: async () => {} }), { code: mode === 'scope' ? 'CHAT_CHANGED' : 'CDP_DISCONNECTED' });
  }
});
test('输出失败不推进持久检查点', async () => {
  let saved = false;
  await assert.rejects(watch({ call: async () => ({ ...scope, messages: [message('a'), message('b')] }) }, scope, {
    checkpoint: { version: 1, ...scope, lastId: 'a' }, durationMs: 20, idleMs: 10,
    emit: async event => { if (event.event === 'messages') throw Error('sink failed'); }, save: async () => { saved = true; },
  }), /sink failed/);
  assert.equal(saved, false);
});
