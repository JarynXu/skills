const fs=require('node:fs/promises');
const path=require('node:path');
const {ClientError}=require('./cdp.cjs');

async function downloadSdkFile(session,{chatId,messageId,outputPath,apply=false,timeoutMs=15000}){
  if(typeof chatId!=='string'||!chatId||typeof messageId!=='string'||!messageId||typeof outputPath!=='string'||!path.isAbsolute(outputPath)||typeof apply!=='boolean'||!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>55000)throw new ClientError('INVALID_ARGUMENT','An observed chat, message ID, absolute output, boolean apply and supported timeout are required.');
  outputPath=path.normalize(outputPath);
  const metadata=await session.invoke('messages','queryMsgByMsgIdList',[[{$type:'d88a.Lb',arguments:[messageId],fields:{}}]],{apply:true,view:'file-message-list'});
  const files=metadata.result?.messages;
  if(!Array.isArray(files)||files.length!==1||files[0].messageId!==messageId||files[0].chatId!==chatId||files[0].accountId!==session.accountId||!files[0].fileName)throw new ClientError('MESSAGE_SCOPE_MISMATCH','A unique file message in the requested scope is required.');
  const plan={accountId:session.accountId,chatId,messageId,fileName:files[0].fileName,outputPath,transport:'client-sdk'};
  if(!apply)return {state:'preview',...plan};
  try{await fs.writeFile(outputPath,'',{flag:'wx'});}catch(error){throw new ClientError(error.code==='EEXIST'?'OUTPUT_EXISTS':'OUTPUT_UNAVAILABLE','A new writable output file is required.',{outputPath,cause:error.code});}
  try{
    const reply=await session.invoke('messages','downLoadMessageAttachs',[{$enum:'14ce.n',member:'TapFile'},chatId,messageId,'',outputPath,null,null,null,null,null,timeoutMs],{apply:true,view:'file-message'});
    const file=reply.result;
    if(file?.messageId!==messageId||file.chatId!==chatId||file.accountId!==session.accountId||file.fileTransferred!==true||file.filePath!==outputPath)throw new ClientError('DOWNLOAD_UNCONFIRMED','The client did not confirm the requested file and output path.');
    const handle=await fs.open(outputPath,'r');
    try{const stat=await handle.stat();if(!stat.isFile())throw new ClientError('DOWNLOAD_UNCONFIRMED','The output is not a regular file.');return {state:'downloaded',...plan,bytes:stat.size};}finally{await handle.close();}
  }catch(error){throw new ClientError('DOWNLOAD_UNKNOWN','The output may have changed; reconcile the file and original message without overwriting it.',{...plan,cause:error.code||error.message});}
}
module.exports={downloadSdkFile};
