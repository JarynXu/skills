// Read-only audit of original modules with isolated UI/transport fixtures.
// A reproduced result confirms a defect in this fixture, not client compatibility.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { spawnSync } = require('node:child_process');
const { createHash } = require('node:crypto');

if (!process.argv[2]) throw new Error('Usage: node source-probe.cjs <original icenter/scripts directory>');
const root = path.resolve(process.argv[2]);
const quiet = { log() {}, error() {} };
const sleep = async () => {};
const results = [];
const loadedHashes = new Map();
function hash(file) { return createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function load(rel, dependencies = {}, globals = {}) {
  const filename = path.join(root, rel);
  loadedHashes.set(filename, hash(filename));
  const module = { exports: {} };
  const context = {
    module, exports: module.exports, console: quiet, __dirname: path.dirname(filename),
    require(id) {
      if (Object.hasOwn(dependencies, id)) return dependencies[id];
      throw new Error(`Unexpected dependency blocked: ${id}`);
    },
    ...globals,
  };
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), context, { filename });
  return module.exports;
}
async function probe(name, fn) {
  try { results.push({ name, status: 'reproduced', evidence: await fn() }); }
  catch (error) { results.push({ name, status: 'probe_failed', error: error.stack }); }
}
function browserClient(getMessages) {
  return { eval: async expression => vm.runInNewContext(expression, {
    document: { querySelector: selector => selector === '.Messageslistul' ? {
      children: getMessages().map(m => ({
        tagName: 'LI', offsetParent: {},
        querySelector(selector) {
          if (selector === '.SendName') return { textContent: m.sender };
          if (selector === '.SendId') return { textContent: m.senderId };
          if (selector === '.SendTime') return { textContent: m.time };
          if (selector === '.messagetext') return { innerText: m.content };
          return null;
        },
      })),
    } : null },
  }) };
}
async function watchFixture(atTick, maxIdleMs) {
  let tick = 0;
  class FixtureDate extends Date { static now() { return tick; } }
  const messages = load('messages.js', {
    './lib/cdp-dom': { sleep: async () => { tick++; } },
    './contacts': { select: async () => ({ success: true, chatName: 'A' }) },
  }, { Date: FixtureDate });
  const events = [];
  await messages.watch(browserClient(() => atTick(tick)), 'A', e => events.push(e), { pollMs: 1, maxIdleMs });
  return { events, tick };
}
function socketFixture() {
  let socket;
  class FakeWebSocket {
    constructor() { socket = this; this.readyState = 0; }
    send(data) { this.lastSent = JSON.parse(data); }
    close() { this.readyState = 3; this.onclose?.({ code: 1006 }); }
  }
  const { CdpClient } = load('lib/cdp-client.js', {}, { WebSocket: FakeWebSocket });
  const client = new CdpClient('ws://fixture.invalid');
  return { client, socket };
}
async function observePending(promise) {
  return Promise.race([
    promise.then(value => ({ outcome: 'resolved', value }), error => ({ outcome: 'rejected', error: error.message })),
    new Promise(resolve => setTimeout(() => resolve({ outcome: 'pending_after_50ms' }), 50)),
  ]);
}

