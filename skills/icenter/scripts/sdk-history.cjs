const { ClientError } = require('./cdp.cjs');
const { withMessageOrigin } = require('./message-origin.cjs');
const { withMessageContent } = require('./message-content.cjs');
const transferStates = require('./sdk-contracts.json').enums['14ce.P'].values;

// 按明确聊天及消息锚点读取本机历史，不改变当前聊天或已读状态。
async function readHistory(session,{chatId,unionId='',limit=50,beforeId=''}={}) {
  if(typeof chatId!=='string'||!chatId||typeof unionId!=='string'||!Number.isInteger(limit)||limit<1||limit>200||typeof beforeId!=='string'||beforeId.length>256||/[\r\n\u0000]/u.test(beforeId)) throw new ClientError('INVALID_ARGUMENT','An observed chat, 1..200 message limit and optional prior message ID are required.');
  const fields={chatRoomUri:chatId,unionID:unionId,maxMessageNum:limit,pullType:{$enum:'14ce.d',member:'up'},...(beforeId?{boundaryMsgID:beforeId}:{})};
  const reply=await session.invoke('messages','getMessagesForChatroom',[{$type:'d88a.H',arguments:[],fields}],{apply:true,
    fields:['success','chatRoomUri','messageList.msgId','messageList.data_owner','messageList.chatRoomUri','messageList.sendUri','messageList.time','messageList.msgType','messageList.content','messageList.msgTransStatus','end']});
  const raw=reply.result;
  if(raw?.success!==1||raw.chatRoomUri!==chatId||!Array.isArray(raw.messageList))throw new ClientError('SDK_QUERY_FAILED','The client did not confirm the requested history scope.');
  if(raw.messageList.length>limit||new Set(raw.messageList.map(message=>message.msgId)).size!==raw.messageList.length)throw new ClientError('SDK_QUERY_FAILED','The history count or message identities differ from the request.');
  const messages=raw.messageList.map(message=>{
    if(message.data_owner!==session.accountId||message.chatRoomUri!==chatId||typeof message.msgId!=='string'||!message.msgId||typeof message.content!=='string')throw new ClientError('MESSAGE_SCOPE_MISMATCH','A history message belongs to another scope or has invalid content.');
    const status=message.msgTransStatus,transfer=status===transferStates.Success?'confirmed':status===transferStates.Failed?'failed':status===transferStates.ing?'pending':status===transferStates.Init?'initial':'unknown';
    return withMessageContent(withMessageOrigin({id:message.msgId,senderId:message.sendUri,clientTime:message.time,clientType:message.msgType,text:message.content,transfer,clientTransferStatus:status}));
  });
  return {accountId:session.accountId,chatId,coverage:'local-client-history',messages,returnedCount:messages.length,requestedLimit:limit,beforeId:beforeId||null,clientEnd:raw.end,complete:false,transport:'client-sdk'};
}
module.exports={readHistory};
