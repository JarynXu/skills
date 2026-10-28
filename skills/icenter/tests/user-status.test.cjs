const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ClientError } = require('../scripts/cdp.cjs');
const { readUserStatus, setUserStatus } = require('../scripts/user-status.cjs');

const accountId = 'sip:self@example.test';
const status = (code = 0, customId = null) => ({ userId: 'self', userStatus: code, userStatusCustomId: customId, content: code === 99 ? 'AI托管中' : null, icon: '' });
const returned = result => ({ state: 'returned', result, callbacks: [{ role: 'accepted' }, { role: 'accepted' }, { role: 'fulfilled' }], callbackOverflow: false });

function fixture(initial = status(), { writeReply = returned(true), readback, writeError } = {}) {
  let current = initial;
  const calls = [];
  const session = { accountId, close: () => assert.fail('The borrowed session belongs to its caller.'),
    invoke: async (service, method, args, options = {}) => {
      calls.push({ service, method, args, options });
      assert.equal(service, 'contacts');
      assert.deepEqual(args.slice(1).map(item => item.$callback), ['accepted', 'rejected', 'fulfilled', 'failed', 'timeout']);
      if (method === 'getUserStatusFromICenter') {
        assert.equal(args[0], 'self'); assert.equal(options.apply, true);
        return returned(current);
      }
      assert.equal(method, 'updateUserStatusToICenter');
      assert.equal(args[0].$type, 'b7c5.a');
      assert.equal(args[0].fields.userStatus.$enum, '22a3.b');
      if (!options.apply) return { state: 'preview' };
      if (writeError) throw writeError;
      const member = args[0].fields.userStatus.member;
      current = readback ?? status({ None: 0, Busy: 1, Custom: 99 }[member], args[0].fields.userStatusCustomId);
      return writeReply;
    } };
  return { session, calls };
}

test('本人状态读取区分无状态和自定义状态，查询使用已观察账户的工号', async () => {
  assert.deepEqual(await readUserStatus(fixture().session), { accountId, status: 'None', statusCode: 0, customId: null, content: null, icon: '' });
  const current = await readUserStatus(fixture(status(99, 123)).session);
  assert.equal(current.status, 'Custom'); assert.equal(current.customId, 123); assert.equal(current.content, 'AI托管中');
});

test('查询缺少成功证据、身份不符或状态未知时不冒充无状态', async () => {
  const replies = [returned(null), returned({ ...status(), userId: 'other' }), returned(status(17)), returned(status(99)),
    { ...returned(status()), callbacks: [{ role: 'accepted' }] },
    { ...returned(status()), callbacks: [{ role: 'fulfilled' }, { role: 'failed' }] },
    { ...returned(status()), callbackOverflow: true }];
  for (const reply of replies) {
    await assert.rejects(readUserStatus({ accountId, invoke: async () => reply }), { code: 'USER_STATUS_QUERY_FAILED' });
  }
});

test('状态预览核对写入契约，不读取旧状态或执行业务写入', async () => {
  const { session, calls } = fixture(status(99, 123));
  assert.deepEqual(await setUserStatus(session), { state: 'preview', operation: 'set-user-status', accountId, target: { status: 'None', statusCode: 0, customId: null } });
  assert.equal(calls.length, 1); assert.equal(calls[0].options.apply, undefined);
  const preview = await setUserStatus(session, { status: 'Custom', customId: 456, expectedCustomId: 123 });
  assert.equal(preview.expectedCustomId, 123); assert.equal(preview.target.customId, 456);
  assert.equal(calls.length, 2);
});

test('默认清为无状态，显式目标可以选择内置状态或自定义状态', async () => {
  for (const [input, expected] of [[{}, 'None'], [{ status: 'Busy' }, 'Busy'], [{ status: 'Custom', customId: 123 }, 'Custom']]) {
    const { session, calls } = fixture();
    const result = await setUserStatus(session, { ...input, apply: true });
    assert.equal(result.state, 'client-confirmed'); assert.equal(result.status, expected);
    assert.deepEqual(calls.map(call => call.method), ['updateUserStatusToICenter', 'getUserStatusFromICenter']);
    assert.equal(calls[0].args[0].fields.userStatus.member, expected);
  }
});

