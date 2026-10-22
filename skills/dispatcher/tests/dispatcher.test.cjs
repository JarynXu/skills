const nodeTest = require('node:test');
const test = (name, operation) => nodeTest(name, { skip: process.platform !== 'win32' ? 'Requires the real Windows named-pipe coordinator.' : false, timeout: 10000 }, operation);
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { createHash } = require('node:crypto');

const THREAD_A = '11111111-1111-4111-8111-111111111111';
const THREAD_B = '22222222-2222-4222-8222-222222222222';
const PROJECT = '33333333-3333-4333-8333-333333333333';
const event = (key, extra = {}) => ({ version: 2, eventId: createHash('sha256').update(key).digest('hex'), sourceId: 'fixture', payload: { text: key }, ...extra });
const evidence = { artifact: 'fixture-result', verifiedBy: 'fixture-owner' };

async function fixture(t, options = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'dispatcher-standalone-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const pkg = path.join(root, 'dispatcher');
  await fs.cp(path.resolve(__dirname, '..'), pkg, { recursive: true });
  const workspace = path.join(root, 'workspace');
  await fs.mkdir(path.join(workspace, 'child'), { recursive: true });
  const { createDispatcher } = require(path.join(pkg, 'scripts', 'dispatcher.cjs'));
  const config = { stateDir: path.join(root, 'state'), workers: [{ threadId: THREAD_A, projectId: null }], workspaceRoots: [workspace], ...options };
  const sent = [];
  const delivery = { async send(input) { sent.push(input); return { outcome: 'accepted', evidence: { queuedMessageId: 'fixture-' + sent.length } }; } };
  const dispatcher = await createDispatcher(config, { delivery });
  return { root, pkg, workspace, createDispatcher, config, sent, delivery, dispatcher };
}
async function routed(dispatcher, key, decision = {}) {
  const input = event(key);
  await dispatcher.importEvent(input);
  const selection = Object.hasOwn(decision, 'threadId') ? {} : { projectId: null };
  await dispatcher.route(input.eventId, { ...selection, prompt: 'Perform fixture work.', ...decision });
  return input.eventId;
}
function runNode(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', data => { stdout += data; }); child.stderr.on('data', data => { stderr += data; });
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve(stdout) : reject(new Error('Child exit ' + code + ': ' + stderr + stdout)));
  });
}

test('standalone immutable import survives producer deletion, duplicate is detached, conflicts fail', async t => {
  const f = await fixture(t);
  const original = event('opaque', { sourceRef: { arbitrary: ['not', 'interpreted'] }, recordKeys: ['stable'], extra: { preserved: true } });
  const file = path.join(f.root, 'producer.json');
  await fs.writeFile(file, JSON.stringify(original));
  await f.dispatcher.importEvent(JSON.parse(await fs.readFile(file)));
  await fs.unlink(file);
  const same = await f.dispatcher.importEvent({ ...original, payload: { text: 'opaque' } });
  assert.equal(same.duplicate, true);
  original.extra.preserved = false;
  const reopened = await f.createDispatcher(f.config);
  assert.equal((await reopened.status(original.eventId)).event.extra.preserved, true);
  await assert.rejects(reopened.importEvent(original), { code: 'EVENT_CONFLICT' });
  await assert.rejects(reopened.importEvent(event('bad', { version: 1 })), { code: 'INVALID_EVENT' });
  assert.deepEqual((await reopened.status(original.eventId)).event.sourceRef, { arbitrary: ['not', 'interpreted'] });
});

test('pool capacity and explicit contextual ownership wait; completion performs bounded drain', async t => {
  const f = await fixture(t, { workers: [{ threadId: THREAD_A, projectId: null }, { threadId: THREAD_B, projectId: PROJECT }] });
  const first = await routed(f.dispatcher, 'first');
  const second = await routed(f.dispatcher, 'second', { threadId: THREAD_A });
  assert.equal((await f.dispatcher.drain()).attempted, 1);
  assert.equal((await f.dispatcher.status(second)).state, 'waiting');
  assert.equal(f.sent[0].threadId, THREAD_A);
  assert.equal((await f.dispatcher.status()).workers[1].reserved.length, 0);
  const current = await f.dispatcher.status(first);
  const done = await f.dispatcher.complete(first, { threadId: THREAD_A, attemptId: current.attemptId, evidence });
  assert.equal(done.completion.state, 'completed');
  assert.equal(done.drain.attempted, 1);
  assert.equal((await f.dispatcher.status(second)).state, 'active');
  assert.equal(f.sent[1].threadId, THREAD_A);
  await assert.rejects(f.dispatcher.route(second, { projectId: PROJECT, prompt: 'Change owner.' }), { code: 'DECISION_CONFLICT' });
});

