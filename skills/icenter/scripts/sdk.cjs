const { ClientError, CdpClient } = require('./cdp.cjs');
const { discover } = require('./client.cjs');
const { sdkPageOperation } = require('./sdk-page.cjs');
const contracts = require('./sdk-contracts.json');
const { readHistory } = require('./sdk-history.cjs');
const { readMessageImage } = require('./message-images.cjs');
const {webPageOperation}=require('./web-page.cjs');
const {webApplicationOperation}=require('./web-application.cjs');
const {startClientDownload}=require('./web-download.cjs');
const webContracts=require('./web-contracts.json');

function requireJsonData(value,ancestors=new Set(),depth=0){
  if(depth>25)throw new ClientError('INVALID_SDK_ARGUMENTS','SDK input nesting is too deep.');
  if(value===null||['string','boolean'].includes(typeof value))return;
  if(typeof value==='number'&&Number.isFinite(value))return;
  if(!value||typeof value!=='object'||ancestors.has(value)||!Array.isArray(value)&&![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw new ClientError('INVALID_SDK_ARGUMENTS','SDK inputs must be JSON data; use declared markers for defaults, models and callbacks.');
  const next=new Set(ancestors).add(value);
  for(const item of Object.values(value))requireJsonData(item,next,depth+1);
}

// 会话只拥有自己的 CDP 连接。版本契约由包维护，调用方不能从输入文件覆盖。
class SdkSession {
  #connection;
  #accountId;
  #ownsConnection;
  constructor(connection, { accountId, ownsConnection = false } = {}) {
    if (typeof connection?.evaluate !== 'function' || typeof accountId !== 'string' || !accountId) throw new ClientError('INVALID_ARGUMENT','An evaluation connection and observed account are required.');
    this.#connection = connection; this.#accountId = accountId; this.#ownsConnection = ownsConnection;
  }
  get accountId() { return this.#accountId; }
  static async connect({ port,targetId,accountId,timeoutMs=20000 }) {
    if (typeof accountId!=='string' || !accountId) throw new ClientError('INVALID_ARGUMENT','An observed account ID is required.');
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 60000) throw new ClientError('INVALID_TIMEOUT','SDK timeout must be 1000..60000 milliseconds.');
    const targets = (await discover(port)).filter(target=>target.role==='main' && (!targetId || target.id===targetId));
    if (targets.length!==1) throw new ClientError('MAIN_WINDOW_NOT_UNIQUE','Select one observed main window.');
    return new SdkSession(await CdpClient.connect(targets[0].webSocketDebuggerUrl,{ timeoutMs }),{ accountId,ownsConnection:true });
  }
  static catalog(query='') {
    if (typeof query!=='string') throw new ClientError('INVALID_ARGUMENT','The catalog query must be text.');
    return structuredClone({ clientVersion:contracts.clientVersion, status:contracts.status,
      operations:Object.entries(contracts.services).flatMap(([service,value])=>Object.entries(value.methods).filter(([method])=>(service+'.'+method).toLowerCase().includes(query.toLowerCase())).map(([method,contract])=>({ service,method,...contract }))),
      types:Object.keys(contracts.types), enums:contracts.enums });
  }
  static webCatalog(){return structuredClone(webContracts);}
  static webTypes(app){
    if(!Object.hasOwn(webContracts.apps,app))throw new ClientError('UNKNOWN_WEB_APP','The application is not registered.');
    return Object.keys(require('./web-types.json')[app]||{});
  }
  static webType(app,type){
    const schemas=require('./web-types.json');
    if(!Object.hasOwn(schemas,app)||!Object.hasOwn(schemas[app],type))throw new ClientError('UNKNOWN_WEB_TYPE','The application schema is not registered.');
    return structuredClone({app,type,schema:schemas[app][type]});
  }
  async describeWeb(app,method){return this.#webCall('describe',{app,method});}
  async invokeWeb(app,method,args,{apply=false,fields,requestTimeoutMs,outputFile,view}={}){
    if(typeof apply!=='boolean')throw new ClientError('INVALID_ARGUMENT','apply must be boolean.');
    return this.#webCall('invoke',{app,method,arguments:args,apply,...(fields===undefined?{}:{fields}),...(requestTimeoutMs===undefined?{}:{requestTimeoutMs}),...(outputFile===undefined?{}:{outputFile}),...(view===undefined?{}:{view})});
  }
  async describe(service,method) { return this.#call('describe',{ service,method }); }
  async check() { return this.#call('check',{}); }
  async history(options) { return readHistory(this,options); }
  async readImage(options) { return readMessageImage(this.#connection, this.#accountId, options); }
  async sendFile({chatId,filePath,apply=false}) {
    if(typeof apply!=='boolean')throw new ClientError('INVALID_ARGUMENT','apply must be boolean.');
    const reply=await this.#call('file-send',{service:'messages',method:'sendFileTransCardMsg',chatId,filePath,apply});
    if(!apply)return reply;
    const result=reply?.result,states=contracts.enums['14ce.P'].values;
    const details={accountId:this.#accountId,chatId,messageId:result?.messageId??null,observedAccountId:result?.accountId??null,
      observedChatId:result?.chatId??null,fileName:result?.fileName??null,
      messageTransferred:result?.messageTransferred??null,fileTransferred:result?.fileTransferred??null,
      clientMessageStatus:result?.clientMessageStatus??null,clientFileStatus:result?.clientFileStatus??null};
    if(result?.chatId!==chatId||result?.accountId!==this.#accountId||typeof result?.messageId!=='string'||!result.messageId||
      result?.fileName!==require('node:path').basename(filePath))
      throw new ClientError('SEND_UNKNOWN','The client has not confirmed successful transfer of both the file message and attachment; reconcile without repeating it.',details);
    if(result.clientMessageStatus===states.Failed&&result.messageTransferred===false)
      throw new ClientError('SEND_FAILED','The client reports that the file message failed.',details);
    if(result.messageTransferred!==true||result.fileTransferred!==true||result.clientMessageStatus!==states.Success)
      throw new ClientError('SEND_UNKNOWN','The client has not confirmed successful transfer of both the file message and attachment; reconcile without repeating it.',details);
    return {...reply,state:'client-confirmed',businessOutcome:'client-send-confirmed',receipt:'recipient-delivery-and-reading-not-verified'};
  }
  async describeType(type) {
    if (!Object.hasOwn(contracts.types,type)) throw new ClientError('UNKNOWN_SDK_TYPE','The requested SDK model is not registered.');
    return this.#call('type',{ type });
  }
  async invoke(service,method,args,{ apply=false,fields,view }={}) {
    if (typeof apply!=='boolean') throw new ClientError('INVALID_ARGUMENT','apply must be boolean.');
    return this.#call('invoke',{ service,method,arguments:args,apply,...(fields!==undefined?{fields}:{}),...(view!==undefined?{view}:{}) });
  }
  close() { if (this.#ownsConnection) this.#connection.close(); }
  async #webCall(operation,input){
    requireJsonData(input);
    if(!Object.hasOwn(webContracts.apps,input.app)||!Object.hasOwn(webContracts.apps[input.app].methods,input.method))throw new ClientError('UNKNOWN_WEB_OPERATION','The application service method is not registered.');
    const app=webContracts.apps[input.app],{methods,...definition}=app,contract={...definition,method:methods[input.method]};
    let invoked=false;
    try{
      if(['binary','download-link'].includes(contract.method.response)&&input.apply&&(typeof input.outputFile!=='string'||!require('node:path').isAbsolute(input.outputFile)))throw new ClientError('INVALID_WEB_OUTPUT','A binary operation requires an absolute outputFile path.');
      if(input.outputFile!==undefined){
        if(!['binary','download-link'].includes(contract.method.response))throw new ClientError('INVALID_WEB_OUTPUT','outputFile is reserved for binary download methods.');
        try{await require('node:fs/promises').access(input.outputFile);throw new ClientError('WEB_OUTPUT_EXISTS','The download output already exists.');}catch(error){if(error.code!=='ENOENT')throw error;}
      }
      invoked=true;
      const response=await this.#connection.evaluate(webPageOperation,operation,{...input,accountId:this.#accountId},contract,webApplicationOperation.toString(),startClientDownload.toString());
      if(!response||typeof response.ok!=='boolean')throw new ClientError('INVALID_CLIENT_RESULT','The application bridge returned an invalid result.');
      if(!response.ok)throw new ClientError(response.error.code,response.error.message,response.error.details);
      if(Object.hasOwn(response.value,'binaryHandoff'))throw new ClientError('WEB_INTERNAL_RESULT','An internal download handoff was not consumed by the client bridge.');
      if(response.value.binary){
        const bytes=Buffer.from(response.value.binary.base64,'base64');
        if(bytes.length!==response.value.binary.bytes)throw new ClientError('INVALID_WEB_RESULT','The downloaded byte count does not match.');
        await require('node:fs/promises').writeFile(input.outputFile,bytes,{flag:'wx'});
        const {binary,...result}=response.value;
        return {...result,file:{path:input.outputFile,bytes:bytes.length,sha256:require('node:crypto').createHash('sha256').update(bytes).digest('hex')}};
      }
      return response.value;
    }catch(error){
      if(invoked&&input.apply&&contract.method.effect==='write'&&error.details?.phase!=='not-invoked')throw new ClientError('WEB_CALL_UNKNOWN','The application call may have taken effect; reconcile the original operation without repeating it.',{...error.details,cause:error.code,app:input.app,method:input.method});
      throw error;
    }
  }
  async #call(operation,input) {
    requireJsonData(input);
    let contract;
    if(operation==='check')contract=contracts.services;
    else if (operation!=='type') {
      if (!Object.hasOwn(contracts.services,input.service) || !Object.hasOwn(contracts.services[input.service].methods,input.method)) throw new ClientError('UNKNOWN_SDK_OPERATION','The requested client service method is not registered.');
      const service = contracts.services[input.service]; contract = { moduleId:service.moduleId,export:service.export,imports:service.imports||{},method:service.methods[input.method] };
    }
    try {
      const response = await this.#connection.evaluate(sdkPageOperation,operation,{ ...input,accountId:this.#accountId },contract,{ types:contracts.types,enums:contracts.enums });
      if (!response || typeof response.ok!=='boolean') throw new ClientError('INVALID_CLIENT_RESULT','The SDK bridge returned an invalid result.');
      if (!response.ok) throw new ClientError(response.error.code,response.error.message,response.error.details);
      return response.value;
    } catch(error) {
      if (input.apply && error.details?.phase!=='not-invoked') throw new ClientError('SDK_CALL_UNKNOWN','The SDK call may have taken effect; reconcile the original target without repeating it.',{ ...error.details,cause:error.code,service:input.service,method:input.method });
      throw error;
    }
  }
}
module.exports = { SdkSession };
