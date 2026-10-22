// 此函数在已连接的应用内执行。模块、请求及身份规则来自包内版本契约。
async function webApplicationOperation(operation,input,contract){
  let phase='not-invoked',loader,module,method,service,timer;
  const fail=(code,message)=>{throw Object.assign(new Error(message),{code})};
  const controller=new AbortController(),cleanups=[];
  const hash=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(value))))].map(x=>x.toString(16).padStart(2,'0')).join('');
  const atPath=(value,parts)=>parts.reduce((current,key)=>current?.[key],value);
  const locationCheck=()=>{if(location.origin!==contract.origin||location.pathname!==contract.path)fail('WEB_APP_NAVIGATED','The application left its registered origin or path.')};
  const credentialKey=key=>/token|password|credential|secret|private.?key|authorization|cookie/i.test(key);
  const secretKey=key=>!contract.businessFields?.includes(key)&&credentialKey(key);

  // 原始 JSON 中的大整数保持十进制字符串，避免文件、目录等 64 位 ID 在解析时失真。
  const parseJson=text=>{
    let encoded='',index=0;
    while(index<text.length){
      const character=text[index];
      if(character==='"'){
        const start=index++;
        while(index<text.length){if(text[index++]==='\\'){index++;continue}if(text[index-1]==='"')break}
        encoded+=text.slice(start,index);continue;
      }
      if(character==='-'||/[0-9]/.test(character)){
        const token=text.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
        if(!token)fail('WEB_RESPONSE_SCHEMA','The API returned invalid JSON.');
        const number=token[0];encoded+=/^-?\d+$/.test(number)&&!Number.isSafeInteger(Number(number))?JSON.stringify(number):number;index+=number.length;continue;
      }
      encoded+=character;index++;
    }
    return JSON.parse(encoded);
  };
  const readBytes=async(response,limit)=>{
    if(Number(response.headers.get('content-length'))>limit)fail('WEB_RESULT_LIMIT','The API response exceeds its size limit.');
    const reader=response.body?.getReader();
    if(!reader){const bytes=new Uint8Array(await response.arrayBuffer());if(bytes.length>limit)fail('WEB_RESULT_LIMIT','The API response exceeds its size limit.');return bytes}
    const chunks=[];let length=0;
    try{for(;;){const item=await reader.read();if(item.done)break;length+=item.value.length;if(length>limit)fail('WEB_RESULT_LIMIT','The API response exceeds its size limit.');chunks.push(item.value)}}
    catch(error){await reader.cancel().catch(()=>{});throw error}
    finally{reader.releaseLock()}
    const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}return bytes;
  };
  const pageCheck=async()=>{
    locationCheck();const identity=contract.identity;let account;
    if(identity.kind==='http'){
      const response=await fetch(identity.url,{credentials:'include',cache:'no-store',signal:controller.signal});
      if(response.status!==200)fail('WEB_IDENTITY_UNAVAILABLE','The application principal service did not return HTTP 200.');
      const data=await response.json();account=atPath(data,identity.accountPath);
      if(data.code?.code!=='0000')fail('WEB_IDENTITY_UNAVAILABLE','The application principal service rejected the request.');
    }else if(identity.kind==='session'){
      for(let attempt=0;attempt<50;attempt++){account=sessionStorage.getItem(identity.key);if(account!==null&&account!=='')break;await new Promise(resolve=>setTimeout(resolve,100));locationCheck()}
    }
    else{
      const fn=loader?.(identity.moduleId)?.[identity.export];
      if(typeof fn!=='function'||await hash(fn)!==identity.hash)fail('WEB_CONTRACT_CHANGED','The application identity contract changed.');
      account=fn();
    }
    if(String(account)!==input.employeeId)fail('WEB_ACCOUNT_CHANGED','The application account differs from the client account.');
    locationCheck();
  };
  const decode=value=>{
    if(!value||typeof value!=='object')return value;
    if(Object.hasOwn(value,'$icenterFile')){
      const file=value.$icenterFile;if(typeof file.base64!=='string')fail('INVALID_WEB_FILE','File data was not prepared by the client bridge.');
      const bytes=Uint8Array.from(atob(file.base64),character=>character.charCodeAt(0));
      return new File([bytes],file.name,{type:file.type||'application/octet-stream'});
    }
    if(Object.hasOwn(value,'$icenterForm')){
      const form=new FormData();
      for(const [key,item]of Object.entries(value.$icenterForm)){for(const part of Array.isArray(item)?item:[item]){const decoded=decode(part);if(decoded!==null&&typeof decoded==='object'&&!(decoded instanceof Blob))fail('INVALID_WEB_FORM','Multipart fields must be scalar values or files.');form.append(key,decoded instanceof Blob?decoded:decoded===null?'':String(decoded))}}return form;
    }
    if(Array.isArray(value))return value.map(decode);
    return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,decode(item)]));
  };
  const requestFrom=inputArguments=>{
    const definition=contract.method.request;
    if(!definition)return null;
    const value=inputArguments[0]??{};
    if(inputArguments.length>1||!value||Array.isArray(value)||typeof value!=='object'||Object.keys(value).some(key=>!['path','query','body'].includes(key)))fail('INVALID_WEB_REQUEST','Use one request object with path, query and body fields.');
    let path=definition.path;
    const pathNames=[...path.matchAll(/\{([^}]+)\}/g)].map(match=>match[1]);
    for(const name of pathNames){const field=value.path?.[name];if(!['string','number'].includes(typeof field)||!String(field))fail('INVALID_WEB_REQUEST','An explicit path identifier is required: '+name);path=path.replace('{'+name+'}',encodeURIComponent(String(field)))}
    if(value.path&&Object.keys(value.path).some(key=>!pathNames.includes(key)))fail('INVALID_WEB_REQUEST','The request contains an undeclared path identifier.');
    let base=definition.base;
    if(definition.service){base=atPath(module,definition.service);if(typeof base!=='string')fail('WEB_CONTRACT_CHANGED','The registered application service URL is unavailable.')}
    const url=new URL(String(base).replace(/\/$/,'')+'/'+path.replace(/^\//,''),location.href);
    if(url.username||url.password||!contract.method.transport.allowedOrigins.includes(url.origin))fail('WEB_REQUEST_ORIGIN','The API request left its registered origins.');
    const query=value.query??{};
    if(!query||Array.isArray(query)||typeof query!=='object')fail('INVALID_WEB_REQUEST','Query parameters must be an object.');
    for(const [key,item]of Object.entries(query)){
      if(definition.queryNames&&!definition.queryNames.includes(key))fail('INVALID_WEB_REQUEST','The request contains an undeclared query parameter: '+key);
      for(const part of Array.isArray(item)?item:[item]){if(part!==null&&!['string','number','boolean'].includes(typeof part))fail('INVALID_WEB_REQUEST','Query values must be scalar values.');url.searchParams.append(key,part===null?'':String(part))}
    }
    for(const [key,value]of Object.entries(definition.fixedQuery||{})){if(Object.hasOwn(query,key)&&String(query[key])!==value)fail('INVALID_WEB_REQUEST','The registered query value cannot be overridden: '+key);url.searchParams.set(key,value)}
    for(const required of definition.requiredQuery||[])if(!Object.hasOwn(query,required))fail('INVALID_WEB_REQUEST','A required query parameter is missing: '+required);
    if(definition.bodyRequired&&value.body===undefined)fail('INVALID_WEB_REQUEST','The request body is required.');
    return {url,method:definition.httpMethod,body:value.body};
  };
  const validateRequest=(url,verb,request)=>{
    const transport=contract.method.transport,parsed=new URL(url,location.href);
    if(parsed.username||parsed.password||!transport.allowedOrigins.includes(parsed.origin)||!transport.verbs.includes(String(verb).toUpperCase()))fail('WEB_REQUEST_CHANGED','The application request left its registered method or origins.');
    if(request&&(parsed.origin!==request.url.origin||parsed.pathname!==request.url.pathname))fail('WEB_REQUEST_CHANGED','The application request left its registered API path.');
  };
  const observeAxios=async(args,request)=>{
    const transport=contract.method.transport,client=loader(transport.client.moduleId)[transport.client.export];
    if(typeof client?.interceptors?.request?.use!=='function')fail('WEB_HTTP_CLIENT_UNAVAILABLE','The registered application HTTP client is unavailable.');
    let raw,status,pending,count=0;
    const interceptor=client.interceptors.request.use(configuration=>{
      if(++count!==1)fail('WEB_MULTIPLE_REQUESTS','The selected API produced more than one request.');
      const base=configuration.baseURL?new URL(configuration.baseURL,location.href).href.replace(/\/$/,''):location.origin;
      const address=/^https?:\/\//i.test(configuration.url)?configuration.url:base+'/'+String(configuration.url).replace(/^\//,'');
      validateRequest(address,configuration.method||'GET',request);
      const transforms=configuration.transformResponse??client.defaults?.transformResponse??[];
      configuration.transformResponse=[function(value,headers,httpStatus){status=httpStatus;const type=typeof headers?.get==='function'?headers.get('content-type'):headers?.['content-type'];if(typeof value==='string'){if(value.length>2*1024*1024)fail('WEB_RESULT_LIMIT','The API JSON response exceeds 2 MiB.');raw=parseJson(value)}else if(value instanceof ArrayBuffer&&String(type).includes('json'))raw=parseJson(new TextDecoder().decode(value));else raw=value;return value},...(Array.isArray(transforms)?transforms:[transforms])];
      configuration.timeout=Math.min(configuration.timeout||input.requestTimeoutMs,input.requestTimeoutMs);configuration.signal=controller.signal;
      return configuration;
    });
    try{phase='invoked';pending=request?client.request({url:request.url.href,method:request.method,data:request.body,...(contract.method.response==='binary'?{responseType:'arraybuffer'}:{})}):method.apply(service,args)}
    finally{client.interceptors.request.eject(interceptor)}
    let clientDisposition='fulfilled';
    try{await pending}catch(error){if(raw===undefined)throw error;clientDisposition='rejected-after-response'}
    if(count!==1||raw===undefined)fail('WEB_RAW_RESPONSE_UNAVAILABLE','The API returned no observed raw response.');
    return {raw,status:Number.isInteger(status)?status:null,clientDisposition};
  };
  const observeFetch=async(args,request)=>{
    const original=window.fetch;let response,responseCopy,pending,count=0;
    window.fetch=function(resource,options={}){
      if(++count!==1)fail('WEB_MULTIPLE_REQUESTS','The selected API produced more than one request.');
      validateRequest(typeof resource==='string'?resource:resource.url,options.method||'GET',request);
      if(options.signal){const abort=()=>controller.abort();if(options.signal.aborted)abort();else{options.signal.addEventListener('abort',abort,{once:true});cleanups.push(()=>options.signal.removeEventListener('abort',abort))}}
      return original.call(this,resource,{...options,signal:controller.signal}).then(value=>{response=value;if(contract.method.response!=='sse'||(value.headers.get('content-type')||'').includes('json'))responseCopy=value.clone();return value});
    };
    try{
      phase='invoked';
      if(contract.method.transport.kind==='plain-fetch'){
        const headers={'Accept':'application/json'};
        for(const [header,key]of Object.entries(contract.method.transport.sessionHeaders||{})){const value=sessionStorage.getItem(key);if(value)headers[header]=value}
        let body=request.body;if(body!==undefined&&!(body instanceof FormData)){headers['Content-Type']='application/json';body=JSON.stringify(body)}
        pending=window.fetch(request.url.href,{method:request.method,body,headers,credentials:'include',cache:'no-store'});
      }else if(request)pending=method(request.method,request.url.href,request.body,contract.method.transport.timeZoneHeader?{'X-TimeZone':Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Shanghai'}:undefined,contract.method.response==='sse'?'stream':'json',undefined,controller.signal);
      else pending=method.apply(service,args);
    }finally{window.fetch=original}
    let clientDisposition='fulfilled';
    try{await pending}catch(error){if(!response)throw error;clientDisposition='rejected-after-response'}
    if(count!==1||!response)fail('WEB_RAW_RESPONSE_UNAVAILABLE','The API returned no observed raw response.');
    const type=response.headers.get('content-type')||'';
    if(contract.method.response==='sse'&&!type.includes('json'))return {response,status:response.status,clientDisposition};
    const bytes=await readBytes(responseCopy,contract.method.response==='binary'?16*1024*1024:2*1024*1024);
    return {raw:contract.method.response==='binary'&&!type.includes('json')?bytes.buffer:parseJson(new TextDecoder().decode(bytes)),status:response.status,clientDisposition};
  };
  const collectStream=async response=>{
    const reader=response.body?.getReader();if(!reader)fail('WEB_STREAM_UNAVAILABLE','The API returned no readable stream.');
    const decoder=new TextDecoder(),events=[];let buffered='',event={},bytes=0,completion='eof';
    const cancel=()=>{completion='deadline';reader.cancel().catch(()=>{})};
    controller.signal.addEventListener('abort',cancel,{once:true});
    if(controller.signal.aborted)cancel();
    const line=text=>{
      if(text===''){if(Object.keys(event).length)events.push(event);event={};return}
      if(text[0]===':')return;
      const colon=text.indexOf(':'),name=colon<0?text:text.slice(0,colon),raw=colon<0?'':text.slice(colon+1),value=raw.startsWith(' ')?raw.slice(1):raw;
      if(name==='data')event.data=event.data===undefined?value:event.data+'\n'+value;else if(['event','id','retry'].includes(name))event[name]=value;
    };
    const drain=final=>{
      for(;;){
        const at=buffered.search(/[\r\n]/);
        if(at<0){if(final&&buffered){line(buffered);buffered=''}return}
        if(buffered[at]==='\r'&&at===buffered.length-1&&!final)return;
        const length=buffered[at]==='\r'&&buffered[at+1]==='\n'?2:1;
        line(buffered.slice(0,at));buffered=buffered.slice(at+length);
        if(events.length>=2000){completion='limit';return}
      }
    };
    try{
      for(;;){
        const item=await reader.read();if(item.done){if(completion==='eof'){buffered+=decoder.decode();drain(true);if(completion==='eof'&&Object.keys(event).length)completion='truncated-event'}break}
        bytes+=item.value.length;if(bytes>1024*1024||events.length>=2000){completion='limit';break}
        buffered+=decoder.decode(item.value,{stream:true});drain(false);if(completion==='limit')break;
      }
    }catch(error){if(controller.signal.aborted)completion='deadline';else throw error}
    finally{controller.signal.removeEventListener('abort',cancel);if(completion!=='eof')await reader.cancel().catch(()=>{});reader.releaseLock()}
    return {events,completion,completed:completion==='eof',bytes};
  };
  const projectResult=(result,fields=input.fields)=>{
    if(input.view==='shape'){
      let count=0;
      const shape=(value,depth=0)=>{
        if(++count>2000||depth>5)return {type:Array.isArray(value)?'array':value===null?'null':typeof value,inspected:false};
        if(value===null||typeof value!=='object')return {type:value===null?'null':typeof value};
        if(Array.isArray(value))return {type:'array',length:value.length,...(value.length?{item:shape(value[0],depth+1)}:{})};
        const keys=Object.keys(value),properties={};for(const key of keys.slice(0,100))properties[key]=secretKey(key)||['__proto__','prototype','constructor'].includes(key)?{type:'redacted'}:shape(value[key],depth+1);
        return {type:'object',properties,...(keys.length>100?{truncatedKeys:true}:{})};
      };return shape(result);
    }
    let nodes=0;
    const copy=(value,tree=true,depth=0)=>{
      if(++nodes>20000||depth>25)fail('WEB_RESULT_LIMIT','The API result exceeds the supported size.');
      if(value===null||['boolean','number'].includes(typeof value))return value;
      if(typeof value==='string'){
        if(/^https?:\/\//i.test(value)){try{const url=new URL(value);if(url.username||url.password||[...url.searchParams.keys()].some(key=>credentialKey(key)||/^(?:decryptStr|authValue)$/i.test(key)))fail('WEB_SENSITIVE_RESULT','The result contains a credential-bearing URL.')}catch(error){if(error.code)throw error}}
        return value;
      }
      if(Array.isArray(value))return value.map(item=>copy(item,tree,depth+1));
      if(!value||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype)fail('WEB_RESULT_TYPE','The API returned a non-JSON value.');
      const output={};
      for(const key of tree===true?Object.keys(value):Object.keys(tree)){
        if(!Object.hasOwn(value,key))continue;
        if(['__proto__','prototype','constructor'].includes(key)||secretKey(key))fail('WEB_SENSITIVE_RESULT','The result contains internal or credential fields.');
        output[key]=copy(value[key],tree===true?true:tree[key],depth+1);
      }return output;
    };
    if(fields==null)return copy(result);
    const tree={};for(const field of fields){let branch=tree;const parts=field.split('.');parts.forEach((part,index)=>{branch[part]??=index===parts.length-1?true:{};branch=branch[part]})}return copy(result,tree);
  };

  try{
    const binding=contract.method.binding||{moduleId:contract.moduleId,export:contract.export,member:input.method};
    locationCheck();
    if(contract.runtime?.kind==='esm'){
      const asset=await fetch(contract.runtime.url,{credentials:'include',signal:controller.signal});
      if(!asset.ok||await hash(await asset.text())!==contract.runtime.hash)fail('WEB_CONTRACT_CHANGED','The registered application bundle changed.');
      module=await import(contract.runtime.url);
    }else if(contract.webpackGlobal){
      for(let attempt=0;attempt<50;attempt++){
        locationCheck();const chunks=window[contract.webpackGlobal];
        if(Array.isArray(chunks)&&!loader){const id='codex_web_api_'+Date.now()+'_'+Math.random().toString(16).slice(2),payload=[[id],{},load=>{loader=load}];try{chunks.push(payload)}finally{const at=chunks.indexOf(payload);if(at>=0)chunks.splice(at,1)}}
        if(loader&&contract.method.chunks?.length&&!loader.m[binding.moduleId])await Promise.all(contract.method.chunks.map(id=>loader.e(id)));
        if(loader&&(contract.method.request||loader.m[binding.moduleId]))break;
        await new Promise(resolve=>setTimeout(resolve,100));
      }
      if(!loader)fail('WEB_API_UNAVAILABLE','The registered application runtime did not load.');
      for(const [id,expected]of Object.entries({...contract.factories,...contract.method.factories}))if(typeof loader.m[id]!=='function'||await hash(loader.m[id])!==expected)fail('WEB_CONTRACT_CHANGED','An application transport, service or identity module changed.');
      if(binding.moduleId)module=loader(binding.moduleId);
    }else if(contract.runtime?.kind==='source'){
      const asset=await fetch(contract.runtime.url,{credentials:'include',signal:controller.signal});
      if(!asset.ok||await hash(await asset.text())!==contract.runtime.hash)fail('WEB_CONTRACT_CHANGED','The registered application bundle changed.');
    }
    await pageCheck();
    if(!contract.method.request||contract.method.transport.kind==='native-fetch'){
      service=module?.[binding.export];method=binding.member===undefined?service:service?.[binding.member];
      if(typeof method!=='function'||await hash(method)!==contract.method.hash)fail('WEB_CONTRACT_CHANGED','The application method differs from its registered contract.');
      if(method.constructor.name==='AsyncFunction')fail('WEB_CONTRACT_CHANGED','The adapter requires a synchronous request wrapper.');
    }
    if(operation==='describe')return {ok:true,value:{app:input.app,method:input.method,...(method?{source:String(method)}:{}),parameters:contract.method.parameters,request:contract.method.request,transport:contract.method.transport,effect:contract.method.effect,validation:contract.method.validation,applicationUserId:input.employeeId}};
    const args=decode(input.arguments),request=requestFrom(args),transport=contract.method.transport;
    let observed;
    timer=setTimeout(()=>controller.abort(),input.requestTimeoutMs);
    if(transport.kind==='native-axios')observed=await observeAxios(args,request);
    else if(['native-fetch','plain-fetch'].includes(transport.kind))observed=await observeFetch(args,request);
    else{
      // 短信使用已核对的配置和响应封套，保留原始 bo 与业务码。
      const configuration=loader(contract.configModuleId)[contract.configExport],url=new URL(configuration[transport.configMember]+transport.suffix,location.href);
      if(url.origin!==contract.apiOrigin)fail('WEB_CONTRACT_CHANGED','The application API origin changed.');
      const query=transport.query==='user-id'?{id:args[0],needContact:true}:transport.query==='first-argument'?args[0]:undefined;
      if(query)for(const [key,value]of Object.entries(query))if(value!==undefined)url.searchParams.append(key,value===null?'':String(value));
      const headers={'X-Lang-Id':transport.languageArgument===undefined?'zh_CN':args[transport.languageArgument]==='zh_CN'?'zh':'en'};
      if(transport.body)headers['Content-Type']='application/json';
      phase='invoked';const response=await fetch(url.href,{method:transport.httpMethod,headers,credentials:'include',cache:'no-cache',mode:'cors',signal:controller.signal,...(transport.body?{body:JSON.stringify(args[0])}:{})});
      observed={status:response.status,raw:parseJson(new TextDecoder().decode(await readBytes(response,2*1024*1024))),clientDisposition:'not-applicable'};
    }
    const authentication=observed.status===401||observed.raw?.code?.code==='0002';
    if(observed.status!==null&&observed.status!==undefined&&(observed.status<200||observed.status>=300)&&!authentication)fail('WEB_HTTP_ERROR','The application API returned HTTP '+observed.status+'.');
    let downloadHandoff;
    if(contract.method.response==='download-link'&&observed.raw?.code?.code==='0000'){
      const download=contract.method.download,address=atPath(observed.raw,download.urlPath);
      if(typeof address==='string'&&address){
        const url=new URL(address,location.href);
        if(url.username||url.password||!download.allowedOrigins.includes(url.origin))fail('WEB_DOWNLOAD_ORIGIN','The download URL left the registered file origins.');
        downloadHandoff={url:url.href};
      }else if(atPath(observed.raw,download.offlinePath)===true)return {ok:true,value:{state:'download-pending',app:input.app,method:input.method,httpStatus:observed.status,result:projectResult(observed.raw),businessOutcome:'not-inferred',coverage:{kind:'offline-download-pending'}}};
    }
    let stream;if(observed.response){if(!(observed.response.headers.get('content-type')||'').includes('text/event-stream'))fail('WEB_RESPONSE_SCHEMA','The application returned an unrecognized stream type.');stream=await collectStream(observed.response)}
    await pageCheck();
    if(downloadHandoff)return {ok:true,value:{state:'download-ready',app:input.app,method:input.method,httpStatus:observed.status,binaryHandoff:downloadHandoff,businessOutcome:'not-inferred'}};
    if(stream){
      for(const event of stream.events){if(!event.data?.trim().startsWith('{')&&!event.data?.trim().startsWith('['))continue;let parsed;try{parsed=parseJson(event.data)}catch{continue}projectResult(parsed,null)}
      return {ok:true,value:{state:stream.completed?'stream-complete':'stream-interrupted',app:input.app,method:input.method,httpStatus:observed.status,clientDisposition:observed.clientDisposition,result:projectResult(stream),businessOutcome:stream.completed?'not-inferred':'unknown',coverage:{kind:'stream',completed:stream.completed,completion:stream.completion}}};
    }
    if(observed.raw instanceof ArrayBuffer){
      const bytes=new Uint8Array(observed.raw);if(bytes.length>16*1024*1024)fail('WEB_RESULT_LIMIT','The downloaded file exceeds 16 MiB.');
      let text='';for(let offset=0;offset<bytes.length;offset+=8192)text+=String.fromCharCode(...bytes.subarray(offset,offset+8192));
      return {ok:true,value:{state:'binary-returned',app:input.app,method:input.method,httpStatus:observed.status,binary:{base64:btoa(text),bytes:bytes.length},businessOutcome:'not-inferred'}};
    }
    const result=observed.raw;
    if(!result||typeof result!=='object'||typeof result.code?.code!=='string')fail('WEB_RESPONSE_SCHEMA','The application returned no recognized response envelope.');
    return {ok:true,value:{state:authentication?'authentication-required':'returned',app:input.app,method:input.method,httpStatus:observed.status,clientDisposition:observed.clientDisposition,responseCode:result.code.code,businessObjectPresent:Object.hasOwn(result,'bo'),result:projectResult(result),businessOutcome:authentication?'authentication-rejected':'not-inferred',coverage:input.view==='shape'?{kind:'shape',maxDepth:5,valuesReturned:false}:input.fields?{kind:'selected-fields',fields:input.fields}:{kind:'complete-returned-value'}}};
  }catch(error){return {ok:false,error:{code:error.code||(controller.signal.aborted?'WEB_API_TIMEOUT':'WEB_API_FAILED'),message:error.code?error.message:'The application operation failed.',details:{phase,...(!error.code?{nativeErrorName:error.name}:{})}}}}
  finally{clearTimeout(timer);controller.abort();for(const cleanup of cleanups)cleanup()}
}
module.exports={webApplicationOperation};