test('unknown delivery and crash markers retain capacity; absence reconciliation requires explicit retry', async t => {
  const f = await fixture(t);
  const first = await routed(f.dispatcher, 'unknown');
  const second = await routed(f.dispatcher, 'waiting');
  let calls = 0;
  const uncertain = await f.createDispatcher(f.config, { delivery: { async send() { calls++; throw new Error('after possible effect'); } } });
  assert.equal((await uncertain.drain()).attempted, 1);
  assert.equal((await uncertain.status(first)).state, 'unknown');
  const restart = await f.createDispatcher(f.config, { delivery: f.delivery });
  assert.equal((await restart.drain()).attempted, 0);
  assert.equal(calls, 1);
  await assert.rejects(restart.retry(first), { code: 'RETRY_UNSAFE' });
  const current = await restart.status(first);
  await assert.rejects(restart.reconcile(first, { attemptId: current.attemptId, outcome: 'not_sent', evidence: {} }), { code: 'INVALID_RECONCILIATION' });
  await assert.rejects(restart.reconcile(first, { attemptId: current.attemptId, outcome: 'not_sent', evidence: { unchecked: true } }), { code: 'ABSENCE_EVIDENCE_REQUIRED' });
  await restart.reconcile(first, { attemptId: current.attemptId, outcome: 'not_sent', evidence: { operationTerminated: true, absenceProof: { authoritativeQueueInspection: 'confirmed absent' } } });
  assert.equal((await restart.status(first)).state, 'not_sent');
  assert.equal((await restart.drain()).attempted, 1);
  assert.equal((await restart.status(second)).state, 'active');
  await restart.retry(first);
  assert.equal((await restart.status(first)).state, 'waiting');
});

test('unknown delivery can complete with matching evidence, immutable completion releases capacity', async t => {
  const f = await fixture(t);
  const id = await routed(f.dispatcher, 'handled-unknown');
  const d = await f.createDispatcher(f.config, { delivery: { async send() { return { outcome: 'unknown' }; } } });
  await d.drain(); const entry = await d.status(id);
  await assert.rejects(d.complete(id, { threadId: THREAD_B, attemptId: entry.attemptId, evidence }), { code: 'NOT_ASSIGNED' });
  await d.complete(id, { threadId: THREAD_A, attemptId: entry.attemptId, evidence }, { drainLimit: 0 });
  await d.complete(id, { threadId: THREAD_A, attemptId: entry.attemptId, evidence }, { drainLimit: 0 });
  await assert.rejects(d.complete(id, { threadId: THREAD_A, attemptId: entry.attemptId, evidence: { different: true } }), { code: 'COMPLETION_CONFLICT' });
  assert.equal((await d.status()).workers[0].reserved.length, 0);
});

test('workspace scope is acquired before dispatch, parent-child conflict waits and completion drains', async t => {
  const f = await fixture(t, { workers: [{ threadId: THREAD_A, projectId: null, capacity: 2 }] });
  const first = await routed(f.dispatcher, 'workspace-owner', { workspaces: [f.workspace] });
  const second = await routed(f.dispatcher, 'workspace-waiter', { workspaces: [path.join(f.workspace, 'child')] });
  await f.dispatcher.drain();
  assert.equal(f.sent.length, 1);
  const owner = await f.dispatcher.status(first);
  assert.equal(owner.claims.length, 1);
  assert.equal((await f.dispatcher.status(second)).claims.length, 0);
  await f.dispatcher.complete(first, { threadId: THREAD_A, attemptId: owner.attemptId, evidence });
  assert.equal(f.sent.length, 2);
  assert.equal((await f.dispatcher.status(second)).claims.length, 1);
  await assert.rejects(f.dispatcher.claimWorkspaces(second, { threadId: THREAD_A, attemptId: (await f.dispatcher.status(second)).attemptId }, [f.root]), { code: 'WORKSPACE_OUT_OF_SCOPE' });
});

