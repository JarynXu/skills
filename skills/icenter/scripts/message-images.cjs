const { ClientError } = require('./cdp.cjs');
const { imagePageOperation } = require('./image-page.cjs');
const { checkImageOutput, writeImageOutput } = require('./image-output.cjs');
const contracts = require('./sdk-contracts.json');

const imageContract = {
  clientVersion: contracts.clientVersion, messages: contracts.services.messages,
  query: contracts.services.messages.methods.queryMsgByMsgIdList,
  download: contracts.services.messages.methods.downLoadMessageAttachs,
  queryType: contracts.types['d88a.Lb'], messageType: contracts.types['d88a.jb'],
  imageType: contracts.enums['14ce.R'].values.Image, downloadType: contracts.enums['14ce.n'],
  decoder: contracts.imageDecoder, maxSourceBytes: 32 * 1024 * 1024, maxOutputBytes: 16 * 1024 * 1024, maxPixels: 40000000,
};
// 只传入图片适配需要的服务身份，避免把整个 SDK 目录送进每次调用。
imageContract.messages = { moduleId: imageContract.messages.moduleId, export: imageContract.messages.export };

async function readMessageImage(connection, accountId, { chatId, messageId, outputPath, variant = 'best', apply = false, timeoutMs = 15000 } = {}) {
  if (typeof chatId !== 'string' || !chatId || typeof messageId !== 'string' || !messageId || typeof apply !== 'boolean' ||
      !['best', 'original', 'large', 'thumbnail'].includes(variant) || !Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 45000) {
    throw new ClientError('INVALID_ARGUMENT', 'Provide an observed chat and message ID, a supported variant and a 1000..45000 ms timeout.');
  }
  outputPath = await checkImageOutput(outputPath);
  let response;
  try { response = await connection.evaluate(imagePageOperation, { accountId, chatId, messageId, variant, apply, timeoutMs }, imageContract); }
  catch (error) { throw new ClientError('IMAGE_READ_UNKNOWN', 'The client image operation did not finish; inspect its cache before another download.', { cause: error.code, accountId, chatId, messageId }); }
  if (!response || typeof response.ok !== 'boolean') throw new ClientError('INVALID_CLIENT_RESULT', 'The image bridge returned an invalid result.');
  if (!response.ok) throw new ClientError(response.error.code, response.error.message, response.error.details);
  const result = response.value;
  if (result?.accountId !== accountId || result.chatId !== chatId || result.messageId !== messageId || result.requestedVariant !== variant) throw new ClientError('MESSAGE_SCOPE_MISMATCH', 'The image result does not match the requested message.');
  if (!apply) {
    if (result.state !== 'preview' || Object.hasOwn(result, 'base64')) throw new ClientError('INVALID_CLIENT_RESULT', 'Image preview returned unexpected content.');
    return { ...result, outputPath: outputPath ?? null, temporary: outputPath === undefined };
  }
  if (result.state !== 'exported' || !['original', 'large', 'thumbnail'].includes(result.variant) || variant !== 'best' && result.variant !== variant ||
      result.mimeType !== 'image/png' || !Number.isInteger(result.width) || !Number.isInteger(result.height) || result.width < 1 || result.height < 1 || result.width * result.height > imageContract.maxPixels ||
      typeof result.base64 !== 'string' || result.base64.length > Math.ceil(imageContract.maxOutputBytes / 3) * 4) {
    throw new ClientError('INVALID_CLIENT_RESULT', 'The image bridge returned no supported decoded image.');
  }
  const bytes = Buffer.from(result.base64, 'base64');
  if (bytes.length !== result.bytes || bytes.length < 33 || bytes.length > imageContract.maxOutputBytes || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
      bytes.toString('ascii', 12, 16) !== 'IHDR' || bytes.readUInt32BE(16) !== result.width || bytes.readUInt32BE(20) !== result.height) {
    throw new ClientError('INVALID_CLIENT_RESULT', 'The image bytes and dimensions do not match the decoded PNG result.');
  }
  const output = await writeImageOutput(bytes, outputPath);
  const { base64, ...value } = result;
  return { ...value, ...output };
}

module.exports = { readMessageImage };
