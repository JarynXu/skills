const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {EventEmitter}=require('node:events');
const {startClientDownload}=require('../web-download.cjs');

function fixture(scenario,overrides={}){
  const timers=new Set(),requests=[];let activeRedirect=false;
  const session={borrowed:true};
  const net={request(options){
    const request=new EventEmitter();request.options=options;request.aborts=0;request.followed=0;
    request.end=()=>queueMicrotask(()=>scenario(request,{redirect(address){activeRedirect=true;request.emit('redirect',302,'GET',address);activeRedirect=false}}));
    request.abort=()=>{request.aborts++;request.emit('abort');request.emit('close')};
    request.followRedirect=()=>{assert.equal(activeRedirect,true);request.followed++};requests.push(request);return request;
  }};
  const context=vm.createContext({URL,Buffer,Promise,process:{mainModule:{require:name=>{assert.equal(name,'electron');return {net,webContents:{fromId:id=>{assert.equal(id,42);return {session}}}}}}},setTimeout:(fn,ms)=>{const timer=setTimeout(fn,ms);timers.add(timer);return timer},clearTimeout:timer=>{clearTimeout(timer);timers.delete(timer)}});
  const options={webContentsId:42,url:'https://files.example.test/file',allowedOrigins:['https://files.example.test'],maxBytes:100,timeoutMs:100,...overrides};
  const handle=vm.runInContext('('+startClientDownload.toString()+')('+JSON.stringify(options)+')',context);
  return {handle,requests,timers,session};
}
function response(request,{headers={},status=200,bytes=Buffer.from([0,255,18])}={}){
  const incoming=new EventEmitter();incoming.statusCode=status;incoming.headers=headers;request.emit('response',incoming);incoming.emit('data',bytes);incoming.emit('end');request.emit('close');return incoming;
}

test('native response reads string and array header representations without changing bytes',async()=>{
  for(const headers of [{'content-length':'3','content-type':'application/octet-stream'},{'content-length':['3'],'content-type':['application/octet-stream']}]){
    const f=fixture(request=>response(request,{headers})),result=await f.handle.promise;assert.equal(result.ok,true);assert.deepEqual(Buffer.from(result.binary.base64,'base64'),Buffer.from([0,255,18]));assert.equal(f.timers.size,0);assert.equal(f.requests[0].options.session,f.session);
  }
});
test('an early close and a late error cannot lose response events or become an uncaught exception',async()=>{
  const f=fixture(request=>{request.emit('close');response(request);request.emit('error',Error('late transport notification'))});
  const result=await f.handle.promise;assert.equal(result.ok,true);assert.equal(f.timers.size,0);assert.ok(f.requests[0].listenerCount('error')>0);
});
test('allowed redirects are followed synchronously in the native request callback',async()=>{
  const f=fixture((request,events)=>{events.redirect('https://files.example.test/next');response(request)});assert.equal((await f.handle.promise).ok,true);assert.equal(f.requests[0].followed,1);
});
test('a rejected redirect aborts the owned request and retains its error listener',async()=>{
  const f=fixture((request,events)=>{events.redirect('https://other.example.test/file');request.emit('error',Error('Redirect was cancelled'))});
  const result=await f.handle.promise;assert.equal(result.error.code,'WEB_DOWNLOAD_REDIRECT');assert.equal(f.requests[0].followed,0);assert.equal(f.requests[0].aborts,1);assert.equal(f.timers.size,0);
});
test('header and streaming size limits reject the file without returning partial bytes',async()=>{
  for(const headers of [{'content-length':'101'},{}]){
    const f=fixture(request=>response(request,{headers,bytes:Buffer.alloc(101)})),result=await f.handle.promise;assert.equal(result.error.code,'WEB_RESULT_LIMIT');assert.equal(result.binary,undefined);assert.equal(f.timers.size,0);
  }
});
test('a timeout cancels a stalled request and a duplicate cancel preserves the result',async()=>{
  const f=fixture(()=>{},{timeoutMs:20});const result=await f.handle.promise;assert.equal(result.error.code,'WEB_DOWNLOAD_TIMEOUT');f.handle.cancel();assert.equal(f.requests[0].aborts,1);assert.equal(f.timers.size,0);
});
test('JSON attachments are files; a JSON service response is a visible failure',async()=>{
  const accepted=fixture(request=>response(request,{headers:{'content-type':'application/json','content-disposition':'attachment; filename=data.json'},bytes:Buffer.from('{}')}));assert.equal((await accepted.handle.promise).ok,true);
  const denied=fixture(request=>response(request,{headers:{'content-type':'application/json'},bytes:Buffer.from('{}')}));assert.equal((await denied.handle.promise).error.code,'WEB_DOWNLOAD_FAILED');
});
test('an unregistered initial origin sends no request',async()=>{
  const f=fixture(()=>{},{url:'https://other.example.test/file'});assert.equal((await f.handle.promise).error.code,'WEB_DOWNLOAD_CONTRACT');assert.equal(f.requests.length,0);assert.equal(f.timers.size,0);
});
