#!/usr/bin/env node
const fs = require('node:fs/promises');
const path = require('node:path');
const { parseArgs } = require('node:util');
const { createDispatcher } = require('./dispatcher.cjs');
const { createCodexDelivery } = require('./codex-delivery.cjs');
const { fail } = require('./state.cjs');

const string = { type: 'string' };
async function main(argv) {
  const { values, positionals } = parseArgs({ args: argv, allowPositionals: true, strict: true, options: {
    config: string, 'event-id': string, event: string, 'thread-id': string, 'attempt-id': string,
    'project-id': string, projectless: { type: 'boolean' }, 'prompt-file': string,
    workspace: { type: 'string', multiple: true }, 'evidence-file': string, outcome: string,
    limit: string, 'drain-limit': string, apply: { type: 'boolean' }, help: { type: 'boolean' }
  } });
  const [command] = positionals;
  const commands = ['import', 'route', 'drain', 'event', 'status', 'workers', 'workspaces', 'complete', 'reconcile', 'retry', 'workspace-claim', 'workspace-release'];
  if (values.help || !command) return { commands, usage: 'node dispatch.cjs <command> --config <absolute JSON file> [options] [--apply]' };
  if (!commands.includes(command) || positionals.length !== 1) fail('INVALID_COMMAND', 'Choose a supported command; use --help.');
  if (!values.config || !path.isAbsolute(values.config)) fail('INVALID_ARGUMENT', '--config must name an absolute JSON file.');
  const config = JSON.parse(await fs.readFile(values.config, 'utf8'));
  const delivery = config.delivery?.executable ? createCodexDelivery({ executable: config.delivery.executable, configFile: values.config }) : undefined;
  const dispatcher = await createDispatcher(config, { delivery });
  const id = values['event-id'];
  const readJson = async file => {
    if (!file) fail('INVALID_ARGUMENT', 'A required JSON file option is missing.');
    return JSON.parse(await fs.readFile(file, 'utf8'));
  };
  const integer = (value, defaultValue, max) => {
    if (value === undefined) return defaultValue;
    if (!/^(0|[1-9][0-9]*)$/.test(value) || Number(value) > max) fail('INVALID_LIMIT', 'The numeric bound is invalid.');
    return Number(value);
  };
  if (['event', 'status', 'workers', 'workspaces'].includes(command)) {
    const result = await dispatcher.status(command === 'event' ? id : undefined);
    if (command === 'event') { if (!id) fail('INVALID_ARGUMENT', 'event needs --event-id.'); return result; }
    if (command === 'workers') return { workers: result.workers };
    if (command === 'workspaces') return { claims: result.entries.filter(entry => entry.claims.length).map(entry => ({ eventId: entry.event.eventId, threadId: entry.threadId, attemptId: entry.attemptId, roots: entry.claims })) };
    return result;
  }
  if (!values.apply) return { state: 'preview', command, configFile: values.config, note: 'No command was executed. Use --apply after checking arguments and authorization.' };
  if (command === 'import') return dispatcher.importEvent(await readJson(values.event));
  if (command === 'route') {
    if (!values['prompt-file']) fail('INVALID_ARGUMENT', 'route needs --prompt-file.');
    if (Number(!!values['thread-id']) + Number(!!values['project-id']) + Number(values.projectless === true) !== 1) fail('INVALID_ARGUMENT', 'Choose --thread-id, --project-id or --projectless.');
    const selection = values['thread-id'] ? { threadId: values['thread-id'] } : { projectId: values.projectless ? null : values['project-id'] };
    return dispatcher.route(id, { ...selection, prompt: await fs.readFile(values['prompt-file'], 'utf8'), workspaces: values.workspace || [] });
  }
  if (command === 'drain') return dispatcher.drain({ limit: integer(values.limit, 20, 100) });
  if (command === 'retry') return dispatcher.retry(id);
  const identity = { threadId: values['thread-id'], attemptId: values['attempt-id'] };
  if (command === 'workspace-claim') return dispatcher.claimWorkspaces(id, identity, values.workspace || []);
  if (command === 'workspace-release') return dispatcher.releaseWorkspaces(id, identity);
  const evidence = await readJson(values['evidence-file']);
  if (command === 'complete') return dispatcher.complete(id, { ...identity, evidence }, { drainLimit: integer(values['drain-limit'], 20, 100) });
  if (command === 'reconcile') return dispatcher.reconcile(id, { attemptId: identity.attemptId, outcome: values.outcome, evidence });
}
if (require.main === module) main(process.argv.slice(2)).then(result => {
  process.stdout.write(JSON.stringify({ ok: true, result }) + '\n');
  if (result?.drain?.error) process.exitCode = 2;
}).catch(error => { process.stdout.write(JSON.stringify({ ok: false, error: { code: error.code || 'COMMAND_FAILED', message: error.message } }) + '\n'); process.exitCode = 1; });
module.exports = { main };
