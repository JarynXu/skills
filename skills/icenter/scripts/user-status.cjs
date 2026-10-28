const { ClientError } = require('./cdp.cjs');
const statusValues = require('./sdk-contracts.json').enums['22a3.b'].values;
const callbacks = ['accepted', 'rejected', 'fulfilled', 'failed', 'timeout'].map(role => ({ $callback: role }));

// 读取当前状态用于确认目标；不保存旧状态或推断后续恢复策略。
async function readUserStatus(session) {
  const id = employeeId(session.accountId);
  const reply = await session.invoke('contacts', 'getUserStatusFromICenter', [id, ...callbacks], {
    apply: true, fields: ['userId', 'userStatus', 'userStatusCustomId', 'content', 'icon'],
  });
  const current = reply?.result;
  if (!fulfilled(reply) || !current || current.userId !== id || !Number.isInteger(current.userStatus) || typeof statusValues[current.userStatus] !== 'string') {
    throw new ClientError('USER_STATUS_QUERY_FAILED', 'The client did not confirm a recognized status for the requested account.');
  }
  if (current.userStatus === statusValues.Custom && !validId(current.userStatusCustomId)) {
    throw new ClientError('USER_STATUS_QUERY_FAILED', 'The custom status has no valid identifier.');
  }
  return { accountId: session.accountId, status: statusValues[current.userStatus], statusCode: current.userStatus,
    customId: current.userStatusCustomId, content: current.content, icon: current.icon };
}

// expectedCustomId 保护调用方已知的托管状态；本地比较不具备服务端原子条件更新语义。
async function setUserStatus(session, { status = 'None', customId, expectedCustomId, apply = false } = {}) {
  employeeId(session.accountId);
  if (typeof apply !== 'boolean' || typeof status !== 'string' || !Object.hasOwn(statusValues, status) || typeof statusValues[status] !== 'number') {
    throw new ClientError('INVALID_ARGUMENT', 'Select a registered user-status name and a boolean apply value.');
  }
  if (status === 'Custom' ? !validId(customId) : customId !== undefined) {
    throw new ClientError('INVALID_ARGUMENT', 'Custom status requires customId; built-in statuses do not accept it.');
  }
  if (expectedCustomId !== undefined && !validId(expectedCustomId)) throw new ClientError('INVALID_ARGUMENT', 'expectedCustomId must identify the current custom status.');
  const target = { status, statusCode: statusValues[status], customId: status === 'Custom' ? customId : null };
  const args = [{ $type: 'b7c5.a', fields: { userStatus: { $enum: '22a3.b', member: status }, userStatusCustomId: target.customId } }, ...callbacks];
  if (!apply) {
    await session.invoke('contacts', 'updateUserStatusToICenter', args);
    return { state: 'preview', operation: 'set-user-status', accountId: session.accountId, target,
      ...(expectedCustomId !== undefined ? { expectedCustomId } : {}) };
  }
  if (expectedCustomId !== undefined) {
    const current = await readUserStatus(session);
    if (current.status !== 'Custom' || String(current.customId) !== String(expectedCustomId)) {
      return { state: 'unchanged', reason: 'current-status-differs', accountId: session.accountId, current };
    }
  }
  let writeReturned = false;
  try {
    const reply = await session.invoke('contacts', 'updateUserStatusToICenter', args, { apply: true });
    writeReturned = true;
    if (!fulfilled(reply) || reply.result !== true) throw new ClientError('USER_STATUS_SET_UNCONFIRMED', 'The client did not confirm the requested status change.');
    const current = await readUserStatus(session);
    if (current.status !== status || status === 'Custom' && String(current.customId) !== String(customId)) {
      throw new ClientError('USER_STATUS_SET_UNCONFIRMED', 'The current status differs from the requested status.', { current });
    }
    return { state: 'client-confirmed', operation: 'set-user-status', ...current };
  } catch (error) {
    // 回读尚未调用不代表此前写入未发生。
    if (!writeReturned && error.details?.phase === 'not-invoked') throw error;
    throw new ClientError('USER_STATUS_SET_UNKNOWN', 'The status change could not be confirmed; query the current status before another write.',
      { accountId: session.accountId, target, phase: writeReturned ? 'confirming' : 'write-requested', cause: error.code || error.message,
        ...(error.details ? { causeDetails: error.details } : {}) });
  }
}

function employeeId(accountId) {
  const id = typeof accountId === 'string' && /^sip:([^@]+)@[^@]+$/.exec(accountId)?.[1];
  if (!id) throw new ClientError('USER_STATUS_IDENTITY_UNSUPPORTED', 'User status requires an observed SIP account.');
  return id;
}

function validId(value) {
  return typeof value === 'string' && !!value.trim() && !/[\r\n\u0000]/u.test(value) || Number.isSafeInteger(value) && value > 0;
}

function fulfilled(reply) {
  return reply?.state === 'returned' && !reply.callbackOverflow && Array.isArray(reply.callbacks) &&
    reply.callbacks.some(item => item.role === 'fulfilled') && !reply.callbacks.some(item => ['rejected', 'failed', 'timeout'].includes(item.role));
}

module.exports = { readUserStatus, setUserStatus };