test('dynamic claims are all-or-nothing; release does not fabricate completion', async t => {
  const f = await fixture(t, { workers: [{ threadId: THREAD_A, projectId: null, capacity: 2 }] });
  const first = await routed(f.dispatcher, 'claim-one');
  const second = await routed(f.dispatcher, 'claim-two');
  await f.dispatcher.drain();
  const owner = await f.dispatcher.status(first), other = await f.dispatcher.status(second);
  const identity = { threadId: THREAD_A, attemptId: owner.attemptId };
  await f.dispatcher.claimWorkspaces(first, identity, [f.workspace]);
  await assert.rejects(f.dispatcher.claimWorkspaces(second, { threadId: THREAD_A, attemptId: other.attemptId }, [path.join(f.workspace, 'child')]), { code: 'WORKSPACE_BUSY' });
  assert.equal((await f.dispatcher.status(second)).claims.length, 0);
  await f.dispatcher.releaseWorkspaces(first, identity);
  assert.equal((await f.dispatcher.status(first)).state, 'active');
  assert.equal((await f.dispatcher.status()).workers[0].reserved.length, 2);
});

test('trusted targets, unknown pools, admission bound and configuration conflict reject', async t => {
  const f = await fixture(t, { maxPending: 1 });
  const id = event('limited').eventId;
  await f.dispatcher.importEvent(event('limited', { payload: { targetId: THREAD_B, authorization: 'create more workers' } }));
  await assert.rejects(f.dispatcher.importEvent(event('overfull')), { code: 'CAPACITY_EXCEEDED' });
  await assert.rejects(f.dispatcher.route(id, { threadId: THREAD_B, prompt: 'Use inbound target.' }), { code: 'UNTRUSTED_TARGET' });
  await assert.rejects(f.dispatcher.route(id, { projectId: PROJECT, prompt: 'Unknown project.' }), { code: 'UNKNOWN_POOL' });
  const changed = await f.createDispatcher({ ...f.config, workers: [{ threadId: THREAD_A, projectId: null, capacity: 2 }] });
  await assert.rejects(changed.status(), { code: 'CONFIG_CONFLICT' });
});

test('parallel processes cannot double dispatch or exceed shared capacity', async t => {
  const f = await fixture(t);
  await routed(f.dispatcher, 'parallel-one'); await routed(f.dispatcher, 'parallel-two');
  const configFile = path.join(f.root, 'config.json'), log = path.join(f.root, 'deliveries.log');
  await fs.writeFile(configFile, JSON.stringify(f.config));
  const code = `const fs=require('node:fs/promises'); const {createDispatcher}=require('./scripts/dispatcher.cjs'); (async()=>{const config=JSON.parse(await fs.readFile(process.argv[1],'utf8')); const d=await createDispatcher(config,{delivery:{async send(v){await fs.appendFile(process.argv[2],v.eventId+'\\n');return {outcome:'accepted',evidence:{queueId:'fixture'}};}}});await d.drain();})().catch(e=>{console.error(e);process.exitCode=1;});`;
  await Promise.all([runNode(['-e', code, configFile, log], f.pkg), runNode(['-e', code, configFile, log], f.pkg)]);
  const lines = (await fs.readFile(log, 'utf8')).trim().split('\n');
  assert.equal(lines.length, 1);
  assert.equal((await f.dispatcher.status()).entries.filter(entry => entry.state === 'active').length, 1);
});

