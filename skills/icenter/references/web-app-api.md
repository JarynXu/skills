# 独立应用接口

`SdkSession.describeWeb`、`invokeWeb` 连接 iCenter 的独立应用并调用数据接口。短信、资料、收藏及门户使用自有隐藏窗口；日历和智能应用使用原生初始化方法及自有隐藏 frame。原生入口在客户端内处理认证，工具不导出 Cookie、令牌或认证 URL。已有聊天、草稿及应用 frame 不作为临时连接修改或关闭。

## 发现操作与契约

```text
node "<技能目录>/scripts/icenter.cjs" web-list
node "<技能目录>/scripts/icenter.cjs" web-list --app drive --query folder
node "<技能目录>/scripts/icenter.cjs" web-list --app drive --types
node "<技能目录>/scripts/icenter.cjs" web-type --app drive --type LibraryFileQueryEx
node "<技能目录>/scripts/icenter.cjs" web-describe --port <端口> --account <账户ID> --app portal --method getDefaultWorkbench
```

`web-list` 默认返回应用及操作数量。app、query 筛选操作，all 展开协议元数据；types 列模型名，web-type 读取一个模型。目录与模型由技能包维护，调用参数不能替换来源、身份或方法契约。

| app | 业务范围与入口 |
|---|---|
| `sms` | 账户查询、短信记录、发送及删除。 |
| `profile` | 收藏的查询与删除，个人资料、签名、头像、状态、同步与出差设置。添加消息收藏使用桌面 messages.addFavoriteMsg。 |
| `portal` | 个人工作台列表、默认项、详情、创建、更新、删除，以及个人应用配置和锁定。接口中的 scheme、workbench、app ID 含义分别保留。 |
| `calendar` | 日程详情、创建、修改、取消、邀约反馈、忙闲、会议室、主办日程及相关设置。原生函数负责日历协议与身份。 |
| `drive` | 云盘的目录、文件、搜索、上传、下载、版本、分享、权限、收藏及申请。请求与模型来自已发布 OpenAPI；服务签名要求仍由服务端执行。 |
| `assistant` | 兴小助及当前智能应用的会话、历史、知识库、技能、文件、计划任务和流式调用。提交问题、创建任务及修改知识库各自需要原任务授权。 |
| `support` | 智能客服系统入口查询。先取得 getSystems 的有效结果再处理子系统；入口失败不能据此编造子系统 API 或声称已完成客服提交。 |

描述会核对当前主体、原生入口及方法或来源指纹，不执行所选业务操作。应用自身的初始化请求仍会运行，可能更新应用会话状态。执行预览只核对主客户端与参数，不打开应用，不读网页业务数据；`runtimeContractVerified:false` 保留这一差别。

## 参数与调用

```text
node "<技能目录>/scripts/icenter.cjs" web-call --port <端口> --account <账户ID> --app <应用> --method <操作> --args-file "<UTF-8 JSON参数数组>"
node "<技能目录>/scripts/icenter.cjs" web-call --port <端口> --account <账户ID> --app <应用> --method <操作> --args-file "<UTF-8 JSON参数数组>" --field code --field bo.id --apply
node "<技能目录>/scripts/icenter.cjs" web-call --port <端口> --account <账户ID> --app <应用> --method <操作> --args-file "<UTF-8 JSON参数数组>" --view shape --apply
```

参数遵守 describe 的当前定义，保留原生函数的参数位置。带 `request` 定义的操作接受一个对象：`[{"path":{},"query":{},"body":{}}]`，使用实际需要的字段。path 填声明的路径 ID，query 填声明的查询参数，body 填 JSON 或 multipart；不接受任意 URL 或认证请求头。64 位 ID 使用十进制字符串，保留前导零，不能先转为 JavaScript 不安全整数。

云盘 OpenAPI 中的对象查询参数按模型属性平铺到 query，例如 folder2.addFolder2 使用 `[{"query":{"libraryId":"<文库ID>","parentId":"<父目录ID>","folderName":"<名称>"}}]`。JSON 请求体保留 body。模型表示协议结构，不证明该账户可执行，也不证明服务器对所有未标 required 的字段均有默认值。

响应结构未知时使用 `--view shape`。它返回字段名、类型、数组长度及首项结构，不返回字段值；认证字段标成 redacted，深度或键数截断有标记。它不能与 field 或二进制下载组合，不能把结构观察当作完整数据读取。

常用读取：

- `profile.getCollectionList` 的参数为 `[{"bo":{"startTime":"","dataType":"","searchKey":"<查询词>"},"order":"desc","other":{},"page":1,"rows":20,"sort":"createDate"}]`。
- `portal.getDefaultWorkbench`、`drive.personLibrary.getCapacity` 使用 `[]`。容量中的文库 ID 与目录 ID 分开保留。
- `drive.folder.tree` 使用 `[{"query":{"libraryId":"<已核对文库ID>"}}]`，返回目录树。
- `drive.lib.getFiles2` 使用完整分页及排序 DTO。当前有效请求为 `[{"body":{"libraryId":"<文库ID>","folderId":"<目录ID>","userId":"<当前员工ID>","deviceType":"pc","folderOrderBy":"desc","folderOrderByColumn":"folder_name","pageInfo":{"pageNow":1,"pageStart":0,"pageSize":20,"keyWord":"","orderBy":"desc","orderByColumn":"last_updated_date"}}}]`。按实际页数据推进；不将一次结果当全部文件。

### 短信

