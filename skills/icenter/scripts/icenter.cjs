#!/usr/bin/env node
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { parseArgs } = require('node:util');
const { randomUUID } = require('node:crypto');
const { TextDecoder } = require('node:util');
const { ClientError, CdpClient, listTargets } = require('./cdp.cjs');
const { connect, discover, select, sendText, watch } = require('./client.cjs');
const { SdkSession } = require('./sdk.cjs');
const { releaseImage } = require('./image-output.cjs');
const { clientVersion } = require('./client-version.json');

const optionsByCommand = {
  connections: [], connect: ['executable', 'instance-pid', 'restart'], targets: ['port', 'all'], status: ['port', 'target-id'],
  cdp: ['port', 'target-id', 'method', 'params-file', 'apply'],
  chats: ['port', 'target-id', 'account', 'query'],
  select: ['port', 'target-id', 'account', 'chat', 'apply'],
  read: ['port', 'target-id', 'account', 'chat', 'limit'],
  history: ['port','target-id','account','chat','union-id','limit','before-id'],
  'read-image': ['port','target-id','account','chat','message-id','output-file','variant','timeout-ms','apply'],
  'release-image': ['output-file','cleanup-token','apply'],
  'read-ids': ['port', 'target-id', 'account', 'chat', 'message-id'],
  'sdk-info': ['port', 'target-id', 'account'],
  'sdk-list': ['query','types','all'],
  'sdk-enum': ['name'],
  'sdk-type': ['port','target-id','account','type'],
  'sdk-check': ['port','target-id','account','all'],
  'sdk-describe': ['port','target-id','account','service','method'],
  'sdk-call': ['port','target-id','account','service','method','args-file','field','apply'],
  'user-status': ['port','target-id','account'],
  'set-user-status': ['port','target-id','account','status','custom-id','expected-custom-id','apply'],
  'web-list': ['app','query','all','types'],
  'web-type': ['app','type'],
  'web-describe': ['port','target-id','account','app','method'],
  'web-call': ['port','target-id','account','app','method','args-file','field','view','timeout-ms','output-file','apply'],
  'send-file': ['port','target-id','account','chat','file','apply'],
  send: ['port', 'target-id', 'account', 'chat', 'text-file', 'suffix-file', 'mark-origin', 'apply'],
  watch: ['port', 'target-id', 'account', 'chat', 'duration-seconds', 'idle-seconds', 'checkpoint'],
};
const output = value => process.stdout.write(JSON.stringify(value) + '\n');
const integer = (value, name, min, max) => {
  if (!/^\d+$/.test(String(value)) || Number(value) < min || Number(value) > max) throw new ClientError('INVALID_ARGUMENT', `${name} must be an integer from ${min} to ${max}.`);
  return Number(value);
};
const required = (values, key) => {
  if (!values[key]) throw new ClientError('MISSING_ARGUMENT', `--${key} is required.`);
  return values[key];
};

function prepareConnection(action, values = {}) {
  if (process.platform !== 'win32') throw new ClientError('UNSUPPORTED_PLATFORM', 'Connection preparation requires Windows PowerShell; use an explicit CDP port on other hosts.');
  const args = ['-NoProfile', '-NonInteractive', '-File', path.join(__dirname, 'connection.ps1'), '-Action', action];
  if (values.executable) args.push('-ExecutablePath', values.executable);
  if (values['instance-pid']) args.push('-InstancePid', String(integer(values['instance-pid'], 'instance-pid', 1, 2147483647)));
  if (values.restart) args.push('-Restart');
  let raw;
  try { raw = execFileSync('powershell.exe', args, { encoding: 'utf8', timeout: action === 'probe' ? 15000 : 50000, windowsHide: true }); }
  catch (error) {
    if (!error.stdout) throw new ClientError('CONNECTION_SETUP', 'Connection preparation did not finish.', { cause: error.message });
    raw = error.stdout;
  }
  const result = JSON.parse(raw.replace(/^\uFEFF/, ''));
  if (result.error) throw new ClientError(result.error.code, result.error.message, result.error.details);
  return result;
}

