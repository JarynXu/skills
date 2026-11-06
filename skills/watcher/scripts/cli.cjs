const fs = require('node:fs/promises');
const path = require('node:path');
const { parseArgs } = require('node:util');
const runtime = require('./runtime.cjs');
const { atomicJson, readJson } = require('./persistence.cjs');
const { RuntimeError } = require('./errors.cjs');
const { loadConfig: loadInboxConfig } = require('./config.cjs');
const { createInboxSource } = require('./inbox-source.cjs');
const { createReceiverSource } = require('./receiver-source.cjs');
const { NativeCodexQueue } = require('./codex-queue.cjs');
const { AppToolsNotifier } = require('./app-tools-notifier.cjs');
const { registerInstance, listInstances } = require('./instances.cjs');
const output = value => process.stdout.write(JSON.stringify(value) + '\n');
const common = ['start', 'run', 'status', 'stop', 'register', 'ack', 'retry', 'reconcile-source'];

async function checkedEvent(config, eventId) {
  if (!/^[a-f0-9]{64}$/.test(eventId || '')) throw new RuntimeError('INVALID_ARGUMENT', '--event-id must be a lowercase SHA-256 event ID.');
  const event = await readJson(path.join(config.stateDir, 'batches', eventId + '.json'));
  if (!event || event.eventId !== eventId || !config.eventContract.matches(event)) throw new RuntimeError('BATCH_NOT_FOUND', 'No event belongs to this configured source and target.');
  return event;
}

const createSource = config => config.source.kind === 'receiver' ? createReceiverSource(config) : createInboxSource(config);

