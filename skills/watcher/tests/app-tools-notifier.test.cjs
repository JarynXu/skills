const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { AppToolsConnection, AppToolsNotifier } = require('../scripts/app-tools-notifier.cjs');
const threadId = '11111111-1111-4111-8111-111111111111';
const turnId = '22222222-2222-4222-8222-222222222222';
const mcp = value => ({ content: [{ type: 'text', text: JSON.stringify(value) }] });

function fake({ status = 'notLoaded', activate = true, accept = true, hostId = 'local', kind = 'codex', truncate = false } = {}) {
  const calls = [];
  let received = null, clock = 0;
  const client = {
    request: async () => ({ tools: [{ name: 'read_thread' }, { name: 'send_message_to_thread' }] }),
    async call(tool, args, callId) {
      calls.push({ tool, args, callId });
      if (tool === 'send_message_to_thread') {
        received = args.prompt;
        return mcp({ threadId: accept ? args.threadId : turnId });
      }
      return mcp({ thread: { id: args.threadId, hostId, kind, status: { type: received && activate ? 'active' : status } },
        turns: received && activate ? [{ id: turnId, status: 'inProgress', items: [{ type: 'userMessage', content: [{ type: 'text', text: truncate ? received.slice(0, args.maxOutputCharsPerItem) : received }] }] }] : [] });
    }
  };
  return { client, calls, options: { client, now: () => clock, pause: async ms => { clock += ms; }, activationTimeoutMs: 300 } };
}

test('冷目标收到对应输入并开始回合，回执携带实际回合证据', async () => {
  const f = fake(), notifier = new AppToolsNotifier({}, f.options);
  await notifier.check();
  const receipt = await notifier.enqueue(threadId, 'Synthetic notification');
  assert.equal(receipt.activation, 'started');
  assert.equal(receipt.startedTurnId, turnId);
  assert.equal(receipt.threadId, threadId);
  assert.equal(Object.hasOwn(receipt, 'queuedMessageId'), false);
  assert.equal(f.calls.filter(call => call.tool === 'send_message_to_thread').length, 1);
  assert.deepEqual(Object.keys(f.calls.find(call => call.tool === 'send_message_to_thread').args).sort(), ['prompt', 'threadId']);
});

test('忙碌目标保留排队，不能报告当前事件已经开始', async () => {
  const f = fake({ status: 'active', activate: false }), notifier = new AppToolsNotifier({}, f.options);
  assert.equal((await notifier.enqueue(threadId, 'Synthetic queued notification')).activation, 'queued-behind-active-turn');
  assert.equal(f.calls.filter(call => call.tool === 'send_message_to_thread').length, 1);
});

test('接收成功但没有对应回合时保留未知，不重发', async () => {
  const f = fake({ activate: false }), notifier = new AppToolsNotifier({}, f.options);
  await assert.rejects(notifier.enqueue(threadId, 'Synthetic delayed notification'), error => error.code === 'NOTIFY_ACTIVATION_UNKNOWN' && error.details.threadId === threadId);
  assert.equal(f.calls.filter(call => call.tool === 'send_message_to_thread').length, 1);
});

test('通知正文相同的独立投递各有标识，后续恢复不会被正文去重吞掉', async () => {
  const f = fake(), notifier = new AppToolsNotifier({}, f.options);
  const first = await notifier.enqueue(threadId, 'Synthetic workspace continuation');
  const second = await notifier.enqueue(threadId, 'Synthetic workspace continuation');
  assert.equal(first.activation, 'started');
  assert.equal(second.activation, 'queued-behind-active-turn');
  assert.notEqual(first.toolCallId, second.toolCallId);
  const sends = f.calls.filter(call => call.tool === 'send_message_to_thread');
  assert.equal(sends.length, 2);
  assert.notEqual(sends[0].args.prompt, sends[1].args.prompt);
});

test('长通知被读取上限截断时仍能核对对应回合', async () => {
  const f = fake({ truncate: true }), notifier = new AppToolsNotifier({}, f.options);
  const prompt = 'Synthetic long notification '.repeat(100);
  const receipt = await notifier.enqueue(threadId, prompt);
  assert.equal(receipt.activation, 'started');
  const sent = f.calls.find(call => call.tool === 'send_message_to_thread');
  assert.ok(sent.args.prompt.length > 1000);
  assert.ok(sent.args.prompt.startsWith('[watcher:' + receipt.toolCallId + ']\n'));
  assert.ok(sent.args.prompt.endsWith(prompt));
  assert.equal(f.calls.filter(call => call.tool === 'send_message_to_thread').length, 1);
});

test('错误目标回执不证明成功，其他主机和非 Codex 目标不发送', async () => {
  const mismatch = fake({ accept: false });
  await assert.rejects(new AppToolsNotifier({}, mismatch.options).enqueue(threadId, 'Synthetic'), { code: 'NOTIFY_UNKNOWN' });
  for (const config of [{ hostId: 'remote' }, { kind: 'chatgpt' }]) {
    const f = fake(config);
    await assert.rejects(new AppToolsNotifier({}, f.options).enqueue(threadId, 'Synthetic'), { code: 'INVALID_WAKE_TARGET' });
    assert.equal(f.calls.filter(call => call.tool === 'send_message_to_thread').length, 0);
  }
});

