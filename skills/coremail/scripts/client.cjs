// CEF 页面属于当前 CMClient 进程；页面与原生窗口是两个需要关联的对象。
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { CdpClient, ClientError, listTargets, localUrl } = require('./cdp.cjs');

function parseArgs(argv) {
  const [action = 'targets', ...rest] = argv;
  if (!['targets', 'inspect', 'evaluate', 'bridge'].includes(action)) throw new ClientError('ARGUMENT', 'Expected targets, inspect, evaluate or bridge.');
  const options = { action, port: 64758, apply: false };
  const names = new Set(['port', 'pid', 'target', 'url', 'script', 'command', 'params', 'marker']);
  const seen = new Set();
  for (let i = 0; i < rest.length; i++) {
    const key = rest[i].replace(/^--/, '');
    if (seen.has(key)) throw new ClientError('ARGUMENT', `Duplicate option: ${key}`);
    seen.add(key);
    if (rest[i] === '--apply') { options.apply = true; continue; }
    if (!rest[i].startsWith('--') || !names.has(key) || !rest[i + 1] || rest[i + 1].startsWith('--')) throw new ClientError('ARGUMENT', `Invalid option: ${rest[i]}`);
    options[key] = rest[++i];
  }
  options.port = Number(options.port);
  options.pid = Number(options.pid);
  if (!Number.isInteger(options.pid) || options.pid <= 0 || !Number.isInteger(options.port) || options.port < 1024 || options.port > 65535) throw new ClientError('ARGUMENT', 'Use a current CMClient --pid and a port between 1024 and 65535.');
  return options;
}

function verifyOwner(options) {
  const result = spawnSync('python', [path.join(__dirname, 'connect.py'), 'status', '--pid', String(options.pid), '--port', String(options.port), '--require-cdp'], { encoding: 'utf8', windowsHide: true, timeout: 25000 });
  if (result.error || result.status !== 0) throw new ClientError('CONNECTION', 'CMClient process/loopback CDP ownership was not established.', { diagnostic: result.stderr || result.stdout || result.error?.message });
  let report;
  try { report = JSON.parse(result.stdout); } catch { throw new ClientError('CONNECTION', 'Connection diagnosis was not JSON.'); }
  return report;
}

function pageKind(url, executable) {
  let filename;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'file:' || parsed.host) return null;
    filename = path.win32.normalize(decodeURIComponent(parsed.pathname).replace(/^\//, '')).replaceAll('\\', '/').toLowerCase();
  } catch { return null; }
  const install = path.win32.dirname(executable).replaceAll('\\', '/').toLowerCase();
  if (filename.startsWith(`${install}/app/template/`)) return 'template';
  if (/\/temp\/temp_\d+\/compose\/[^/]+\.html$/.test(filename)) return 'compose';
  return null;
}

async function currentPage(client, url) {
  const state = await client.evaluate(() => ({ href: location.href, bridge: typeof window.CM }));
  if (state.href !== url || state.bridge !== 'function') throw new ClientError('STALE_PAGE', 'Page URL or native bridge changed; discover the target again.');
}

async function execute(options) {
  const owner = verifyOwner(options);
  const targets = (await listTargets(options.port)).filter(t => pageKind(t.url, owner.client.executable));
  for (const target of targets) {
    const socket = localUrl(target.webSocketDebuggerUrl, 'ws:');
    if (socket.hostname !== '127.0.0.1' || Number(socket.port) !== options.port) throw new ClientError('CONNECTION', 'Page WebSocket differs from the verified listener.');
  }
  if (options.action === 'targets') {
    const response = await fetch(`http://127.0.0.1:${options.port}/json/version`, { signal: AbortSignal.timeout(5000), redirect: 'error' });
    if (!response.ok) throw new ClientError('CONNECTION', `Version endpoint returned HTTP ${response.status}.`);
    return { status: 'observed', client: owner.client, cdp: owner.cdp, runtime: await response.json(), targets };
  }
  if (!options.target || !options.url) throw new ClientError('ARGUMENT', 'Use --target and exact --url from targets output.');
  const matches = targets.filter(t => t.id === options.target && t.url === options.url);
  if (matches.length !== 1) throw new ClientError('STALE_PAGE', 'The exact target/URL is absent.');
  const target = matches[0];
  let expression;
  let payload = {};
  if (options.action === 'evaluate') {
    if (!options.script) throw new ClientError('ARGUMENT', 'evaluate requires a UTF-8 --script containing a JavaScript expression.');
    expression = fs.readFileSync(options.script, 'utf8').replace(/^\uFEFF/, '');
  }
  if (options.action === 'bridge') {
    if (!options.command) throw new ClientError('ARGUMENT', 'bridge requires the command observed in this client source.');
    if (options.params) payload = JSON.parse(fs.readFileSync(options.params, 'utf8').replace(/^\uFEFF/, ''));
    if (options.command === 'sendcompose' && pageKind(target.url, owner.client.executable) !== 'compose') throw new ClientError('ARGUMENT', 'sendcompose requires the exact current compose target and URL.');
  }
  const client = await CdpClient.connect(target.webSocketDebuggerUrl);
  try {
    await currentPage(client, target.url);
    if (options.action === 'inspect') {
      return { status: 'observed', target: target.id, page: await client.evaluate(() => ({
        href: location.href, userAgent: navigator.userAgent, title: document.title,
        appKeys: Object.keys(window.app || {}), globals: Object.keys(window).filter(k => /^(app|baseApp|mailInfoGroup|appConfig|calendarInstances|CM|callPC)$/u.test(k)),
        text: document.body.innerText,
        fields: [...document.querySelectorAll('input,textarea,[contenteditable]')].map(e => ({ tag: e.tagName, id: e.id, type: e.type, value: e.value ?? e.innerText })),
        frames: [...document.querySelectorAll('iframe')].map(f => ({ id: f.id, href: f.contentDocument?.location.href, text: f.contentDocument?.body.innerText })),
      })) };
    }
    if (options.marker) {
      const exists = await client.evaluate(marker => [document.body, ...[...document.querySelectorAll('iframe')].map(f => f.contentDocument?.body)].some(b => b?.innerText.includes(marker)), options.marker);
      if (!exists) throw new ClientError('WRONG_COMPOSE', 'The expected marker is absent from this page body; no operation dispatched.');
    }
    if (!options.apply) return { status: 'preview', target: target.id, url: target.url, action: options.action, command: options.command, payload, script: options.script, marker: options.marker };
    await currentPage(client, target.url);
    if (options.action === 'bridge') {
      await client.evaluate((command, params) => { window.CM(command, JSON.stringify(params)); return { dispatched: command }; }, options.command, payload);
      return { status: 'dispatched', command: options.command, target: target.id, verify: 'Read the native dialog and query the resulting mailbox state before reporting completion.' };
    }
    const response = await client.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new ClientError('EVALUATION_FAILED', response.exceptionDetails.exception?.description || response.exceptionDetails.text);
    return { status: 'evaluated', target: target.id, result: response.result };
  } finally { client.close(); }
}

if (require.main === module) {
  Promise.resolve().then(() => execute(parseArgs(process.argv.slice(2)))).then(result => console.log(JSON.stringify(result))).catch(error => {
    console.error(JSON.stringify({ status: 'error', code: error.code || 'ERROR', message: error.message, details: error.details, outcome: 'Inspect before retrying applied operations.' }));
    process.exitCode = 1;
  });
}
module.exports = { parseArgs, pageKind, currentPage, execute };
