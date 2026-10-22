const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const { setTimeout: delay } = require('node:timers/promises');
const { RuntimeError } = require('./errors.cjs');
const { defaultPrompts } = require('./codex-queue.cjs');
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

// 复用宿主提供的 MCP 服务，工具调用仍经应用验证；不建立另一套会话服务器。
class AppToolsConnection {
  #child;
  #pending = new Map();
  #buffer = '';
  #serial = 0;
  #connecting;
  #closed = false;
  constructor({ serverFile, callerThreadId }, { env = process.env, timeoutMs = 10000, spawnProcess = spawn } = {}) {
    if (typeof serverFile !== 'string' || !path.isAbsolute(serverFile) || !UUID.test(callerThreadId || '')) throw new RuntimeError('INVALID_WAKE_CONFIG', 'App tools need an absolute server file and a verified caller thread UUID.');
    if (env.CODEX_THREAD_ID !== callerThreadId || !env.CODEX_APP_TOOLS_PIPE_PATH) throw new RuntimeError('APP_TOOLS_CONTEXT_MISSING', 'The executor must supply the matching caller thread and app tools connection.');
    this.serverFile = serverFile; this.callerThreadId = callerThreadId;
    this.env = env; this.timeoutMs = timeoutMs; this.spawnProcess = spawnProcess;
  }
  async connect() {
    if (this.#closed) throw new RuntimeError('APP_TOOLS_CLOSED', 'The app tools connection is closed.');
    if (this.#connecting) return this.#connecting;
    this.#connecting = (async () => {
      await fs.access(this.serverFile);
      const child = this.spawnProcess(process.execPath, [this.serverFile], { windowsHide: true, env: this.env, stdio: ['pipe', 'pipe', 'pipe'] });
      this.#child = child;
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', chunk => this.#receive(chunk));
      child.stdin.on('error', error => this.#fail(new RuntimeError('APP_TOOLS_DISCONNECTED', error.message)));
      child.stderr.on('data', () => {});
      child.once('error', error => this.#fail(new RuntimeError('APP_TOOLS_DISCONNECTED', error.message)));
      child.once('exit', () => this.#fail(new RuntimeError('APP_TOOLS_DISCONNECTED', 'The app tools service exited.')));
      const initialized = await this.#request('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'watcher', version: '1.0.0' } });
      if (!initialized?.protocolVersion || !initialized.capabilities?.tools) throw new RuntimeError('APP_TOOLS_UNSUPPORTED', 'The configured service does not expose MCP tools.');
      child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
    })();
    return this.#connecting;
  }
  async request(method, params) { await this.connect(); return this.#request(method, params); }
  call(name, argumentsValue, callId) {
    if (!['read_thread', 'send_message_to_thread'].includes(name)) throw new RuntimeError('UNSUPPORTED_APP_TOOL', 'This notifier only reads and sends to existing tasks.');
    return this.request('tools/call', { name, arguments: argumentsValue, _meta: { codexThreadId: this.callerThreadId, codexCallId: callId } });
  }
  #request(method, params) {
    if (!this.#child || this.#closed) return Promise.reject(new RuntimeError('APP_TOOLS_CLOSED', 'The app tools service is unavailable.'));
    const id = ++this.#serial;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#pending.delete(id);
        reject(new RuntimeError('APP_TOOLS_TIMEOUT', 'The app tool request timed out; a submitted effect may be unknown.'));
      }, this.timeoutMs);
      this.#pending.set(id, { resolve, reject, timer });
      this.#child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n', error => {
        if (!error) return;
        const entry = this.#pending.get(id);
        if (entry) { clearTimeout(entry.timer); this.#pending.delete(id); entry.reject(error); }
      });
    });
  }
  #receive(chunk) {
    this.#buffer += chunk;
    if (Buffer.byteLength(this.#buffer, 'utf8') > 8 * 1024 * 1024) { this.#fail(new RuntimeError('APP_TOOLS_PROTOCOL_ERROR', 'The app tools response exceeded the supported bound.')); return; }
    let boundary;
    while ((boundary = this.#buffer.indexOf('\n')) !== -1) {
      const line = this.#buffer.slice(0, boundary).trim(); this.#buffer = this.#buffer.slice(boundary + 1);
      if (!line) continue;
      let response;
      try { response = JSON.parse(line); }
      catch { this.#fail(new RuntimeError('APP_TOOLS_PROTOCOL_ERROR', 'The app tools service returned malformed JSON.')); return; }
      if (response.id === undefined) continue;
      const entry = this.#pending.get(response.id);
      if (!entry) continue;
      clearTimeout(entry.timer); this.#pending.delete(response.id);
      if (response.error) entry.reject(new RuntimeError('APP_TOOL_REJECTED', response.error.message || 'The app tool rejected the request.'));
      else if (!Object.hasOwn(response, 'result')) entry.reject(new RuntimeError('APP_TOOLS_PROTOCOL_ERROR', 'The app tools response has no result.'));
      else entry.resolve(response.result);
    }
  }
  #fail(error) {
    this.#closed = true;
    for (const entry of this.#pending.values()) { clearTimeout(entry.timer); entry.reject(error); }
    this.#pending.clear();
    this.#child?.kill();
  }
  async close() {
    const child = this.#child;
    this.#fail(new RuntimeError('APP_TOOLS_CLOSED', 'The notifier connection was closed.'));
    if (!child || child.exitCode !== null || child.signalCode !== null) return;
    await new Promise(resolve => { const timer = setTimeout(resolve, 2000); child.once('exit', () => { clearTimeout(timer); resolve(); }); });
  }
}

function toolValue(result) {
  const text = result?.content?.filter(item => item.type === 'text').map(item => item.text).join('\n');
  if (result?.isError) throw new RuntimeError('APP_TOOL_REJECTED', text || 'The application rejected the tool request.');
  try { return JSON.parse(text); }
  catch { throw new RuntimeError('APP_TOOLS_PROTOCOL_ERROR', 'The app tool did not return the expected JSON result.'); }
}
function hasDelivery(turn, marker) {
  return turn?.items?.some(item => item.type === 'userMessage' && item.content?.some(content => content.type === 'text' && content.text?.includes(marker)));
}

class AppToolsNotifier {
  constructor(config, { client, prompts = defaultPrompts, activationTimeoutMs = 5000, now = Date.now, pause = delay } = {}) {
    this.client = client || new AppToolsConnection(config);
    this.prompts = prompts; this.activationTimeoutMs = activationTimeoutMs; this.now = now; this.pause = pause;
  }
  async check() {
    const result = await this.client.request('tools/list', {});
    for (const name of ['read_thread', 'send_message_to_thread']) if (!result.tools?.some(tool => tool.name === name)) throw new RuntimeError('APP_TOOLS_UNSUPPORTED', 'The app tool catalog is missing ' + name + '.');
  }
  notify(batch, eventFile, configFile) { return this.enqueue(batch.threadId, this.prompts.notify(batch, eventFile, configFile)); }
  forward(batch, eventFile, configFile, threadId, options = {}) {
    if (typeof this.prompts.forward !== 'function') throw new RuntimeError('DISPATCH_UNAVAILABLE', 'No dispatch notification formatter was composed.');
    return this.enqueue(threadId, this.prompts.forward(batch, eventFile, configFile, threadId, options));
  }
  async read(threadId) {
    const result = toolValue(await this.client.call('read_thread', { threadId, turnLimit: 1, includeOutputs: false, maxOutputCharsPerItem: 1000 }, 'event-read-' + randomUUID()));
    if (result.thread?.id !== threadId || result.thread.kind !== 'codex' || result.thread.hostId !== 'local') throw new RuntimeError('INVALID_WAKE_TARGET', 'The target is not the verified local Codex task.');
    return result;
  }
  async enqueue(threadId, prompt) {
    if (!UUID.test(threadId || '') || typeof prompt !== 'string' || !prompt) throw new RuntimeError('INVALID_WAKE_TARGET', 'Expected an existing task UUID and notification text.');
    const before = await this.read(threadId);
    const toolCallId = 'event-send-' + randomUUID();
    // 回合读取允许截断正文；前缀标识关联本次投递，事件去重仍由持久回执负责。
    const marker = '[watcher:' + toolCallId + ']';
    const accepted = toolValue(await this.client.call('send_message_to_thread', { threadId, prompt: marker + '\n' + prompt }, toolCallId));
    if (accepted.threadId !== threadId) throw new RuntimeError('NOTIFY_UNKNOWN', 'No matching app tool receipt was returned.', { threadId, toolCallId });
    const receipt = { threadId, backend: 'app-tools', toolCallId };
    if (before.thread.status?.type === 'active') return { ...receipt, activation: 'queued-behind-active-turn' };
    const deadline = this.now() + this.activationTimeoutMs;
    do {
      const observed = await this.read(threadId);
      const turn = observed.turns?.find(turn => hasDelivery(turn, marker));
      if (turn) return { ...receipt, activation: 'started', startedTurnId: turn.id };
      await this.pause(150);
    } while (this.now() < deadline);
    throw new RuntimeError('NOTIFY_ACTIVATION_UNKNOWN', 'The application accepted the notification but no matching processing turn was observed; reconcile without resending.', receipt);
  }
  close() { return this.client.close?.(); }
}

module.exports = { AppToolsConnection, AppToolsNotifier, toolValue };
