const { ClientError } = require('./cdp.cjs');

function requireScope(snapshot, accountId, chatId) {
  if (!accountId || !chatId) throw new ClientError('SCOPE_REQUIRED', 'Account and conversation IDs are required.');
  if (snapshot.accountId !== accountId) throw new ClientError('ACCOUNT_CHANGED', 'The signed-in account differs from the selected account.');
  if (snapshot.chatId !== chatId) throw new ClientError('CHAT_CHANGED', 'The active conversation differs from the selected conversation.');
}

// 游标只承诺当前客户端窗口内的连续追加；没有重叠锚点时报告缺口。
class MessageCursor {
  constructor(accountId, chatId, checkpoint = null) {
    this.accountId = accountId;
    this.chatId = chatId;
    this.initialized = checkpoint !== null;
    this.lastId = null;
    if (checkpoint !== null) {
      if (typeof checkpoint !== 'object' || Array.isArray(checkpoint)) throw new ClientError('INVALID_CHECKPOINT', 'A message checkpoint must be an object.');
      requireScope(checkpoint, accountId, chatId);
      if (checkpoint.version !== 1 || (checkpoint.lastId !== null && (typeof checkpoint.lastId !== 'string' || !checkpoint.lastId))) {
        throw new ClientError('INVALID_CHECKPOINT', 'Unsupported or malformed message checkpoint.');
      }
      this.lastId = checkpoint.lastId;
    }
  }

  advance(snapshot) {
    requireScope(snapshot, this.accountId, this.chatId);
    const ids = snapshot.messages.map(message => message.id);
    if (ids.some(id => typeof id !== 'string' || !id) || new Set(ids).size !== ids.length) {
      throw new ClientError('INVALID_MESSAGE_IDENTITY', 'Messages require distinct, nonempty client message IDs.');
    }
    if (!this.initialized) {
      this.initialized = true;
      this.lastId = ids.at(-1) ?? null;
      return [];
    }
    let index = -1;
    if (this.lastId !== null) {
      index = ids.indexOf(this.lastId);
      if (index < 0) throw new ClientError('MONITOR_GAP', 'The previous message is outside the loaded message window. Inspect history before resuming.', { lastId: this.lastId });
    }
    const added = snapshot.messages.slice(index + 1);
    this.lastId = ids.at(-1) ?? this.lastId;
    return added;
  }

  checkpoint() {
    return { version: 1, accountId: this.accountId, chatId: this.chatId, lastId: this.lastId };
  }
}

module.exports = { requireScope, MessageCursor };
