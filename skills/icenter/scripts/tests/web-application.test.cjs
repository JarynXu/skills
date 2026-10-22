const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {createHash,webcrypto}=require('node:crypto');
const {webApplicationOperation}=require('../web-application.cjs');
const sha=value=>createHash('sha256').update(String(value)).digest('hex');

function fixture(options={}){
  const requests=[],handlers=new Map();let sequence=0;
  const context=vm.createContext({URL,TextEncoder,TextDecoder,AbortController,ReadableStream,Response,FormData,File,Blob,ArrayBuffer,Uint8Array,atob,btoa,crypto:webcrypto,setTimeout,clearTimeout,location:{origin:'https://app.example.test',pathname:'/web/'},sessionStorage:{getItem:()=>options.account??'owner'}});
  const result=options.raw??'{"code":{"code":"0000"},"bo":{"id":9223372036854775807}}';
  const client={defaults:{transformResponse:[]},interceptors:{request:{use:fn=>{handlers.set(++sequence,fn);return sequence},eject:id=>handlers.delete(id)}},request(configuration){
    const chain=[...handlers.values()];
    return Promise.resolve().then(async()=>{
      for(const handler of chain)configuration=await handler(configuration);
      requests.push(configuration);let value=result;
      for(const transform of configuration.transformResponse??[])value=transform.call(configuration,value,{'content-type':options.contentType||'application/json'},options.status??200);
      if(options.nativeRejection)throw Error('Native business interceptor rejected the response');
      return {data:value};
    });
  }};
  context.client=client;
  vm.runInContext(`
    window=globalThis;
    const service={method(value){return client.request({url:'https://api.example.test/data',method:'POST',data:value}).then(()=>({boOnly:true}))}};
    const loader=id=>id==='client'?{A:client}:id==='api'?{A:service}:{};loader.m={api:function api(){},client:function client(){}};
    const chunks=[];chunks.push=payload=>{payload[2](loader);return Array.prototype.push.call(chunks,payload)};window.chunks=chunks;
  `,context);
  context.fetch=async(resource,init={})=>{requests.push({url:resource,...init});return new Response(options.stream??result,{status:options.status??200,headers:{'content-type':options.contentType||'application/json'}})};
  const originalFetch=context.fetch;
  const contract={origin:'https://app.example.test',path:'/web/',webpackGlobal:'chunks',identity:{kind:'session',key:'owner'},method:{binding:{moduleId:'api',export:'A',member:'method'},hash:sha(vm.runInContext('service.method',context)),effect:'read',parameters:['value'],transport:{kind:'native-axios',client:{moduleId:'client',export:'A'},verbs:['POST'],allowedOrigins:['https://api.example.test']}}};
  const call=async(overrides={},operation='invoke')=>{
    const input={app:'fixture',method:'query',employeeId:'owner',arguments:[{}],requestTimeoutMs:100,...overrides};
    return JSON.parse(JSON.stringify(await vm.runInContext('('+webApplicationOperation.toString()+')(...JSON.parse('+JSON.stringify(JSON.stringify([operation,input,contract]))+'))',context)));
  };
  return {context,contract,call,requests,handlers,originalFetch};
}
function useFetch(f,source){
  vm.runInContext('service.method='+source,f.context);
  f.contract.method.hash=sha(vm.runInContext('service.method',f.context));
  f.contract.method.transport.kind='native-fetch';
}