async function main(argv) {
  const command = argv[0];
  if (!command || command === '--help' || command === 'help') {
    output({ commands: optionsByCommand, defaults: { limit: 50, watchDurationSeconds: 60, watchIdleSeconds: 30 }, note: 'connect prepares the client; --restart allows restarting the selected instance. select/send/cdp preview by default; --apply executes. All IDs come from the observed client. See references/tools.md.' });
    return;
  }
  if (!Object.hasOwn(optionsByCommand, command)) throw new ClientError('UNKNOWN_COMMAND', `Unknown command: ${command}`);
  const schema = Object.fromEntries(optionsByCommand[command].map(key => [key, { type: ['apply', 'all', 'restart', 'mark-origin','types'].includes(key) ? 'boolean' : 'string', ...(['message-id','field'].includes(key) ? { multiple: true } : {}) }]));
  const { values } = parseArgs({ args: argv.slice(1), options: schema, allowPositionals: false, strict: true });
  if (command === 'connections') {
    output(prepareConnection('probe')); return;
  }
  if (command === 'connect') {
    const prepared = prepareConnection('ensure', values);
    let client;
    try {
      client = await connect(prepared.port);
      try { output({ ...prepared, targetId: client.targetId, clientState: 'signed-in', ...(await client.call('status')) }); }
      catch (error) {
        if (!['NOT_SIGNED_IN', 'UNSUPPORTED_SCHEMA'].includes(error.code)) throw error;
        output({ ...prepared, targetId: client.targetId, clientState: error.code === 'NOT_SIGNED_IN' ? 'not-signed-in' : 'adapter-unavailable', adapterError: { code: error.code, message: error.message } });
      }
    } catch (error) {
      error.details = { ...error.details, connection: prepared }; throw error;
    } finally { client?.close(); }
    return;
  }
  if (command === 'sdk-list') {
    const catalog = SdkSession.catalog(values.query || '');
    output(values.types ? { clientVersion:catalog.clientVersion,types:catalog.types.filter(key=>key.includes(values.query || '')),enums:Object.keys(catalog.enums).filter(key=>key.includes(values.query || '')) } :
      !values.query&&!values.all?{clientVersion:catalog.clientVersion,status:catalog.status,services:Object.fromEntries([...new Set(catalog.operations.map(operation=>operation.service))].map(service=>[service,catalog.operations.filter(operation=>operation.service===service).length]))}:
      { clientVersion:catalog.clientVersion,status:catalog.status,operations:catalog.operations.map(({service,method,validation})=>({service,method,validation})) });
    return;
  }
  if (command === 'sdk-enum') {
    const key = required(values,'name'), value = SdkSession.catalog().enums[key];
    if (!Object.hasOwn(SdkSession.catalog().enums,key)) throw new ClientError('UNKNOWN_SDK_ENUM','The enum is not registered.');
    output({clientVersion,name:key,values:value.values}); return;
  }
  if(command==='web-list'){
    const catalog=SdkSession.webCatalog(),apps=Object.entries(catalog.apps).filter(([name])=>!values.app||name===values.app);
    if(values.app&&!Object.hasOwn(catalog.apps,values.app))throw new ClientError('UNKNOWN_WEB_APP','The application is not registered.');
    const query=(values.query||'').toLowerCase();
    output(values.types?{apps:Object.fromEntries(apps.map(([name])=>[name,SdkSession.webTypes(name).filter(type=>type.toLowerCase().includes(query))]))}:
      !values.app&&!values.query&&!values.all?{clientVersion:catalog.clientVersion,apps:Object.fromEntries(apps.map(([name,app])=>[name,{operations:Object.keys(app.methods).length,schemas:app.schemaCount||0}]))}:
      {clientVersion:catalog.clientVersion,operations:apps.flatMap(([app,value])=>Object.entries(value.methods).filter(([method])=>(app+'.'+method).toLowerCase().includes(query)).map(([method,definition])=>values.all?{app,method,...definition}:{app,method,effect:definition.effect,response:definition.response||'json',validation:definition.validation}))});
    return;
  }
  if(command==='web-type'){output(SdkSession.webType(required(values,'app'),required(values,'type')));return;}
  if (command === 'release-image') {
    output(await releaseImage({ outputPath: required(values, 'output-file'), cleanupToken: required(values, 'cleanup-token'), apply: !!values.apply }));
    return;
  }
  const port = integer(required(values, 'port'), 'port', 1, 65535);
  if(['web-describe','web-call'].includes(command)){
    const accountId=required(values,'account'),app=required(values,'app'),method=required(values,'method');
    const args=command==='web-call'?JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await fs.readFile(required(values,'args-file')))):undefined;
    const session=await SdkSession.connect({port,targetId:values['target-id'],accountId,timeoutMs:60000});
    try{output(command==='web-describe'?await session.describeWeb(app,method):await session.invokeWeb(app,method,args,{apply:!!values.apply,...(values.field?{fields:values.field}:{}),...(values['timeout-ms']?{requestTimeoutMs:integer(values['timeout-ms'],'timeout-ms',1000,45000)}:{}),...(values['output-file']?{outputFile:values['output-file']}:{}),...(values.view?{view:values.view}:{})}));}
    finally{session.close();}
    return;
  }
  if (['send-file','history','read-image','sdk-check','sdk-describe','sdk-type','sdk-call','user-status','set-user-status'].includes(command)) {
    const accountId = required(values,'account');
    let args;
    if (command === 'sdk-call') {
      args = JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await fs.readFile(required(values,'args-file'))));
      if (!Array.isArray(args)) throw new ClientError('INVALID_SDK_ARGUMENTS','The argument file must contain a JSON array.');
    }
    const session = await SdkSession.connect({port,targetId:values['target-id'],accountId,...(command === 'read-image' ? {timeoutMs:60000} : {})});
    try {
      if(command==='user-status')output(await session.userStatus());
      else if(command==='set-user-status')output(await session.setUserStatus({status:values.status??'None',customId:values['custom-id'],expectedCustomId:values['expected-custom-id'],apply:!!values.apply}));
      else if(command==='send-file')output(await session.sendFile({chatId:required(values,'chat'),filePath:required(values,'file'),apply:!!values.apply}));
      else if (command === 'history') output(await session.history({chatId:required(values,'chat'),unionId:values['union-id']||'',limit:integer(values.limit??'50','limit',1,200),beforeId:values['before-id']||''}));
      else if (command === 'read-image') {
        const ids = required(values,'message-id');
        if (ids.length !== 1) throw new ClientError('INVALID_ARGUMENT','read-image requires exactly one message ID.');
        output(await session.readImage({chatId:required(values,'chat'),messageId:ids[0],outputPath:values['output-file'],variant:values.variant||'best',apply:!!values.apply,timeoutMs:integer(values['timeout-ms']??'15000','timeout-ms',1000,45000)}));
      }
      else if (command === 'sdk-check') {
        const result=await session.check();
        output(values.all?result:{accountId:result.accountId,total:result.operations.length,matched:result.operations.filter(operation=>operation.state==='contract-matched').length,unmatched:result.operations.filter(operation=>operation.state!=='contract-matched'),executedBusinessOperations:result.executedBusinessOperations,verification:result.verification});
      }
      else if (command === 'sdk-type') output(await session.describeType(required(values,'type')));
      else if (command === 'sdk-describe') output(await session.describe(required(values,'service'),required(values,'method')));
      else output(await session.invoke(required(values,'service'),required(values,'method'),args,{apply:!!values.apply,...(values.field?{fields:values.field}:{})}));
    } finally { session.close(); }
    return;
  }
  if (command === 'targets') {
    output({ targets: values.all ? (await listTargets(port, 5000, { allPages: true })).map(({ id, type, title, url }) => ({ id, type, title, url })) : (await discover(port)).map(({ id, role }) => ({ id, role })) }); return;
  }
  if (command === 'cdp') {
    const targetId = required(values, 'target-id'), method = required(values, 'method');
    if (!/^[A-Za-z]\w*\.[A-Za-z]\w*$/.test(method)) throw new ClientError('INVALID_ARGUMENT', 'method must be a CDP Domain.command name.');
    const params = values['params-file'] ? JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(await fs.readFile(values['params-file']))) : {};
    if (!params || typeof params !== 'object' || Array.isArray(params)) throw new ClientError('INVALID_ARGUMENT', 'CDP parameters must be a JSON object.');
    const target = (await listTargets(port, 5000, { allPages: true })).find(page => page.id === targetId);
    if (!target) throw new ClientError('TARGET_NOT_FOUND', 'Rediscover the intended page target before executing.');
    if (!values.apply) { output({ state: 'preview', targetId, method, params }); return; }
    const client = await CdpClient.connect(target.webSocketDebuggerUrl);
    try { output({ state: 'executed', targetId, method, result: await client.send(method, params) }); }
    finally { client.close(); }
    return;
  }
  const scope = command === 'status' ? {} : { accountId: required(values, 'account') };
  if (['select', 'read', 'read-ids', 'send', 'watch'].includes(command)) scope.chatId = required(values, 'chat');
  const limit = command === 'read' ? integer(values.limit ?? '50', 'limit', 1, 10000) : null;
  let text, suffix;
  if (command === 'send') {
    const bytes = await fs.readFile(required(values, 'text-file'));
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/\r\n/g, '\n');
    if (!text.trim()) throw new ClientError('EMPTY_MESSAGE', 'The message file is empty.');
    if (values['suffix-file'] !== undefined) {
      suffix = new TextDecoder('utf-8', { fatal: true }).decode(await fs.readFile(required(values, 'suffix-file'))).replace(/\r\n/g, '\n');
      if (!suffix.trim() || suffix.includes('\u0000')) throw new ClientError('INVALID_ARGUMENT', 'The suffix file must contain nonempty text without NUL.');
    }
  }
  let monitor;
  if (command === 'watch') {
    monitor = { durationMs: integer(values['duration-seconds'] ?? '60', 'duration-seconds', 1, 43200) * 1000,
      idleMs: integer(values['idle-seconds'] ?? '30', 'idle-seconds', 1, 43200) * 1000,
      emit: value => new Promise((resolve, reject) => process.stdout.write(JSON.stringify(value) + '\n', error => error ? reject(error) : resolve())) };
    if (values.checkpoint) {
      try { monitor.checkpoint = JSON.parse(await fs.readFile(values.checkpoint, 'utf8')); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (monitor.checkpoint === null) throw new ClientError('INVALID_CHECKPOINT', 'The checkpoint file must contain a checkpoint object, not null.');
      // 先完成 stdout 事件输出，再移动检查点；崩溃恢复允许重复，不能保证恰好一次。
      monitor.save = async checkpoint => {
        const temporary = values.checkpoint + '.' + randomUUID() + '.tmp';
        const handle = await fs.open(temporary, 'wx');
        try {
          try { await handle.writeFile(JSON.stringify(checkpoint)); } finally { await handle.close(); }
          await fs.rename(temporary, values.checkpoint);
        }
        finally { await fs.rm(temporary, { force: true }); }
      };
    }
  }
  const client = await connect(port, values['target-id']);
  try {
    if (command === 'status') output({ targetId: client.targetId, ...(await client.call('status')) });
    if (command === 'chats') {
      const result = await client.call('chats', scope);
      if (values.query) result.chats = result.chats.filter(chat => chat.name?.includes(values.query) || chat.id === values.query);
      output(result);
    }
    if (command === 'select') output(await select(client, scope, !!values.apply));
    if (command === 'read') {
      const result = await client.call('read', scope);
      const loadedCount = result.messages.length;
      result.messages = result.messages.slice(-limit);
      output({ ...result, loadedCount, returnedCount: result.messages.length });
    }
    if (command === 'read-ids') output(await client.call('read-by-ids', { ...scope, messageIds: required(values, 'message-id') }));
    if (command === 'sdk-info') output(await client.call('sdk-info', scope));
    if (command === 'send') output(await sendText(client, scope, text, !!values.apply, { markOrigin: !!values['mark-origin'], suffix }));
    if (command === 'watch') {
      const controller = new AbortController(); const stop = () => controller.abort();
      process.once('SIGINT', stop); process.once('SIGTERM', stop);
      try { await watch(client, scope, { ...monitor, signal: controller.signal }); }
      finally { process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop); }
    }
  } finally { client.close(); }
}

if (require.main === module) main(process.argv.slice(2)).catch(error => {
  output({ ok: false, error: { code: error.code || 'TOOL_ERROR', message: error.message, ...(error.details === undefined ? {} : { details: error.details }) } });
  process.exitCode = 1;
});

module.exports = { main };
