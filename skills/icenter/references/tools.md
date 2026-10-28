# 工具契约

## 环境与命令

所有脚本相对自身目录装配，不依赖工作目录。Node.js 22.4+ 提供原生 WebSocket；没有 npm 依赖或安装步骤。Windows 实例发现使用 PowerShell。`connection.ps1` 的启动契约见[连接与身份](connection-and-identity.md)。

```text
node "<技能目录>/scripts/icenter.cjs" help
node "<技能目录>/scripts/icenter.cjs" connections
node "<技能目录>/scripts/icenter.cjs" connect
node "<技能目录>/scripts/icenter.cjs" targets --port <端口>
node "<技能目录>/scripts/icenter.cjs" status --port <端口>
```

`targets` 区分主窗口与辅助窗口。存在多个主窗口时，使用 `--target-id` 指定已观察到的 ID。`status` 返回登录账户、客户端版本、主窗口和当前会话；失败不以空账户表示成功。

`connect [--executable <路径>] [--instance-pid <PID>] [--restart]` 复用 CDP，客户端未运行时启动。普通运行的实例返回 `RESTART_REQUIRED`；准备好重启后传入 `--restart`，它允许停止所选实例的进程树。多实例必须指定 PID。该命令执行连接准备，不采用业务命令的预览规则。返回的 `clientState` 区分已登录、未登录与适配器不可用，见[连接与身份](connection-and-identity.md)。

