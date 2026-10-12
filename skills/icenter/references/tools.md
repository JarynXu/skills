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
| `send` | `--port --account --chat --text-file [--apply]`。要求当前选中目标且主编辑器为空。正文为 UTF-8，CRLF 转 LF，其他文本保留。默认预览，执行后最多等候 15 秒确认。 |
| `watch` | `--port --account --chat [--duration-seconds] [--idle-seconds] [--checkpoint]`。默认总时长 60 秒、空闲时长 30 秒，范围 1–43200 秒。详细语义见[监控](monitoring.md)。 |

`status`、`chats`、`select`、`read`、`send` 和 `watch` 可追加 `--target-id`。通用 `cdp` 命令必须指定页面 ID。不接受未知参数或多余位置参数。消息内容来自文件，不能拼接进命令源码。

普通命令输出一个 JSON 对象；`watch` 输出逐行 JSON。失败输出 `ok:false`、错误码及说明，退出码为 1。成功退出只支持该命令的结果语义，预览不会发送。

## 字段的含义

账户 `id` 来自登录状态，`linkedUnionId` 来自同一资料对象，`aliasesComplete:false` 表示别名未穷尽。SIP URI 不应转换为邮箱。

消息返回客户端消息 ID、发送人、原始时间、类型、正文、传输与已读字段。原始时间保留客户端表示，不假定 UTC；`text` 是客户端内容字段，非文本类型可能携带结构化内容。不要把文件元数据当成可读正文或已下载文件。`clientType`、`readStatus` 保留原始值，未经对应版本证据不能自行命名。

`transfer` 为 `initial`、`pending`、`confirmed`、`failed` 或 `unknown`。这表示客户端传输状态，不能证明他人收到或阅读。`send` 的 `client-confirmed` 还要求新增消息 ID、发送人和完整正文匹配。存在多条匹配消息时报告未知，避免选错证据。

## 错误与恢复

| 错误 | 处理 |
|---|---|
| `CDP_UNREACHABLE`、`CDP_DISCONNECTED` | 检查实例与端口；写入后断开需要核对副作用，不能立即重发。 |
| `MAIN_WINDOW_NOT_UNIQUE`、`WRONG_WINDOW` | 重新发现主窗口；辅助页面不能替代主窗口。 |
| `NOT_SIGNED_IN` | 用户完成登录；不采集密码或验证码。 |
| `RESTART_REQUIRED` | 保留未完成工作，按已确认授权对目标 PID 执行 `connect --restart`；不转用桌面工具。 |
| `INSTANCE_NOT_UNIQUE`、`INSTALLATION_NOT_UNIQUE` | 从实际实例或安装信息选择 PID、路径；不取第一个。 |
| `CDP_NOT_READY` | 检查原实例、返回 PID 和端口，不重复启动或重启。 |
| `UNSUPPORTED_VERSION`、`UNSUPPORTED_SCHEMA` | 使用通用 CDP 检查 DOM 和页面状态。维护专用适配器需要版本和字段证据。 |
| `TARGET_NOT_FOUND` | 使用 `targets --all` 重新定位页面，不能沿用失效 ID。 |
| `ACCOUNT_CHANGED`、`CHAT_CHANGED`、`MESSAGE_SCOPE_MISMATCH` | 重新核对账户和目标；禁止把新会话的数据贴上旧标签。 |
| `CHAT_NOT_VISIBLE`、`CHAT_NOT_UNIQUE` | 搜索或滚动后核对精确 ID，不取第一个同名结果。 |
| `DRAFT_PRESENT`、`EDITOR_UNAVAILABLE` | 保留现场，检查草稿、引用或富编辑器；不能清空后重试。 |
| `SEND_FAILED` | 客户端已有失败记录；报告记录和状态，按授权决定重试。 |
| `SEND_UNKNOWN`、`SELECTION_UNKNOWN` | 动作已有可能发生，检查原目标和现有结果。 |
| `MONITOR_GAP`、`INVALID_CHECKPOINT` | 核对历史和检查点，保留遗漏证据。 |

## 适配边界

当前适配器验证过 iCenter 12.1.0（Windows 文件版本 12.1.0.662）的 Vue 状态与主编辑器。它不是厂商公开 API，不对未来版本作兼容承诺。

通用 CDP 命令不依赖该 Vue 适配器。它不自动核对业务账户或会话，调用方按[CDP 页面](ui-and-settings.md)在动作前核对身份、草稿和控件，并检查协议异常及业务结果。

`scripts/cdp.cjs` 导出 `listTargets` 和 `CdpClient`。多步操作通过 `CdpClient.connect` 建立一个连接，调用 `send(method, params)`，在 `finally` 中 `close()`。这用于保留同一 CDP 会话中的节点与远程对象；单次 CLI 调用不会保留这些引用。

`scripts/renderer.cjs` 导出 `RendererSession`。它提供账户/可选会话核对、可见 DOM 定位、CDP 输入和现有 Vue 组件的任务回调，接口见[页面工作流工具](ui-and-settings.md#页面工作流工具)。`run` 的回调可以产生副作用，没有预览或撤销保证；调用前需要对应授权。组件定位失败返回 `COMPONENT_NOT_UNIQUE`，控件歧义返回 `CONTROL_NOT_UNIQUE`。它们不是成功的空结果。`click` 的 `ACTION_UNKNOWN` 保留动作后状态核对要求。

`scripts/attachments.cjs` 导出 `downloadFile(session, {messageId, outputPath, apply=false, timeoutMs=15000})`，借用调用方绑定会话的 `RendererSession`，不关闭它。预览、文件保留、成功与未知状态的契约见[下载到指定路径](files-and-collections.md#1210-下载到指定路径)。

客户端代码、令牌、完整状态、企业通讯录和真实会话记录不进入技能包。诊断按需要读取字段，错误不能静默转换为空列表。
