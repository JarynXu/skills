const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {createHash,webcrypto}=require('node:crypto');
const {webPageOperation}=require('../web-page.cjs');
const {webApplicationOperation}=require('../web-application.cjs');
const {SdkSession}=require('../sdk.cjs');
const sha=value=>createHash('sha256').update(String(value)).digest('hex');

function fixture(options={}){
  const requests=[],windows=[],timers=new Set(),state={userInfo:{userId:'sip:self@example.test'}};
  const web=vm.createContext({URL,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,crypto:webcrypto,AbortController,employee:'self',location:{origin:'https://app.example.test',pathname:'/sms/'},setTimeout,clearTimeout});
  const methodName=options.methodName||'list';
  vm.runInContext(`
    const identity=()=>employee;
    const service={smsDeleteMsg(ids){throw Error('unused native wrapper')},list(query){throw Error('The vendor wrapper must not swallow response envelopes.')},smsSendService(data,language){throw Error('The vendor wrapper must not swallow response envelopes.')}};
    const loader=id=>({'1':{A:service},'2':{id:identity},'3':{A:{endpoint:'https://api.example.test/sms/search'}}}[id]);
    loader.m={'1':true,'2':true,'3':true};
    const chunks=[];chunks.push=payload=>{payload[2](loader);return Array.prototype.push.call(chunks,payload)};
    globalThis.window=globalThis;window.chunks=chunks;
  `,web);
  const contract={origin:'https://app.example.test',path:'/sms/',route:'/send',apiOrigin:'https://api.example.test',configModuleId:'3',configExport:'A',webpackGlobal:'chunks',moduleId:'1',export:'A',identity:{moduleId:'2',export:'id',hash:sha(vm.runInContext('identity',web))},method:{hash:sha(vm.runInContext('service.'+methodName,web)),parameters:['query'],effect:options.write?'write':'read',transport:options.write?{httpMethod:'POST',configMember:'endpoint',suffix:'',body:'first-argument',languageArgument:1}:{httpMethod:'GET',configMember:'endpoint',suffix:'',query:'first-argument'}}};
  web.fetch=async(url,init)=>{
    requests.push({url,init});
    if(options.fetchError)throw Error('transport failed');
    if(options.changeAccount)state.userInfo.userId='sip:other@example.test';
    return new Response(options.rawResponse??JSON.stringify(options.response??{code:{code:'0000'},bo:{rows:[{id:'original-id'}]}}),{status:options.status??200,headers:{'content-type':'application/json'}});
  };
  class BrowserWindow{
    constructor(options){this.options=options;this.closed=false;windows.push(this);this.webContents={executeJavaScript:async code=>vm.runInContext(code,web)}}
    async loadURL(url){this.url=url;if(options.loadError)throw Error('load failed');}
    isDestroyed(){return this.closed}
    destroy(){this.closed=true}
  }
  const loader={c:{daba:{exports:{BrowserWindow,getCurrentWebContents:()=>({session:{borrowed:true}})}}},m:{}};
  const window={webpackJsonp:[]};window.webpackJsonp.push=payload=>{payload[1][Object.keys(payload[1])[0]](null,null,loader);return Array.prototype.push.call(window.webpackJsonp,payload)};
  const main=vm.createContext({process:{argv:['IS_MAIN_WINDOW'],resourcesPath:'/client'},require:()=>({version:'12.1.0'}),document:{querySelector:()=>({__vue_app__:{config:{globalProperties:{$store:{state}}}}})},window,setTimeout:(fn,ms)=>{const timer=setTimeout(fn,ms);timers.add(timer);return timer},clearTimeout:timer=>{timers.delete(timer);clearTimeout(timer)}});
  const invoke=async(overrides={},operation='invoke')=>{
    const input={accountId:'sip:self@example.test',app:'sms',method:methodName,arguments:[{pageSize:1,startIndex:1,keyword:'exact value'}],apply:true,...overrides};
    const result=await vm.runInContext('('+webPageOperation.toString()+')(...JSON.parse('+JSON.stringify(JSON.stringify([operation,input,contract,webApplicationOperation.toString()]))+'))',main);
    return JSON.parse(JSON.stringify(result));
  };
  return {invoke,contract,web,main,window,state,requests,windows,timers};
}

