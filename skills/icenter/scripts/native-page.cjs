// 已核对的 SDK 入口；不读取认证材料，不经编辑器发送，不提供任意方法执行。
async function nativePageOperation(operation, input = {}) {
  let phase = 'not-edited', acceptedId = null, lockToken = null;
  const fail = (code, message, details) => { throw Object.assign(new Error(message), { code, details }); };
  try {
    if (!['send', 'read-by-ids', 'sdk-info'].includes(operation)) fail('UNKNOWN_OPERATION', 'Unsupported SDK operation.');
    if (!process.argv.includes('IS_MAIN_WINDOW')) fail('WRONG_WINDOW', 'Expected the iCenter main window.');
    const currentState = () => document.querySelector('#app')?.__vue_app__?.config?.globalProperties?.$store?.state;
    const state = currentState();
    const accountId = state?.userInfo?.userId;
    if (!accountId) fail('NOT_SIGNED_IN', 'No signed-in iCenter account.');
    if (!input.accountId) fail('SCOPE_REQUIRED', 'An observed account ID is required.');
    const checkAccount = () => { if (currentState()?.userInfo?.userId !== input.accountId) fail('ACCOUNT_CHANGED', 'The signed-in account changed.'); };
    checkAccount();
    let load; const bridgeId = 'codex_icenter_sdk_' + Date.now() + '_' + Math.random().toString(16).slice(2);
    const bridge = [[], { [bridgeId]: (_module, _exports, loader) => { load = loader; } }, [[bridgeId]]];
    if (!Array.isArray(window.webpackJsonp)) fail('UNSUPPORTED_SCHEMA', 'The verified client runtime is unavailable.');
    try { window.webpackJsonp.push(bridge); }
    finally {
      if (load) { delete load.c[bridgeId]; delete load.m[bridgeId]; load.s = 0; }
      const at = window.webpackJsonp.indexOf(bridge); if (at >= 0) window.webpackJsonp.splice(at, 1);
    }
    const service = load?.c?.['1bb8']?.exports?.a;
    const QueryItem = load?.c?.['d88a']?.exports?.Lb;
    const sanitize = load?.c?.['16f8']?.exports?.z;
    if (typeof service?.sendTextMsg !== 'function' || typeof service.queryMsgByMsgIdList !== 'function' || typeof QueryItem !== 'function' || typeof sanitize !== 'function') fail('UNSUPPORTED_SCHEMA', 'The loaded SDK differs from the verified contract.');
    if (operation === 'sdk-info') return { ok: true, value: { version: require(process.resourcesPath + '/app.asar/package.json').version, accountId, transport: 'client-sdk-over-cdp', verifiedOperations: ['send', 'read-by-ids'],
      discoveredChatServiceMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(service)).filter(key => key !== 'constructor' && typeof service[key] === 'function'),
      discoveryIsNotValidation: true, authentication: 'existing-client', arbitraryInvocation: false } };
    if (typeof input.chatId !== 'string' || !input.chatId) fail('SCOPE_REQUIRED', 'An observed chat ID is required.');
    const chats = state.chatInfo?.chatList;
    if (!Array.isArray(chats)) fail('UNSUPPORTED_SCHEMA', 'The loaded conversation list is unavailable.');
    const targets = chats.filter(chat => chat.chatRoomUri === input.chatId);
    if (targets.length !== 1 || ![0, 1].includes(targets[0].chatRoomType)) fail('CHAT_NOT_UNIQUE', 'Expected one observed direct or group conversation.');
    const scope = { accountId, chatId: input.chatId };
    const messageValue = message => {
      checkAccount();
      if (message?.data_owner !== accountId || message.chatRoomUri !== input.chatId || typeof message.msgId !== 'string' || !message.msgId || typeof message.content !== 'string') fail('MESSAGE_SCOPE_MISMATCH', 'The SDK returned a message outside the requested account or chat.');
      const predicates = ['isMessageTransSuccess', 'isMessageTransFailed', 'isMessageTransing', 'isMessageTransInit'];
      if (predicates.some(key => typeof message[key] !== 'function')) fail('UNSUPPORTED_SCHEMA', 'Message delivery predicates are unavailable.');
      const states = predicates.map(key => message[key]());
      return { id: message.msgId, senderId: message.sendUri, clientTime: message.time, clientType: message.msgType, text: message.content,
        direction: message.msgFromReceive === true ? 'incoming' : message.msgFromReceive === false ? 'outgoing' : 'unknown',
        transfer: states.filter(Boolean).length === 1 ? ['confirmed', 'failed', 'pending', 'initial'][states.indexOf(true)] : 'unknown',
        clientTransferStatus: message.msgTransStatus, readStatus: message.readStatus };
    };
    if (operation === 'read-by-ids') {
      const ids = input.messageIds;
      if (!Array.isArray(ids) || !ids.length || ids.length > 50 || new Set(ids).size !== ids.length || ids.some(id => typeof id !== 'string' || !id || id.length > 256 || /[\r\n\u0000]/u.test(id))) fail('INVALID_MESSAGE_IDS', 'Expected 1..50 distinct observed message IDs.');
      checkAccount();
      if (window.__codexIcenterSdkCall) fail('SDK_BUSY', 'Another SDK operation is still in flight.');
      lockToken = bridgeId; window.__codexIcenterSdkCall = lockToken;
      const result = await service.queryMsgByMsgIdList(ids.map(id => new QueryItem(id)));
      checkAccount();
      if (!result || result.success !== 1 || !Array.isArray(result.aMessagesList)) fail('SDK_QUERY_FAILED', 'The client did not return a successful message query.');
      const messages = result.aMessagesList.map(messageValue);
      if (messages.some(message => !ids.includes(message.id)) || new Set(messages.map(message => message.id)).size !== messages.length) fail('MESSAGE_SCOPE_MISMATCH', 'The query returned unexpected or duplicate message IDs.');
      return { ok: true, value: { ...scope, coverage: 'requested-message-ids', messages, missingIds: ids.filter(id => !messages.some(message => message.id === id)), transport: 'client-sdk' } };
    }
    if (typeof input.text !== 'string' || !input.text.trim()) fail('EMPTY_MESSAGE', 'A nonempty plain-text message is required.');
    if (/\r|\u0000/u.test(input.text)) fail('INVALID_MESSAGE_TEXT', 'Use LF newlines and no NUL in a text message.');
    if (sanitize(input.text) !== input.text) fail('TEXT_WOULD_CHANGE', 'The client would change this text before sending; review the content.');
    if (!input.apply) return { ok: true, value: { state: 'preview', ...scope, text: input.text, transport: 'client-sdk', composer: 'untouched' } };
    checkAccount();
    if (window.__codexIcenterSdkCall) fail('SDK_BUSY', 'Another SDK operation is still in flight.');
    lockToken = bridgeId; window.__codexIcenterSdkCall = lockToken;
    phase = 'send-requested';
    const message = await service.sendTextMsg(input.text, input.chatId,
      { forward: false, isSendBurn: false, isSendRecepit: false, isReply: false, isNeedAskRobot: false, isEmoticon: false },
      '#', '#', true, null, false, null, accepted => { acceptedId = accepted?.msgId || accepted?.msgID || null; }, null, null, null, null, 8000);
    if (!message) fail('SEND_UNKNOWN', 'The SDK send has no final message; reconcile the original chat before retrying.', { ...scope, acceptedId });
    const observed = messageValue(message);
    if (observed.senderId !== accountId || observed.text !== input.text) fail('SEND_UNKNOWN', 'The resulting message differs from the requested sender or text.', { ...scope, acceptedId, observedId: observed.id });
    if (observed.transfer === 'failed') fail('SEND_FAILED', 'The client reports that sending failed.', { ...scope, observedId: observed.id });
    if (observed.transfer !== 'confirmed') fail('SEND_UNKNOWN', 'The SDK has not confirmed sending.', { ...scope, observedId: observed.id });
    return { ok: true, value: { state: 'client-confirmed', ...scope, message: observed, transport: 'client-sdk', composer: 'untouched', receipt: 'recipient-delivery-and-reading-not-verified' } };
  } catch (error) {
    return { ok: false, error: { code: error.code || 'SDK_OPERATION_FAILED', message: error.message || String(error), details: { ...error.details, phase, ...(acceptedId ? { acceptedId } : {}) } } };
  } finally {
    if (lockToken && window.__codexIcenterSdkCall === lockToken) delete window.__codexIcenterSdkCall;
  }
}

module.exports = { nativePageOperation };
