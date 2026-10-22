const fs = require('node:fs/promises');
const path = require('node:path');
const { ClientError } = require('./cdp.cjs');
const { downloadSdkFile } = require('./sdk-attachments.cjs');

// session 由调用方持有；下载期间保留它的账户、会话和连接。
async function downloadFile(session, { messageId, outputPath, apply = false, timeoutMs = 15000 }) {
  if(typeof session.invoke==='function')return downloadSdkFile(session,arguments[1]);
  if (!session.scope?.chatId || typeof messageId !== 'string' || !messageId || typeof outputPath !== 'string' || !path.isAbsolute(outputPath) || !Number.isInteger(timeoutMs) || timeoutMs < 1) {
    throw new ClientError('INVALID_ARGUMENT', 'A conversation-bound session, message ID, absolute output path and positive timeout are required.');
  }
  outputPath = path.normalize(outputPath);
  const plan = await session.run((tools, messageId) => {
    const scope = tools.check();
    if (require(process.resourcesPath + '/app.asar/package.json').version !== '12.1.0') throw Object.assign(Error('Unsupported attachment adapter version'), { code: 'UNSUPPORTED_VERSION' });
    const messages = document.querySelector('#app').__vue_app__.config.globalProperties.$store.state.messageInfo?.messageList;
    if (!Array.isArray(messages)) throw Object.assign(Error('Loaded messages unavailable'), { code: 'UNSUPPORTED_SCHEMA' });
    const matches = messages.filter(message => message.msgId === messageId && message.chatRoomUri === scope.chatId);
    if (matches.length !== 1 || typeof matches[0].getFileName !== 'function' || !matches[0].getFileName()) throw Object.assign(Error('The loaded file message is not unique'), { code: 'MESSAGE_NOT_FOUND' });
    return { ...scope, messageId, fileName: matches[0].getFileName() };
  }, messageId);
  if (!apply) return { state: 'preview', ...plan, outputPath };

  // 独占创建占位文件；客户端只覆盖本次创建的目标。失败时保留文件供核对。
  try { await fs.writeFile(outputPath, '', { flag: 'wx' }); }
  catch (error) { throw new ClientError(error.code === 'EEXIST' ? 'OUTPUT_EXISTS' : 'OUTPUT_UNAVAILABLE', 'A new writable output file is required.', { outputPath, cause: error.code }); }
  try {
    const result = await session.run(async (tools, messageId, outputPath, timeoutMs) => {
      const scope = tools.check();
      if (require(process.resourcesPath + '/app.asar/package.json').version !== '12.1.0') throw Error('Unsupported attachment adapter version');
      const messages = document.querySelector('#app').__vue_app__.config.globalProperties.$store.state.messageInfo.messageList;
      const matches = messages.filter(message => message.msgId === messageId && message.chatRoomUri === scope.chatId);
      if (matches.length !== 1 || !matches[0].getFileName?.()) throw Error('File message changed');

      // 12.1.0 的 webpack 入口为 0。临时工厂取得已有客户端服务，结束后撤销自身注册。
      const queue = window.webpackJsonp, token = 'icenter_skill_attachment_' + require('crypto').randomUUID();
      let loader, service, kind;
      const payload = [[], { [token]: (module, exports, load) => { loader = load; } }, [[token]]];
      try {
        if (!queue || typeof queue.push !== 'function') throw Error('Client module loader unavailable');
        queue.push(payload);
        if (!loader?.c?.[0] || !loader.m?.[0]) throw Error('Client bootstrap differs from the supported adapter');
        service = loader('1bb8').a;
        kind = loader('14ce').n?.TapFile;
        if (typeof service?.downLoadMessageAttachs !== 'function' || !Number.isInteger(kind)) throw Error('Client attachment service unavailable');
      } finally {
        if (loader) { delete loader.c[token]; delete loader.m[token]; loader.s = 0; }
        const index = queue?.indexOf(payload);
        if (index >= 0) queue.splice(index, 1);
      }
      tools.check();
      const reply = await service.downLoadMessageAttachs(kind, scope.chatId, messageId, '', outputPath, null, null, null, null, null, timeoutMs);
      tools.check();
      return { confirmed: !!reply && reply.msgId === messageId && reply.chatRoomUri === scope.chatId && reply.isFileTransSuccess?.() === true && reply.getFilePath?.() === outputPath };
    }, messageId, outputPath, timeoutMs);
    if (!result.confirmed) throw new ClientError('DOWNLOAD_UNCONFIRMED', 'The client did not confirm the requested file download.');
    const handle = await fs.open(outputPath, 'r');
    try {
      const file = await handle.stat();
      if (!file.isFile()) throw new ClientError('DOWNLOAD_UNCONFIRMED', 'The output is not a readable file.');
      return { state: 'downloaded', ...plan, outputPath, bytes: file.size };
    } finally { await handle.close(); }
  } catch (error) {
    throw new ClientError('DOWNLOAD_UNKNOWN', 'The download may have changed the output. Inspect the original message and file before repeating.', { messageId, outputPath, cause: error.code || error.message });
  }
}

module.exports = { downloadFile };
