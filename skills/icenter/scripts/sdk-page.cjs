// 按接口契约调用客户端服务。请求数据只作为参数传递，不作为代码执行。
async function sdkPageOperation(operation, input, contract, modelContracts) {
  let phase = 'not-invoked', lockToken = null, callbackEvidence = [], observedId = null;
  const fail = (code, message, details) => { throw Object.assign(new Error(message), { code, details }); };
  const own = (object, key) => Object.hasOwn(object, key);
  const safeKey = key => !['__proto__','prototype','constructor'].includes(key);
  const hash = value => require('crypto').createHash('sha256').update(String(value)).digest('hex');
  try {
    if (!['check','describe','type','invoke','file-send'].includes(operation)) fail('UNKNOWN_OPERATION', 'Unsupported SDK service operation.');
    if (!process.argv.includes('IS_MAIN_WINDOW')) fail('WRONG_WINDOW', 'Expected the main iCenter window.');
    const state = () => document.querySelector('#app')?.__vue_app__?.config?.globalProperties?.$store?.state;
    const check = () => {
      const accountId = state()?.userInfo?.userId;
      if (!accountId) fail('NOT_SIGNED_IN', 'No signed-in client account.');
      if (!input.accountId || accountId !== input.accountId) fail('ACCOUNT_CHANGED', 'The signed-in account differs from the requested account.');
      return accountId;
    };
    check();
    let loader; const bridgeId = 'codex_sdk_service_' + Date.now() + '_' + Math.random().toString(16).slice(2);
    const payload = [[], { [bridgeId]: (_m, _e, load) => { loader = load; } }, [[bridgeId]]];
    if (!Array.isArray(window.webpackJsonp)) fail('UNSUPPORTED_SCHEMA', 'The client module loader is unavailable.');
    try { window.webpackJsonp.push(payload); }
    finally {
      if (loader) { delete loader.c[bridgeId]; delete loader.m[bridgeId]; loader.s = 0; }
      const at = window.webpackJsonp.indexOf(payload); if (at >= 0) window.webpackJsonp.splice(at, 1);
    }
    const exported = definition => {
      const module = loader?.c?.[definition.moduleId]?.exports;
      if (!module || !own(module, definition.export)) fail('SDK_SERVICE_UNAVAILABLE', 'The observed client module or export is not loaded.');
      return module[definition.export];
    };
    const typeFor = key => {
      if (!own(modelContracts.types, key)) fail('UNKNOWN_SDK_TYPE', 'The requested model type is not registered.');
      const definition = modelContracts.types[key], type = exported(definition);
      if (typeof type !== 'function' || hash(type) !== definition.hash) fail('SDK_CONTRACT_CHANGED', 'A client model differs from its registered contract.');
      return type;
    };
    if(operation==='check'){
      const operations=[];
      for(const [name,definition]of Object.entries(contract)){
        for(const [nameOfMethod,method]of Object.entries(definition.methods)){
          try{
            const service=exported(definition),descriptor=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(service),method.property||nameOfMethod),fn=method.access?descriptor?.[method.access]:descriptor?.value;
            operations.push({service:name,method:nameOfMethod,state:typeof fn==='function'&&hash(fn)===method.hash?'contract-matched':'contract-changed'});
          }catch(error){operations.push({service:name,method:nameOfMethod,state:'unavailable',error:error.code||'SDK_SERVICE_UNAVAILABLE'});}
        }
      }
      check();return {ok:true,value:{accountId:input.accountId,operations,executedBusinessOperations:0,verification:'loaded-method-identity-only'}};
    }
    if (operation === 'type') {
      const type = typeFor(input.type);
      return { ok: true, value: { type: input.type, source: String(type),imports:modelContracts.types[input.type].imports||{}, accountId: input.accountId, constructorsHaveNotRun: true } };
    }
    const service = exported(contract);
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(service), contract.method.property || input.method);
    const method = contract.method.access ? descriptor?.[contract.method.access] : descriptor?.value;
    if (typeof method !== 'function' || hash(method) !== contract.method.hash) fail('SDK_CONTRACT_CHANGED', 'The client method differs from its registered contract.');
    if (operation === 'describe') return { ok: true, value: { service: input.service, method: input.method, ...contract.method,
      source: String(method),imports:contract.imports||{}, accountId: input.accountId, transport: 'client-service-over-cdp', businessOutcome: 'not-inferred' } };
    if(operation==='file-send'){
      if(input.service!=='messages'||input.method!=='sendFileTransCardMsg'||typeof input.chatId!=='string'||!input.chatId||typeof input.filePath!=='string'||input.filePath.includes('\u0000')||!require('path').isAbsolute(input.filePath))fail('INVALID_SDK_ARGUMENTS','A file send requires an absolute source path and observed recipient.');
      if(state().chatInfo?.chatList?.filter(chat=>chat.chatRoomUri===input.chatId&&[0,1].includes(chat.chatRoomType)).length!==1)fail('CHAT_NOT_UNIQUE','Expected an observed direct or group recipient.');
      const file=await require('fs').promises.stat(input.filePath);
      if(!file.isFile()||file.size===0)fail('INVALID_SDK_ARGUMENTS','A nonempty regular source file is required.');
      input.arguments=[input.filePath,input.chatId,{forward:false,isSendBurn:false,isSendRecepit:false,isReply:false,isNeedAskRobot:false,isEmoticon:false},null,false,'',false];
      input.view='file-message';
    }else if(input.service==='messages'&&input.method==='sendFileTransCardMsg'&&input.arguments?.[2]?.forward!==true)fail('SDK_FLOW_REQUIRED','New files require the prepare-and-send workflow; use send-file.');
    if (!Array.isArray(input.arguments) || input.arguments.length > 32) fail('INVALID_SDK_ARGUMENTS', 'Provide an array of at most 32 arguments.');
    if (input.fields !== undefined && (!Array.isArray(input.fields) || !input.fields.length || input.fields.length > 40 || input.fields.some(field => typeof field !== 'string' || field.split('.').some(part=>!part || !safeKey(part))))) fail('INVALID_SDK_FIELDS', 'Result fields must be explicit own-property paths.');
    const selection = input.fields ? Object.create(null) : null;
    for (const field of input.fields || []) {
      const parts = field.split('.'); let branch = selection;
      for (let index=0;index<parts.length;index++) {
        const part=parts[index];
        if (branch[part]===true) fail('INVALID_SDK_FIELDS','Result field selections overlap.');
        if (index===parts.length-1) { if (own(branch,part)) fail('INVALID_SDK_FIELDS','Result field selections overlap.'); branch[part]=true; }
        else branch=branch[part] ||= Object.create(null);
      }
    }
    let nodes = 0;
    function validate(value, depth = 0) {
      if (++nodes > 10000 || depth > 25) fail('INVALID_SDK_ARGUMENTS', 'The SDK arguments exceed the supported size or depth.');
      if(typeof value==='string'&&value.includes('\u0000'))fail('INVALID_SDK_ARGUMENTS','NUL is not permitted in SDK strings.');
      if(typeof value==='number'&&!Number.isFinite(value))fail('INVALID_SDK_ARGUMENTS','SDK numbers must be finite.');
      if (value === null || ['string','number','boolean'].includes(typeof value)) return;
      if (Array.isArray(value)) { value.forEach(item => validate(item, depth + 1)); return; }
      if (!value || typeof value !== 'object' || Object.keys(value).some(key => !safeKey(key))) fail('INVALID_SDK_ARGUMENTS', 'Unsupported SDK argument value.');
      const keys = Object.keys(value), markers = keys.filter(key => key.startsWith('$'));
      if (markers.length > 1) fail('INVALID_SDK_ARGUMENTS', 'Only one argument marker is permitted per object.');
      if (markers.length) {
        const marker = markers[0];
        if (marker === '$default') { if (keys.length !== 1 || value.$default !== true) fail('INVALID_SDK_ARGUMENTS', 'Invalid default argument marker.'); }
        else if (marker === '$callback') { if (depth!==1 || keys.length !== 1 || !['accepted','rejected','fulfilled','failed','timeout'].includes(value.$callback)) fail('INVALID_SDK_ARGUMENTS', 'Callbacks must be top-level SDK arguments with a supported role.'); }
        else if (marker === '$type') {
          if (keys.some(key => !['$type','arguments','fields'].includes(key)) || !own(modelContracts.types, value.$type) || !Array.isArray(value.arguments ?? []) || !value.fields || Array.isArray(value.fields) || typeof value.fields !== 'object') fail('INVALID_SDK_ARGUMENTS', 'A registered model, constructor arguments and fields are required.');
          typeFor(value.$type); validate(value.arguments ?? [], depth + 1); validate(value.fields, depth + 1);
        } else if (marker === '$enum') {
          if (keys.some(key => !['$enum','member'].includes(key)) || !own(modelContracts.enums, value.$enum) || !own(modelContracts.enums[value.$enum].values, value.member)) fail('INVALID_SDK_ARGUMENTS', 'An observed enum and member are required.');
        } else if (marker === '$message') {
          if (keys.length !== 1 || !value.$message || Object.keys(value.$message).some(key => !['id','chatId'].includes(key)) || typeof value.$message.id !== 'string' || !value.$message.id || typeof value.$message.chatId !== 'string' || !value.$message.chatId) fail('INVALID_SDK_ARGUMENTS', 'A message reference needs an observed ID and chat ID.');
          if (state().chatInfo?.chatList?.filter(chat => chat.chatRoomUri === value.$message.chatId).length !== 1) fail('CHAT_NOT_UNIQUE', 'The message reference conversation is not uniquely observed.');
        } else fail('INVALID_SDK_ARGUMENTS', 'Unknown SDK argument marker.');
      } else for (const item of Object.values(value)) validate(item, depth + 1);
    }
    validate(input.arguments);
    if(input.view!==undefined&&!['file-message','file-message-list'].includes(input.view))fail('INVALID_SDK_VIEW','The result view is not supported.');
    if (!input.apply) return { ok: true, value: { state: 'preview', accountId: input.accountId, service: input.service, method: input.method,
      arguments: input.arguments, fields: input.fields, validation: contract.method.validation, businessOutcome: 'not-inferred', transport: 'client-service-over-cdp' } };
    check();
    if (window.__codexIcenterSdkCall) fail('SDK_BUSY', 'Another SDK operation is still in flight; do not retry an unknown write.');
    lockToken = bridgeId; window.__codexIcenterSdkCall = lockToken;
    const callbacks = [], references = new Map(); let callbackOverflow = false;
    callbackEvidence=callbacks;
    const callbackSummary=value=>{
      if(value===null||['string','boolean','number'].includes(typeof value))return value;
      if(value===undefined)return {type:'undefined'};
      if(typeof value!=='object')return {type:typeof value};
      const identity={};
      for(const name of ['msgId','msgID','success','result','streamingNO']){
        const descriptor=Object.getOwnPropertyDescriptor(value,name);
        if(descriptor&&['string','number','boolean'].includes(typeof descriptor.value))identity[name]=descriptor.value;
      }
      return {type:Array.isArray(value)?'array':'object',...identity};
    };
    async function materialize(value) {
      if (value === null || typeof value !== 'object') return value;
      if (Array.isArray(value)) { const items = []; for (const item of value) items.push(await materialize(item)); return items; }
      if (own(value, '$default')) return undefined;
      if (own(value, '$callback')) return (...args) => { if (callbacks.length < 100) callbacks.push({ role: value.$callback, args:args.map(callbackSummary) }); else callbackOverflow = true; };
      if (own(value, '$enum')) {
        const definition = modelContracts.enums[value.$enum], actual = exported(definition);
        if (!own(actual, value.member) || actual[value.member] !== definition.values[value.member]) fail('SDK_CONTRACT_CHANGED', 'The client enum differs from its registered value.');
        return actual[value.member];
      }
      if (own(value, '$type')) {
        const type = typeFor(value.$type), args = await materialize(value.arguments || []), instance = new type(...args);
        for (const [key, item] of Object.entries(value.fields)) {
          if (!safeKey(key) || !own(instance, key)) fail('INVALID_SDK_FIELD', 'A model field is not declared by its constructor.');
          instance[key] = await materialize(item);
        }
        return instance;
      }
      if (own(value, '$message')) {
        const reference = value.$message, key = reference.chatId + '\u0000' + reference.id;
        if (references.has(key)) return references.get(key);
        const QueryItem = typeFor('d88a.Lb'), chat = loader.c['1bb8']?.exports?.a;
        if (typeof chat?.queryMsgByMsgIdList !== 'function') fail('SDK_SERVICE_UNAVAILABLE', 'The message query service is unavailable.');
        const reply = await chat.queryMsgByMsgIdList([new QueryItem(reference.id)]);
        check();
        if (reply?.success !== 1 || !Array.isArray(reply.aMessagesList)) fail('SDK_QUERY_FAILED', 'The message reference query failed.');
        if(reply.aMessagesList.length!==1)fail('MESSAGE_SCOPE_MISMATCH','The message reference query returned an unexpected record count.');
        const matches = reply.aMessagesList.filter(message => message.msgId === reference.id);
        if (matches.length !== 1 || matches[0].chatRoomUri !== reference.chatId || matches[0].data_owner !== input.accountId) fail('MESSAGE_SCOPE_MISMATCH', 'The message reference is missing or belongs to another scope.');
        references.set(key, matches[0]); return matches[0];
      }
      const result = {}; for (const [key, item] of Object.entries(value)) Object.defineProperty(result,key,{ value: await materialize(item), enumerable:true, writable:true, configurable:true });
      return result;
    }
    const args = await materialize(input.arguments);
    let setting;
    if (contract.method.access) {
      const config=loader.c['522a']?.exports?.a, paths=loader.c['e1d0']?.exports?.a, ini=loader.c['6343']?.exports;
      if(typeof config?.writeBackUserConfigIni!=='function'||hash(config.writeBackUserConfigIni)!==contract.method.configWriterHash||typeof paths?.getUserConfigPath!=='function'||typeof ini?.parse!=='function')fail('SDK_CONTRACT_CHANGED','The configuration provider differs from the verified contract.');
      const [section,key]=contract.method.configPath, record=config.settings?.userConfig?.[section];
      if(!record||!own(record,key))fail('SDK_CONTRACT_CHANGED','The registered preference does not exist in client configuration.');
      const before=descriptor.get.call(service);
      if(contract.method.access==='set'&&(args.length!==1||!['boolean','number','string'].includes(typeof args[0])||typeof args[0]!==typeof before))fail('INVALID_SDK_ARGUMENTS','The preference value must have the current client value type.');
      if(contract.method.access==='get'&&args.length)fail('INVALID_SDK_ARGUMENTS','A preference getter takes no arguments.');
      setting={config,paths,ini,section,key,record,before};
    }
    check(); phase = 'call-requested';
    let result;
    if(operation==='file-send'){
      let started=false,closed=false,conflict=false,resolveSend,rejectSend;
      const sending=new Promise((resolve,reject)=>{resolveSend=resolve;rejectSend=reject;});
      const prepared=message=>{
        if(closed)return;
        if(started){if(message?.msgId!==observedId)conflict=true;return;}
        try{
          check();
          if(typeof message?.msgId!=='string'||!message.msgId)fail('SDK_PREPARE_UNCONFIRMED','The prepared message has no unique ID.');
          started=true;observedId=message.msgId;
          callbackEvidence.push({role:'accepted',stage:'file-prepared',args:[{msgId:observedId}]});
          Promise.resolve(method.call(service,args[0],args[1],args[2],null,false,observedId,false)).then(resolveSend,rejectSend);
        }catch(error){closed=true;rejectSend(error);}
      };
      let preparation;
      try{preparation=Promise.resolve(method.call(service,args[0],args[1],args[2],null,false,'',true,prepared));}
      catch(error){preparation=Promise.reject(error);}
      const preparing=preparation.then(()=>{if(!started){closed=true;rejectSend(Object.assign(Error('The client did not accept a prepared file message.'),{code:'SDK_PREPARE_UNCONFIRMED'}));}},error=>{
        callbackEvidence.push({role:'failed',stage:'file-preparation',args:[{code:error.code||'SDK_PREPARE_FAILED'}]});
        if(!started){closed=true;rejectSend(error);}
      });
      // 两个客户端调用都结束后释放占用；相同准备通知不会产生第二次发送。
      const settled=await Promise.allSettled([preparing,sending]);closed=true;
      if(settled[1].status==='rejected')throw settled[1].reason;
      if(conflict)fail('SDK_PREPARE_UNCONFIRMED','The client returned conflicting prepared message IDs.');
      result=settled[1].value;
    }else result=await method.apply(service,args);
    if(typeof result?.msgId==='string')observedId=result.msgId;
    if(setting){
      if(contract.method.access==='set'){
        setting.record[setting.key]=args[0];
        await setting.config.writeBackUserConfigIni();
      }
      const saved=setting.ini.parse(await require('fs').promises.readFile(setting.paths.getUserConfigPath(),'utf8'));
      const persisted=saved?.[setting.section]?.[setting.key], value=descriptor.get.call(service);
      const fileMatches=String(persisted)===String(value);
      if(contract.method.access==='set'&&(value!==args[0]||!fileMatches))fail('SETTINGS_UNCONFIRMED','The client state and saved preference did not confirm the requested value.');
      result={value,persistedValue:persisted,clientAndFileAgree:fileMatches,...(contract.method.access==='set'?{before:setting.before,persistence:'file-read-confirmed'}:{})};
    }
    if(input.view){
      const Message=typeFor('d88a.jb');
      const fileMessage=message=>{
        if(!(message instanceof Message)||message.data_owner!==input.accountId||!message.msgId||!message.chatRoomUri)fail('MESSAGE_SCOPE_MISMATCH','The result is not an owned native message.');
        return {messageId:message.msgId,chatId:message.chatRoomUri,accountId:message.data_owner,fileName:message.getFileName(),filePath:message.getFilePath(),fileTransferred:message.isFileTransSuccess(),messageTransferred:message.isMessageTransSuccess(),clientFileStatus:message.fileTransStatus,clientMessageStatus:message.msgTransStatus};
      };
      if(input.view==='file-message-list'){
        if(result?.success!==1||!Array.isArray(result.aMessagesList))fail('SDK_QUERY_FAILED','The message metadata query failed.');
        result={messages:result.aMessagesList.map(fileMessage)};
      }else result=fileMessage(result);
    }
    check();
    let count = 0;
    const serialize = (value, ancestors = new Set(), fields = null) => {
      if (++count > 30000) fail('SDK_RESULT_TOO_LARGE', 'Limit the query or request explicit result fields.');
      if (value === null || ['string','boolean'].includes(typeof value)) return value;
      if (typeof value === 'number') { if (!Number.isFinite(value)) fail('SDK_RESULT_UNSERIALIZABLE', 'The SDK returned a non-finite number.'); return value; }
      if (value === undefined) return { type: 'undefined' };
      if (typeof value !== 'object') fail('SDK_RESULT_UNSERIALIZABLE', 'The SDK result contains unsupported values.');
      if (ancestors.has(value)) fail('SDK_RESULT_UNSERIALIZABLE', 'The SDK result is cyclic; request explicit fields.');
      const next = new Set(ancestors).add(value);
      if (Array.isArray(value)) return value.map(item => serialize(item,next,fields));
      if (value instanceof Map) return { type:'Map', entries:[...value].map(([key,item])=>[serialize(key,next),serialize(item,next,fields)]) };
      if (value instanceof Set) return { type:'Set', values:[...value].map(item=>serialize(item,next,fields)) };
      if (value instanceof Date) return { type:'Date', value:value.toISOString() };
      const keys = fields ? Object.keys(fields) : Object.keys(value), output = {};
      for (const key of keys) {
        if (!safeKey(key) || /^(?:.*token|.*password|.*secret.*|.*credential.*|.*privatekey|cookies?|authorization)$/i.test(key)) fail('SDK_SENSITIVE_RESULT', 'Select task fields that exclude authentication or secret material.');
        const descriptor = Object.getOwnPropertyDescriptor(value,key);
        if (!descriptor || !own(descriptor,'value')) fail('SDK_RESULT_UNSERIALIZABLE', 'A requested field is absent or computed.');
        if (typeof descriptor.value === 'function') continue;
        output[key] = serialize(descriptor.value,next,fields?.[key]===true?null:fields?.[key]);
      }
      return output;
    };
    const value = { state:'returned', businessOutcome:'not-inferred', accountId:input.accountId, service:input.service, method:input.method,
      result:serialize(result,new Set(),selection), coverage:input.fields?{kind:'selected-result-fields',fields:input.fields}:{kind:'enumerable-result-data'},callbacks:serialize(callbacks), callbackOverflow, transport:'client-service-over-cdp' };
    if (JSON.stringify(value).length > 2e6) fail('SDK_RESULT_TOO_LARGE', 'Limit the query or request explicit result fields.');
    return { ok:true,value };
  } catch (error) {
    return { ok:false,error:{ code:error.code || 'SDK_SERVICE_FAILED', message:error.message || String(error), details:{ ...error.details,phase,...(observedId?{observedId}:{}),...(callbackEvidence.length?{callbacks:callbackEvidence}:{}) } } };
  } finally {
    if (lockToken && window.__codexIcenterSdkCall === lockToken) delete window.__codexIcenterSdkCall;
  }
}
module.exports = { sdkPageOperation };
