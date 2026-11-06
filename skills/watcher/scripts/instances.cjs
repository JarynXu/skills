const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { atomicJson, readJson, digest } = require('./persistence.cjs');
const { status } = require('./runtime.cjs');
const { errorInfo } = require('./errors.cjs');

function catalogDirectory() {
  return path.join(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'watchers', 'instances');
}

// 每个状态目录写自己的索引项，同时启动多个实例时无需覆盖共享文件。
async function registerInstance(config) {
  const directory = catalogDirectory();
  await fs.mkdir(directory, { recursive: true });
  const key = process.platform === 'win32' ? config.stateDir.toLowerCase() : config.stateDir;
  const { configFile, stateDir, pollMs, targetThreadId, lockPrefix } = config;
  await atomicJson(path.join(directory, digest(key) + '.json'), { configFile, stateDir, pollMs, targetThreadId, sourceId: config.source.id, ...(lockPrefix ? { lockPrefix } : {}) });
}

async function listInstances(threadId) {
  const directory = catalogDirectory();
  let files;
  try { files = await fs.readdir(directory); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const rows = await Promise.all(files.filter(file => /^[a-f0-9]{64}\.json$/.test(file)).sort().map(async file => {
    let entry;
    try {
      entry = await readJson(path.join(directory, file));
      if (threadId && entry.targetThreadId !== threadId) return null;
      const observed = await status(entry);
      return { ...entry, state: observed.state, ownership: observed.ownership, fresh: observed.fresh,
        pid: observed.observedProcessAlive ? observed.pid : null, subscription: observed.subscription ?? null,
        lastObservationAt: observed.lastObservationAt ?? null, pendingBatches: observed.pendingBatches ?? null,
        uncertainBatches: observed.uncertainBatches ?? [], ...(observed.sourceCoverageError ? { coverageError: observed.sourceCoverageError.error?.code } : {}),
        ...(observed.error ? { error: observed.error.code } : {}) };
    } catch (error) { return { ...entry, catalogFile: file, state: 'inspection-failed', error: errorInfo(error) }; }
  }));
  return rows.filter(Boolean);
}

module.exports = { registerInstance, listInstances };
