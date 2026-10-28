const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const { ClientError } = require('./cdp.cjs');

const imageName = 'image.png', ownerName = 'ownership.json', prefix = 'icenter-image-';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

async function checkImageOutput(outputPath) {
  if (outputPath === undefined) return undefined;
  if (typeof outputPath !== 'string' || !path.isAbsolute(outputPath) || path.extname(outputPath).toLowerCase() !== '.png') {
    throw new ClientError('INVALID_ARGUMENT', 'An explicit image output must be a new absolute .png path.');
  }
  outputPath = path.normalize(outputPath);
  try { await fs.lstat(outputPath); throw new ClientError('OUTPUT_EXISTS', 'The image output already exists.', { outputPath }); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  return outputPath;
}

// 未指定保存路径时，取图操作拥有一个独立临时目录；清理权随结果交给读图调用方。
async function writeImageOutput(bytes, outputPath) {
  const temporary = outputPath === undefined, sha256 = digest(bytes), created = [];
  let directory, cleanupToken;
  const writeNew = async (file, data) => {
    const handle = await fs.open(file, 'wx', 0o600); created.push(file);
    try { await handle.writeFile(data); } finally { await handle.close(); }
  };
  try {
    if (temporary) {
      directory = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
      outputPath = path.join(directory, imageName); cleanupToken = randomUUID();
    }
    await writeNew(outputPath, bytes);
    if (temporary) await writeNew(path.join(directory, ownerName), JSON.stringify({ schema: 1, token: cleanupToken, bytes: bytes.length, sha256 }));
    return { outputPath, sha256, temporary, ...(temporary ? { cleanupToken } : {}) };
  } catch (error) {
    const cleanupErrors = [];
    for (const file of created.reverse()) {
      try { await fs.unlink(file); } catch (failure) { cleanupErrors.push({ path: file, cause: failure.code }); }
    }
    if (directory) {
      try { await fs.rmdir(directory); } catch (failure) { cleanupErrors.push({ path: directory, cause: failure.code }); }
    }
    throw new ClientError(error.code === 'EEXIST' ? 'OUTPUT_EXISTS' : 'IMAGE_OUTPUT_FAILED', 'The image output could not be created.',
      { outputPath, cause: error.code, ...(cleanupErrors.length ? { cleanupErrors, cleanupToken } : {}) });
  }
}

// 宿主识图发生在导出命令结束之后，释放须由消费结束的调用方发起；不扫描或清理客户端缓存。
async function releaseImage({ outputPath, cleanupToken, apply = false } = {}) {
  if (typeof outputPath !== 'string' || !path.isAbsolute(outputPath) || typeof cleanupToken !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanupToken) || typeof apply !== 'boolean') {
    throw new ClientError('INVALID_ARGUMENT', 'Image cleanup requires the temporary output path and cleanupToken returned by read-image.');
  }
  outputPath = path.normalize(outputPath);
  const directory = path.dirname(outputPath), root = await fs.realpath(os.tmpdir());
  if (path.basename(outputPath) !== imageName || !/^icenter-image-[A-Za-z0-9]{6}$/.test(path.basename(directory)) ||
      ![path.resolve(os.tmpdir()), root].includes(path.dirname(directory))) {
    throw new ClientError('IMAGE_OUTPUT_NOT_TEMPORARY', 'Cleanup only accepts this tool\'s managed temporary image outputs.');
  }
  const stat = async file => {
    try { return await fs.lstat(file); } catch (error) { if (error.code !== 'ENOENT') throw error; return null; }
  };
  try {
    const dirStat = await stat(directory);
    if (!dirStat) return { state: 'absent', outputPath };
    if (!dirStat.isDirectory() || dirStat.isSymbolicLink() || await fs.realpath(directory) !== path.join(root, path.basename(directory))) {
      throw new ClientError('IMAGE_OUTPUT_NOT_TEMPORARY', 'The temporary image directory has changed.');
    }
    const ownerPath = path.join(directory, ownerName), ownerStat = await stat(ownerPath);
    if (!ownerStat?.isFile() || ownerStat.isSymbolicLink() || ownerStat.size > 1024) {
      throw new ClientError('IMAGE_OUTPUT_NOT_TEMPORARY', 'The temporary image ownership record is missing or changed.');
    }
    let owner;
    try { owner = JSON.parse(await fs.readFile(ownerPath, 'utf8')); } catch { throw new ClientError('IMAGE_OUTPUT_NOT_TEMPORARY', 'The temporary image ownership record is unreadable.'); }
    if (owner.schema !== 1 || owner.token !== cleanupToken) throw new ClientError('IMAGE_OUTPUT_NOT_TEMPORARY', 'The cleanup token does not own this temporary output.');
    const names = await fs.readdir(directory), imageStat = await stat(outputPath);
    if (names.some(name => ![imageName, ownerName].includes(name)) || imageStat && (!imageStat.isFile() || imageStat.isSymbolicLink() ||
        imageStat.size !== owner.bytes || digest(await fs.readFile(outputPath)) !== owner.sha256)) {
      throw new ClientError('IMAGE_OUTPUT_CHANGED', 'Temporary output contents have changed; preserve them for the caller to inspect.');
    }
    if (!apply) return { state: 'preview', operation: 'release-image', outputPath, imagePresent: !!imageStat };
    if (imageStat) await fs.unlink(outputPath);
    await fs.unlink(ownerPath);
    await fs.rmdir(directory);
    return { state: 'released', outputPath };
  } catch (error) {
    if (error instanceof ClientError) throw error;
    throw new ClientError('IMAGE_CLEANUP_FAILED', 'The temporary image output was not fully released.', { outputPath, cause: error.code });
  }
}

module.exports = { checkImageOutput, writeImageOutput, releaseImage };