test('preview validates the account without opening a browser or issuing requests',async()=>{
  const f=fixture();const r=await f.invoke({apply:false});assert.equal(r.value.state,'preview');assert.equal(r.value.runtimeContractVerified,false);assert.equal(f.windows.length,0);assert.equal(f.requests.length,0);
});
test('query uses its registered HTTPS API, browser credentials and response envelope',async()=>{
  const f=fixture();const r=await f.invoke();assert.equal(r.ok,true);assert.equal(r.value.responseCode,'0000');assert.equal(r.value.businessOutcome,'not-inferred');assert.equal(r.value.result.bo.rows[0].id,'original-id');
  const request=f.requests[0];assert.equal(new URL(request.url).searchParams.get('keyword'),'exact value');assert.equal(request.init.credentials,'include');assert.equal(request.init.method,'GET');assert.equal(f.windows[0].options.show,false);assert.equal(f.windows[0].options.webPreferences.nodeIntegration,false);assert.equal(f.windows[0].options.webPreferences.session.borrowed,true);assert.equal(f.windows[0].closed,true);assert.equal(f.timers.size,0);assert.equal(f.window.__codexIcenterSdkCall,undefined);
});
test('a successful envelope without a business object retains its absence',async()=>{
  const f=fixture({response:{code:{code:'0000'}}});const r=await f.invoke();assert.equal(r.ok,true);assert.equal(r.value.businessObjectPresent,false);assert.equal(Object.hasOwn(r.value.result,'bo'),false);
});
test('authentication rejection is not presented as an empty successful result',async()=>{
  const f=fixture({response:{code:{code:'0002'}}});const r=await f.invoke();assert.equal(r.value.state,'authentication-required');assert.equal(r.value.businessOutcome,'authentication-rejected');assert.equal(f.requests.length,1);assert.equal(f.windows[0].closed,true);
});
test('application identity mismatch prevents a business request',async()=>{
  const f=fixture();f.web.employee='other';const r=await f.invoke();assert.equal(r.error.code,'WEB_ACCOUNT_CHANGED');assert.equal(r.error.details.phase,'not-invoked');assert.equal(f.requests.length,0);assert.equal(f.windows[0].closed,true);
});
test('changed native method contract prevents the request',async()=>{
  const f=fixture();f.contract.method.hash='changed';const r=await f.invoke();assert.equal(r.error.code,'WEB_CONTRACT_CHANGED');assert.equal(f.requests.length,0);assert.equal(f.windows[0].closed,true);
});
test('an in-flight SDK operation retains its ownership',async()=>{
  const f=fixture();f.window.__codexIcenterSdkCall='existing-owner';const r=await f.invoke();assert.equal(r.error.code,'SDK_BUSY');assert.equal(f.windows.length,0);assert.equal(f.window.__codexIcenterSdkCall,'existing-owner');
});
test('browser load failure closes only the newly owned window',async()=>{
  const f=fixture({loadError:true});const r=await f.invoke();assert.equal(r.error.code,'WEB_APP_LOAD_FAILED');assert.equal(f.windows.length,1);assert.equal(f.windows[0].closed,true);assert.equal(f.window.__codexIcenterSdkCall,undefined);
});
test('transport failure retains the invoked phase without retry',async()=>{
  const f=fixture({fetchError:true});const r=await f.invoke();assert.equal(r.ok,false);assert.equal(r.error.details.phase,'invoked');assert.equal(f.requests.length,1);assert.equal(f.windows[0].closed,true);
});
test('HTTP failures and malformed envelopes do not become business values',async()=>{
  for(const options of [{status:503},{response:{rows:[]}}]){const f=fixture(options);const r=await f.invoke();assert.equal(r.ok,false);assert.equal(r.error.details.phase,'invoked');assert.equal(f.requests.length,1);assert.equal(f.windows[0].closed,true);}
});
test('client account changes invalidate the returned application data',async()=>{
  const f=fixture({changeAccount:true});const r=await f.invoke();assert.equal(r.error.code,'ACCOUNT_CHANGED');assert.equal(f.windows[0].closed,true);
});
test('credential-bearing responses fail; explicit non-secret projection remains available',async()=>{
  const f=fixture({response:{code:{code:'0000'},bo:{id:'record',token:'must-stay-in-page'}}});const r=await f.invoke();assert.equal(r.error.code,'WEB_SENSITIVE_RESULT');const projected=await f.invoke({fields:['bo.id']});assert.deepEqual(projected.value.result,{bo:{id:'record'}});assert.equal(JSON.stringify(projected).includes('must-stay'),false);
});
test('credential and overlapping field requests are rejected before opening a window',async()=>{
  for(const fields of [['bo.token'],['bo','bo.id']]){const f=fixture();const r=await f.invoke({fields});assert.equal(r.error.code,'INVALID_WEB_FIELDS');assert.equal(f.windows.length,0);}
});
test('invalid pagination and reserved keys do not reach the server',async()=>{
  for(const arg of [{pageSize:0,startIndex:1,keyword:''},JSON.parse('{"pageSize":1,"startIndex":1,"keyword":"","__proto__":{}}')]){const f=fixture();const r=await f.invoke({arguments:[arg]});assert.equal(r.error.code,'INVALID_WEB_ARGUMENTS');assert.equal(f.requests.length,0);assert.equal(f.windows.length,0);}
});
test('description checks source identity without issuing the requested API',async()=>{
  const f=fixture();const r=await f.invoke({},'describe');assert.equal(r.ok,true);assert.match(r.value.source,/vendor wrapper/);assert.equal(f.requests.length,0);assert.equal(f.windows[0].closed,true);
});
test('web metadata is detached and unknown operations fail before evaluation',async()=>{
  const original=SdkSession.webCatalog();original.apps.sms.origin='https://other.test';assert.notEqual(SdkSession.webCatalog().apps.sms.origin,original.apps.sms.origin);
  const sdk=new SdkSession({evaluate:()=>{throw Error('Unexpected evaluation')}},{accountId:'sip:self@example.test'});await assert.rejects(sdk.invokeWeb('sms','unknown',[]),{code:'UNKNOWN_WEB_OPERATION'});
});
test('a lost write response remains unknown and is not retried',async()=>{
  let calls=0;const sdk=new SdkSession({evaluate:async()=>{calls++;throw Object.assign(Error('disconnected'),{code:'CDP_DISCONNECTED'})}},{accountId:'sip:self@example.test'});
  await assert.rejects(sdk.invokeWeb('sms','smsDeleteMsg',[['observed-id']],{apply:true}),{code:'WEB_CALL_UNKNOWN'});assert.equal(calls,1);
});