test('条件清除只修改本次已知的自定义状态，已变化的状态保持原值', async () => {
  const matching = fixture(status(99, 123));
  assert.equal((await setUserStatus(matching.session, { expectedCustomId: '123', apply: true })).status, 'None');
  assert.deepEqual(matching.calls.map(call => call.method), ['getUserStatusFromICenter', 'updateUserStatusToICenter', 'getUserStatusFromICenter']);
  for (const current of [status(), status(1), status(99, 456)]) {
    const { session, calls } = fixture(current);
    const result = await setUserStatus(session, { expectedCustomId: 123, apply: true });
    assert.equal(result.state, 'unchanged'); assert.equal(result.reason, 'current-status-differs');
    assert.equal(result.current.statusCode, current.userStatus);
    assert.deepEqual(calls.map(call => call.method), ['getUserStatusFromICenter']);
  }
});

test('无效状态组合在客户端调用前拒绝', async () => {
  const session = { accountId, invoke: () => assert.fail('Invalid input reached the client.') };
  for (const input of [{ status: 'Typo' }, { status: '0' }, { status: 0 }, { apply: 'yes' }, { status: 'Custom' },
    { status: 'Custom', customId: '' }, { status: 'Custom', customId: 0 }, { customId: 123 }, { expectedCustomId: '\n' }]) {
    await assert.rejects(setUserStatus(session, input), { code: 'INVALID_ARGUMENT' });
  }
  await assert.rejects(readUserStatus({ ...session, accountId: 'not-a-sip-account' }), { code: 'USER_STATUS_IDENTITY_UNSUPPORTED' });
});

test('设置缺少完成回调、返回失败或回读不符时保留未知且不重试', async () => {
  for (const config of [{ writeReply: returned(false) }, { writeReply: { ...returned(true), callbacks: [{ role: 'accepted' }] } },
    { writeReply: { ...returned(true), callbacks: [{ role: 'fulfilled' }, { role: 'timeout' }] } },
    { readback: status(1) }, { readback: { ...status(), userId: 'other' } },
    { writeError: new ClientError('SDK_CALL_UNKNOWN', 'Connection lost after invocation.') }]) {
    const { session, calls } = fixture(status(99, 123), config);
    await assert.rejects(setUserStatus(session, { apply: true }), error => error.code === 'USER_STATUS_SET_UNKNOWN' && error.details.target.status === 'None');
    assert.equal(calls.filter(call => call.method === 'updateUserStatusToICenter').length, 1);
  }
});

test('自定义目标 ID 回读不符不能确认为成功', async () => {
  const { session } = fixture(status(), { readback: status(99, 456) });
  await assert.rejects(setUserStatus(session, { status: 'Custom', customId: 123, apply: true }), { code: 'USER_STATUS_SET_UNKNOWN' });
});

test('写入前拒绝保留原错误，条件读取失败不进入写入', async () => {
  const error = new ClientError('ACCOUNT_CHANGED', 'Account changed.', { phase: 'not-invoked' });
  const { session, calls } = fixture(status(), { writeError: error });
  await assert.rejects(setUserStatus(session, { apply: true }), candidate => candidate === error);
  assert.equal(calls.length, 1);
  const brokenRead = fixture(null);
  await assert.rejects(setUserStatus(brokenRead.session, { expectedCustomId: 123, apply: true }), { code: 'USER_STATUS_QUERY_FAILED' });
  assert.equal(brokenRead.calls.length, 1);
});

test('写入之后的回读前账户变化保留设置未知，不冒充写入前拒绝', async () => {
  const { session, calls } = fixture();
  const invoke = session.invoke;
  session.invoke = async (service, method, ...args) => {
    if (method === 'getUserStatusFromICenter') throw new ClientError('ACCOUNT_CHANGED', 'Account changed before readback.', { phase: 'not-invoked' });
    return invoke(service, method, ...args);
  };
  await assert.rejects(setUserStatus(session, { apply: true }), error => error.code === 'USER_STATUS_SET_UNKNOWN' &&
    error.details.phase === 'confirming' && error.details.cause === 'ACCOUNT_CHANGED' && error.details.causeDetails.phase === 'not-invoked');
  assert.equal(calls.length, 1); assert.equal(calls[0].method, 'updateUserStatusToICenter');
});