| 命令 | 参数与行为 |
|---|---|
| `targets` | `--port [--all]`。默认识别主窗口角色；`--all` 列出页面与 webview 的 ID、标题和 URL。 |
| `cdp` | `--port --target-id --method [--params-file] [--apply]`。使用明确页面 ID 调用 CDP；参数为 UTF-8 JSON 对象，缺省 `{}`。默认预览，执行查询也需要 `--apply`。返回协议结果，不替代业务验收。 |
| `chats` | `--port --account [--query]`。查询已加载会话；名称包含匹配只用于列候选，不能授权发送。结果提供精确 ID 和原始类型。 |
| `select` | `--port --account --chat [--apply]`。默认预览。执行点击已渲染的精确 ID 行，验证当前会话 ID。未加载到界面的目标从客户端搜索进入。切换会话可能标记已读。 |
| `read` | `--port --account --chat [--limit]`。要求当前选中该会话，返回已加载窗口末尾的消息；默认 50，范围 1–10000。 |
| `read-ids` | `--port --account --chat --message-id <ID>`，ID 参数可重复，单次 1–50 个不同值。从客户端历史查询，不切换聊天；缺失项在 `missingIds` 返回。 |
| `history` | `--port --account --chat [--union-id] [--limit] [--before-id]`。不选中聊天，查询本机历史；默认 50，范围 1–200，按消息 ID 向前翻页；保留实际覆盖和原始结束标志。 |
| `read-image` | `--port --account --chat --message-id <单个ID> [--output-file <新绝对PNG路径>] [--variant best\|original\|large\|thumbnail] [--timeout-ms] [--apply]`。预览检查图片及缓存；执行导出解码后的图片。默认使用系统临时目录；保存、清晰度及识图交接见[读取消息图片](files-and-collections.md#读取消息图片)。 |
| `release-image` | `--output-file <取图结果路径> --cleanup-token <取图结果令牌> [--apply]`。消费结束后释放该次临时输出，无需连接客户端。范围与失败处置见[读取消息图片](files-and-collections.md#读取消息图片)。 |
| `sdk-info` | `--port --account`。核对专用文本和 ID 查询适配器；通用服务目录使用 sdk-list，当前方法指纹使用 sdk-check。发现方法名不等于验证业务结果。 |
| `send` | `--port --account --chat --text-file [--mark-origin] [--apply]`。使用已核实的客户端 SDK，目标为已加载单聊或群，不要求选中或清空编辑器。正文为 UTF-8，CRLF 转 LF。默认预览；SDK 等候通知的期限为 8 秒，超时不重发。来源标记仅在显式选择时附加，使用条件见 [SDK 与消息来源](sdk-and-origin.md)。 |
| `send-file` | `--port --account --chat --file [--apply]`。绝对源路径；执行客户端准备与发送两阶段，复用同一消息 ID。默认预览，不打开编辑器或文件选择器。 |
| `sdk-list` | `[--query] [--types] [--all]`。离线目录；默认返回服务与数量，query 筛选操作，types 查询模型及枚举 ID，all 展开全部操作。 |
| `sdk-check` | `--port --account [--all]`。只核对加载方法及指纹，默认返回数量和不匹配项；all 返回逐项结果，不执行业务动作。 |
| `sdk-describe` | `--port --account --service --method`。返回当前方法定义、参数位置及验证状态，不执行方法。 |
| `sdk-type`、`sdk-enum` | 前者为 `--port --account --type`，后者为离线 `--name`。分别查询模型源码与登记枚举。 |
| `sdk-call` | `--port --account --service --method --args-file [--field <路径>] [--apply]`。JSON 参数数组；field 可重复，默认预览。通用返回不推断业务成功，见[客户端接口](client-api.md)。 |
| `web-list` | `[--app] [--query] [--types] [--all]`。离线目录；默认返回应用与数量，types 查询模型名，all 展开协议元数据。 |
| `web-type` | `--app --type`。离线读取已登记的应用模型。 |
| `web-describe` | `--port --account --app --method`。连接自有应用窗口或原生 frame，核对主体与契约；不执行所选业务操作，应用初始化请求仍会运行。 |
| `web-call` | `--port --account --app --method --args-file [--field <路径>] [--view shape] [--timeout-ms] [--output-file] [--apply]`。默认预览不打开应用；执行保留原始响应，文件与流式语义见[独立应用接口](web-app-api.md)。 |
| `watch` | `--port --account --chat [--duration-seconds] [--idle-seconds] [--checkpoint]`。默认总时长 60 秒、空闲时长 30 秒，范围 1–43200 秒。详细语义见[监控](monitoring.md)。 |

连接到客户端的命令可追加 `--target-id`；sdk-list、sdk-enum、web-list 和 web-type 是离线查询。通用 `cdp` 命令必须指定页面 ID。不接受未知参数或多余位置参数。消息内容来自文件，不能拼接进命令源码。

普通命令输出一个 JSON 对象；`watch` 输出逐行 JSON。失败输出 `ok:false`、错误码及说明，退出码为 1。成功退出只支持该命令的结果语义，预览不会发送。

## 被动通知接口

`scripts/message-receiver.cjs` 提供独立的连续消息接收入口，拥有归集及持久恢复状态。`scripts/notifications.cjs` 保留原生逐条订阅、读取、确认与注销能力。参数、交接及兼容边界见[消息监控](monitoring.md)。`scripts/listener.cjs` 的旧工作流命令已迁出；它返回 `COMPOSITION_MOVED`，不加载外部模块。实际自动处理入口由使用者的组合包及实例策略指定。

## 字段的含义

账户 `id` 来自登录状态，`linkedUnionId` 来自同一资料对象，`aliasesComplete:false` 表示别名未穷尽。SIP URI 不应转换为邮箱。

消息返回客户端消息 ID、发送人、原始时间、类型、正文、传输与已读字段。原始时间保留客户端表示，不假定 UTC；`text` 是客户端内容字段，非文本类型可能携带结构化内容。不要把文件元数据当成可读正文或已下载文件。`clientType`、`readStatus` 保留原始值，未经对应版本证据不能自行命名。

图片消息的 `attachments[].kind` 为 `image`、`state` 为 `not-read`。它只标识后续内容读取需要，不把图片字节塞入消息正文或通知。`read-image` 返回可读文件，宿主识图结论另行取得。

`transfer` 为 `initial`、`pending`、`confirmed`、`failed` 或 `unknown`。这表示客户端传输状态，不能证明他人收到或阅读。`send` 的 `client-confirmed` 还要求新增消息 ID、发送人和完整正文匹配。存在多条匹配消息时报告未知，避免选错证据。

`origin.kind` 为 `automation-marked` 或 `unknown`，`sampleEligible:false` 表示工具没有授予文风取样资格。识别结果不改写 `text`。来源标记的编码、适用范围和未知状态见 [SDK 与消息来源](sdk-and-origin.md#代发来源与文风取样)。

## 错误与恢复

| 错误 | 处理 |
|---|---|
| `CDP_UNREACHABLE`、`CDP_DISCONNECTED` | 检查实例与端口；写入后断开需要核对副作用，不能立即重发。 |
| `MAIN_WINDOW_NOT_UNIQUE`、`WRONG_WINDOW` | 重新发现主窗口；辅助页面不能替代主窗口。 |
| `NOT_SIGNED_IN` | 用户完成登录；不采集密码或验证码。 |
| `RESTART_REQUIRED` | 所选接口或页面工具需要 CDP；保留未完成工作，按已确认授权对目标 PID 执行 `connect --restart`。 |
| `INSTANCE_NOT_UNIQUE`、`INSTALLATION_NOT_UNIQUE` | 从实际实例或安装信息选择 PID、路径；不取第一个。 |
| `CDP_NOT_READY` | 检查原实例、返回 PID 和端口，不重复启动或重启。 |
| `UNSUPPORTED_VERSION`、`UNSUPPORTED_SCHEMA` | 使用通用 CDP 检查 DOM 和页面状态。维护专用适配器需要版本和字段证据。 |
| `TARGET_NOT_FOUND` | 使用 `targets --all` 重新定位页面，不能沿用失效 ID。 |
| `ACCOUNT_CHANGED`、`CHAT_CHANGED`、`MESSAGE_SCOPE_MISMATCH` | 重新核对账户和目标；禁止把新会话的数据贴上旧标签。 |
| `CHAT_NOT_VISIBLE`、`CHAT_NOT_UNIQUE` | 搜索或滚动后核对精确 ID，不取第一个同名结果。 |
| `DRAFT_PRESENT`、`EDITOR_UNAVAILABLE` | 保留现场，检查草稿、引用或富编辑器；不能清空后重试。 |
| `SEND_FAILED` | 客户端已有失败记录；报告记录和状态，按授权决定重试。 |
| `SEND_UNKNOWN`、`SELECTION_UNKNOWN` | 动作已有可能发生，检查原目标和现有结果。 |
| `SDK_QUERY_FAILED`、`INVALID_MESSAGE_IDS` | 保留查询失败或参数错误，不转换为空历史。 |
| `TEXT_WOULD_CHANGE`、`INVALID_MESSAGE_TEXT` | 发送前拒绝；检查原文与客户端允许的文本，不静默删改字符。 |
| `ORIGIN_MARKER_CONFLICT` | 保留已有标记和正文，核对损坏或未知版本，不重复附加。 |
| `SDK_CONTRACT_CHANGED`、`SDK_SERVICE_UNAVAILABLE` | 方法、模型、枚举或当前加载状态不符；读取新实现并维护适配，不跳过指纹检查。 |
| `SDK_BUSY` | 仍有在途调用；保留占用，不抢占或重复写入。 |
| `SDK_CALL_UNKNOWN`、`SETTINGS_UNCONFIRMED` | 调用已有可能生效，按原对象及已知 ID 对账，不换页面重做。 |
| `SDK_FLOW_REQUIRED` | 新文件需两阶段准备与发送，使用 send-file，不直接补一次底层调用。 |
| `MESSAGE_NOT_FILE`、`MESSAGE_NOT_IMAGE` | 归属已核对，消息内容类型与所选操作不符；分别使用普通附件下载或 read-image，不把类型不符误报为账户不符。 |
| `IMAGE_REVOKED`、`IMAGE_RESTRICTED`、`IMAGE_VARIANT_UNAVAILABLE` | 保留客户端的撤回、临时消息和清晰度限制，不借缓存绕过。 |
| `IMAGE_DECODE_FAILED`、`IMAGE_CACHE_UNAVAILABLE`、`IMAGE_TOO_LARGE` | 当前内容未导出为可读图片；保留原因与已尝试清晰度，不能把缓存路径当作已读内容。 |
| `IMAGE_DOWNLOAD_UNKNOWN`、`IMAGE_DOWNLOAD_UNCONFIRMED`、`IMAGE_READ_UNKNOWN` | 核对原消息及缓存，不以超时断定下载未发生，不自动重复请求。 |
| `SDK_SENSITIVE_RESULT`、`SDK_RESULT_UNSERIALIZABLE` | 选择本次需要的结果字段；保留失败，不输出认证、密钥或循环对象。 |
| `WEB_ACCOUNT_CHANGED`、`WEB_APP_NAVIGATED`、`WEB_CONTRACT_CHANGED` | 网页身份、来源或接口不符；停止当前调用，不借用另一账户或猜测新协议。 |
| `WEB_DOWNLOAD_FAILED`、`WEB_DOWNLOAD_TIMEOUT`、`WEB_DOWNLOAD_REDIRECT`、`WEB_OUTPUT_EXISTS` | 保留文件服务或输出失败，核对已注册来源与输出；已有文件不覆盖。 |
| `WEB_SENSITIVE_RESULT`、`WEB_INTERNAL_RESULT` | 认证字段、带认证地址或内部交接未被消费；保留失败，使用投影或 shape，不导出内部对象。 |
| `WEB_CALL_UNKNOWN` | 网页写入可能已提交；读取原目标的状态，不重复提交。 |
| `WEB_APP_LOAD_FAILED`、`WEB_API_UNAVAILABLE`、`WEB_HTTP_ERROR`、`WEB_RESPONSE_SCHEMA` | 保留连接、加载、HTTP 或协议失败；不能转换为空业务数据。 |
| `MONITOR_GAP`、`INVALID_CHECKPOINT` | 核对历史和检查点，保留遗漏证据。 |
| `LISTENER_ACCOUNT_UNKNOWN` | 旧内存订阅没有账户绑定，不能复用、读取或确认；原所有者处理遗留覆盖记录后注销重建，见[消息监控](monitoring.md)。 |
| `RECEIVER_BUSY`、`RECEIVER_CONFIG_CHANGED` | 状态目录已有活动写者，或属于另一账户、范围及归集策略。保留原状态，使用原配置，不抢占。 |
| `RECEIVER_CAPACITY`、`INVALID_RECEIVER_STATE`、`INVALID_BATCH_STATE` | 状态达到保留上限或损坏；原记录保留，停止采集交接并核对检查点，不重置为初始状态。 |
| `LISTENER_LOST`、`RECEIVER_SEQUENCE_GAP`、`OBSERVATION_STOPPED` | 接收覆盖存在中断，待处理内容仍保留。按原账户及历史核对缺口，新基线不能代替补齐证据。 |
| `BATCH_MESSAGE_CONFLICT` | 同一账户、会话、消息 ID 对应的正文或发送者发生冲突；核对原消息，不能当作普通重复通知丢弃。 |

## 适配边界

当前适配器验证过 iCenter 12.1.0（Windows 文件版本 12.1.0.662）的 Vue 状态、主编辑器及文本发送与按 ID 查询 SDK。SDK 路径仍经 CDP 使用现有登录客户端；它不是厂商公开 API，不对未来版本作兼容承诺。已发现接口与已适配操作的边界见 [SDK 与消息来源](sdk-and-origin.md)。

通用 CDP 命令不依赖该 Vue 适配器。它不自动核对业务账户或会话，调用方按[CDP 页面](ui-and-settings.md)在动作前核对身份、草稿和控件，并检查协议异常及业务结果。

`scripts/cdp.cjs` 导出 `listTargets` 和 `CdpClient`。多步操作通过 `CdpClient.connect` 建立一个连接，调用 `send(method, params)`，在 `finally` 中 `close()`。这用于保留同一 CDP 会话中的节点与远程对象；单次 CLI 调用不会保留这些引用。

`scripts/renderer.cjs` 导出 `RendererSession`。它提供账户/可选会话核对、可见 DOM 定位、CDP 输入和现有 Vue 组件的任务回调，接口见[页面工作流工具](ui-and-settings.md#页面工作流工具)。`run` 的回调可以产生副作用，没有预览或撤销保证；调用前需要对应授权。组件定位失败返回 `COMPONENT_NOT_UNIQUE`，控件歧义返回 `CONTROL_NOT_UNIQUE`。它们不是成功的空结果。`click` 的 `ACTION_UNKNOWN` 保留动作后状态核对要求。

`scripts/attachments.cjs` 导出 `downloadFile(session, {chatId?,messageId,outputPath,apply=false,timeoutMs=15000})`。新任务借用 `SdkSession` 并显式提供 chatId；不要求聊天选中或消息已加载。旧 `RendererSession` 借用保留其会话绑定契约。该函数不关闭借用会话。预览、独占输出、完成与未知状态见[下载到指定路径](files-and-collections.md#下载到指定路径)。

客户端代码、令牌、完整状态、企业通讯录和真实会话记录不进入技能包。诊断按需要读取字段，错误不能静默转换为空列表。
