const { ClientError, CdpClient } = require('./cdp.cjs');
const { discover, callPage } = require('./client.cjs');
const { listenerPageOperation } = require('./listener-page.cjs');
const { sendReply } = require('./conversation-send.cjs');
const { withMessageOrigin } = require('./message-origin.cjs');
const { withMessageContent } = require('./message-content.cjs');

const nonempty = value => typeof value === 'string' && value.length > 0;
const reject = message => { throw new ClientError('INVALID_NOTIFICATION_SCOPE', message); };
const hasLegacyFollowups = input => Boolean(input && (
  Object.hasOwn(input, 'quietMs') || Object.hasOwn(input, 'mentionWindows') ||
  (Array.isArray(input.sources) && input.sources.some(source => source && Object.hasOwn(source, 'followups')))
));
const legacyCompatibility = Object.freeze({
  code: 'LEGACY_FOLLOWUPS',
  message: 'Use message-receiver.cjs for grouped delivery; native followups remain available for existing callers.',
});
function knownKeys(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !keys.includes(key))) reject('The notification scope contains unsupported fields.');
}
function ownerScope(input) {
  if (!nonempty(input?.ownerId) || !nonempty(input.accountId)) reject('An owner ID and verified account ID are required.');
  return { ownerId: input.ownerId, accountId: input.accountId };
}

function subscriptionScope(input) {
  knownKeys(input, ['ownerId', 'accountId', 'generationId', 'sources', 'mentionIdentity', 'quietMs', 'replyAwareness', 'mentionWindows']);
  ownerScope(input);
  if (!nonempty(input.generationId) || !Array.isArray(input.sources) || !input.sources.length) reject('A generation ID and nonempty notification sources are required.');
  const legacy = hasLegacyFollowups(input);
  const quietMs = input.quietMs ?? 30000;
  if (!Number.isInteger(quietMs) || quietMs < 0 || quietMs > 60000) reject('quietMs must be 0..60000.');
  if (Object.hasOwn(input, 'replyAwareness') && typeof input.replyAwareness !== 'boolean') reject('replyAwareness must be a boolean.');
  const exact = new Set();
  let direct = false;
  for (const source of input.sources) {
    knownKeys(source, ['kind', 'chatId', 'senderIds', 'followups', 'textPrefix']);
    const kind = source.kind ?? 'conversation';
    if (!['conversation', 'direct', 'group', 'group-mention', 'self-text'].includes(kind)) reject('Unsupported native notification source.');
    if (kind === 'direct') {
      if (direct || Object.keys(source).some(key => key !== 'kind')) reject('Configure one unrestricted direct source.');
      direct = true;
      continue;
    }
    if (!nonempty(source.chatId) || exact.has(source.chatId)) reject('Each explicit conversation must be unique.');
    exact.add(source.chatId);
    if (kind === 'conversation') {
      if (!Array.isArray(source.senderIds) || !source.senderIds.length || source.senderIds.some(id => !nonempty(id) || id === input.accountId)) reject('A conversation source needs explicit incoming senders.');
    } else if (Object.hasOwn(source, 'senderIds')) reject('This source does not accept a sender restriction.');
    if (Object.hasOwn(source, 'followups') && (kind !== 'group-mention' || typeof source.followups !== 'boolean')) reject('Legacy followups is a group-mention boolean.');
    if (['group', 'group-mention'].includes(kind) && !input.mentionIdentity) reject('Group sources require verified native mention identity values.');
    if (kind === 'self-text' && source.chatId !== input.accountId) reject('A self-text source must select the signed-in self conversation.');
    if (Object.hasOwn(source, 'textPrefix') && (kind !== 'self-text' || !nonempty(source.textPrefix) || /\s/u.test(source.textPrefix))) reject('textPrefix must be a nonempty self-text token.');
  }
  const identity = input.mentionIdentity;
  if (identity != null || input.sources.some(source => ['group', 'group-mention'].includes(source.kind))) {
    knownKeys(identity, ['userIds', 'unionIds']);
    if (!Array.isArray(identity.userIds) || !Array.isArray(identity.unionIds) || ![...identity.userIds, ...identity.unionIds].length || [...identity.userIds, ...identity.unionIds].some(id => !nonempty(id) || ['all', '#'].includes(id))) reject('Personal mentions require verified native identity values.');
  }
  if (input.mentionWindows !== undefined) {
    if (!Array.isArray(input.mentionWindows)) reject('Invalid restored personal mention windows.');
    for (const item of input.mentionWindows) {
      knownKeys(item, ['chatId', 'senderId', 'lastId', 'lastAt']);
      if (!nonempty(item.chatId) || !nonempty(item.senderId) || !nonempty(item.lastId) || !Number.isFinite(item.lastAt)) reject('Invalid restored personal mention window.');
    }
  }
  return structuredClone(legacy ? { ...input, quietMs } : input);
}

async function pageCall(connection, operation, input) {
  const result = await connection.evaluate(listenerPageOperation, operation, input);
  if (!result?.ok) throw new ClientError(result?.error?.code || 'INVALID_CLIENT_RESULT', result?.error?.message || 'Invalid notification result.', result?.error?.details);
  return result.value;
}

class NotificationSession {
  #connection;
  #ownsConnection;
  constructor(connection, { ownsConnection = false } = {}) {
    if (typeof connection?.evaluate !== 'function') throw new ClientError('INVALID_CONNECTION', 'A CDP evaluation connection is required.');
    this.#connection = connection;
    this.#ownsConnection = ownsConnection;
  }
  async subscribe(input) {
    const result = await pageCall(this.#connection, 'install', subscriptionScope(input));
    return hasLegacyFollowups(input) ? { ...result, compatibility: legacyCompatibility } : result;
  }
  async readPending(input) {
    const snapshot = await pageCall(this.#connection, 'peek', ownerScope(input));
    return { ...snapshot, records: snapshot.records.map(record => ({ ...record,
      ...(record.message ? { message: withMessageContent(withMessageOrigin(record.message)) } : {}),
      ...(record.ownReply ? { ownReply: withMessageContent(withMessageOrigin(record.ownReply)) } : {}),
    })) };
  }
  confirm(input) {
    if (!Number.isInteger(input?.sequence) || input.sequence < 0) reject('A nonnegative observed sequence is required.');
    return pageCall(this.#connection, 'ack', { ...ownerScope(input), sequence: input.sequence });
  }
  unsubscribe(input) { return pageCall(this.#connection, 'remove', ownerScope(input)); }
  call(operation, input) { return callPage(this.#connection, operation, input); }
  sendTextDirect(scope, text, apply) { return this.call('send-sdk', { ...scope, text, apply }); }
  sendReply(recipient, text, options = {}) { return sendReply(this, recipient, text, options); }
  close() { if (this.#ownsConnection) return this.#connection.close(); }
}

async function openNotifications({ port, targetId }) {
  const targets = (await discover(port)).filter(target => target.role === 'main' && (!targetId || targetId === target.id));
  if (targets.length !== 1) throw new ClientError('MAIN_WINDOW_NOT_UNIQUE', 'Expected one verified iCenter main window.');
  return new NotificationSession(await CdpClient.connect(targets[0].webSocketDebuggerUrl,{timeoutMs:20000}), { ownsConnection: true });
}

module.exports = { openNotifications, NotificationSession, subscriptionScope, sendReply, ClientError };
