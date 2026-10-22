const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

// 来源边界只接受 JSON 值；拒绝 JSON.stringify 会丢弃或改写的输入。
function canonicalJson(value, ancestors = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (typeof value !== 'object' || ancestors.has(value) || !Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new TypeError('Expected finite, acyclic JSON data.');
  ancestors.add(value);
  try {
    if (Array.isArray(value)) return '[' + Array.from(value, item => canonicalJson(item, ancestors)).join(',') + ']';
    return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonicalJson(value[key], ancestors)).join(',') + '}';
  } finally { ancestors.delete(value); }
}

async function readJson(file, fallback = null) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}

// 先刷盘再替换目标；检查点的前移必须晚于消息文件的持久化。
async function atomicJson(file, value, { exclusive = false } = {}) {
  const temporary = file + '.' + randomUUID() + '.tmp';
  const handle = await fs.open(temporary, 'wx', 0o600);
  try {
    try { await handle.writeFile(JSON.stringify(value, null, 2) + '\n'); await handle.sync(); }
    finally { await handle.close(); }
    if (exclusive) {
      try { await fs.link(temporary, file); }
      catch (error) { if (error.code === 'EEXIST') return false; throw error; }
    } else await fs.rename(temporary, file);
    return true;
  } finally { await fs.rm(temporary, { force: true }); }
}

async function jsonFiles(directory) {
  const files = (await fs.readdir(directory)).filter(name => /^[a-f0-9]{64}\.json$/.test(name));
  return Promise.all(files.map(async name => ({ file: path.join(directory, name), value: await readJson(path.join(directory, name)) })));
}


module.exports = { atomicJson, readJson, digest, jsonFiles, canonicalJson };
