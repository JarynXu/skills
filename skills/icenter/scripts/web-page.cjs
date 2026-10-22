// 主客户端负责账户核对和应用连接。认证材料由原生入口使用，不返回给调用方。
async function webPageOperation(operation,input,contract,applicationSource,downloadSource){
  let phase='not-invoked',ownedWindow=null,ownedFrame=null,ownedDownload=null,token=null,timer;
  const fail=(code,message)=>{throw Object.assign(new Error(message),{code})};
  const state=()=>document.querySelector('#app')?.__vue_app__?.config?.globalProperties?.$store?.state;
  const check=()=>{
    if(typeof process==='undefined'||!process.argv.includes('IS_MAIN_WINDOW'))fail('WRONG_WINDOW','Expected the main iCenter window.');
    if(require(process.resourcesPath+'/app.asar/package.json').version!=='12.1.0')fail('UNSUPPORTED_VERSION','The application bridge requires iCenter 12.1.0.');
    if(state()?.userInfo?.userId!==input.accountId)fail('ACCOUNT_CHANGED','The client account changed.');
  };
  const hash=value=>require('crypto').createHash('sha256').update(String(value)).digest('hex');
  const release=()=>{
    ownedDownload?.cancel();
    ownedFrame?.remove();
    if(ownedWindow&&!ownedWindow.isDestroyed())ownedWindow.destroy();
    if(token&&window.__codexIcenterSdkCall===token)delete window.__codexIcenterSdkCall;
  };
  const downloadFile=async(remote,address)=>{
    const allowed=contract.method.download?.allowedOrigins;
    if(contract.method.response!=='download-link'||!Array.isArray(allowed)||typeof downloadSource!=='string')fail('WEB_DOWNLOAD_CONTRACT','No download contract is registered.');
    const start=remote.require('vm').runInThisContext('('+downloadSource+')');
    ownedDownload=start({webContentsId:remote.getCurrentWebContents().id,url:address,allowedOrigins:allowed,timeoutMs:input.requestTimeoutMs,maxBytes:16*1024*1024});
    const result=await ownedDownload.promise;ownedDownload=null;
    if(!result?.ok)throw Object.assign(Error(result?.error?.message||'The client download failed.'),result?.error||{code:'WEB_DOWNLOAD_FAILED'});
    return Buffer.from(result.binary.base64,'base64');
  };
  const validate=(value,budget,depth=0)=>{
    if(++budget.nodes>10000||depth>25)fail('INVALID_WEB_ARGUMENTS','Application input exceeds the supported size.');
    if(typeof value==='string'&&value.includes('\u0000'))fail('INVALID_WEB_ARGUMENTS','NUL is not permitted in application strings.');
    if(value===null||['string','boolean'].includes(typeof value))return;
    if(typeof value==='number'&&Number.isFinite(value)&&(!Number.isInteger(value)||Number.isSafeInteger(value)))return;
    if(Array.isArray(value)){value.forEach(item=>validate(item,budget,depth+1));return}
    if(!value||typeof value!=='object')fail('INVALID_WEB_ARGUMENTS','Application arguments must be JSON data; represent 64-bit identifiers as strings.');
    for(const key of Object.keys(value)){if(['__proto__','prototype','constructor'].includes(key))fail('INVALID_WEB_ARGUMENTS','Reserved object keys are not permitted.');validate(value[key],budget,depth+1)}
  };
  const prepareFiles=value=>{
    let total=0;
    const visit=item=>{
      if(!item||typeof item!=='object')return item;
      if(Object.hasOwn(item,'$icenterFile')){
        const file=item.$icenterFile;
        if(Object.keys(item).length!==1||!file||typeof file!=='object'||Object.keys(file).some(key=>!['path','name','type'].includes(key))||typeof file.path!=='string'||!require('path').isAbsolute(file.path))fail('INVALID_WEB_FILE','Provide an explicit absolute file path.');
        const fs=require('fs'),stat=fs.statSync(file.path);
        if(!stat.isFile()||stat.size>16*1024*1024||(total+=stat.size)>32*1024*1024)fail('INVALID_WEB_FILE','Each file must be at most 16 MiB; one call accepts at most 32 MiB.');
        const name=file.name||require('path').basename(file.path);
        if(typeof name!=='string'||!name||/[\\/\u0000]/.test(name)||file.type!==undefined&&typeof file.type!=='string')fail('INVALID_WEB_FILE','A file name and MIME type must be plain strings.');
        const bytes=fs.readFileSync(file.path);if(bytes.length>16*1024*1024)fail('INVALID_WEB_FILE','The selected file grew beyond 16 MiB.');
        return {$icenterFile:{name,type:file.type||'application/octet-stream',base64:bytes.toString('base64')}};
      }
      if(Array.isArray(item))return item.map(visit);
      return Object.fromEntries(Object.entries(item).map(([key,child])=>[key,visit(child)]));
    };
    return visit(value);
  };
  try{
    check();
    if(!['describe','invoke'].includes(operation)||typeof applicationSource!=='string')fail('UNKNOWN_OPERATION','Unsupported application operation.');
    if(!/^sip:([^@]+)@[^@]+$/.test(input.accountId))fail('WEB_IDENTITY_UNSUPPORTED','This application requires a SIP account with an employee identifier.');
    input.employeeId=input.accountId.match(/^sip:([^@]+)@[^@]+$/)[1];
    input.requestTimeoutMs??=contract.method.response==='sse'?30000:7000;
    if(!Number.isInteger(input.requestTimeoutMs)||input.requestTimeoutMs<1000||input.requestTimeoutMs>45000)fail('INVALID_TIMEOUT','Application timeout must be 1000..45000 milliseconds.');
    if(operation==='invoke'){
      if(input.view!==undefined&&(input.view!=='shape'||input.fields!==undefined||['binary','download-link'].includes(contract.method.response)))fail('INVALID_WEB_VIEW','shape is a JSON response view and cannot be combined with selected fields or binary downloads.');
      if(!Array.isArray(input.arguments)||input.arguments.length>16)fail('INVALID_WEB_ARGUMENTS','Provide at most 16 application arguments.');
      validate(input.arguments,{nodes:0});
      const first=input.arguments[0],transport=contract.method.transport;
      if(transport.query==='user-id'&&(input.arguments.length!==1||typeof first!=='string'||!first))fail('INVALID_WEB_ARGUMENTS','The user lookup requires one observed employee identifier.');
      if(transport.query==='first-argument'&&(input.arguments.length!==1||!first||Array.isArray(first)||typeof first!=='object'||!Number.isInteger(first.pageSize)||first.pageSize<1||first.pageSize>200||!Number.isInteger(first.startIndex)||first.startIndex<1||typeof first.keyword!=='string'))fail('INVALID_WEB_ARGUMENTS','The search requires pageSize 1..200, a positive startIndex and keyword text.');
      if(input.app==='sms'&&input.method==='smsDeleteMsg'&&(input.arguments.length!==1||!Array.isArray(first)||!first.length||first.length>200||first.some(id=>!(typeof id==='string'&&id)&&!(Number.isSafeInteger(id)&&id>0))))fail('INVALID_WEB_ARGUMENTS','Deletion requires a nonempty list of observed message IDs.');
      if(input.app==='sms'&&input.method==='smsSendService'&&(input.arguments.length!==2||!first||Array.isArray(first)||typeof first!=='object'||typeof first.content!=='string'||!first.content.trim()||![0,1].includes(first.signatureType)||!Array.isArray(first.receiverInfo)||!first.receiverInfo.length||first.receiverInfo.length>20||first.receiverInfo.some(receiver=>typeof receiver?.mobileReceiver!=='string'||!receiver.mobileReceiver)||!['zh_CN','en_US'].includes(input.arguments[1])))fail('INVALID_WEB_ARGUMENTS','Sending requires content, signatureType 0/1, 1..20 explicit receivers and zh_CN/en_US.');
      if(input.fields!==undefined){
        if(!Array.isArray(input.fields)||!input.fields.length||input.fields.length>40||input.fields.some(field=>typeof field!=='string'||field.split('.').some(part=>!part||['__proto__','prototype','constructor'].includes(part)||!contract.businessFields?.includes(part)&&/token|password|credential|secret|private.?key|authorization|cookie/i.test(part))))fail('INVALID_WEB_FIELDS','Select explicit non-credential own-property paths.');
        for(let i=0;i<input.fields.length;i++)for(let j=i+1;j<input.fields.length;j++)if(input.fields[i]===input.fields[j]||input.fields[i].startsWith(input.fields[j]+'.')||input.fields[j].startsWith(input.fields[i]+'.'))fail('INVALID_WEB_FIELDS','Selected paths overlap.');
      }
      if(!input.apply)return {ok:true,value:{state:'preview',app:input.app,method:input.method,accountId:input.accountId,arguments:input.arguments,fields:input.fields,validation:contract.method.validation,runtimeContractVerified:false,applicationWindowOpened:false,businessOutcome:'not-inferred'}};
      input.arguments=prepareFiles(input.arguments);
    }
    if(window.__codexIcenterSdkCall)fail('SDK_BUSY','Another client API operation is in flight.');
    token='codex_web_owner_'+Date.now()+'_'+Math.random().toString(16).slice(2);window.__codexIcenterSdkCall=token;
    let loader;const payload=[[],{[token]:(_m,_e,load)=>{loader=load}},[[token]]];
    try{window.webpackJsonp.push(payload)}finally{if(loader){delete loader.c[token];delete loader.m[token];loader.s=0}const at=window.webpackJsonp.indexOf(payload);if(at>=0)window.webpackJsonp.splice(at,1)}
    const remote=loader?.c.daba?.exports;
    if(typeof remote?.BrowserWindow!=='function')fail('WEB_CONNECTION_UNAVAILABLE','The client browser connection is unavailable.');
    const entry=contract.entry;
    const work=async()=>{
      let frame;
      if(entry?.kind==='native-frame'){
        await loader.e(entry.chunk);
        if(hash(loader.m[entry.moduleId])!==entry.factoryHash)fail('WEB_CONTRACT_CHANGED','The native application entry changed.');
        const fn=loader(entry.moduleId)?.default?.methods?.[entry.method];
        if(typeof fn!=='function'||hash(fn)!==entry.hash||fn.constructor.name==='AsyncFunction')fail('WEB_CONTRACT_CHANGED','The native entry is not the registered synchronous method.');
        const args=[];
        if(entry.urlSetting){const url=loader('8c9e').g[entry.urlSetting],parsed=new URL(url);if(parsed.origin!==contract.origin||parsed.pathname!==contract.path)fail('WEB_ENTRY_ORIGIN','The native entry points to a different application.');args.push(url)}
        ownedFrame=document.createElement('iframe');ownedFrame.id=token;ownedFrame.name=token;ownedFrame.style.display='none';ownedFrame.sandbox='allow-scripts allow-same-origin';document.body.appendChild(ownedFrame);
        // 同步入口调用中的固定 ID 查询指向自有 frame；已有节点不参与这次初始化。
        const previous=Object.getOwnPropertyDescriptor(document,'getElementById'),getElement=document.getElementById;
        try{
          Object.defineProperty(document,'getElementById',{configurable:true,writable:true,value:function(id){return id===entry.frameId?ownedFrame:getElement.call(this,id)}});
          fn.apply({serviceName:'iCenterClient',shouldRefrashed:false,isUseSchedule:true,cardDetailflag:false,logger:{info(){}}},args);
        }finally{if(previous)Object.defineProperty(document,'getElementById',previous);else delete document.getElementById}
        for(let attempt=0;attempt<60;attempt++){
          check();const frames=remote.getCurrentWebContents().mainFrame.framesInSubtree.filter(candidate=>candidate.name===token);
          if(frames.length===1){const url=new URL(frames[0].url);if(url.origin===contract.origin&&url.pathname===contract.path){frame=frames[0];break}}
          await new Promise(resolve=>setTimeout(resolve,100));
        }
        if(!frame)fail('WEB_APP_LOAD_FAILED','The native application frame did not load.');
      }else{
        ownedWindow=new remote.BrowserWindow({show:false,width:1000,height:800,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,backgroundThrottling:false,session:remote.getCurrentWebContents().session}});
        const url=contract.origin+contract.path+(contract.route?'#'+contract.route:'');
        try{await ownedWindow.loadURL(url)}catch{fail('WEB_APP_LOAD_FAILED','The application page did not load.')}
      }
      check();phase='application-running';
      const script='('+applicationSource+')(...JSON.parse('+JSON.stringify(JSON.stringify([operation,input,contract]))+'))';
      let response=await(frame?frame.executeJavaScript(script):ownedWindow.webContents.executeJavaScript(script));
      if(response?.ok&&response.value?.binaryHandoff){
        phase='download-running';
        const bytes=await downloadFile(remote,response.value.binaryHandoff.url);
        // remote 返回对象的 delete 不保证修改远端对象。外部结果重新构造，不包含内部 URL。
        response={ok:true,value:{state:'binary-returned',app:input.app,method:input.method,httpStatus:response.value.httpStatus,binary:{base64:bytes.toString('base64'),bytes:bytes.length},businessOutcome:'not-inferred'}};
      }
      phase=response?.ok?'completed':response?.error?.details?.phase||'application-running';
      check();return response;
    };
    const response=await Promise.race([work(),new Promise((_,reject)=>{timer=setTimeout(()=>{release();reject(Object.assign(Error('The application call exceeded its connection deadline.'),{code:'WEB_CONNECTION_TIMEOUT'}))},input.requestTimeoutMs+10000)})]);
    if(!response||typeof response.ok!=='boolean')fail('INVALID_CLIENT_RESULT','The application returned no structured result.');
    if(response.ok)response.value.accountId=input.accountId;
    return response;
  }catch(error){return {ok:false,error:{code:error.code||'WEB_CONNECTION_FAILED',message:error.code?error.message:'The application connection failed.',details:{...error.details,phase}}}}
  finally{clearTimeout(timer);release()}
}
module.exports={webPageOperation};
