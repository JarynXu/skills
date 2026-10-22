// 此函数在客户端主进程执行。请求、回调与取消由客户端主进程中的一个句柄负责。
function startClientDownload(options){
  const electron=process.mainModule.require('electron'),net=electron.net,session=electron.webContents.fromId(options.webContentsId).session;
  let request,timer,outcome,resolveResult,redirects=0;
  const promise=new Promise(resolve=>{resolveResult=resolve});
  const failure=(code,message,details)=>({ok:false,error:{code,message,...(details?{details}:{})}});
  const on=(emitter,event,handler)=>emitter.on(event,handler);
  const finish=(result,abort=true)=>{
    if(outcome)return;outcome=result;clearTimeout(timer);
    if(abort&&request)request.abort();resolveResult(outcome);
  };
  const validAddress=address=>{
    const url=new URL(address);
    if(url.username||url.password||!options.allowedOrigins.includes(url.origin))throw Error('Unregistered file origin');
    return url;
  };
  try{
    const url=validAddress(options.url);
    request=net.request({url:url.href,method:'GET',session,credentials:'include',redirect:'manual'});
    // 自有请求保留 error 监听；完成后的迟到 error 不再改变结果。请求与闭包由运行时回收。
    on(request,'error',()=>finish(failure('WEB_DOWNLOAD_FAILED','The client file request failed.')));
    on(request,'abort',()=>finish(failure('WEB_DOWNLOAD_ABORTED','The client file request was aborted.'),false));
    on(request,'login',(_information,callback)=>{callback();finish(failure('WEB_DOWNLOAD_AUTHENTICATION','The file service requires authentication.'))});
    on(request,'redirect',(_status,method,address)=>{
      try{if(method!=='GET'||++redirects>5)throw Error('Invalid redirect');validAddress(address);request.followRedirect()}
      catch{finish(failure('WEB_DOWNLOAD_REDIRECT','The file redirect left its registered origins, method or redirect limit.'))}
    });
    on(request,'response',response=>{
      if(response.statusCode!==200){finish(failure('WEB_DOWNLOAD_FAILED','The file service returned HTTP '+response.statusCode+'.',{httpStatus:response.statusCode,downloadOrigin:url.origin}));return}
      const headers=response.headers,header=name=>Array.isArray(headers[name])?headers[name].join(','):headers[name];
      const type=String(header('content-type')||''),disposition=String(header('content-disposition')||''),expected=Number(header('content-length'));
      if(type.includes('json')&&!/attachment/i.test(disposition)){finish(failure('WEB_DOWNLOAD_FAILED','The file service returned JSON without an attachment.'));return}
      if(expected>options.maxBytes){finish(failure('WEB_RESULT_LIMIT','The downloaded file exceeds its size limit.'));return}
      const chunks=[];let length=0;
      on(response,'error',()=>finish(failure('WEB_DOWNLOAD_FAILED','The file response failed.')));
      on(response,'aborted',()=>finish(failure('WEB_DOWNLOAD_ABORTED','The file response was interrupted.')));
      on(response,'data',chunk=>{
        if(outcome)return;
        try{const bytes=Buffer.from(chunk);length+=bytes.length;if(length>options.maxBytes)finish(failure('WEB_RESULT_LIMIT','The downloaded file exceeds its size limit.'));else chunks.push(bytes)}
        catch{finish(failure('WEB_DOWNLOAD_FAILED','The file response contained invalid binary data.'))}
      });
      on(response,'end',()=>{
        if(Number.isFinite(expected)&&expected!==length){finish(failure('WEB_DOWNLOAD_FAILED','The downloaded byte count differs from Content-Length.'));return}
        finish({ok:true,binary:{base64:Buffer.concat(chunks,length).toString('base64'),bytes:length}},false);
      });
    });
    timer=setTimeout(()=>finish(failure('WEB_DOWNLOAD_TIMEOUT','The file request exceeded its deadline.')),options.timeoutMs);
    request.end();
  }catch{finish(failure('WEB_DOWNLOAD_CONTRACT','The native download connection or origin is unavailable.'))}
  return {promise,cancel:()=>finish(failure('WEB_DOWNLOAD_ABORTED','The owned download was cancelled.'))};
}
module.exports={startClientDownload};
