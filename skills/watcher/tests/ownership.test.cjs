const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { fork } = require('node:child_process');
const { createServer } = require('node:net');
const { once } = require('node:events');
const { setTimeout: delay } = require('node:timers/promises');
const { acquireLock, canonicalPath, status, start, stop } = require('../scripts/runtime.cjs');
const { atomicJson, readJson, digest } = require('../scripts/persistence.cjs');
const workerFile = path.join(__dirname, 'fixtures/owner-worker.cjs');
const windows = { skip: process.platform !== 'win32', timeout: 15000 };

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'watcher-owner-'));
  const stateDir = path.join(root, 'state'), directory = path.join(root, 'inbox');
  await fs.mkdir(stateDir); await fs.mkdir(directory);
  const configFile = path.join(root, 'config.json');
  await atomicJson(configFile, { version: 2, source: { kind: 'json-inbox', id: 'fixture', directory }, stateDir,
    targetThreadId: '11111111-1111-4111-8111-111111111111', pollMs: 250, debounceMs: 0, wake: { executable: process.execPath } });
  const config = await require('../scripts/config.cjs').loadConfig(configFile);
  config.commandFile = workerFile;
  const children = [];
  const f = { config, stateDir, children };
  t.after(async () => {
    await f.beforeCleanup?.();
    if (f.detachedPid) {
      const observed = await status(config);
      if (observed.ownership === 'owned' && observed.pid === f.detachedPid) await stop(config);
    }
    for (const child of children) {
      if (child.exitCode === null && child.signalCode === null) { child.kill(); await once(child, 'exit'); }
    }
    await fs.rm(root, { recursive: true, force: true });
  });
  return f;
}

function launch(f, mode) {
  const child = fork(workerFile, [mode, '--config', f.config.configFile], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
  f.children.push(child);
  const messages = [], waiters = [];
  let exited = false, stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk; });
  const flush = () => {
    for (let i = waiters.length - 1; i >= 0; i--) {
      const waiter = waiters[i], message = messages.find(waiter.predicate);
      if (message) { waiters.splice(i, 1); waiter.resolve(message); }
      else if (exited) { waiters.splice(i, 1); waiter.reject(new Error('Worker exited before expected event: ' + stderr + JSON.stringify(messages))); }
    }
  };
  child.on('message', message => { messages.push(message); flush(); });
  child.once('exit', () => { exited = true; flush(); });
  return { child, messages, waitFor: predicate => new Promise((resolve, reject) => { waiters.push({ predicate, resolve, reject }); flush(); }) };
}

test('存活的旧 PID 不能代表锁所有权，停止不等待该 PID 或写入旧令牌', windows, async t => {
  const f = await fixture(t), old = { pid: process.pid, token: 'stale-token', startedAt: new Date().toISOString() };
  await atomicJson(path.join(f.stateDir, 'listener.lock'), old);
  await atomicJson(path.join(f.stateDir, 'status.json'), { ...old, state: 'listening', updatedAt: new Date().toISOString() });
  const observed = await status(f.config);
  assert.equal(observed.ownership, 'absent'); assert.equal(observed.lockRecord, 'stale');
  assert.equal(observed.state, 'stopped'); assert.equal(observed.observedProcessAlive, false); assert.equal(observed.recordedProcessAlive, true); assert.equal(observed.fresh, false);
  const stopped = await stop(f.config);
  assert.equal(stopped.state, 'stopped'); assert.equal(stopped.ownership, 'absent');
  assert.equal(await readJson(path.join(f.stateDir, 'stop.json')), null);
  await atomicJson(path.join(f.stateDir, 'listener.lock'), old);
  const lock = await acquireLock(f.config);
  assert.notEqual(lock.owner.token, old.token); await lock.release();
});