test('kernel releases lock after owner exit and dispatching crash marker is never resent', async t => {
  const f = await fixture(t);
  const id = await routed(f.dispatcher, 'crash');
  const configFile = path.join(f.root, 'config.json'); await fs.writeFile(configFile, JSON.stringify(f.config));
  const code = `const fs=require('node:fs/promises');const {createDispatcher}=require('./scripts/dispatcher.cjs');(async()=>{const d=await createDispatcher(JSON.parse(await fs.readFile(process.argv[1],'utf8')),{delivery:{async send(){process.stdout.write('RESERVED\\n');return new Promise(()=>{});}}});await d.drain();})().catch(e=>{console.error(e);process.exitCode=1;});setInterval(()=>{},1000);`;
  const child = spawn(process.execPath, ['-e', code, configFile], { cwd: f.pkg, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => child.kill());
  await Promise.race([once(child.stdout, 'data'), new Promise((_, reject) => setTimeout(() => reject(new Error('Child readiness timeout')), 5000).unref())]);
  const exited = once(child, 'exit'); child.kill(); await exited;
  assert.equal((await f.dispatcher.status(id)).state, 'dispatching');
  assert.equal((await f.dispatcher.drain()).attempted, 0);
  const lockCode = `const {withState}=require('./scripts/state.cjs');withState(process.argv[1],async()=>{process.stdout.write('LOCKED\\n');await new Promise(()=>{});});setInterval(()=>{},1000);`;
  const locker = spawn(process.execPath, ['-e', lockCode, f.config.stateDir], { cwd: f.pkg, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => locker.kill());
  await once(locker.stdout, 'data'); const stopped = once(locker, 'exit'); locker.kill(); await stopped;
  assert.equal((await f.dispatcher.status(id)).state, 'dispatching');
});

test('native adapter validates queue receipts and CLI imports standalone JSON', async t => {
  const f = await fixture(t);
  const { createCodexDelivery } = require(path.join(f.pkg, 'scripts', 'codex-delivery.cjs'));
  const configFile = path.join(f.root, 'config.json'), eventFile = path.join(f.root, 'event.json');
  await fs.writeFile(configFile, JSON.stringify(f.config)); await fs.writeFile(eventFile, JSON.stringify(event('cli')));
  const imported = JSON.parse(await runNode(['scripts/dispatch.cjs', 'import', '--config', configFile, '--event', eventFile, '--apply'], f.pkg));
  assert.equal(imported.result.imported, true);
  const a = createCodexDelivery({ executable: process.execPath, configFile }, { run: async (_exe, args) => {
    assert.equal(args[0], 'queue'); assert.equal(args[2], THREAD_A);
    return { stdout: 'Queued message aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa for thread ' + THREAD_A + '.' };
  } });
  assert.equal((await a.send({ eventId: event('cli').eventId, threadId: THREAD_A, attemptId: 'attempt', prompt: 'Work.' })).outcome, 'accepted');
  const b = createCodexDelivery({ executable: process.execPath, configFile }, { run: async () => ({ stdout: 'unconfirmed' }) });
  assert.equal((await b.send({ eventId: event('cli').eventId, threadId: THREAD_A, attemptId: 'attempt', prompt: 'Work.' })).outcome, 'unknown');
});

test('retained history and event byte bounds reject without evicting identities', async t => {
  const f = await fixture(t, { maxEntries: 1, maxEventBytes: 500 });
  await assert.rejects(f.dispatcher.importEvent(event('large', { payload: 'x'.repeat(1000) })), { code: 'EVENT_TOO_LARGE' });
  const id = await routed(f.dispatcher, 'retained'); await f.dispatcher.drain();
  const owner = await f.dispatcher.status(id);
  await f.dispatcher.complete(id, { threadId: THREAD_A, attemptId: owner.attemptId, evidence }, { drainLimit: 0 });
  await assert.rejects(f.dispatcher.importEvent(event('new')), { code: 'STATE_CAPACITY_EXCEEDED' });
  assert.equal((await f.dispatcher.importEvent(event('retained'))).duplicate, true);
});

test('state byte bound and malformed state do not report successful handoff', async t => {
  const f = await fixture(t, { maxStateBytes: 250 });
  await assert.rejects(f.dispatcher.importEvent(event('too-much-state')), { code: 'STATE_CAPACITY_EXCEEDED' });
  assert.equal((await f.dispatcher.status()).entries.length, 0);
  const corrupt = { version: 1, sequence: 1, entries: [{ event: event('corrupt'), ordinal: 1, state: 'waiting', claims: [] }] };
  await fs.writeFile(path.join(f.config.stateDir, 'dispatcher-state.json'), JSON.stringify(corrupt));
  await assert.rejects(f.dispatcher.status(), { code: 'INVALID_STATE' });
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(f.config.stateDir, 'dispatcher-state.json'), 'utf8')), corrupt);
});

test('state is outside skill/Git trees and path redirection is rejected', async t => {
  const f = await fixture(t);
  await assert.rejects(f.createDispatcher({ ...f.config, stateDir: path.join(f.pkg, 'state') }), { code: 'INVALID_CONFIG' });
  const git = path.join(f.root, 'git-worktree'); await fs.mkdir(git); await fs.writeFile(path.join(git, '.git'), 'gitdir: fixture');
  await assert.rejects(f.createDispatcher({ ...f.config, stateDir: path.join(git, 'state') }), { code: 'INVALID_CONFIG' });
  const elsewhere = path.join(f.root, 'elsewhere'); await fs.mkdir(elsewhere);
  await fs.rename(f.config.stateDir, f.config.stateDir + '-original');
  await fs.symlink(elsewhere, f.config.stateDir, 'junction');
  await assert.rejects(f.dispatcher.status(), { code: 'STATE_PATH_CHANGED' });
});

