const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');
const persistence = require('../../scripts/persistence.cjs');
const mode = process.argv[2];
const configFile = process.argv[process.argv.indexOf('--config') + 1];
const send = value => process.send?.(value);

if (mode === 'observed-run') {
  const net = require('node:net'), createServer = net.createServer;
  let queries = 0;
  net.createServer = callback => createServer(socket => {
    socket.on('data', chunk => { if (String(chunk).includes('"command":"owner"')) send({ event: 'owner-query', count: ++queries }); });
    callback(socket);
  });
}

if (mode === 'publish-window') {
  const Controller = globalThis.AbortController;
  globalThis.AbortController = class extends Controller {
    abort(...args) { super.abort(...args); send({ event: 'aborted' }); }
  };
  const publish = persistence.atomicJson;
  persistence.atomicJson = async (file, value, options) => {
    if (path.basename(file) === 'listener.lock') {
      send({ event: 'publishing', owner: value });
      await new Promise(resolve => process.once('message', resolve));
    }
    return publish(file, value, options);
  };
}

const runtime = require('../../scripts/runtime.cjs');
async function main() {
  const config = await require('../../scripts/config.cjs').loadConfig(configFile);
  if (mode === 'run' && config.testStartGate && !process.send) {
    await persistence.atomicJson(config.testStartedFile, { pid: process.pid });
    while (!await persistence.readJson(config.testStartGate)) await delay(5);
  }
  if (['run', 'publish-window', 'observed-run'].includes(mode)) {
    await runtime.run(config, { source: require('../../scripts/inbox-source.cjs').createInboxSource(config), queue: { check: async () => {}, notify: async () => { throw new Error('Fixture must not notify'); } }, emit: send });
    return;
  }
  if (mode === 'contend') {
    try {
      const lock = await runtime.acquireLock(config);
      send({ event: 'acquired', owner: lock.owner });
      await delay(100);
      await lock.release();
      send({ event: 'released' });
    } catch (error) { send({ event: 'rejected', code: error.code }); }
    return;
  }
  throw new Error('Unknown fixture mode');
}
main().then(() => process.disconnect?.()).catch(error => { send({ event: 'error', code: error.code, message: error.message }); process.exitCode = 1; process.disconnect?.(); }).finally(async () => {
  if (mode === 'run' && !process.send) {
    const config = await persistence.readJson(configFile);
    if (config?.testFinishedFile) await persistence.atomicJson(config.testFinishedFile, { pid: process.pid });
  }
});