(async () => {
  await probe('partial_name_accepts_wrong_current_chat', async () => {
    const contacts = load('contacts.js', { './lib/cdp-dom': { getCurrentChatTitle: async () => 'Project A - Test', sleep } });
    const r = await contacts.select({ eval: async () => { throw new Error('Must not navigate'); } }, 'Project A');
    assert.equal(r.success, true);
    assert.equal(r.chatName, 'Project A - Test');
    return r;
  });
  await probe('same_name_single_and_group_are_collapsed', async () => {
    const contacts = load('contacts.js', { './lib/cdp-dom': { sleep } });
    const input = [{ name: 'Same name', type: 'single' }, { name: 'Same name', type: 'group' }];
    const r = await contacts.list({ eval: async expression => expression.includes('var items = []')
      ? JSON.stringify({ scrollTop: 0, scrollHeight: 100, clientHeight: 100, items: input }) : 0 });
    assert.equal(r.length, 1);
    return { inputCount: input.length, outputCount: r.length, returned: r };
  });
  await probe('read_failure_is_returned_as_empty_messages', async () => {
    const messages = load('messages.js', { './lib/cdp-dom': {}, './contacts': {} });
    const r = await messages.read({ eval: async () => JSON.stringify({ error: 'NO_MESSAGE_LIST' }) });
    assert.equal(r.length, 0);
    return { inputError: 'NO_MESSAGE_LIST', returned: r };
  });
  await probe('editor_clear_is_reported_as_send_success_without_message_confirmation', async () => {
    const dom = {
      sleep, findEditor: async () => ({ centerX: 1, centerY: 1 }),
      setEditorContent: async () => 'OK', findSendButton: async () => ({ centerX: 2, centerY: 2 }),
    };
    const messages = load('messages.js', { './lib/cdp-dom': dom, './contacts': {} });
    const emptyEditor = { textContent: '' };
    const r = await messages.send({ clickAt: async () => {}, eval: async expression => vm.runInNewContext(expression, {
      document: { getElementById: () => ({ querySelector: () => emptyEditor }) },
    }) }, 'Fixture only');
    assert.equal(r.sent, true);
    return { fixture: 'empty editor; no sent-message acknowledgement supplied', returned: r };
  });
  const msg = { sender: 'User', senderId: 'u1', time: '10:00', content: 'Fixture message' };
  await probe('switched_chat_messages_are_labeled_as_original_chat', async () => {
    const r = await watchFixture(tick => tick === 0 ? [] : [{ ...msg, content: 'Only present in chat B' }], 1);
    assert.equal(r.events.length, 1);
    assert.equal(r.events[0].group, 'A');
    return { actualFixtureChat: 'B after first poll', event: r.events[0] };
  });
  await probe('message_dedup_ignores_sender_id_and_content_after_100_chars', async () => {
    const first = { ...msg, content: 'x'.repeat(100) + '-first' };
    const second = { ...msg, senderId: 'u2', content: 'x'.repeat(100) + '-second' };
    const r = await watchFixture(tick => tick === 0 ? [first] : [first, second], 1);
    assert.equal(r.events.length, 0);
    return { newDistinctMessages: 1, reported: r.events.length };
  });
  await probe('idle_timeout_expires_during_continuous_new_messages', async () => {
    const r = await watchFixture(tick => tick === 0 ? [] : [{ ...msg, content: `New message ${tick}` }], 2);
    assert.equal(r.events.length, 2);
    assert.equal(r.tick, 3);
    return { maxIdleMs: 2, lastMessageTick: 2, exitTick: r.tick };
  });
  await probe('successful_connection_json_followed_by_log_cannot_be_parsed', async () => {
    // Run only this literal stdout fixture in PowerShell; never run connect.ps1.
    const ps = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      `Write-Host '[icenter-cdp] Main page found'; Write-Host '{"port":12345,"status":"connected","mainPageId":"fixture","webSocketDebuggerUrl":"ws://fixture.invalid"}'; Write-Host '[icenter-cdp] Done. iCenter CDP available at ws://localhost:12345'`], { encoding: 'utf8', windowsHide: true });
    assert.equal(ps.status, 0);
    assert.match(ps.stdout, /Done/);
    const connect = load('lib/connect.js', {
      path,
      child_process: { spawn() {
        const child = new EventEmitter(); child.stdout = new EventEmitter(); child.stderr = new EventEmitter();
        queueMicrotask(() => { child.stdout.emit('data', Buffer.from(ps.stdout)); child.emit('exit', 0); });
        return child;
      } },
    });
    let failure;
    try { await connect.ensureCdp(); } catch (error) { failure = error.message; }
    assert.match(failure, /Failed to parse/);
    return { childExitCode: 0, logsCapturedOnStdout: true, error: failure.split('\n')[0] };
  });
  await probe('cdp_protocol_error_resolves_as_undefined', async () => {
    const { client, socket } = socketFixture();
    socket.readyState = 1; socket.onopen({});
    const request = client.send('Fixture.invalid');
    await Promise.resolve();
    socket.onmessage({ data: JSON.stringify({ id: socket.lastSent.id, error: { code: -32601, message: 'Method not found' } }) });
    const r = await request;
    assert.equal(r, undefined);
    return { responseContainedError: true, promise: 'resolved', result: 'undefined' };
  });
  await probe('websocket_connection_error_leaves_command_pending', async () => {
    const { client, socket } = socketFixture();
    const request = client.send('Runtime.enable');
    socket.onerror({ message: 'Fixture connection failed' });
    const r = await observePending(request);
    assert.equal(r.outcome, 'pending_after_50ms');
    return r;
  });
  await probe('websocket_close_leaves_inflight_command_pending', async () => {
    const { client, socket } = socketFixture();
    socket.readyState = 1; socket.onopen({});
    const request = client.send('Runtime.enable');
    await Promise.resolve(); socket.close();
    const r = await observePending(request);
    assert.equal(r.outcome, 'pending_after_50ms');
    return { ...r, retainedPendingCount: client._pending.size };
  });
  await probe('group_toggle_labels_are_treated_as_enabled_states', async () => {
    const groups = load('groups.js', { './lib/cdp-dom': { sleep } });
    const panel = { offsetParent: {}, textContent: '允许分享群聊二维码 消息免扰',
      querySelector: () => null, querySelectorAll: () => [],
    };
    const r = await groups.info({ eval: async expression => vm.runInNewContext(expression, {
      document: { getElementById: () => panel, querySelector: () => null },
    }) });
    assert.equal(r.allowShareQr, true); assert.equal(r.muted, true);
    return { fixture: 'labels only; no enabled-state evidence', returned: { allowShareQr: r.allowShareQr, muted: r.muted } };
  });
  const sourceUnchanged = [...loadedHashes].every(([file, before]) => hash(file) === before);
  const report = {
    runAt: new Date().toISOString(), node: process.version, source: root,
    scope: 'Isolated source-module reproductions. No real iCenter process, network connection, UI action, or message sending.',
    reproduced: results.filter(r => r.status === 'reproduced').length,
    probeFailures: results.filter(r => r.status === 'probe_failed').length,
    sourceUnchanged, sourceHashes: Object.fromEntries(loadedHashes), results,
  };
  console.log(JSON.stringify(report, null, 2));
  if (!sourceUnchanged || report.probeFailures) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