| 方法 | JSON 参数数组 |
|---|---|
| `getUserInfo` | `["<员工ID>"]`。SIP URI 与网页员工 ID 分开核对。指定员工的查询不是当前主体证明。 |
| `smsSearchMsg` | `[{"pageSize":20,"startIndex":1,"keyword":"<查询词>"}]`。startIndex 是网页的分页位置。 |
| `smsSendService` | `[{"content":"<协议正文>","receiverInfo":[{"mobileReceiver":"<号码>","receiverCode":"<已核对员工ID或空串>","receiverName":"<已核对姓名或空串>"}],"signatureType":0},"zh_CN"]`。当前适配接受 1–20 个收件人，语言 zh_CN/en_US，签名类型 0/1。 |
| `smsDeleteMsg` | `[["<记录ID>",12345]]`。保留服务器原有 ID 类型；数字 ID 必须为正的安全整数。处理明确选择的已有记录，不把删除记录与撤销定时发送混用。 |

网页构造短信协议正文时去除首尾空白，将小于号、大于号转为 HTML 实体。调用方核对原文与协议表达，不能改写用户要求保留的文本。定时发送增加 appointTime，格式 YYYYMMDDHHmmss；核对服务器时区及未来时间。执行后检查外层码、bo.resultCode 是否为 0，再查原发送记录和状态。受理及记录存在不证明运营商送达。

## 文件与流式响应

文件参数使用 `{"$icenterFile":{"path":"<绝对源路径>","name":"<可选文件名>","type":"text/plain"}}`。multipart 使用 `{"$icenterForm":{"file":{"$icenterFile":{"path":"<绝对源路径>"}},"其他字段":"值"}}`。文件字节在执行时读取，在应用中构造 File；预览不读取文件。单个文件上限 16 MiB，一次参数总量上限 32 MiB。分片服务需要按协议准备各片及哈希，不能把未上传的本机路径当成服务端文件。

云盘上传依次调用 upload.uploadConfig、upload.sendData、upload.finish、upload.save2。sendData 的 query 包含 fileMd5、chunk、size，body 为包含 file 的 multipart；finish 使用 fileMd5、fileName；save2 的 body 采用 FileUploadInfoDTO 及 DocLibraryFile。每步检查响应，保留文库、目录、文件名、文件 ID 与分片状态。数据片上传成功不代表文件信息已经保存。不要对结果未知的分片、完成或保存动作直接重做。

`drive.file.downloadToFile` 执行 file.downloadFile 的权限请求，再在客户端内接收文件，使用 `--output-file "<新的绝对输出路径>"`。单文件请求为 `[{"query":{"fileIds":"<文件ID>","folderId":"0"}}]`；非零 folderId 用于目录打包，不能将当前父目录 ID 填入单文件请求。已存在的输出不覆盖。下载地址及其权限值留在客户端，结果只返回本机路径、字节数与 SHA-256。下载响应上限 16 MiB。离线任务返回 download-pending，不创建假文件；HTTP、权限、文件服务或本机写入失败各自保留。

文件接收使用当前客户端会话及 [Electron 22 的 ClientRequest](https://github.com/electron/electron/blob/v22.3.27/docs/api/client-request.md)。请求、重定向核对、读取与取消位于客户端主进程；请求使用自己的 error 监听处理迟到错误。没有复制认证头、关闭网页安全策略或扩大文件来源。重定向最多 5 次，只接受已注册来源的 GET。

assistant 中的流式方法返回 stream-complete 或 stream-interrupted，保留 SSE 事件、字节数及完成原因。EOF 只证明传输结束，不推断回答成功；超时、数量上限及未结束的事件返回未完成状态和已取得事件，业务结果为 unknown。不能因收到部分回答就重复提问。普通调用请求期限默认 7 秒，流式默认 30 秒；`--timeout-ms` 范围为 1000–45000，CLI 的 CDP 连接期限覆盖该范围。使用 Node API 时为 SdkSession.connect 提供足够的 timeoutMs，最长 60000。

## 身份、结果与恢复

客户端账户和网页主体分别检查。门户使用当前主体接口；日历及智能应用使用已核对的原生初始化及该应用保存的当前主体。不能自行设置会话存储来伪造登录。每次调用前后核对身份及来源；原生方法、应用脚本或传输契约变化时停止该调用。

工具保留 HTTP 状态、外层 responseCode、原始响应、bo 是否存在，以及原生客户端是否拒绝该响应。`businessObjectPresent:false` 不是完整历史为空，字段投影缺失也不是查询空集。返回非零业务码保留原值；`returned` 和 `businessOutcome:not-inferred` 不推断业务成功。0002 或 HTTP 401 表示需要认证，服务签名拒绝与登录失效分别处理，不生成或提取凭据补齐。

原始 JSON 中的不安全整数转换为十进制字符串。认证字段或带认证参数的 URL 不能进入结果；使用字段投影或 shape 读取所需信息。云盘协议中的 secretLevel、libSecret、libSecretLevel 是业务密级字段，由该应用契约声明，不能与认证秘密混为一项。

写入后超时、断线或无法确定副作用时返回 WEB_CALL_UNKNOWN。按原目标、正文、时间及已有 ID 对账，不换界面重做。窗口关闭不证明服务器取消了已提交请求。连接与请求均有期限；清理只处理本次资源和占用。调用与桌面 SDK 共享客户端占用，不抢占已有调用。

目录中的 source-linked 表示协议与源码已关联，不能用它代替真实写入验证。当前验证范围查方法的 validation；跨账户、权限、签名和服务可用性在本次操作时重查。未验证的接口、服务返回失败及真实业务成功分别交付。
