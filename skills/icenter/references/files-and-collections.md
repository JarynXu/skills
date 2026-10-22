# 文件与收藏

文件、图片、媒体、收藏与稍后处理使用[客户端接口](client-api.md)。文件选择器不属于发送前提；源路径、输出路径及消息身份作为参数提供。

## 发送文件

    node "<技能目录>/scripts/icenter.cjs" send-file --port <端口> --account <账户ID> --chat <聊天ID> --file "<绝对源路径>"
    node "<技能目录>/scripts/icenter.cjs" send-file --port <端口> --account <账户ID> --chat <聊天ID> --file "<绝对源路径>" --apply

新文件需要客户端的两阶段流程：先准备消息，从受理回调取得 ID，再用同一 ID 执行实际发送。SdkSession.sendFile 封装该流程，不打开编辑器、不清理草稿。单次调用 sendFileTransCardMsg 并取得 ID 不能证明文件已发送；通用入口对缺少准备流程的新文件请求返回 SDK_FLOW_REQUIRED。转发已有服务器附件使用对应转发路径，不重复上传原件。

执行前检查源文件为非空普通文件、目标及授权；企业大小、格式、保密和转发政策以客户端及服务端结果为准。client-confirmed 要求消息与附件传输均有成功证据，并核对消息 ID、账户、目标和文件名；对方送达及阅读仍未验证。未完成、结果缺失或状态矛盾保留未知，错误携带已取得的消息 ID 和传输状态用于对账。超时保留受理 ID，不创建新 ID 重发。

## 下载到指定路径

scripts/attachments.cjs 的 downloadFile 可借用 SdkSession：

    const {SdkSession}=require('<技能目录>/scripts/sdk.cjs');
    const {downloadFile}=require('<技能目录>/scripts/attachments.cjs');
    const sdk=await SdkSession.connect({port,accountId});
    try{
      const preview=await downloadFile(sdk,{chatId,messageId,outputPath});
      const result=await downloadFile(sdk,{chatId,messageId,outputPath,apply:true});
    }finally{sdk.close();}

预览按 ID 读取原生文件元数据，不创建目标或下载。执行独占创建新输出，已有文件返回 OUTPUT_EXISTS。调用客户端附件服务传入明确路径，不切换聊天或打开保存框。downloaded 要求同一账户、聊天及消息，客户端文件传输成功、原件路径匹配，本机文件可打开。失败或未知保留目标，不覆盖重试。借用会话不取得关闭权，连接超时需要覆盖客户端等待时间。

旧的 RendererSession 借用调用仍兼容，但要求目标已加载及选中；新任务使用上述 SDK 路径。普通文件、合并转发子附件、原图和媒体使用各自参数，不能把空子消息 ID 套到所有类型。

## 图片、语音、视频与资源

messages.sendImageMsg、sendAudioMsg、sendVideoMsg、sendCardMsg 及相应模型提供结构化发送。先读取定义核对文件、类型、来源、目标、回复信息和状态，按客户端政策验证。图片以文件消息发送时保持文件类型，不能改称图片消息。

getFileSize 的封装元数据不保证等于原文件字节数；fileLocalPath 可能是封装缓存。取得实际原件后检查文件类型、可读性，必要时比较内容哈希。下载链接或缩略图不属于已取得附件。过期、撤回、权限、网络和解密失败分别报告；下载不授予执行文件或宏的权限。

表情资源使用 emoticons 服务，添加、删除、排序、下载和发送分别处理。群文件以已核对的群作为搜索条件查询文件消息及当前应用的文档接口，保留分页和文件版本。收藏使用 messages.addFavoriteMsg；云文档转换、分享及稍后处理保留各自写入授权。

录音、截图、设备激活及权限窗口需要该设备或系统的实际支持。SDK 的发起接口不证明用户已选择屏幕或授予权限，不伪造媒体或绕过系统提示。云盘使用 drive 的目录、文件与版本接口；收藏列表及删除使用 profile。上传、文件编码、下载到指定路径和响应结构查询见[独立应用接口](web-app-api.md)。桌面消息附件与云盘文件保留各自的 ID、传输及权限语义。
