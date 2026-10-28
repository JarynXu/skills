// 图片归属、缓存和解码由当前登录客户端核对；不导出密钥或接受任意缓存路径。
async function imagePageOperation(input, contract) {
  let lockToken, phase = 'not-invoked';
  const fail = (code, message, details) => { throw Object.assign(new Error(message), { code, details }); };
  const hash = value => require('crypto').createHash('sha256').update(String(value)).digest('hex');
  const attempts = [];
  try {
    const deadline = Date.now() + input.timeoutMs;
    if (!process.argv.includes('IS_MAIN_WINDOW')) fail('WRONG_WINDOW', 'Expected the main iCenter window.');
    const check = () => {
      const accountId = document.querySelector('#app')?.__vue_app__?.config?.globalProperties?.$store?.state?.userInfo?.userId;
      if (!accountId) fail('NOT_SIGNED_IN', 'No signed-in client account.');
      if (accountId !== input.accountId) fail('ACCOUNT_CHANGED', 'The signed-in account differs from the requested account.');
    };
    check();
    let loader;
    const token = 'icenter_image_' + Date.now() + '_' + Math.random().toString(16).slice(2);
    const entry = [[], { [token]: (_module, _exports, load) => { loader = load; } }, [[token]]];
    if (!Array.isArray(window.webpackJsonp)) fail('UNSUPPORTED_SCHEMA', 'The client module loader is unavailable.');
    try { window.webpackJsonp.push(entry); }
    finally {
      if (loader) { delete loader.c[token]; delete loader.m[token]; loader.s = 0; }
      const at = window.webpackJsonp.indexOf(entry); if (at >= 0) window.webpackJsonp.splice(at, 1);
    }
    const exported = definition => {
      const value = loader?.c?.[definition.moduleId]?.exports?.[definition.export];
      if (!value) fail('SDK_SERVICE_UNAVAILABLE', 'A registered image dependency is not loaded.');
      return value;
    };
    const model = definition => {
      const value = exported(definition);
      if (typeof value !== 'function' || hash(value) !== definition.hash) fail('SDK_CONTRACT_CHANGED', 'An image message model differs from its registered contract.');
      return value;
    };
    const service = exported(contract.messages), decoder = exported(contract.decoder);
    const method = (owner, name, definition) => {
      const value = owner[name];
      if (typeof value !== 'function' || hash(value) !== definition.hash) fail('SDK_CONTRACT_CHANGED', 'An image service differs from its registered contract.');
      return value;
    };
    const query = method(service, 'queryMsgByMsgIdList', contract.query);
    const decrypt = method(decoder, contract.decoder.method, contract.decoder);
    const QueryItem = model(contract.queryType), Message = model(contract.messageType);
    if (window.__codexIcenterSdkCall) fail('SDK_BUSY', 'Another SDK operation is still in flight.');
    window.__codexIcenterSdkCall = lockToken = token;
    const read = async () => {
      const reply = await query.call(service, [new QueryItem(input.messageId)]); check();
      if (reply?.success !== 1 || !Array.isArray(reply.aMessagesList)) fail('SDK_QUERY_FAILED', 'The image message query failed.');
      if (!reply.aMessagesList.length) fail('MESSAGE_NOT_FOUND', 'The requested image is not in local message history.');
      const message = reply.aMessagesList[0];
      if (reply.aMessagesList.length !== 1 || !(message instanceof Message) || message.msgId !== input.messageId || message.data_owner !== input.accountId || message.chatRoomUri !== input.chatId) fail('MESSAGE_SCOPE_MISMATCH', 'The image message does not match the requested account, chat and ID.');
      if (message.hasMessageAttributeWithDrawal()) fail('IMAGE_REVOKED', 'The image message was withdrawn.');
      if (message.hasMessageAttributeBurnAfterReading()) fail('IMAGE_RESTRICTED', 'Use the client viewing flow for an ephemeral image.');
      if (message.msgType !== contract.imageType) fail('MESSAGE_NOT_IMAGE', 'This is not a native image message; use the file attachment path for images sent as files.');
      return message;
    };
    const fs = require('fs').promises;
    const paths = message => ({ original: message.getOriginImageLocalPath(), large: message.getLargeImagePath(), thumbnail: message.getThumbnailImagePath() });
    const available = async message => {
      const variants = [];
      for (const [variant, file] of Object.entries(paths(message))) {
        let cached = false;
        if (file) {
          try { const stat = await fs.stat(file); cached = stat.isFile() && stat.size > 0; }
          catch (error) { if (error.code !== 'ENOENT') fail('IMAGE_CACHE_UNAVAILABLE', 'The client image cache could not be inspected.', { cause: error.code }); }
        }
        variants.push({ variant, cached });
      }
      return variants;
    };
    let message = await read();
    const scope = { accountId: input.accountId, chatId: input.chatId, messageId: input.messageId, requestedVariant: input.variant };
    if (!input.apply) {
      const variants = await available(message); check();
      return { ok: true, value: { state: 'preview', ...scope, available: variants, contentRead: false } };
    }
    const decode = async (message, variants, source) => {
      for (const variant of variants) {
        const file = paths(message)[variant];
        if (!file) { attempts.push({ variant, state: 'missing' }); continue; }
        let stat;
        try { stat = await fs.stat(file); }
        catch (error) { if (error.code !== 'ENOENT') fail('IMAGE_CACHE_UNAVAILABLE', 'The client image cache could not be read.', { cause: error.code }); }
        if (!stat?.isFile() || !stat.size) { attempts.push({ variant, state: 'missing' }); continue; }
        if (stat.size > contract.maxSourceBytes) fail('IMAGE_TOO_LARGE', 'The cached image exceeds the input byte limit.');
        check();
        phase = 'decode-requested';
        const nativeImage = require('electron').nativeImage;
        let image = nativeImage.createFromPath(file);
        if (image.isEmpty()) {
          const bytes = await decrypt.call(decoder, file, 'iCenter skill read image'); check();
          if (!bytes?.length) { attempts.push({ variant, state: 'decrypt-failed' }); continue; }
          if (bytes.length > contract.maxSourceBytes) fail('IMAGE_TOO_LARGE', 'The decoded source exceeds the input byte limit.');
          image = nativeImage.createFromBuffer(bytes);
        }
        if (image.isEmpty()) { attempts.push({ variant, state: 'decode-failed' }); continue; }
        const { width, height } = image.getSize();
        if (width < 1 || height < 1 || width * height > contract.maxPixels) fail('IMAGE_TOO_LARGE', 'The image dimensions exceed the supported limit.');
        const png = image.toPNG();
        if (!png.length || png.length > contract.maxOutputBytes) fail('IMAGE_TOO_LARGE', 'The exported PNG exceeds the output byte limit.');
        check();
        return { state: 'exported', ...scope, variant, source, width, height, mimeType: 'image/png', frame: 'first',
          export: 'decoded-pixels', bytes: png.length, base64: png.toString('base64'), attempts, contentRead: false };
      }
      return null;
    };
    const variants = input.variant === 'best' ? ['original', 'large', 'thumbnail'] : [input.variant];
    // best 先用可读缓存；明确请求某一清晰度时不降级，也不把解码失败当成需要重下。
    let value = await decode(message, variants, 'client-cache');
    if (value) return { ok: true, value };
    if (attempts.some(item => item.state.endsWith('failed'))) fail('IMAGE_DECODE_FAILED', 'The client could not decode the cached image.', { attempts });
    const wanted = input.variant === 'best' ? 'large' : input.variant;
    const download = method(service, 'downLoadMessageAttachs', contract.download);
    const enums = exported(contract.downloadType);
    const fetchVariant = async variant => {
      const member = variant === 'original' ? 'TapOrigin' : variant === 'large' ? 'TapSecond' : 'DefaultAttach';
      if (enums[member] !== contract.downloadType.values[member]) fail('SDK_CONTRACT_CHANGED', 'The image download kind differs from its registered value.');
      const remaining = deadline - Date.now();
      if (remaining <= 0) fail('IMAGE_DOWNLOAD_UNCONFIRMED', 'The image download waiting budget expired.');
      check(); phase = 'download-requested';
      // 空保存路径让客户端维护其缓存；没有把图片当作普通文件另存。
      const downloaded = await download.call(service, enums[member], input.chatId, input.messageId, '', '', null, null, null, null, null, remaining);
      check();
      if (!downloaded) fail('IMAGE_DOWNLOAD_UNCONFIRMED', 'The client did not confirm the image download; inspect the original message before another request.');
      if (downloaded.msgId !== input.messageId || downloaded.chatRoomUri !== input.chatId || downloaded.data_owner !== input.accountId) fail('MESSAGE_SCOPE_MISMATCH', 'The downloaded image belongs to another message or account.');
      return read();
    };
    // 客户端原图流程先取得大图；没有原图来源时保留不可用事实。
    if (wanted === 'original') {
      if (!message.hasMessageAttributeOriginalImage() || !message.originImageServerPath) fail('IMAGE_VARIANT_UNAVAILABLE', 'The message has no available original-image source.');
      if (!(await available(message)).find(item => item.variant === 'large').cached) message = await fetchVariant('large');
    }
    message = await fetchVariant(wanted);
    value = await decode(message, input.variant === 'best' ? ['original', 'large', 'thumbnail'] : [wanted], 'client-download');
    if (!value) fail('IMAGE_DECODE_FAILED', 'The download produced no readable image.', { attempts });
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error: { code: error.code || (phase === 'download-requested' ? 'IMAGE_DOWNLOAD_UNKNOWN' : 'IMAGE_READ_FAILED'), message: error.message || String(error), details: { ...error.details, phase } } };
  } finally { if (lockToken && window.__codexIcenterSdkCall === lockToken) delete window.__codexIcenterSdkCall; }
}

module.exports = { imagePageOperation };