test('真实持有者通过管道确认，磁盘锁被旧活 PID 替换仍不能抢占或误停', windows, async t => {
  const f = await fixture(t), worker = launch(f, 'run');
  await worker.waitFor(value => value.event === 'listening');
  const actual = await readJson(path.join(f.stateDir, 'listener.lock'));
  await atomicJson(path.join(f.stateDir, 'listener.lock'), { pid: process.pid, token: 'foreign-record' });
  const observed = await status(f.config);
  assert.equal(observed.ownership, 'owned'); assert.equal(observed.pid, worker.child.pid); assert.equal(observed.token, actual.token);
  assert.equal(observed.lockRecord, 'stale'); assert.equal(observed.state, 'listening'); assert.equal(observed.fresh, true);
  await assert.rejects(acquireLock(f.config), { code: 'LISTENER_ALREADY_RUNNING' });
  await assert.rejects(start(f.config), { code: 'LISTENER_ALREADY_RUNNING' });
  const stopped = await stop(f.config);
  assert.equal(stopped.state, 'stopped'); assert.equal(stopped.ownership, 'absent');
  assert.equal(await readJson(path.join(f.stateDir, 'stop.json')), null);
});

test('锁文件出版窗口中的状态查询不占独占权，启动与停止识别内核持有者', windows, async t => {
  const f = await fixture(t), worker = launch(f, 'publish-window');
  const publishing = await worker.waitFor(value => value.event === 'publishing');
  const states = await Promise.all(Array.from({ length: 8 }, () => status(f.config)));
  for (const observed of states) {
    assert.equal(observed.ownership, 'owned'); assert.equal(observed.token, publishing.owner.token);
    assert.equal(observed.lockRecord, 'missing'); assert.equal(observed.state, 'starting'); assert.equal(observed.fresh, false);
  }
  await assert.rejects(start(f.config), { code: 'LISTENER_ALREADY_RUNNING' });
  const stopping = stop(f.config);
  await worker.waitFor(value => value.event === 'aborted');
  worker.child.send({ event: 'continue' });
  assert.equal((await stopping).state, 'stopped');
  assert.equal(worker.messages.some(value => value.event === 'listening'), false);
  assert.equal((await status(f.config)).ownership, 'absent');
});

test('start 忽略陈旧活 PID，真实子进程确认就绪后能停止', windows, async t => {
  const f = await fixture(t);
  await atomicJson(path.join(f.stateDir, 'listener.lock'), { pid: process.pid, token: 'stale' });
  const launched = await start(f.config); f.detachedPid = launched.pid;
  assert.equal(launched.state, 'listening'); assert.equal(launched.ownership, 'owned'); assert.notEqual(launched.pid, process.pid);
  assert.equal((await stop(f.config)).state, 'stopped');
});

test('并发 start 只有一个实例确认就绪，失败启动不能停止获胜实例', windows, async t => {
  const f = await fixture(t);
  const outcomes = await Promise.allSettled([start(f.config), start(f.config)]);
  const succeeded = outcomes.filter(value => value.status === 'fulfilled');
  const rejected = outcomes.filter(value => value.status === 'rejected');
  if (succeeded[0]) f.detachedPid = succeeded[0].value.pid;
  assert.equal(succeeded.length, 1); assert.equal(rejected.length, 1);
  assert.ok(['LISTENER_ALREADY_RUNNING', 'LISTENER_START_FAILED'].includes(rejected[0].reason.code));
  assert.equal((await status(f.config)).pid, f.detachedPid);
  assert.equal((await stop(f.config)).state, 'stopped');
});

test('竞争持有者出现后 start 等待自己的延迟子进程退出，失败返回不能留下待启动实例', windows, async t => {
  const f = await fixture(t), gate = path.join(f.stateDir, 'start-gate.json'), startedFile = path.join(f.stateDir, 'child-started.json'), finishedFile = path.join(f.stateDir, 'child-finished.json');
  const raw = await readJson(f.config.configFile);
  await atomicJson(f.config.configFile, { ...raw, testStartGate: gate, testStartedFile: startedFile, testFinishedFile: finishedFile });
  const open = fs.open;
  let foreign, ready;
  const foreignReady = new Promise(resolve => { ready = resolve; });
  // 在启动预检与生成子进程之间建立竞争持有者；己方子进程保持在取锁屏障前。
  fs.open = async (file, ...args) => {
    if (file === path.join(f.stateDir, 'listener.log')) {
      foreign = launch(f, 'observed-run');
      await foreign.waitFor(value => value.event === 'listening');
      ready();
    }
    return open(file, ...args);
  };
  const starting = start(f.config);
  starting.catch(() => {});
  f.beforeCleanup = async () => {
    fs.open = open; await atomicJson(gate, true); await starting.catch(() => {});
    const deadline = Date.now() + 2000;
    while (!await readJson(finishedFile) && Date.now() < deadline) await delay(5);
    assert.ok(await readJson(finishedFile), 'The gated child must finish before the competing owner is released');
  };
  try {
    await foreignReady;
    await Promise.race([
      foreign.waitFor(value => value.event === 'owner-query' && value.count === 2),
      starting.then(() => { throw new Error('start returned while its child remained behind the acquisition gate'); }, error => { throw new Error('start rejected before its child exited: ' + error.code); })
    ]);
    assert.ok(await readJson(startedFile));
    await atomicJson(gate, true);
    await assert.rejects(starting, { code: 'LISTENER_START_FAILED' });
    assert.equal((await status(f.config)).pid, foreign.child.pid);
    assert.equal((await stop(f.config)).state, 'stopped');
    assert.equal((await status(f.config)).ownership, 'absent');
  } finally { fs.open = open; }
});

