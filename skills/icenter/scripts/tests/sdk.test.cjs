const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const { sdkPageOperation } = require('../sdk-page.cjs');
const { SdkSession } = require('../sdk.cjs');
const { ClientError } = require('../cdp.cjs');
const { clientVersion } = require('../client-version.json');
const accountId = 'sip:owner@example.test', chatId = 'sip:peer@example.test';
const digest = value => createHash('sha256').update(String(value)).digest('hex');
function fixture({ returned, action, version=clientVersion, readConfig,statSource }={}) {
  const calls = [];
  class Model { constructor(value='') { this.value=value; } }
  class QueryItem { constructor(id) { this.msgId=id; } }
  const state = { userInfo:{userId:accountId},chatInfo:{chatList:[{chatRoomUri:chatId}]} };
  class Service { async method(...args) { calls.push(args); if (action) return await action(args,state); return returned===undefined ? args : returned; } }
  const service = new Service(), loader = { c:{ service:{exports:{a:service}},models:{exports:{A:Model,E:{single:1}}},d88a:{exports:{Lb:QueryItem}},'1bb8':{exports:{a:{queryMsgByMsgIdList:async list=>({success:1,aMessagesList:list.map(item=>({msgId:item.msgId,data_owner:accountId,chatRoomUri:chatId,content:'original'}))})}}} },m:{},s:0 };
  const chunks = [], window = {webpackJsonp:chunks};
  chunks.push = entry=>{Array.prototype.push.call(chunks,entry);for(const [id,factory] of Object.entries(entry[1])){loader.m[id]=factory;loader.c[id]={};factory({}, {},loader);}};
  const context = vm.createContext({window,document:{querySelector(selector){assert.equal(selector,'#app');return {__vue_app__:{config:{globalProperties:{$store:{state}}}}};}},process:{argv:['IS_MAIN_WINDOW'],resourcesPath:'/fixture'},require:file=>file.endsWith('package.json')?{version}:file==='fs'&&(readConfig||statSource)?{promises:{readFile:readConfig,stat:statSource}}:require(file),Date,Math,Map,Set});
  vm.runInContext('globalThis.operation='+sdkPageOperation.toString(),context);
  const contract = {moduleId:'service',export:'a',method:{hash:digest(Service.prototype.method),validation:'isolated-contract'}};
  const models = {types:{'models.A':{moduleId:'models',export:'A',hash:digest(Model)},'d88a.Lb':{moduleId:'d88a',export:'Lb',hash:digest(QueryItem)}},enums:{'models.E':{moduleId:'models',export:'E',values:{single:1}}}};
  return { calls,state,window,loader,contract,models,async call(operation='invoke',input={}) {
    context.op=operation;context.input={accountId,service:'fixture',method:'method',arguments:[],...input};context.contract=contract;context.models=models;
    return JSON.parse(JSON.stringify(await vm.runInContext('operation(op,input,contract,models)',context)));
  }};
}
test('接口预览不调用服务或参数构造器，正文按数据传递',async()=>{
  const f=fixture(), result=await f.call('invoke',{arguments:['`$()你好\n',{$type:'models.A',arguments:['value'],fields:{value:'field'}}]});
  assert.equal(result.value.state,'preview');assert.equal(f.calls.length,0);assert.equal(f.window.__codexIcenterSdkCall,undefined);
  assert.equal(Object.keys(f.loader.m).length,0);
});
function fileFixture(action){
  class Message{
    constructor(id){this.msgId=id;this.data_owner=accountId;this.chatRoomUri=chatId;this.fileTransStatus=3;this.msgTransStatus=3;}
    getFileName(){return 'source.txt';}getFilePath(){return 'C:\\fixture\\source.txt';}isFileTransSuccess(){return true;}isMessageTransSuccess(){return true;}
  }
  const f=fixture({action:args=>action(args,Message),statSource:async()=>({isFile:()=>true,size:10})});
  const prototype=Object.getPrototypeOf(f.loader.c.service.exports.a);prototype.sendFileTransCardMsg=prototype.method;
  f.models.types['d88a.jb']={moduleId:'models',export:'Message',hash:digest(Message)};f.loader.c.models.exports.Message=Message;
  f.state.chatInfo.chatList[0].chatRoomType=0;
  f.send=()=>f.call('file-send',{service:'messages',method:'sendFileTransCardMsg',chatId,filePath:'C:\\fixture\\source.txt',apply:true});
  return f;
}
test('文件流程复用准备 ID，重复通知不重发，准备调用退出前保留互斥占用',async()=>{
  let finishPreparation,actualReady;const ready=new Promise(resolve=>{actualReady=resolve;});
  const f=fileFixture(async(args,Message)=>{
    if(args[6]===true){args[7](new Message('prepared-id'));args[7](new Message('prepared-id'));return await new Promise(resolve=>{finishPreparation=resolve;});}
    assert.equal(args[5],'prepared-id');actualReady();return new Message('prepared-id');
  });
  const pending=f.send();await ready;assert.equal(f.calls.length,2);assert.ok(f.window.__codexIcenterSdkCall);
  assert.equal((await f.call('invoke',{apply:true})).error.code,'SDK_BUSY');finishPreparation(null);
  const reply=await pending;assert.equal(reply.value.result.messageId,'prepared-id');assert.equal(reply.value.result.messageTransferred,true);assert.equal(f.window.__codexIcenterSdkCall,undefined);
});
test('无准备 ID 不进入实际发送，原始单阶段新文件请求在调用前拒绝',async()=>{
  const f=fileFixture(async args=>{args[7]({});return null;});
  const reply=await f.send();assert.equal(reply.error.code,'SDK_PREPARE_UNCONFIRMED');assert.equal(f.calls.length,1);
  const raw=await f.call('invoke',{service:'messages',method:'sendFileTransCardMsg',arguments:['source',chatId,{forward:false}],apply:true});
  assert.equal(raw.error.code,'SDK_FLOW_REQUIRED');assert.equal(f.calls.length,1);
});
test('公开文件发送入口要求消息与文件分别成功并保留对账状态',async()=>{
  const result=(value)=>({state:'returned',businessOutcome:'not-inferred',accountId,service:'messages',method:'sendFileTransCardMsg',result:value});
  const sessionFor=value=>new SdkSession({evaluate:async(_fn,operation,input)=>{
    assert.equal(operation,'file-send');assert.equal(input.accountId,accountId);assert.equal(input.chatId,chatId);
    return {ok:true,value:result(value)};
  }},{accountId});
  const base={chatId,accountId,messageId:'file-message',fileName:'source.txt',messageTransferred:true,fileTransferred:true,
    clientMessageStatus:3,clientFileStatus:4};
  const sent=await sessionFor(base).sendFile({chatId,filePath:'C:\\fixture\\source.txt',apply:true});
  assert.equal(sent.state,'client-confirmed');assert.equal(sent.result.fileTransferred,true);

  for(const [reply,code] of [
    [{...base,fileTransferred:false,clientFileStatus:2},'SEND_UNKNOWN'],
    [{...base,fileTransferred:false,clientFileStatus:5},'SEND_UNKNOWN'],
    [{...base,fileTransferred:false,clientFileStatus:1},'SEND_UNKNOWN'],
    [{...base,fileTransferred:false,clientFileStatus:6},'SEND_UNKNOWN'],
    [{...base,messageTransferred:false,clientMessageStatus:2},'SEND_FAILED'],
    [{...base,messageTransferred:true,clientMessageStatus:2},'SEND_UNKNOWN'],
    [{...base,messageTransferred:false,clientMessageStatus:3},'SEND_UNKNOWN'],
    [{...base,chatId:'other',messageTransferred:false,clientMessageStatus:2},'SEND_UNKNOWN'],
    [{...base,accountId:'other',messageTransferred:false,clientMessageStatus:2},'SEND_UNKNOWN'],
    [{...base,messageId:'',messageTransferred:false,clientMessageStatus:2},'SEND_UNKNOWN'],
    [{...base,fileTransferred:undefined,clientFileStatus:undefined},'SEND_UNKNOWN'],
    [undefined,'SEND_UNKNOWN'],
  ]){
    await assert.rejects(sessionFor(reply).sendFile({chatId,filePath:'C:\\fixture\\source.txt',apply:true}),error=>{
      assert.equal(error.code,code);assert.equal(error.details.accountId,accountId);assert.equal(error.details.chatId,chatId);
      if(reply){assert.equal(error.details.messageId,reply.messageId??null);assert.equal(error.details.observedAccountId,reply.accountId??null);assert.equal(error.details.observedChatId,reply.chatId??null);assert.equal(error.details.clientMessageStatus,reply.clientMessageStatus??null);assert.equal(error.details.clientFileStatus,reply.clientFileStatus??null);}
      return true;
    });
  }
});
test('执行保留默认值、DTO、枚举、原消息和回调证据',async()=>{
  const f=fixture({action:args=>{args[4]('accepted-id');return {plain:args[0],defaulted:args[1]===undefined,model:args[2].value,enum:args[3],original:args[5].content};}});
  const result=await f.call('invoke',{apply:true,arguments:['literal',{$default:true},{$type:'models.A',arguments:['old'],fields:{value:'new'}},{$enum:'models.E',member:'single'},{$callback:'accepted'},{$message:{id:'original-id',chatId}}]});
  assert.equal(result.ok,true);assert.equal(result.value.state,'returned');assert.equal(result.value.businessOutcome,'not-inferred');
  assert.deepEqual(result.value.result,{plain:'literal',defaulted:true,model:'new',enum:1,original:'original'});
  assert.deepEqual(result.value.callbacks,[{role:'accepted',args:['accepted-id']}]);assert.equal(f.calls.length,1);assert.equal(f.window.__codexIcenterSdkCall,undefined);
});
test('非法模型字段、保留键和未知标记在调用服务前拒绝',async()=>{
  for(const args of [[{$type:'models.A',fields:{unknown:1}}],[{$type:'models.A',fields:{value:{$callback:'fulfilled'}}}],['bad\u0000text'],[{$enum:'models.E',member:'missing'}],[{$shell:'bad'}],[JSON.parse('{"__proto__":{"polluted":true}}')]]){
    const f=fixture(), result=await f.call('invoke',{apply:true,arguments:args});
    assert.equal(result.ok,false);assert.equal(result.error.details.phase,'not-invoked');assert.equal(f.calls.length,0);assert.equal(f.window.__codexIcenterSdkCall,undefined);
  }
});
test('版本高低不阻止匹配契约的服务调用',async()=>{
  for(const version of ['0.0.0','9999.0.0']){
    const f=fixture({version}),result=await f.call('invoke',{apply:true,arguments:['value']});
    assert.equal(result.ok,true);assert.deepEqual(result.value.result,['value']);assert.equal(f.calls.length,1);
  }
});
test('账户、哈希和已有调用占用拒绝执行',async()=>{
  for(const option of ['account','hash','busy']){
    const f=fixture({version:'unverified'});
    if(option==='account')f.state.userInfo.userId='other';
    if(option==='hash')f.contract.method.hash='wrong';
    if(option==='busy')f.window.__codexIcenterSdkCall='other-owner';
    const result=await f.call('invoke',{apply:true});assert.equal(result.ok,false);assert.equal(f.calls.length,0);
    if(option==='busy')assert.equal(f.window.__codexIcenterSdkCall,'other-owner');
  }
});
test('返回 false 或 null 不被转成业务成功，Map 保留键和记录',async()=>{
  for(const returned of [false,null,new Map([['key',{value:'data'}]])]){
    const f=fixture({returned}),result=await f.call('invoke',{apply:true});assert.equal(result.value.businessOutcome,'not-inferred');
    if(returned instanceof Map)assert.deepEqual(result.value.result,{type:'Map',entries:[['key',{value:'data'}]]});else assert.equal(result.value.result,returned);
  }
});
test('结果循环及敏感字段明确失败，投影不读取未选择字段',async()=>{
  const cyclic={value:'data'};cyclic.self=cyclic;
  for(const returned of [cyclic,{value:'data',accessToken:'must-not-return'}]){
    const f=fixture({returned}), result=await f.call('invoke',{apply:true});assert.equal(result.ok,false);assert.equal(result.error.details.phase,'call-requested');
    const selected=await f.call('invoke',{apply:true,fields:['value']});assert.equal(selected.ok,true);assert.deepEqual(selected.value.result,{value:'data'});
  }
  const nested=fixture({returned:{success:1,messages:[{id:'id',content:'text',accessToken:'must-not-return'}]}});
  const selected=await nested.call('invoke',{apply:true,fields:['success','messages.id','messages.content']});
  assert.deepEqual(selected.value.result,{success:1,messages:[{id:'id',content:'text'}]});
  assert.equal((await nested.call('invoke',{fields:['messages','messages.id']})).error.code,'INVALID_SDK_FIELDS');
});
test('接口调用期间占用互斥，账户变化保留未知阶段，结束后释放占用',async()=>{
  let finish, started;const ready=new Promise(resolve=>{started=resolve;});
  const f=fixture({action:()=>{started();return new Promise(resolve=>{finish=resolve;});}}), pending=f.call('invoke',{apply:true});
  await ready;assert.equal((await f.call('invoke',{apply:true})).error.code,'SDK_BUSY');
  f.state.userInfo.userId='other';finish(true);const result=await pending;
  assert.equal(result.error.code,'ACCOUNT_CHANGED');assert.equal(result.error.details.phase,'call-requested');assert.equal(f.calls.length,1);assert.equal(f.window.__codexIcenterSdkCall,undefined);
});
test('公开客户端只接受注册操作，调用参数中的方法名不能替换契约',async()=>{
  let calls=0;
  const session=new SdkSession({evaluate:async(_fn,operation,input,contract)=>{calls++;assert.equal(operation,'describe');assert.equal(input.accountId,accountId);assert.equal(contract.moduleId,'d5b6');return {ok:true,value:{method:input.method}};}},{accountId});
  assert.equal((await session.describe('groups','modifyGroupName')).method,'modifyGroupName');
  await assert.rejects(session.invoke('login','getToken',[],{apply:true}),{code:'UNKNOWN_SDK_OPERATION'});assert.equal(calls,1);
});
test('公开调用断连只报告未知，不重试；借用连接不取得关闭权',async()=>{
  let invokes=0,closed=0;const connection={evaluate:async()=>{invokes++;throw new ClientError('CDP_DISCONNECTED','lost');},close:()=>{closed++;}};
  const borrowed=new SdkSession(connection,{accountId});
  await assert.rejects(borrowed.invoke('groups','modifyGroupName',[chatId,'name'],{apply:true}),{code:'SDK_CALL_UNKNOWN'});
  assert.equal(invokes,1);borrowed.close();assert.equal(closed,0);
  new SdkSession(connection,{accountId,ownsConnection:true}).close();assert.equal(closed,1);
});
test('Node 调用拒绝会在 JSON 传输中改变含义的值',async()=>{
  const sdk=new SdkSession({evaluate:()=>assert.fail('Invalid data must not be serialized into a client request.')},{accountId});
  const cyclic={};cyclic.self=cyclic;
  for(const value of [undefined,Infinity,NaN,()=>{},new Date(),cyclic])await assert.rejects(sdk.invoke('groups','modifyGroupName',[chatId,value],{apply:true}),{code:'INVALID_SDK_ARGUMENTS'});
});
test('目录返回副本，调用者不能改写后续使用的枚举契约',()=>{
  const first=SdkSession.catalog();first.enums['14ce.h'].values.SingleChat=123;
  assert.equal(SdkSession.catalog().enums['14ce.h'].values.SingleChat,0);
  assert.equal(SdkSession.catalog('groups.modifyGroupName').operations.length,1);
});
test('设置写入由实际 setter 和配置服务完成，配置写入失败不能算保存成功',async()=>{
  for(const save of [true,false]){
    let value=false,saved=false,writes=0;
    const f=fixture({readConfig:async file=>{assert.equal(file,'/fixture/UserConfig.ini');return '{}';}});
    class Settings{get audio(){return value;}set audio(next){value=next;}}
    const settings=new Settings(),configuration={settings:{userConfig:{Message:{Audio:false}}},async writeBackUserConfigIni(){writes++;if(save)saved=this.settings.userConfig.Message.Audio;}};
    f.loader.c.service.exports.a=settings;
    f.loader.c['522a']={exports:{a:configuration}};f.loader.c.e1d0={exports:{a:{getUserConfigPath:()=>'/fixture/UserConfig.ini'}}};f.loader.c['6343']={exports:{parse:JSON.parse}};
    const getter=Object.getOwnPropertyDescriptor(Settings.prototype,'audio'),setter=getter.set;
    f.contract.method={access:'set',property:'audio',hash:digest(setter),configPath:['Message','Audio'],configWriterHash:digest(configuration.writeBackUserConfigIni)};
    f.loader.c['6343'].exports.parse=()=>({Message:{Audio:saved}});
    // 真实配置写入在集成验证中只读；这里替换文件读取，覆盖失败返回被厂商服务吞掉的情形。
    const result=await f.call('invoke',{apply:true,arguments:[true]});
    assert.equal(writes,1);assert.equal(value,true);
    if(save){assert.equal(result.value.result.clientAndFileAgree,true);assert.equal(result.value.result.persistence,'file-read-confirmed');}
    else{assert.equal(result.ok,false);assert.equal(result.error.code,'SETTINGS_UNCONFIRMED');assert.equal(result.error.details.phase,'call-requested');}
  }
});
