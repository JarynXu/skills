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

旧的 RendererSession 借用调用仍兼容，但要求目标已加载及选中；新任务使用上述 SDK 路径。`downloadFile` 处理普通文件附件；图片消息使用下方 `read-image`。合并转发子附件和其他媒体需核对各自参数，不能把空子消息 ID 套到所有类型。

## 读取消息图片

按账户、聊天和图片消息 ID 读取，不切换聊天、不置已读、不操作草稿。`history`、`read-ids` 及通知里的图片附件描述只表示存在图片，尚未取得或识别内容。

```text
node "<技能目录>/scripts/icenter.cjs" read-image --port <端口> --account <账户ID> --chat <聊天ID> --message-id <图片消息ID>
node "<技能目录>/scripts/icenter.cjs" read-image --port <端口> --account <账户ID> --chat <聊天ID> --message-id <图片消息ID> --apply
```

默认预览检查消息归属和各清晰度的缓存状态，不解密、下载或创建目录和文件。`--apply` 让当前登录客户端读取并解密图片。省略 `--output-file` 时，工具在系统临时目录 `os.tmpdir()` 的独立 `icenter-image-*` 子目录生成 PNG，返回 `temporary:true` 与 `cleanupToken`。需要保存或作为文件交付时，传入 `--output-file "<包和 Git 工作树外的新绝对路径>.png"`；结果为 `temporary:false`，文件由调用方保留，已有输出不覆盖。

取图复用客户端已有缓存，不另发 HTTP 请求下载同一图片。缓存缺失时，调用客户端图片查看器使用的下载接口补齐缓存，再读取缓存。工具不打开图片窗口或切换聊天来触发加载。缓存可能使用客户端加密格式；解密在内存中完成，PNG 是供宿主读取的像素导出，不是第二次网络下载。不能把加密缓存路径交给识图工具，也不能提取密钥。

`--variant` 接受 `best`、`original`、`large`、`thumbnail`，默认 `best`。`best` 按原图、大图、缩略图选择可解码缓存；无缓存时请求大图。需要辨认细小文字时，检查结果的 `variant` 和尺寸，按需请求 `large` 或 `original`。明确请求的清晰度不可用时返回错误，不降级后冒充原图。原图需要客户端提供原图来源；缺少大图缓存时，接口按客户端流程先下载大图。下载等待总预算由 `--timeout-ms` 指定，默认 15000，范围 1000..45000 毫秒。

成功结果含 `state:exported`、原账户/聊天/消息 ID、`requestedVariant`、实际 `variant`、缓存或下载来源、`outputPath`、`mimeType`、宽高、字节数和 SHA-256。输出是解码像素导出的 PNG，动画只导出首帧，不是原文件的字节备份。输入缓存及解码源上限 32 MiB，像素上限 4000 万，输出上限 16 MiB。解码失败保留错误，不把加密缓存改名成图片，也不自动反复下载。

取得 `outputPath` 后，调用宿主的本地图片查看或识图工具。识别结论与原消息 ID 关联，转述只使用实际可辨认的信息。`contentRead:false` 表示此取图命令没有理解图中内容；预览和导出均不表示已经完成识图。只有缩略图、文字模糊或宿主没有识图能力时，报告已取得图片及缺失的能力，不能补猜截图中的命令、版本号或错误文字。需要外部识图服务时遵守该服务及数据外发授权。

识图调用方负责结束临时文件的使用。所有识图读取已结束、后续无需引用或保留本次图片时，使用结果中的路径和令牌执行清理：

```text
node "<技能目录>/scripts/icenter.cjs" release-image --output-file "<结果的 outputPath>" --cleanup-token <结果的 cleanupToken> --apply
```

清理不需要客户端连接。省略 `--apply` 可预览；执行时核对临时目录、所有权记录与文件内容，只删除该次生成的图片及记录，再移除空目录。不接受保存输出或 iCenter 缓存路径。其他文件、内容变化或链接替换触发错误，保留现场；报告未完成的清理。成功后的重复调用返回 `absent`。工具不扫描旧目录或删除 iCenter 自身缓存。导出命令退出时，宿主尚未读取文件，不能在命令退出时删图。识图失败或缺少识图工具时，清理无需继续使用的本次临时产物；进程中断遗留的输出按原取图回执恢复清理。

Node.js 使用 `const image = await sdk.readImage({chatId,messageId,variant:'best',apply:true})`，由 `SdkSession` 持有连接；下载任务建议以 `timeoutMs:60000` 建立会话。宿主读图结束后，从 `scripts/image-output.cjs` 导入 `releaseImage`，执行 `await releaseImage({...image,apply:true})`；需要保留的图片在取图时指定 `outputPath`，不调用释放入口。取图和清理均不关闭借用会话。图片以普通文件附件发送时，使用前述 `downloadFile`，取得并核对实际文件后交给识图工具。

`MESSAGE_NOT_IMAGE` 表示该消息不是原生图片；`IMAGE_REVOKED`、`IMAGE_RESTRICTED` 保留撤回和临时消息的客户端限制；`IMAGE_VARIANT_UNAVAILABLE` 表示所需清晰度没有可用来源。`IMAGE_DECODE_FAILED`、`IMAGE_CACHE_UNAVAILABLE` 不能解释成无图片。下载未确认、结果未知或连接断开时，先预览同一消息的缓存状态，再决定后续动作，不切换收件对象或重放未知请求。

## 图片、语音、视频与资源

messages.sendImageMsg、sendAudioMsg、sendVideoMsg、sendCardMsg 及相应模型提供结构化发送。先读取定义核对文件、类型、来源、目标、回复信息和状态，按客户端政策验证。图片以文件消息发送时保持文件类型，不能改称图片消息。

语音消息自动转文字开关使用 `messages.enableAutoConvertToTxt`、`disableAutoConvertToTxt`。它们修改转换偏好，不返回已有语音的转写内容。需要阅读语音时，核对该消息的转换状态与实际文本，不能把开启开关写成已读完语音。

getFileSize 的封装元数据不保证等于原文件字节数；fileLocalPath 可能是封装缓存。取得实际原件后检查文件类型、可读性，必要时比较内容哈希。下载链接不表示已取得内容；缩略图保留实际清晰度，不表示已取得原图。过期、撤回、权限、网络和解密失败分别报告；下载不授予执行文件或宏的权限。

表情资源使用 emoticons 服务，添加、删除、排序、下载和发送分别处理。群文件以已核对的群作为搜索条件查询文件消息及当前应用的文档接口，保留分页和文件版本。收藏使用 messages.addFavoriteMsg；云文档转换、分享及稍后处理保留各自写入授权。

录音、截图、设备激活及权限窗口需要该设备或系统的实际支持。SDK 的发起接口不证明用户已选择屏幕或授予权限，不伪造媒体或绕过系统提示。云盘使用 drive 的目录、文件与版本接口；收藏列表及删除使用 profile。上传、文件编码、下载到指定路径和响应结构查询见[独立应用接口](web-app-api.md)。桌面消息附件与云盘文件保留各自的 ID、传输及权限语义。
