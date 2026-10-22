// 12.1.0 的被动消息订阅适配器；只注册观察回调，不切换会话或调用发送接口。
function listenerPageOperation(operation, input) {
  const key = '__codexICenterListenerV1';
  const contractVersion = 3;
  const fail = (code, message, details) => {
    const error = new Error(message);
    error.code = code;
    error.details = details;
    throw error;
  };
  try {
    let current = window[key];
    if (operation === 'remove') {
      if (current && current.ownerId !== input.ownerId) fail('LISTENER_BUSY', 'Another listener owns this renderer subscription.');
      if (current) { current.remove(); delete window[key]; }
      return { ok: true, value: { removed: !!current } };
    }
    if (!process.argv.includes('IS_MAIN_WINDOW')) fail('WRONG_WINDOW', 'Expected the iCenter main window.');
    const version = require(process.resourcesPath + '/app.asar/package.json').version;
    if (version !== '12.1.0') fail('UNSUPPORTED_VERSION', 'Passive notification adapter requires iCenter 12.1.0.');
    const store = document.querySelector('#app')?.__vue_app__?.config?.globalProperties?.$store;
    const accountId = store?.state?.userInfo?.userId;
    if (!accountId) fail('NOT_SIGNED_IN', 'No signed-in iCenter account.');
    if (accountId !== input.accountId) fail('ACCOUNT_CHANGED', 'The listener account differs from the signed-in account.');
    if (!input.ownerId) fail('SCOPE_REQUIRED', 'A listener owner ID is required.');
    if (current && current.ownerId !== input.ownerId) fail('LISTENER_BUSY', 'Another listener owns this renderer subscription.');
    if (current && !current.accountId) fail('LISTENER_ACCOUNT_UNKNOWN', 'The existing subscription has no verified account binding; remove it before reusing, reading or acknowledging it.');
    if (current && current.accountId !== accountId) fail('ACCOUNT_CHANGED', 'The existing listener belongs to a different signed-in account.');
    if (operation === 'install') {
      // 保留已存在外部调用方的旧订阅契约；新群消息归集不使用此兼容分支。
      const legacyFollowups = Object.hasOwn(input, 'quietMs') || Object.hasOwn(input, 'mentionWindows') || input.sources.some(source => Object.hasOwn(source, 'followups'));
      const signature = JSON.stringify([contractVersion, accountId, input.sources, input.mentionIdentity || null, legacyFollowups ? input.quietMs : null, input.replyAwareness || false]);
      if (current) {
        if (current.contractVersion !== contractVersion) fail('LISTENER_CONTRACT_CHANGED', 'The existing listener uses an older notification contract; preserve or process its records, then remove it before installing the new contract.');
        if (current.signature !== signature) fail('LISTENER_CONFIG_CHANGED', 'Stop the existing subscription before changing sources.');
        current.lastPollAt = Date.now();
        return { ok: true, value: { reused: true, generationId: current.generationId, baseline: current.baseline, sequence: current.sequence } };
      }
      if (typeof input.generationId !== 'string' || !input.generationId) fail('SCOPE_REQUIRED', 'A fresh renderer generation ID is required.');
      if (!Array.isArray(store.state.chatInfo?.chatList)) fail('UNSUPPORTED_SCHEMA', 'Conversation identities are unavailable.');
      const kindOf = source => source.kind === undefined ? 'conversation' : source.kind;
      const sources = new Map(input.sources.filter(source => kindOf(source) !== 'direct').map(source => [source.chatId, source]));
      const direct = input.sources.find(source => kindOf(source) === 'direct');
      const mentionIdentity = input.mentionIdentity;
      const quietMs = legacyFollowups ? input.quietMs ?? 30000 : 0;
      const mentionWindows = legacyFollowups ? new Map((input.mentionWindows || []).map(item => [JSON.stringify([item.chatId, item.senderId]), item])) : new Map();
      if (input.sources.some(source => ['group', 'group-mention'].includes(kindOf(source))) &&
        (!mentionIdentity || !Array.isArray(mentionIdentity.userIds) || !Array.isArray(mentionIdentity.unionIds) ||
         !(mentionIdentity.userIds.includes(accountId) || (store.state.userInfo.unionId && mentionIdentity.unionIds.includes(store.state.userInfo.unionId))))) fail('ACCOUNT_CHANGED', 'Mention identity differs from the signed-in account.');
      for (const source of sources.values()) {
        const matches = store.state.chatInfo.chatList.filter(chat => chat.chatRoomUri === source.chatId);
        if (matches.length !== 1) fail('CHAT_NOT_UNIQUE', 'A configured conversation is absent or duplicated.');
        if (['group', 'group-mention'].includes(kindOf(source)) && matches[0].chatRoomType !== 1) fail('MESSAGE_SCOPE_MISMATCH', 'A group source is not a verified group conversation.');
        if (kindOf(source) === 'self-text' && (source.chatId !== accountId || matches[0].chatRoomType !== 0)) fail('MESSAGE_SCOPE_MISMATCH', 'A self-text source must be the signed-in account self conversation.');
      }
      const rooms = store.state.chatInfo.chatList.filter(chat => sources.has(chat.chatRoomUri) || (direct && chat.chatRoomType === 0));
      if (new Set(rooms.map(chat => chat.chatRoomUri)).size !== rooms.length) fail('CHAT_NOT_UNIQUE', 'A covered conversation is duplicated.');
      const baseline = rooms.map(chat => ({ chatId: chat.chatRoomUri, chatType: chat.chatRoomType, lastId: chat.lastMessageBriefInfo?.msgId || null }));
      // 已核对的 webpack 4 入口为模块 0。临时桥接模块在取得现有导出后移除。
      // ce65 提供通知注册/注销；bcec.u 提供生命周期策略；14ce.I 是客户端通知枚举。
      if (!Array.isArray(window.webpackJsonp) || typeof window.webpackJsonp.push !== 'function') fail('UNSUPPORTED_SCHEMA', 'The verified notification runtime is unavailable.');
      const bridgeId = 'codex_icenter_listener_' + input.ownerId;
      let load;
      const bridge = [[], { [bridgeId]: (_module, _exports, loader) => { load = loader; } }, [[bridgeId]]];
      let notifications, policy, events;
      try {
        window.webpackJsonp.push(bridge);
        if (!load?.c?.ce65 || !load.c.bcec || !load.c['14ce']) fail('UNSUPPORTED_SCHEMA', 'Verified notification modules are not loaded.');
        notifications = load.c.ce65.exports.b;
        policy = load.c.bcec.exports.u;
        events = load.c['14ce'].exports.I;
      } finally {
        if (load) { delete load.c[bridgeId]; delete load.m[bridgeId]; load.s = 0; }
        const index = window.webpackJsonp.indexOf(bridge);
        if (index >= 0) window.webpackJsonp.splice(index, 1);
      }
      if (typeof notifications?.addMessageBaseMattersNotifyListener !== 'function' || typeof notifications?.removeMessageBaseMattersNotifyListener !== 'function' || policy?.PERMANENT !== 1 || events?.MessageArrivedNotify !== 2 || events?.MultiMessageArrivedNotify !== 8 ||
        (input.replyAwareness && events?.SendMessageResult !== 0)) {
        fail('UNSUPPORTED_SCHEMA', 'Notification registration or event contracts differ from the verified adapter.');
      }
      const name = 'CodexPassiveListener:' + input.ownerId;
      const state = {
        ownerId: input.ownerId, accountId, contractVersion, generationId: input.generationId, signature, baseline, sequence: 0, acknowledged: 0,
        records: [], bufferedBytes: 0, error: null, lastPollAt: Date.now(),
        remove: () => notifications.removeMessageBaseMattersNotifyListener(name),
      };
      const callback = notice => {
        try {
          if (store.state.userInfo.userId !== accountId) fail('ACCOUNT_CHANGED', 'The signed-in account changed during listening.');
          let messages;
          // ApplicationMessageArrivedNotify 是客户端应用控制通道，包含历史同步结果，不是会话来信。
          const sentResult = notice.aNotifyType === events.SendMessageResult;
          if (notice.aNotifyType === events.MessageArrivedNotify || sentResult) messages = notice.message ? [notice.message] : [];
          else if (notice.aNotifyType === events.MultiMessageArrivedNotify) {
            if (!Array.isArray(notice.multiMessageContentList)) fail('UNSUPPORTED_SCHEMA', 'A message batch has no content list.');
            messages = notice.multiMessageContentList;
          } else return true;
          const notifiedRooms = new Map();
          if (notice.pCorrespondingChatRoom?.chatRoomUri) notifiedRooms.set(notice.pCorrespondingChatRoom.chatRoomUri, notice.pCorrespondingChatRoom);
          if (Array.isArray(notice.multiMessageList)) for (const item of notice.multiMessageList) {
            if (item.pChatRoom?.chatRoomUri) notifiedRooms.set(item.pChatRoom.chatRoomUri, item.pChatRoom);
          }
          for (const raw of messages) {
            if (sentResult && (raw.sendUri !== accountId || typeof raw.isMessageTransSuccess !== 'function' || !raw.isMessageTransSuccess())) continue;
            if (direct && (typeof raw.chatRoomUri !== 'string' || !raw.chatRoomUri)) fail('UNSUPPORTED_SCHEMA', 'An arriving message has no conversation identity.');
            let source = sources.get(raw.chatRoomUri);
            if (!source && !direct) continue;
            const room = notifiedRooms.get(raw.chatRoomUri) || store.state.chatInfo.chatList.find(chat => chat.chatRoomUri === raw.chatRoomUri);
            const chatType = room?.chatRoomType ?? raw.chatRoomType;
            if (!source) {
              if (!Number.isInteger(chatType)) fail('UNSUPPORTED_SCHEMA', 'An arriving conversation has no verified type for direct-message filtering.');
              if (chatType !== 0) continue;
              source = direct;
            }
            const kind = kindOf(source);
            if (kind === 'group-mention' && chatType !== 1) fail('MESSAGE_SCOPE_MISMATCH', 'A mention-only message no longer belongs to a verified group.');
            if (kind === 'self-text' && (raw.chatRoomUri !== accountId || chatType !== 0)) fail('MESSAGE_SCOPE_MISMATCH', 'A self-text notification no longer belongs to the verified self conversation.');
            if (raw.data_owner && raw.data_owner !== accountId) fail('MESSAGE_SCOPE_MISMATCH', 'A notification belongs to another account.');
            if (typeof raw.msgId !== 'string' || !raw.msgId || typeof raw.sendUri !== 'string') fail('UNSUPPORTED_SCHEMA', 'A matching message has no stable identity.');
            let incoming = raw.sendUri !== accountId && !(raw.sendUnionID && raw.sendUnionID === store.state.userInfo.unionId);
            let ownReply = false;
            if (input.replyAwareness && kind !== 'self-text' && raw.sendUri === accountId && raw.data_owner === accountId &&
              (!raw.sendUnionID || raw.sendUnionID === store.state.userInfo.unionId)) {
              if (![0, 1].includes(chatType) || typeof raw.isMessageTransSuccess !== 'function') fail('UNSUPPORTED_SCHEMA', 'An own reply has no verified conversation type or transfer predicate.');
              ownReply = raw.isMessageTransSuccess();
            }
            if (kind === 'self-text') {
              incoming = raw.sendUri === accountId && raw.data_owner === accountId &&
                (!raw.sendUnionID || raw.sendUnionID === store.state.userInfo.unionId) && raw.msgType === 1 &&
                typeof raw.content === 'string' && (!source.textPrefix || (raw.content.startsWith(source.textPrefix) && /^[ \t]+\S[\s\S]*$/u.test(raw.content.slice(source.textPrefix.length))));
            }
            let mention, mentionContinuation;
            if (incoming && kind === 'conversation') incoming = source.senderIds.includes(raw.sendUri);
            if (incoming && ['group', 'group-mention'].includes(kind)) {
              const hasMentionFields = typeof raw.atInfo === 'string' && typeof raw.atExInfo === 'string';
              if (!hasMentionFields && kind === 'group-mention') fail('UNSUPPORTED_SCHEMA', 'A group message has no supported structured mention fields.');
              if (!hasMentionFields) {
                mention = { state: 'unavailable', userIds: [], unionIds: [], all: false, other: false };
              } else {
                const atUserIds = raw.atInfo.split(',').filter(id => id && id !== '#');
                const atUnionIds = raw.atExInfo.split(',').filter(id => id && id !== '#');
                const userIds = atUserIds.filter(id => id !== 'all' && mentionIdentity.userIds.includes(id));
                const unionIds = atUnionIds.filter(id => id !== 'all' && mentionIdentity.unionIds.includes(id));
                const all = atUserIds.includes('all') || atUnionIds.includes('all');
                const other = atUserIds.some(id => id !== 'all' && !mentionIdentity.userIds.includes(id)) ||
                  atUnionIds.some(id => id !== 'all' && !mentionIdentity.unionIds.includes(id));
                mention = { state: 'available', userIds, unionIds, all, other };
                if (kind === 'group-mention') {
                  incoming = userIds.length > 0 || unionIds.length > 0;
                  if (source.followups) {
                    // 仅服务旧外部调用契约；新 group 来源逐条输出，不做时间关联。
                    const key = JSON.stringify([raw.chatRoomUri, raw.sendUri]);
                    const now = Date.now();
                    for (const [otherKey, window] of mentionWindows) if (now - window.lastAt >= quietMs) mentionWindows.delete(otherKey);
                    const previous = mentionWindows.get(key);
                    const noOtherTargets = [raw.atInfo, raw.atExInfo].every(field => field.split(',').every(id => !id || id === '#'));
                    if (!incoming && noOtherTargets && previous && now - previous.lastAt >= 0 && now - previous.lastAt < quietMs) {
                      incoming = true;
                      mentionContinuation = { previousId: previous.lastId };
                      mention = undefined;
                    }
                    if (incoming) mentionWindows.set(key, { chatId: raw.chatRoomUri, senderId: raw.sendUri, lastId: raw.msgId, lastAt: now });
                  }
                }
              }
            }
            const record = { sequence: state.sequence + 1, accountId, chatId: raw.chatRoomUri, chatType,
              chatName: room?.i18nChatRoomName || room?.chatRoomNameCn || room?.chatRoomNameEn || null,
              sourceKind: kind, id: raw.msgId, incoming };
            if (incoming || ownReply) {
              if (typeof raw.content !== 'string') fail('UNSUPPORTED_SCHEMA', 'A matching message has an unsupported content representation.');
              const message = {
                id: raw.msgId, senderId: raw.sendUri, senderUnionId: raw.sendUnionID || null, senderName: raw.sendName || raw._senderName || null,
                clientTime: raw.time, clientType: raw.msgType, text: raw.content,
                contentState: raw.content.trim() ? 'available' : 'needs-client-read',
                direction: ownReply ? 'outgoing' : kind === 'self-text' ? 'self-text' : 'incoming', observedAt: new Date().toISOString(),
                ...(mention ? { mention } : {}),
                ...(mentionContinuation ? { mentionContinuation } : {}),
              };
              if (ownReply) record.ownReply = { ...message, transfer: 'client-confirmed' };
              else record.message = message;
            }
            const bytes = new TextEncoder().encode(JSON.stringify(record)).length;
            if (state.records.length >= 2048 || state.bufferedBytes + bytes > 16 * 1024 * 1024) fail('MONITOR_GAP', 'The renderer message buffer overflowed; history reconciliation is required.');
            state.sequence++;
            state.records.push({ ...record, bytes });
            state.bufferedBytes += bytes;
          }
        } catch (error) {
          state.error ||= { code: error.code || 'NOTIFICATION_FAILED', message: error.message };
        }
        // 返回 true 保留本观察者；错误留给本地进程，不能影响客户端的其他通知处理器。
        return true;
      };
      notifications.addMessageBaseMattersNotifyListener(name, policy.PERMANENT, callback);
      window[key] = state;
      current = state;
      return { ok: true, value: { reused: false, generationId: state.generationId, baseline, sequence: 0 } };
    }
    if (!current) fail('LISTENER_LOST', 'The renderer subscription disappeared; reconcile continuity before reinstalling.');
    if (current.contractVersion !== contractVersion) {
      if (!current.accountId) fail('LISTENER_ACCOUNT_UNKNOWN', 'The existing subscription has no verified account binding; remove it before reading or acknowledging it.');
      if (current.accountId !== accountId) fail('ACCOUNT_CHANGED', 'The existing listener belongs to a different signed-in account.');
      // 已绑定账户的旧订阅仍允许原所有者读取和确认；只有重新安装需要迁移。
    }
    current.lastPollAt = Date.now();
    if (operation === 'peek') return { ok: true, value: {
      records: current.records.map(({ bytes, ...record }) => record), error: current.error,
      sequence: current.sequence, acknowledged: current.acknowledged, checkedAt: Date.now(),
    } };
    if (operation === 'ack') {
      if (!Number.isInteger(input.sequence) || input.sequence < current.acknowledged || input.sequence > current.sequence) fail('INVALID_ACK', 'Acknowledgement is outside the observed sequence.');
      current.records = current.records.filter(record => {
        if (record.sequence > input.sequence) return true;
        current.bufferedBytes -= record.bytes;
        return false;
      });
      current.acknowledged = input.sequence;
      return { ok: true, value: { acknowledged: current.acknowledged } };
    }
    fail('UNKNOWN_OPERATION', 'Unknown passive listener operation.');
  } catch (error) {
    return { ok: false, error: { code: error.code || 'LISTENER_OPERATION_FAILED', message: error.message, ...(error.details ? { details: error.details } : {}) } };
  }
}

module.exports = { listenerPageOperation };