test('completion survives a failed follow-on drain and early completion cannot be overwritten by delivery', async t => {
  const f = await fixture(t);
  const first = await routed(f.dispatcher, 'no-port-on-completion'); await f.dispatcher.drain();
  const current = await f.dispatcher.status(first);
  const withoutPort = await f.createDispatcher(f.config);
  const result = await withoutPort.complete(first, { threadId: THREAD_A, attemptId: current.attemptId, evidence });
  assert.equal(result.completion.state, 'completed');
  assert.equal(result.drain.error.code, 'DELIVERY_REQUIRED');
  assert.equal((await f.dispatcher.status(first)).state, 'completed');
  const second = await routed(f.dispatcher, 'complete-before-send-return');
  let reentrant;
  reentrant = await f.createDispatcher(f.config, { delivery: { async send(input) {
    await reentrant.complete(input.eventId, { threadId: input.threadId, attemptId: input.attemptId, evidence }, { drainLimit: 0 });
    return { outcome: 'accepted', evidence: { lateQueueConfirmation: true } };
  } } });
  await reentrant.drain();
  assert.equal((await reentrant.status(second)).state, 'completed');
  assert.equal((await reentrant.status()).workers[0].reserved.length, 0);
});

test('parallel imports transfer ownership once and malformed delivery results remain unknown', async t => {
  const f = await fixture(t);
  const other = await f.createDispatcher(f.config);
  const results = await Promise.all([f.dispatcher.importEvent(event('same')), other.importEvent(event('same'))]);
  assert.equal(results.filter(result => result.duplicate).length, 1);
  assert.equal((await f.dispatcher.status()).entries.length, 1);
  await f.dispatcher.route(event('same').eventId, { projectId: null, prompt: 'Work.' });
  const malformed = await f.createDispatcher(f.config, { delivery: { async send() { return { outcome: 'accepted' }; } } });
  await malformed.drain();
  assert.equal((await malformed.status(event('same').eventId)).state, 'unknown');
  assert.equal((await malformed.drain()).attempted, 0);
});

test('workspace aliases resolve to the same claim and cannot bypass overlap', async t => {
  const f = await fixture(t, { workers: [{ threadId: THREAD_A, projectId: null, capacity: 2 }] });
  const alias = path.join(f.root, 'workspace-alias'); await fs.symlink(f.workspace, alias, 'junction');
  const one = await routed(f.dispatcher, 'alias-owner', { workspaces: [f.workspace] });
  const two = await routed(f.dispatcher, 'alias-waiter', { workspaces: [alias] });
  assert.equal((await f.dispatcher.drain()).attempted, 1);
  assert.equal((await f.dispatcher.status(one)).claims.length, 1);
  assert.equal((await f.dispatcher.status(two)).state, 'waiting');
});

nodeTest('CLI help is standalone and non-Windows state access rejects explicitly', async t => {
  const f = await fixture(t);
  const help = JSON.parse(await runNode(['scripts/dispatch.cjs', '--help'], f.pkg));
  assert.ok(help.result.commands.includes('drain'));
  if (process.platform !== 'win32') await assert.rejects(f.dispatcher.importEvent(event('unsupported')), { code: 'UNSUPPORTED_PLATFORM' });
});

test('state bound can be raised to finish retained work; stale lower-bound instances reject', async t => {
  const f = await fixture(t, { maxStateBytes: 3000 });
  const id = await routed(f.dispatcher, 'bound-recovery'); await f.dispatcher.drain();
  const entry = await f.dispatcher.status(id);
  const largeEvidence = { artifact: 'x'.repeat(4000) };
  await assert.rejects(f.dispatcher.complete(id, { threadId: THREAD_A, attemptId: entry.attemptId, evidence: largeEvidence }, { drainLimit: 0 }), { code: 'STATE_CAPACITY_EXCEEDED' });
  assert.equal((await f.dispatcher.status(id)).state, 'active');
  const raised = await f.createDispatcher({ ...f.config, maxStateBytes: 10000 });
  const done = await raised.complete(id, { threadId: THREAD_A, attemptId: entry.attemptId, evidence: largeEvidence }, { drainLimit: 0 });
  assert.equal(done.completion.state, 'completed');
  await raised.importEvent(event('retained-after-raise'));
  await assert.rejects(f.dispatcher.status(), { code: 'CONFIG_CONFLICT' });
});
