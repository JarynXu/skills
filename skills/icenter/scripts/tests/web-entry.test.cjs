const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {createHash}=require('node:crypto');
const {webPageOperation}=require('../web-page.cjs');
const {SdkSession}=require('../sdk.cjs');
const fs=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const sha=value=>createHash('sha256').update(String(value)).digest('hex');

function fixture(options={}){
  const owned=[],existing={id:'native-frame',src:'https://app.example.test/user-work'},timers=new Set(),state={userInfo:{userId:'sip:owner@example.test'}};
  const document={querySelector:()=>({__vue_app__:{config:{globalProperties:{$store:{state}}}}}),getElementById:id=>id==='native-frame'?existing:null,createElement:()=>{const frame={style:{},remove(){this.removed=true}};return frame},body:{appendChild:frame=>owned.push(frame)}};
  const originalLookup=document.getElementById;
  const context=vm.createContext({document,URL,process:{argv:['IS_MAIN_WINDOW'],resourcesPath:'/fixture'},require:name=>name.endsWith('package.json')?{version:'12.1.0'}:require(name),setTimeout:(fn,ms)=>{const timer=setTimeout(fn,ms);timers.add(timer);return timer},clearTimeout:timer=>{timers.delete(timer);clearTimeout(timer)}});
  const getCurrentWebContents=()=>({mainFrame:{get framesInSubtree(){return owned.filter(frame=>!frame.removed).map(frame=>({name:frame.name,url:frame.src,executeJavaScript:async()=>options.applicationFailure?{ok:false,error:{code:'WEB_ACCOUNT_CHANGED',message:'Mismatch',details:{phase:'not-invoked'}}}:{ok:true,value:{state:'returned'}}}))}}});
  context.remote={BrowserWindow:class{constructor(){throw Error('Native entry must not open a second window')}},getCurrentWebContents};
  vm.runInContext(`
    window=globalThis;
    const entry={initialize(){document.getElementById('native-frame').src='https://app.example.test/connected/';${options.entryFailure?"throw Error('entry failed');":''}}};
    const factory=function entryFactory(){};
    const loader=id=>id==='entry'?{default:{methods:entry}}:{};loader.m={entry:factory};loader.c={daba:{exports:remote}};loader.e=async()=>{};
    const chunks=[];chunks.push=payload=>{payload[1][Object.keys(payload[1])[0]](null,null,loader);return Array.prototype.push.call(chunks,payload)};window.webpackJsonp=chunks;
  `,context);
  const contract={origin:'https://app.example.test',path:'/connected/',method:{effect:'read',transport:{}},entry:{kind:'native-frame',chunk:'fixture-chunk',moduleId:'entry',method:'initialize',frameId:'native-frame',hash:sha(vm.runInContext('entry.initialize',context)),factoryHash:sha(vm.runInContext('factory',context))}};
  const call=async()=>JSON.parse(JSON.stringify(await vm.runInContext('('+webPageOperation.toString()+')(...JSON.parse('+JSON.stringify(JSON.stringify(['invoke',{accountId:'sip:owner@example.test',app:'fixture',method:'query',arguments:[],apply:true},contract,'async function(){return {ok:true,value:{state:"returned"}}}']))+'))',context)));
  return {call,owned,existing,document,originalLookup,context,timers};
}

test('native initialization writes to an owned frame and preserves an existing application frame',async()=>{
  const f=fixture(),r=await f.call();assert.equal(r.ok,true);assert.equal(f.existing.src,'https://app.example.test/user-work');assert.equal(f.owned.length,1);assert.equal(f.owned[0].removed,true);assert.equal(f.document.getElementById,f.originalLookup);assert.equal(Object.hasOwn(f.document,'getElementById'),true);assert.equal(f.context.__codexIcenterSdkCall,undefined);assert.equal(f.timers.size,0);
});
test('a native entry exception restores DOM lookup and releases only its own resources',async()=>{
  const f=fixture({entryFailure:true}),r=await f.call();assert.equal(r.ok,false);assert.equal(r.error.details.phase,'not-invoked');assert.equal(f.document.getElementById,f.originalLookup);assert.equal(f.existing.src,'https://app.example.test/user-work');assert.equal(f.owned[0].removed,true);assert.equal(f.context.__codexIcenterSdkCall,undefined);assert.equal(f.timers.size,0);
});
test('application identity rejection releases the native frame and retains the rejected phase',async()=>{
  const f=fixture({applicationFailure:true}),r=await f.call();assert.equal(r.error.code,'WEB_ACCOUNT_CHANGED');assert.equal(r.error.details.phase,'not-invoked');assert.equal(f.owned[0].removed,true);assert.equal(f.existing.src,'https://app.example.test/user-work');
});
test('binary download creates a new file and refuses an existing output before evaluation',async()=>{
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),'icenter-web-download-test-')),file=path.join(directory,'result.bin');let calls=0;
  try{
    const bytes=Buffer.from([0,255,5,16]);
    const sdk=new SdkSession({evaluate:async()=>{calls++;return {ok:true,value:{state:'binary-returned',binary:{base64:bytes.toString('base64'),bytes:bytes.length},httpStatus:200}}}},{accountId:'sip:owner@example.test'});
    const method=Object.entries(SdkSession.webCatalog().apps.drive.methods).find(([,method])=>method.response==='binary')[0];
    const result=await sdk.invokeWeb('drive',method,[{path:{fileKey:'original-id'}}],{apply:true,outputFile:file});assert.equal(result.file.sha256,createHash('sha256').update(bytes).digest('hex'));assert.deepEqual(await fs.readFile(file),bytes);assert.equal(result.binary,undefined);
    await assert.rejects(sdk.invokeWeb('drive',method,[{}],{apply:true,outputFile:file}),{code:'WEB_OUTPUT_EXISTS'});assert.equal(calls,1);
  }finally{await fs.unlink(file).catch(error=>{if(error.code!=='ENOENT')throw error});await fs.rmdir(directory)}
});
test('model metadata is detached and invalid binary output never reaches the client',async()=>{
  const type=SdkSession.webType('drive','LibraryFileQueryEx');type.schema.properties.libraryId.type='other';assert.notEqual(SdkSession.webType('drive','LibraryFileQueryEx').schema.properties.libraryId.type,'other');
  const sdk=new SdkSession({evaluate:()=>{throw Error('Unexpected evaluation')}},{accountId:'sip:owner@example.test'}),method=Object.entries(SdkSession.webCatalog().apps.drive.methods).find(([,method])=>method.response==='binary')[0];
  await assert.rejects(sdk.invokeWeb('drive',method,[{}],{apply:true}),{code:'INVALID_WEB_OUTPUT'});
});
test('an unconsumed internal download address never leaves the public SDK',async()=>{
  const sdk=new SdkSession({evaluate:async()=>({ok:true,value:{state:'download-ready',binaryHandoff:{url:'https://files.example.test/private?token=private'}}})},{accountId:'sip:owner@example.test'});
  await assert.rejects(sdk.invokeWeb('drive','personLibrary.getCapacity',[],{apply:true}),{code:'WEB_INTERNAL_RESULT'});
});