test('目录能力缺失和应用工具错误不作为发送成功', async () => {
  const f = fake();
  f.client.request = async () => ({ tools: [{ name: 'read_thread' }] });
  await assert.rejects(new AppToolsNotifier({}, f.options).check(), { code: 'APP_TOOLS_UNSUPPORTED' });
  f.client.call = async () => ({ isError: true, content: [{ type: 'text', text: 'Tool denied.' }] });
  await assert.rejects(new AppToolsNotifier({}, f.options).enqueue(threadId, 'Synthetic'), { code: 'APP_TOOL_REJECTED' });
});

test('默认通知及转交使用同一受限通道，正文不成为工具或收件人', async () => {
  const f = fake(), prompts = { notify: () => 'notify synthetic', forward: () => 'forward synthetic' };
  const notifier = new AppToolsNotifier({}, { ...f.options, prompts });
  await notifier.notify({ threadId }, 'event', 'config');
  await notifier.forward({}, 'event', 'config', threadId);
  const sends = f.calls.filter(call => call.tool === 'send_message_to_thread');
  assert.deepEqual(sends.map(call => call.args.threadId), [threadId, threadId]);
  assert.ok(sends[0].args.prompt.endsWith('\nnotify synthetic'));
  assert.ok(sends[1].args.prompt.endsWith('\nforward synthetic'));
});

async function fixture(t, source) {
  const parent = path.resolve(os.tmpdir()), root = await fs.mkdtemp(path.join(parent, 'codex-mcp-notifier-'));
  t.after(async () => { assert.equal(path.dirname(root), parent); assert.ok(path.basename(root).startsWith('codex-mcp-notifier-')); await fs.rm(root, { recursive: true, force: true }); });
  const file = path.join(root, 'server.cjs');
  await fs.writeFile(file, source);
  return { root, file, env: { ...process.env, CODEX_THREAD_ID: threadId, CODEX_APP_TOOLS_PIPE_PATH: 'synthetic-no-real-pipe', FIXTURE_LOG: path.join(root, 'calls.jsonl') } };
}
const service = `
const fs = require('node:fs');
require('node:readline').createInterface({input:process.stdin}).on('line', line => {
  const message=JSON.parse(line);
  fs.appendFileSync(process.env.FIXTURE_LOG,JSON.stringify(message)+'\\n');
  if(message.id===undefined)return;
  let result;
  if(message.method==='initialize')result={protocolVersion:'2024-11-05',capabilities:{tools:{}}};
  else if(message.method==='tools/list')result={tools:[{name:'read_thread'},{name:'send_message_to_thread'}]};
  else result={content:[{type:'text',text:JSON.stringify({threadId:message.params.arguments.threadId})}]};
  process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:message.id,result})+'\\n');
});`;

test('标准 MCP stdio 服务保留执行器身份，退出只清理拥有的子进程', async t => {
  const f = await fixture(t, service), client = new AppToolsConnection({ serverFile: f.file, callerThreadId: threadId }, { env: f.env });
  t.after(() => client.close());
  await client.request('tools/list', {});
  await client.call('send_message_to_thread', { threadId, prompt: 'Synthetic data $(no shell)' }, 'synthetic-call');
  await client.close();
  const calls = (await fs.readFile(f.env.FIXTURE_LOG, 'utf8')).trim().split('\n').map(JSON.parse);
  const call = calls.find(call => call.method === 'tools/call');
  assert.equal(call.params._meta.codexThreadId, threadId);
  assert.equal(call.params._meta.codexCallId, 'synthetic-call');
  assert.equal(call.params.arguments.prompt, 'Synthetic data $(no shell)');
  assert.equal(Object.hasOwn(call.params._meta, 'codexTurnId'), false);
  await assert.rejects(client.request('tools/list', {}), { code: 'APP_TOOLS_CLOSED' });
});

test('调用者和宿主连接必须来自匹配执行器环境，不能任意调用工具', async t => {
  const f = await fixture(t, service);
  assert.throws(() => new AppToolsConnection({ serverFile: f.file, callerThreadId: turnId }, { env: f.env }), { code: 'APP_TOOLS_CONTEXT_MISSING' });
  assert.throws(() => new AppToolsConnection({ serverFile: f.file, callerThreadId: threadId }, { env: { CODEX_THREAD_ID: threadId } }), { code: 'APP_TOOLS_CONTEXT_MISSING' });
  const client = new AppToolsConnection({ serverFile: f.file, callerThreadId: threadId }, { env: f.env });
  assert.throws(() => client.call('exec_command', {}, 'synthetic'), { code: 'UNSUPPORTED_APP_TOOL' });
  await client.close();
});

test('子进程异常和无响应给出失败，不遗留等待请求', async t => {
  const dead = await fixture(t, 'process.exit(1);');
  const disconnected = new AppToolsConnection({ serverFile: dead.file, callerThreadId: threadId }, { env: dead.env });
  try { await assert.rejects(disconnected.request('tools/list', {}), { code: 'APP_TOOLS_DISCONNECTED' }); }
  finally { await disconnected.close(); }
  const hung = await fixture(t, 'process.stdin.resume();');
  const timeout = new AppToolsConnection({ serverFile: hung.file, callerThreadId: threadId }, { env: hung.env, timeoutMs: 60 });
  try { await assert.rejects(timeout.request('tools/list', {}), { code: 'APP_TOOLS_TIMEOUT' }); }
  finally { await timeout.close(); }
});