async function main(argv, { loadConfig = loadInboxConfig, sourceFactory = createSource, queueFactory, extensions = {} } = {}) {
  const command = argv[0];
  if (!command || ['help', '--help'].includes(command)) { output({ commands: ['list', ...common, ...Object.keys(extensions)], list: 'list [--thread <target UUID>]', instance: '--config <absolute JSON file>', execution: 'Mutations preview by default; --apply executes.' }); return; }
  if (command === 'list') {
    const { values } = parseArgs({ args: argv.slice(1), options: { thread: { type: 'string' } } });
    output({ instances: await listInstances(values.thread) }); return;
  }
  if (!common.includes(command) && !extensions[command]) throw new RuntimeError('UNKNOWN_COMMAND', 'Unknown event command.');
  const schema = { config: { type: 'string' }, apply: { type: 'boolean' }, ...(extensions[command]?.options || {}) };
  if (['ack', 'retry'].includes(command)) schema['event-id'] = { type: 'string' };
  if (['ack', 'retry', 'reconcile-source'].includes(command)) schema.reason = { type: 'string' };
  if (command === 'ack') schema.outcome = { type: 'string' };
  const { values } = parseArgs({ args: argv.slice(1), options: schema, strict: true, allowPositionals: false });
  if (!path.isAbsolute(values.config || '')) throw new RuntimeError('INVALID_ARGUMENT', '--config must be an absolute JSON path.');
  const config = await loadConfig(values.config);
  if (command === 'status') { output(await runtime.status(config)); return; }
  if (extensions[command]) { output(await extensions[command].run(config, values)); return; }
  let event;
  if (['ack', 'retry'].includes(command)) event = await checkedEvent(config, values['event-id']);
  if (command === 'ack') {
    if (!['accepted', 'completed', 'ignored', 'attention'].includes(values.outcome)) throw new RuntimeError('INVALID_ARGUMENT', 'A fixed-target event accepts accepted, completed, ignored or attention.');
    if (values.outcome === 'ignored' && config.eventContract.needsContent?.(event)) throw new RuntimeError('BODY_READ_REQUIRED', 'Unresolved source content cannot be silently ignored.');
    if (values.outcome === 'ignored' && !values.reason?.trim()) throw new RuntimeError('DISPOSITION_REASON_REQUIRED', 'An ignored event needs a reason from existing evidence or authorized policy.');
  }
  if (command === 'retry' && !values.reason?.trim()) throw new RuntimeError('RECONCILIATION_REASON_REQUIRED', 'Retry needs evidence that the previous notification was not accepted and cannot arrive later.');
  if (command === 'reconcile-source' && !values.reason?.trim()) throw new RuntimeError('RECONCILIATION_REASON_REQUIRED', 'Source reconciliation needs checked coverage or starting-point evidence from its owner.');
  if (!values.apply) { output({ state: 'preview', command, stateDir: config.stateDir, sourceId: config.source.id, targetThreadId: config.targetThreadId, ...(event ? { eventId: event.eventId } : {}) }); return; }
  if (command === 'register') {
    const identity = await readJson(path.join(config.stateDir, 'identity.json'));
    if (identity?.version !== 2 || identity.signature !== sourceFactory(config).createStore().signature()) throw new RuntimeError('LISTENER_CONFIG_CHANGED', 'Register an existing watcher using its original source and target mapping.');
    const current = await runtime.status(config);
    if (current.ownership === 'unknown' || current.ownership === 'owned' && current.configFile && path.relative(current.configFile, config.configFile)) throw new RuntimeError('LISTENER_OWNERSHIP_UNKNOWN', 'The active configuration could not be matched to this file.');
    await registerInstance(config);
    output({ state: 'registered', sourceId: config.source.id, targetThreadId: config.targetThreadId, configFile: config.configFile }); return;
  }
  if (command === 'start') { output(await runtime.start(config)); return; }
  if (command === 'run') {
    const options = queueFactory ? { queue: queueFactory(config) } : { openQueue: () => config.wake.backend === 'app-tools'
      ? new AppToolsNotifier({ serverFile: config.wake.serverFile, callerThreadId: process.env.CODEX_THREAD_ID })
      : new NativeCodexQueue(config.wake.executable) };
    await runtime.run(config, { source: sourceFactory(config), ...options, register: registerInstance });
    return;
  }
  if (command === 'stop') { output(await runtime.stop(config)); return; }
  if (command === 'ack') {
    const file = path.join(config.stateDir, 'consumer', event.eventId + '.json');
    await fs.mkdir(path.dirname(file), { recursive: true });
    const value = { eventId: event.eventId, threadId: event.threadId, outcome: values.outcome, ...(values.reason ? { reason: values.reason.trim() } : {}), handledAt: new Date().toISOString() };
    await atomicJson(file, value, { exclusive: true });
    const previous = await readJson(file);
    if (previous.outcome !== value.outcome || previous.reason !== value.reason) throw new RuntimeError('EVENT_ALREADY_HANDLED', 'This event has a different completed outcome.');
    output({ state: 'acknowledged', eventId: event.eventId, outcome: value.outcome }); return;
  }
  const lock = await runtime.acquireLock(config);
  try {
    const store = sourceFactory(config).createStore(); await store.open();
    if (command === 'reconcile-source') {
      if (!store.resolveCoverageError) throw new RuntimeError('SOURCE_RECONCILIATION_UNSUPPORTED', 'This source has no persisted coverage reconciliation contract.');
      const resolution = await store.resolveCoverageError(values.reason);
      const previous = await readJson(path.join(config.stateDir, 'status.json'), {});
      const { sourceCoverageError, ...retained } = previous;
      await atomicJson(path.join(config.stateDir, 'status.json'), { ...retained, ...store.summary(), state: 'stopped', updatedAt: new Date().toISOString(), sourceResolution: resolution });
      output({ state: 'source-reconciled', sourceId: config.source.id, coverageId: resolution.coverageId }); return;
    }
    if (!['unknown', 'dispatching'].includes(store.receipts.get(event.eventId)?.state)) throw new RuntimeError('INVALID_DELIVERY_STATE', 'Reconcile an uncertain delivery before requesting a retry.');
    if (await readJson(path.join(config.stateDir, 'consumer', event.eventId + '.json'))) throw new RuntimeError('EVENT_ALREADY_HANDLED', 'An event with a consumer receipt cannot be retried.');
    await store.receipt(event.eventId, { state: 'pending', manuallyReconciledAt: new Date().toISOString(), reconciliationReason: values.reason.trim() });
    output({ state: 'retry-pending', eventId: event.eventId });
  } finally { await lock.release(); }
}
module.exports = { main, checkedEvent, createSource };