test('SMS POST retains exact payload, language and a business rejection code',async()=>{
  const f=fixture({methodName:'smsSendService',write:true,response:{code:{code:'0000'},bo:{resultCode:'105'}}});
  const payload={content:'test &lt;value&gt;',receiverInfo:[{mobileReceiver:'001234',receiverCode:'',receiverName:''}],signatureType:0};
  const r=await f.invoke({arguments:[payload,'en_US']});assert.equal(r.ok,true);assert.equal(r.value.result.bo.resultCode,'105');assert.equal(r.value.businessOutcome,'not-inferred');assert.equal(f.requests[0].init.method,'POST');assert.equal(f.requests[0].init.headers['X-Lang-Id'],'en');assert.deepEqual(JSON.parse(f.requests[0].init.body),payload);assert.equal(f.requests.length,1);assert.equal(f.windows[0].closed,true);
});
test('SMS recipient absence prevents browser creation and HTTP submission',async()=>{
  const f=fixture({methodName:'smsSendService',write:true});const r=await f.invoke({arguments:[{content:'content',receiverInfo:[],signatureType:0},'zh_CN']});assert.equal(r.error.code,'INVALID_WEB_ARGUMENTS');assert.equal(f.windows.length,0);assert.equal(f.requests.length,0);
});
test('registered transport module changes prevent an API request',async()=>{
  const f=fixture();f.contract.factories={'3':'different'};const r=await f.invoke();assert.equal(r.error.code,'WEB_CONTRACT_CHANGED');assert.equal(f.requests.length,0);assert.equal(f.windows[0].closed,true);
});


test('SMS deletion accepts observed numeric IDs without coercing their type',async()=>{
  const f=fixture({methodName:'smsDeleteMsg',write:true});const r=await f.invoke({arguments:[[12345,'old-string-id']]});assert.equal(r.ok,true);assert.deepEqual(JSON.parse(f.requests[0].init.body),[12345,'old-string-id']);
  const invalid=await f.invoke({arguments:[[9007199254740992]]});assert.equal(invalid.error.code,'INVALID_WEB_ARGUMENTS');assert.equal(f.requests.length,1);
});