test('维护锁不能被 stop 当作监听进程停止，状态过期与记录损坏保留区别', windows, async t => {
  const f = await fixture(t), lock = await acquireLock(f.config);
  try {
    await atomicJson(path.join(f.stateDir, 'status.json'), { ...lock.owner, state: 'listening', updatedAt: '2000-01-01T00:00:00.000Z' });
    await fs.writeFile(path.join(f.stateDir, 'listener.lock'), '{invalid');
    const observed = await status(f.config);
    assert.equal(observed.ownership, 'owned'); assert.equal(observed.lockRecord, 'unreadable'); assert.equal(observed.state, 'unresponsive'); assert.equal(observed.fresh, false);
    await assert.rejects(stop(f.config), { code: 'LISTENER_NOT_STOPPABLE' });
    assert.equal((await status(f.config)).ownership, 'owned');
    await atomicJson(path.join(f.stateDir, 'listener.lock'), lock.owner);
  } finally { await lock.release(); }
});

test('查询不能冒充独占持有者；多进程获得与释放后没有残留锁', windows, async t => {
  const f = await fixture(t);
  for (let round = 0; round < 3; round++) {
    let querying = true;
    const queries = (async () => { while (querying) { const observed = await status(f.config); assert.ok(['owned', 'absent', 'unknown'].includes(observed.ownership)); await delay(1); } })();
    const contenders = Array.from({ length: 4 }, () => launch(f, 'contend'));
    const outcomes = await Promise.all(contenders.map(worker => worker.waitFor(value => ['acquired', 'rejected'].includes(value.event))));
    assert.ok(outcomes.some(value => value.event === 'acquired'));
    assert.ok(outcomes.filter(value => value.event === 'rejected').every(value => value.code === 'LISTENER_ALREADY_RUNNING'));
    await Promise.all(contenders.map((worker, index) => outcomes[index].event === 'acquired' ? worker.waitFor(value => value.event === 'released') : Promise.resolve()));
    querying = false; await queries;
    assert.equal((await status(f.config)).ownership, 'absent');
    const lock = await acquireLock(f.config); await lock.release();
  }
});

test('不响应探测的管道报告不可核对，start 和 stop 不使用磁盘 PID', windows, async t => {
  const f = await fixture(t);
  const pipe = '\\\\.\\pipe\\codex-watcher-' + digest((await canonicalPath(f.stateDir)).toLowerCase());
  const sockets = new Set(), server = createServer(socket => { sockets.add(socket); socket.once('close', () => sockets.delete(socket)); });
  server.listen({ path: pipe, exclusive: true }); await once(server, 'listening');
  t.after(async () => { for (const socket of sockets) socket.destroy(); await new Promise(resolve => server.close(resolve)); });
  await atomicJson(path.join(f.stateDir, 'listener.lock'), { pid: process.pid, token: 'unverified' });
  const observed = await status(f.config);
  assert.equal(observed.ownership, 'unknown'); assert.equal(observed.state, 'ownership-unknown'); assert.equal(observed.lockRecord, 'unverified'); assert.equal(observed.fresh, false);
  await assert.rejects(start(f.config), { code: 'LISTENER_OWNERSHIP_UNKNOWN' });
  await assert.rejects(stop(f.config), { code: 'LISTENER_OWNERSHIP_UNKNOWN' });
  assert.equal(await readJson(path.join(f.stateDir, 'stop.json')), null);
});
