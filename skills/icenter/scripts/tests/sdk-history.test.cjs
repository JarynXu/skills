const test=require('node:test');
const assert=require('node:assert/strict');
const {readHistory}=require('../sdk-history.cjs');
const {markAutomation}=require('../message-origin.cjs');
const accountId='sip:owner@example.test',chatId='sip:peer@example.test';
const message=(extra={})=>({msgId:'message',data_owner:accountId,chatRoomUri:chatId,sendUri:chatId,time:'20261022000100',msgType:1,content:'answer',msgTransStatus:3,...extra});
function client(reply){return {accountId,invoke:async(service,method,args,options)=>{
  assert.equal(service,'messages');assert.equal(method,'getMessagesForChatroom');assert.equal(args[0].$type,'d88a.H');assert.equal(args[0].fields.chatRoomUri,chatId);assert.equal(options.apply,true);
  return {result:reply};
}};}
test('历史接口保留范围、客户端结束标志和来源，不推断完整历史',async()=>{
  const text=markAutomation('answer'),result=await readHistory(client({success:1,chatRoomUri:chatId,messageList:[message({content:text})],end:0}),{chatId,limit:2,beforeId:'anchor'});
  assert.equal(result.coverage,'local-client-history');assert.equal(result.complete,false);assert.equal(result.clientEnd,0);assert.equal(result.beforeId,'anchor');
  assert.equal(result.messages[0].text,text);assert.equal(result.messages[0].origin.kind,'automation-marked');assert.equal(result.messages[0].transfer,'confirmed');
});
test('历史查询失败、范围变化、重复 ID 和超量结果不转成成功空窗口',async()=>{
  for(const reply of [{success:0,chatRoomUri:chatId,messageList:[]},{success:1,chatRoomUri:'other',messageList:[]},{success:1,chatRoomUri:chatId,messageList:[message({data_owner:'other'})]},
    {success:1,chatRoomUri:chatId,messageList:[message(),message()]},{success:1,chatRoomUri:chatId,messageList:[message(),message({msgId:'second'}),message({msgId:'third'})]}]){
    await assert.rejects(readHistory(client(reply),{chatId,limit:2}));
  }
  assert.equal((await readHistory(client({success:1,chatRoomUri:chatId,messageList:[],end:1}),{chatId})).messages.length,0);
});
test('非法历史参数不访问 SDK',async()=>{
  const session={accountId,invoke:()=>assert.fail('Invalid input must not reach the client.')};
  for(const options of [{chatId,limit:0},{chatId,limit:201},{chatId,beforeId:'bad\n'},{chatId:''}])await assert.rejects(readHistory(session,options),{code:'INVALID_ARGUMENT'});
});
