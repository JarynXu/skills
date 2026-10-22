const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const {downloadSdkFile}=require('../sdk-attachments.cjs');
const accountId='owner',chatId='peer',messageId='message';
async function output(t){
  const parent=path.resolve(os.tmpdir()),root=await fs.mkdtemp(path.join(parent,'icenter-sdk-attachment-'));
  t.after(async()=>{assert.equal(path.dirname(root),parent);assert.ok(path.basename(root).startsWith('icenter-sdk-attachment-'));await fs.rm(root,{recursive:true,force:true});});
  return path.join(root,'output.bin');
}
function fixture(download){
  const calls=[];
  return {accountId,calls,invoke:async(service,method,args,options)=>{
    calls.push({service,method,args,options});
    if(method==='queryMsgByMsgIdList')return {result:{messages:[{messageId,chatId,accountId,fileName:'source.bin'}]}};
    if(method==='downLoadMessageAttachs')return await download(args);
    throw Error('Unexpected operation');
  }};
}
test('SDK 下载预览不创建文件，已有输出不覆盖或发起下载',async t=>{
  const outputPath=await output(t),client=fixture(()=>assert.fail('No download expected.'));
  assert.equal((await downloadSdkFile(client,{chatId,messageId,outputPath})).state,'preview');
  await assert.rejects(fs.access(outputPath),{code:'ENOENT'});
  await fs.writeFile(outputPath,'human data');
  await assert.rejects(downloadSdkFile(client,{chatId,messageId,outputPath,apply:true}),{code:'OUTPUT_EXISTS'});
  assert.equal(await fs.readFile(outputPath,'utf8'),'human data');assert.ok(client.calls.every(call=>call.method==='queryMsgByMsgIdList'));
});
test('SDK 下载确认匹配账户、消息和路径；未知结果保留文件且不重试',async t=>{
  const outputPath=await output(t);let downloads=0;
  const client=fixture(async args=>{downloads++;await fs.writeFile(args[4],'downloaded bytes');return {result:{accountId,chatId,messageId,fileTransferred:true,filePath:args[4]}};});
  assert.equal((await downloadSdkFile(client,{chatId,messageId,outputPath,apply:true})).state,'downloaded');assert.equal(downloads,1);
  const uncertain=await output(t),failure=fixture(async args=>{downloads++;await fs.writeFile(args[4],'partial');throw Object.assign(Error('lost'),{code:'SDK_CALL_UNKNOWN'});});
  await assert.rejects(downloadSdkFile(failure,{chatId,messageId,outputPath:uncertain,apply:true}),{code:'DOWNLOAD_UNKNOWN'});
  assert.equal(await fs.readFile(uncertain,'utf8'),'partial');assert.equal(downloads,2);
});
test('SDK 下载拒绝字符串执行标志，不访问客户端',async t=>{
  const outputPath=await output(t),client={accountId,invoke:()=>assert.fail('Invalid input must not reach SDK.')};
  await assert.rejects(downloadSdkFile(client,{chatId,messageId,outputPath,apply:'false'}),{code:'INVALID_ARGUMENT'});
});
