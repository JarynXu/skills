const { setTimeout: delay } = require('node:timers/promises');
const { select, sendText } = require('./client.cjs');
const describe = error => ({ code: error.code || 'SEND_FAILED', message: error.message });

async function sendReply(client, recipient, text, options = {}) {
  const scope = { accountId: recipient.accountId, chatId: recipient.chatId };
  // 直发能力由客户端声明；SDK 失败不切到编辑器重试。只提供 call 的既有借用客户端保留旧契约。
  if (typeof client.sendTextDirect === 'function') {
    const result = await sendText(client, scope, text, true, options);
    return { messageId: result.message.id, transport: result.transport };
  }
  const original = await client.call('status', { accountId: recipient.accountId });
  let result, operationError;
  try {
    if (original.activeChatId !== recipient.chatId) await select(client, scope, true);
    // 会话选择先于消息列表载入完成；发送前用只读调用确认列表已属于目标。
    const readyDeadline = Date.now() + 5000;
    while (true) {
      try { await client.call('read', { ...scope, requireReady: true }); break; }
      catch (error) {
        if (error.code !== 'MESSAGE_SCOPE_MISMATCH' || Date.now() >= readyDeadline) throw error;
        await delay(100);
      }
    }
    result = await sendText(client, scope, text, true, options);
  } catch (error) { operationError = error; }
  let restoration;
  try {
    const current = await client.call('status', { accountId: recipient.accountId });
    if (original.activeChatId && original.activeChatId !== recipient.chatId && current.activeChatId === recipient.chatId) {
      await select(client, { accountId: recipient.accountId, chatId: original.activeChatId }, true);
    }
  } catch (error) { restoration = { state: 'pending', error: describe(error) }; }
  if (operationError) {
    if (restoration) operationError.restoration = restoration;
    throw operationError;
  }
  return { messageId: result.message.id, ...(restoration ? { restoration } : {}) };
}

module.exports = { sendReply };
