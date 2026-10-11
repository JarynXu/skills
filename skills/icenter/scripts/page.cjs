// 此函数在 iCenter 渲染进程执行；版本相关字段与 DOM 选择器归此处维护。
function pageOperation(operation, input = {}) {
  let phase = 'not-edited';
  const fail = (code, message) => { const error = new Error(message); error.code = code; throw error; };
  try {
    const role = typeof process !== 'undefined' && process.argv.includes('IS_MAIN_WINDOW') ? 'main' : 'other';
    if (operation === 'identify') return { ok: true, value: { role } };
    if (role !== 'main') fail('WRONG_WINDOW', 'The target is not the iCenter main window.');
    const version = require(process.resourcesPath + '/app.asar/package.json').version;
    if (version !== '12.1.0') fail('UNSUPPORTED_VERSION', `No verified script adapter for iCenter ${version}. Use the client UI.`);
    const state = document.querySelector('#app')?.__vue_app__?.config?.globalProperties?.$store?.state;
    if (!state?.userInfo || !state.chatInfo || !state.messageInfo) fail('UNSUPPORTED_SCHEMA', 'The iCenter store schema is unavailable.');
    const accountId = state.userInfo.userId;
    if (typeof accountId !== 'string' || !accountId) fail('NOT_SIGNED_IN', 'No signed-in iCenter account.');
    if (input.accountId && accountId !== input.accountId) fail('ACCOUNT_CHANGED', 'The signed-in account changed.');
    const chatId = state.chatInfo.chatSelectUri;
    if (operation === 'status') return { ok: true, value: {
      version, account: { id: accountId, name: state.userInfo.userName, englishName: state.userInfo.userNameEn,
        linkedUnionId: state.userInfo.unionId || null, source: 'signed-in-client', aliasesComplete: false },
      activeChatId: chatId || null,
    } };
    if (!input.accountId) fail('SCOPE_REQUIRED', 'An account ID is required.');
    if (!Array.isArray(state.chatInfo.chatList)) fail('UNSUPPORTED_SCHEMA', 'The loaded conversation list is unavailable.');
    const chats = state.chatInfo.chatList.map(chat => ({ id: chat.chatRoomUri,
      name: chat.i18nChatRoomName || chat.chatRoomNameCn || chat.chatRoomNameEn,
      kind: chat.chatRoomType === 0 ? 'direct' : 'client-type:' + chat.chatRoomType,
      clientType: chat.chatRoomType, linkedUnionId: chat.unionID || null }));
    if (chats.some(chat => typeof chat.id !== 'string' || !chat.id)) fail('UNSUPPORTED_SCHEMA', 'A conversation has no ID.');
    if (operation === 'chats') return { ok: true, value: { accountId, coverage: 'loaded-conversations', chats } };
    if (!input.chatId) fail('SCOPE_REQUIRED', 'A conversation ID is required.');
    const matches = chats.filter(chat => chat.id === input.chatId);
    if (matches.length !== 1) fail('CHAT_NOT_UNIQUE', 'The conversation ID is absent or duplicated in the loaded list.');
    const visible = element => !!element?.getClientRects().length && getComputedStyle(element).visibility !== 'hidden';
    if (operation === 'select') {
      const rows = [...document.querySelectorAll('li.ChatInfo')].filter(el => el.dataset.id === input.chatId && visible(el));
      if (rows.length !== 1) fail('CHAT_NOT_VISIBLE', 'Locate the exact conversation in the client UI, then retry.');
      if (input.apply && chatId !== input.chatId) rows[0].click();
      return { ok: true, value: { accountId, chat: matches[0], state: input.apply ? 'selection-requested' : 'preview' } };
    }
    if (chatId !== input.chatId) fail('CHAT_CHANGED', 'The active conversation differs from the requested conversation.');
    if (!Array.isArray(state.messageInfo.messageList)) fail('UNSUPPORTED_SCHEMA', 'The loaded message list is unavailable.');
    const messages = state.messageInfo.messageList.map(message => {
      if (message.chatRoomUri !== input.chatId || message.data_owner !== accountId) fail('MESSAGE_SCOPE_MISMATCH', 'The loaded messages belong to another account or conversation. Wait for the selected conversation to load.');
      if (typeof message.msgId !== 'string' || !message.msgId || typeof message.content !== 'string') fail('UNSUPPORTED_SCHEMA', 'A message has an unsupported identity or content representation.');
      const predicates = ['isMessageTransSuccess', 'isMessageTransFailed', 'isMessageTransing', 'isMessageTransInit'];
      if (predicates.some(name => typeof message[name] !== 'function')) fail('UNSUPPORTED_SCHEMA', 'Message delivery predicates are unavailable.');
      const statuses = predicates.map(name => message[name]());
      const index = statuses.indexOf(true);
      const transfer = statuses.filter(Boolean).length === 1 ? ['confirmed', 'failed', 'pending', 'initial'][index] : 'unknown';
      return { id: message.msgId, senderId: message.sendUri, senderName: message.sendName || message._senderName || null,
        clientTime: message.time, clientType: message.msgType, text: message.content,
        direction: message.msgFromReceive === true ? 'incoming' : message.msgFromReceive === false ? 'outgoing' : 'unknown',
        transfer, clientTransferStatus: message.msgTransStatus, readStatus: message.readStatus };
    });
    if (new Set(messages.map(m => m.id)).size !== messages.length) fail('INVALID_MESSAGE_IDENTITY', 'The loaded message IDs are duplicated.');
    if (operation === 'read') return { ok: true, value: { accountId, chatId, coverage: 'loaded-message-window', messages } };
    if (operation !== 'send') fail('UNKNOWN_OPERATION', 'Unsupported page operation.');
    if (typeof input.text !== 'string' || !input.text.trim()) fail('EMPTY_MESSAGE', 'A nonempty plain-text message is required.');
    if (/\r/.test(input.text)) fail('INVALID_NEWLINES', 'Use LF newlines in the text file.');
    const editors = [...document.querySelectorAll('.MessageEditor .MessageInputEditor')].filter(visible);
    if (editors.length !== 1) fail('EDITOR_UNAVAILABLE', 'Exactly one visible main message editor is required.');
    const editor = editors[0];
    const composer = editor.closest('.MessageEditor');
    const sendControls = [...composer.querySelectorAll('.Send')].filter(visible);
    if (sendControls.length !== 1 || editor.getAttribute('contenteditable') !== 'true') fail('EDITOR_UNAVAILABLE', 'The plain-text composer is unavailable.');
    const activeChat = state.chatInfo.chatList.find(chat => chat.chatRoomUri === input.chatId);
    // 严格接受空白编辑器；富对象、空格草稿及引用都交回界面处理。
    if (editor.textContent.length || editor.querySelector('*:not(br)') || activeChat.messageReplyInfo) fail('DRAFT_PRESENT', 'An existing draft or reply is present. Preserve it and resolve its disposition before sending.');
    const beforeIds = messages.map(message => message.id);
    if (!input.apply) return { ok: true, value: { state: 'preview', accountId, chat: matches[0], text: input.text } };
    // 核对、写入和点击处于同一次渲染进程调用，避免坐标操作之间的会话切换。
    phase = 'draft-written';
    editor.textContent = input.text;
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    if (state.userInfo.userId !== accountId || state.chatInfo.chatSelectUri !== input.chatId || editor.textContent !== input.text) {
      fail('COMPOSER_CHANGED', 'The composer changed after editing. The draft was left in place; sending was not requested.');
    }
    phase = 'send-requested';
    sendControls[0].click();
    return { ok: true, value: { state: 'send-requested', accountId, chatId, beforeIds } };
  } catch (error) {
    return { ok: false, error: { code: error.code || 'CLIENT_OPERATION_FAILED', message: error.message, details: { phase } } };
  }
}

module.exports = { pageOperation };
