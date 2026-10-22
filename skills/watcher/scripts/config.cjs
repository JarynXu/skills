const fs = require('node:fs/promises');
const path = require('node:path');
const { readJson, canonicalJson } = require('./persistence.cjs');
const { canonicalPath } = require('./runtime.cjs');
const { RuntimeError } = require('./errors.cjs');
const { bindInboxConfig } = require('./inbox-source.cjs');
const UUID = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const identity = value => process.platform === 'win32' ? value.toLowerCase() : value;
const contains = (parent, child) => child === parent || child.startsWith(parent + path.sep);

async function validateStateDir(directory, skillRoots = [path.resolve(__dirname, '..')]) {
  if (typeof directory !== 'string' || !path.isAbsolute(directory)) throw new RuntimeError('INVALID_CONFIG', 'stateDir must be an absolute task directory.');
  const resolved = await canonicalPath(directory);
  if (path.parse(resolved).root === resolved) throw new RuntimeError('INVALID_STATE_DIR', 'Runtime state cannot be a filesystem root.');
  for (const root of skillRoots) if (contains(identity(await canonicalPath(root)), identity(resolved))) throw new RuntimeError('INVALID_STATE_DIR', 'Runtime input cannot be stored in a skill package.');
  for (let current = resolved; ; current = path.dirname(current)) {
    try { await fs.lstat(path.join(current, 'SKILL.md')); throw new RuntimeError('INVALID_STATE_DIR', 'Runtime input cannot be stored inside a skill package.'); }
    catch (error) { if (!['ENOENT', 'ENOTDIR'].includes(error.code)) throw error; }
    try { await fs.lstat(path.join(current, '.git')); throw new RuntimeError('INVALID_STATE_DIR', 'Runtime input cannot be stored in a Git working tree.'); }
    catch (error) { if (!['ENOENT', 'ENOTDIR'].includes(error.code)) throw error; }
    if (path.dirname(current) === current) break;
  }
  return resolved;
}

async function loadConfig(file) {
  const value = await readJson(file);
  if (!value || value.version !== 2 || !['json-inbox', 'receiver'].includes(value.source?.kind)) throw new RuntimeError('INVALID_CONFIG', 'Use a version 2 json-inbox or receiver config.');
  if (typeof value.source.id !== 'string' || !value.source.id || !UUID.test(value.targetThreadId || '') || !path.isAbsolute(value.wake?.executable || '')) throw new RuntimeError('INVALID_CONFIG', 'A source needs stable identity, an observed target thread UUID and an absolute native executable.');
  const allowed = value.source.kind === 'receiver' ? ['kind', 'id', 'module', 'export', 'options'] : ['kind', 'id', 'directory'];
  if (Object.keys(value.source).some(key => !allowed.includes(key))) throw new RuntimeError('INVALID_CONFIG', 'Unknown source configuration field.');
  const stateDir = await validateStateDir(value.stateDir);
  let source = { ...value.source };
  if (source.kind === 'json-inbox') {
    if (!path.isAbsolute(source.directory || '')) throw new RuntimeError('INVALID_CONFIG', 'The inbox directory must be absolute.');
    source.directory = await fs.realpath(source.directory);
    if (!(await fs.stat(source.directory)).isDirectory() || path.parse(source.directory).root === source.directory || contains(identity(source.directory), identity(stateDir)) || contains(identity(stateDir), identity(source.directory))) throw new RuntimeError('INVALID_CONFIG', 'The inbox and state directories must be disjoint non-root directories.');
  } else {
    if (!path.isAbsolute(source.module || '') || typeof source.export !== 'string' || !source.export || !source.module.toLowerCase().endsWith('.cjs')) throw new RuntimeError('INVALID_CONFIG', 'A receiver needs an absolute trusted .cjs module and an explicitly selected export.');
    source.module = await canonicalPath(source.module);
    try { source.options = JSON.parse(canonicalJson(source.options === undefined ? {} : source.options)); }
    catch { throw new RuntimeError('INVALID_CONFIG', 'Receiver options must be opaque JSON data.'); }
    if (value.debounceMs !== undefined && value.debounceMs !== 0) throw new RuntimeError('INVALID_CONFIG', 'A ready receiver owns grouping; debounceMs must be omitted or zero.');
  }
  const pollMs = value.pollMs ?? 1000, debounceMs = value.debounceMs ?? 0;
  if (!Number.isInteger(pollMs) || pollMs < 250 || pollMs > 60000 || !Number.isInteger(debounceMs) || debounceMs < 0 || debounceMs > 60000) throw new RuntimeError('INVALID_CONFIG', 'pollMs must be 250..60000 and debounceMs 0..60000.');
  const config = { ...value, stateDir, source, pollMs, debounceMs, configFile: path.resolve(file), commandFile: path.join(__dirname, 'trigger.cjs') };
  return source.kind === 'json-inbox' ? bindInboxConfig(config) : { ...config, eventContract: {
    matches: event => event.version === 2 && event.sourceId === source.id && event.threadId === config.targetThreadId
  } };
}
module.exports = { loadConfig, validateStateDir };