test('native Axios observes the raw envelope and preserves 64-bit IDs before the vendor parser',async()=>{
  const f=fixture({nativeRejection:true});const r=await f.call();
  assert.equal(r.ok,true);assert.equal(r.value.result.bo.id,'9223372036854775807');assert.equal(r.value.httpStatus,200);assert.equal(r.value.clientDisposition,'rejected-after-response');assert.equal(f.handlers.size,0);assert.equal(f.requests.length,1);
});
test('an undeclared API origin is rejected before the native request is sent',async()=>{
  const f=fixture();f.contract.method.transport.allowedOrigins=['https://another.example.test'];const r=await f.call();assert.equal(r.ok,false);assert.equal(f.requests.length,0);assert.equal(f.handlers.size,0);
});
test('request interceptor ownership ends before unrelated requests begin',async()=>{
  const f=fixture();await f.call();assert.equal(f.handlers.size,0);await f.context.client.request({url:'https://unrelated.example.test',method:'GET'});assert.equal(f.requests.length,2);assert.equal(f.requests[1].signal,undefined);
});
test('native fetch may consume its Response; the raw observer owns a separate copy',async()=>{
  const f=fixture();useFetch(f,'function(value){return window.fetch("https://api.example.test/data",{method:"POST",body:JSON.stringify(value)}).then(response=>response.json()).then(data=>data.bo)}');
  const r=await f.call();assert.equal(r.value.result.bo.id,'9223372036854775807');assert.equal(f.context.fetch,f.originalFetch);assert.equal(f.requests.length,1);
});
test('synchronous request construction failure restores the fetch function',async()=>{
  const f=fixture();useFetch(f,'function(){throw Error("construction failed")}');const r=await f.call();assert.equal(r.ok,false);assert.equal(f.context.fetch,f.originalFetch);assert.equal(f.requests.length,0);
});
test('async wrappers are refused before invocation and background interception',async()=>{
  const f=fixture();useFetch(f,'async function(){return window.fetch("https://api.example.test/data")}');const r=await f.call();assert.equal(r.error.code,'WEB_CONTRACT_CHANGED');assert.equal(r.error.details.phase,'not-invoked');assert.equal(f.requests.length,0);
});
test('registered request paths encode IDs and reject undeclared query keys',async()=>{
  const f=fixture();f.contract.method.request={base:'https://api.example.test',path:'/files/{id}',httpMethod:'POST',queryNames:['page'],requiredQuery:['page']};
  const r=await f.call({arguments:[{path:{id:'x/../y?z'},query:{page:1},body:{name:'value'}}]});assert.equal(r.ok,true);assert.equal(new URL(f.requests[0].url).pathname,'/files/x%2F..%2Fy%3Fz');
  const bad=await f.call({arguments:[{path:{id:'x'},query:{page:1,endpoint:'other'}}]});assert.equal(bad.error.code,'INVALID_WEB_REQUEST');assert.equal(f.requests.length,1);
});
test('multipart input becomes File and FormData within the application',async()=>{
  const f=fixture();f.contract.method.request={base:'https://api.example.test',path:'/upload',httpMethod:'POST',queryNames:[]};
  const r=await f.call({arguments:[{body:{$icenterForm:{title:'original',file:{$icenterFile:{name:'source.txt',type:'text/plain',base64:Buffer.from('exact bytes').toString('base64')}}}}}]});
  assert.equal(r.ok,true);const body=f.requests[0].data;assert.ok(body instanceof FormData);assert.equal(body.get('title'),'original');assert.equal(body.get('file').name,'source.txt');assert.equal(await body.get('file').text(),'exact bytes');
});
test('string literals and escapes do not participate in large-integer conversion',async()=>{
  const raw='{"code":{"code":"0000"},"bo":{"id":9007199254740993,"description":"quoted \\\" 9223372036854775807","safe":42,"decimal":1.25}}';
  const f=fixture({raw});const r=await f.call();assert.deepEqual(r.value.result.bo,{id:'9007199254740993',description:'quoted " 9223372036854775807',safe:42,decimal:1.25});
});
test('credential-bearing URLs are blocked while non-sensitive projection remains available',async()=>{
  const f=fixture({raw:'{"code":{"code":"0000"},"bo":{"id":"file","url":"https://files.example.test/file?token=private"}}'});
  const r=await f.call();assert.equal(r.error.code,'WEB_SENSITIVE_RESULT');const selected=await f.call({fields:['bo.id']});assert.deepEqual(selected.value.result,{bo:{id:'file'}});
});
test('HTTP 401 with an authentication envelope remains a visible authentication rejection',async()=>{
  const f=fixture({status:401,raw:'{"code":{"code":"0002"}}'});const r=await f.call();assert.equal(r.value.httpStatus,401);assert.equal(r.value.state,'authentication-required');assert.equal(r.value.businessObjectPresent,false);
});
test('SSE joins UTF-8 chunks, CRLF and multiline events before reporting EOF',async()=>{
  const bytes=new TextEncoder().encode(':heartbeat\r\nid: 7\r\nevent: answer\r\ndata: 你好\r\ndata: second\r\n\r\ndata: [DONE]\n\n');
  const stream=new ReadableStream({start(controller){for(let index=0;index<bytes.length;index+=3)controller.enqueue(bytes.subarray(index,index+3));controller.close()}});
  const f=fixture({stream,contentType:'text/event-stream'});useFetch(f,'function(){return window.fetch("https://api.example.test/data",{method:"POST"})}');f.contract.method.response='sse';
  const r=await f.call();assert.equal(r.value.state,'stream-complete');assert.deepEqual(r.value.result.events,[{id:'7',event:'answer',data:'你好\nsecond'},{data:'[DONE]'}]);assert.equal(r.value.coverage.completed,true);
});
test('SSE deadline cancels an otherwise blocked reader and preserves partial events as unknown',async()=>{
  let cancelled=0;const stream=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('data: first\n\n'))},cancel(){cancelled++}});
  const f=fixture({stream,contentType:'text/event-stream'});useFetch(f,'function(){return window.fetch("https://api.example.test/data",{method:"POST"})}');f.contract.method.response='sse';
  const r=await f.call({requestTimeoutMs:20});assert.equal(r.value.state,'stream-interrupted');assert.equal(r.value.businessOutcome,'unknown');assert.equal(r.value.result.events[0].data,'first');assert.equal(cancelled,1);assert.equal(r.value.coverage.completion,'deadline');
});
test('an HTTP error body cannot become a successful stream',async()=>{
  const f=fixture({status:503,stream:'service unavailable',contentType:'text/plain'});useFetch(f,'function(){return window.fetch("https://api.example.test/data",{method:"POST"})}');f.contract.method.response='sse';const r=await f.call();assert.equal(r.error.code,'WEB_HTTP_ERROR');
});
test('binary results retain exact bytes and reject HTTP failures',async()=>{
  const bytes=new Uint8Array([0,255,17,24]).buffer,f=fixture({raw:bytes,contentType:'application/octet-stream'});f.contract.method.response='binary';const r=await f.call();assert.equal(r.value.state,'binary-returned');assert.equal(r.value.binary.base64,Buffer.from(bytes).toString('base64'));
  const denied=fixture({status:503,raw:bytes,contentType:'application/octet-stream'});denied.contract.method.response='binary';assert.equal((await denied.call()).error.code,'WEB_HTTP_ERROR');
});
test('shape view returns types without credential or business values',async()=>{
  const f=fixture({raw:'{"code":{"code":"0000"},"bo":{"id":"private-id","token":"private-auth","rows":[{"name":"private-name"}]}}'}),r=await f.call({view:'shape'});
  assert.equal(r.value.result.properties.bo.properties.token.type,'redacted');assert.equal(r.value.result.properties.bo.properties.rows.length,1);assert.equal(r.value.coverage.valuesReturned,false);assert.equal(JSON.stringify(r).includes('private-'),false);
});
test('declared classification fields do not disable credential checks',async()=>{
  const f=fixture({raw:'{"code":{"code":"0000"},"bo":{"secretLevel":"L2","token":"private-auth"}}'});f.contract.businessFields=['secretLevel'];
  assert.equal((await f.call()).error.code,'WEB_SENSITIVE_RESULT');assert.deepEqual((await f.call({fields:['bo.secretLevel']})).value.result,{bo:{secretLevel:'L2'}});
});
test('SSE accepts CR delimiters and preserves an unterminated event as incomplete',async()=>{
  for(const [text,state,completion]of [['data: one\r\r','stream-complete','eof'],['data: unfinished','stream-interrupted','truncated-event']]){
    const f=fixture({stream:text,contentType:'text/event-stream'});useFetch(f,'function(){return window.fetch("https://api.example.test/data",{method:"POST"})}');f.contract.method.response='sse';const r=await f.call();assert.equal(r.value.state,state);assert.equal(r.value.coverage.completion,completion);
  }
});
