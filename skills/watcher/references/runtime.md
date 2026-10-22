# 运行契约

## 入口与环境

需要 Windows、Node.js 22.4 或更高版本，使用 Node 内置模块。`scripts/trigger.cjs` 提供 `start`、`run`、`status`、`stop`、`ack`、`retry`、`reconcile-source`。`run` 在前台运行；`start` 启动隐藏后台进程。除 `status` 外，命令默认预览，`--apply` 执行。

```text
node "<watcher>/scripts/trigger.cjs" start --config "<绝对配置文件>"
node "<watcher>/scripts/trigger.cjs" start --config "<绝对配置文件>" --apply
node "<watcher>/scripts/trigger.cjs" status --config "<绝对配置文件>"
node "<watcher>/scripts/trigger.cjs" stop --config "<绝对配置文件>" --apply
```

状态目录必须为绝对路径，不能是文件系统根、技能包内部或 Git 工作树内部。路径检查解析现有目录联接。Windows 内核命名管道提供单写者权；`listener.lock` 保存诊断记录。崩溃释放内核锁，磁盘事件保留。取得内核锁的进程替换旧记录，旧 PID 存活不构成拒绝条件。PID 复用不能代表实例所有权。

`status` 连接现有管道，核对持有者返回的 PID、令牌与状态更新时间。查询不取得独占锁。管道已取得、锁文件或状态尚未发布时，返回 `starting`。匹配状态过期时返回 `unresponsive`。查询超时或协议不能核对时返回 `ownership-unknown`，不能据此启动替代进程。每次管道查询的超时为 1 秒。

| 字段 | 含义 |
|---|---|
| `ownership` | `owned` 表示管道持有者已响应；`absent` 表示没有管道持有者；`unknown` 表示无法核对。 |
| `lockRecord` | `matched`、`stale`、`missing`、`unreadable`、`unverified` 表示磁盘记录与当前持有者的关系。 |
| `observedProcessAlive` | 已核对的管道持有者 PID 的存活诊断。旧文件中的 PID 不进入此字段。 |
| `recordedProcessAlive` | 磁盘记录 PID 的存活诊断，不证明锁所有权。 |
| `fresh` | 状态的 PID、令牌匹配当前管道持有者，更新时间处于新鲜窗口。 |

`start` 拒绝已核对的持有者及所有权未知，允许旧活 PID 没有管道的崩溃恢复。并发启动由内核锁决定获胜实例。`stop` 通过管道向已核对的持有者提交令牌；停止请求不写入 `stop.json`，不向文件中的 PID 发送信号。请求只作用于响应它的实例。没有持有者时，`stop` 取得实例锁并保存停止状态，不连接来源。停止请求已接受但 10 秒内未确认该持有者释放时，返回 `stop-requested`。

`runtime.acquireLock(config, { onStop } = {})` 返回 `{ owner, release }`。缺省锁用于维护操作，不能由 `stop` 取消；`stop` 返回 `LISTENER_NOT_STOPPABLE`。运行时提供同步、不抛异常的 `onStop` 回调，回调只请求取消，资源清理由 `run` 完成。`release` 释放自身管道；匹配令牌的磁盘记录由它删除。

`pollMs` 为 250..60000，默认 1000。配置中的目标必须是已核对的会话 UUID，不能由来源载荷生成。配置及来源模块具有执行权，属于可信实例输入。来源事件不具有配置权。

## 已就绪接收器

```json
{
  "version": 2,
  "source": {
    "kind": "receiver",
    "id": "source-instance",
    "module": "C:/trusted/source/receiver.cjs",
    "export": "openReceiver",
    "options": { "sourceSpecific": "opaque JSON" }
  },
  "stateDir": "C:/task/watcher-state",
  "targetThreadId": "11111111-1111-4111-8111-111111111111",
  "pollMs": 1000,
  "wake": { "executable": "C:/tools/codex.exe" }
}
```

`module` 是可信本地 CommonJS `.cjs` 模块绝对路径，`export` 明确选择命名导出。工厂接受 `options`，返回接收器或其 Promise。选项是有限 JSON 数据，不由 watcher 解释。模块路径、导出、完整选项、来源 ID 和目标进入持久身份签名。更改任一项须使用新状态目录或完成显式迁移；不能在运行中改映射。来源与 watcher 的状态目录应互斥，已知目录由组合入口核对，不靠 watcher 解析来源私有选项。

模块在 `source.connect()` 中加载。`status`、预览及只建立来源对象不加载模块。配置加载不调用工厂。运行时不会从事件载荷取模块名或执行路径。

```javascript
const { createReceiverSource } = require('<watcher>/scripts/receiver-source.cjs');
const source = createReceiverSource(config, { openReceiver });
// openReceiver(options) -> receiver
// receiver.read() -> { batches: [{ id: 'stable-id', ...opaquePayload }], error? }
// receiver.confirm(id) -> true | false
// receiver.close() -> void | Promise<void>
```

方法可以返回 Promise。`read` 的每个批次是完整 JSON 对象，`id` 是非空稳定字符串，其余字段不作解释。接收器负责静默窗口、分组、内容就绪和历史恢复。watcher 不检查账户、会话、发送者、提及或正文。`debounceMs` 必须省略或为 0，已就绪输入不再分组或延迟。

`read` 返回的全部批次先落盘，再持久化该轮 `error`，最后按读取顺序 `confirm(id)`。确认前的失败保留来源缓冲；确认后的崩溃从 watcher 事件恢复。来源确认必须支持同 ID 重复确认；未确认输入在恢复读取时重放，成功确认后可从来源缓冲移除。`false` 或确认异常不撤销已保存事件。重复批次必须保留相同内容；对象键顺序不属于内容差异。

`error` 可以是 JSON 数据或 Error。覆盖错误与批次共同返回时，已保存批次仍得到确认，运行随后报告 `SOURCE_COVERAGE_ERROR`。读取异常保存为覆盖错误。错误原数据保存在覆盖记录的 `error.details` 中；Error 保存 code、message 和 details。断线、模块异常、确认失败不作通用重连或自动重投，来源恢复政策属于来源所有者。

停止流程执行最后一次 `read` 和持久交接，再 `close`。`close` 必须释放连接并保留来源订阅及待取缓冲。可选 `stop()` 不由 watcher 调用：它可能注销来源观察或使 `read` 不可用。注销使用来源技能。运行失败仍关闭已取得的连接；关闭失败写入状态并向调用方传播。没有运行进程时，`stop` 不重新加载模块或连接来源。

## 持久事件与顺序

`ReceiverStore` 由 `scripts/receiver-source.cjs` 导出，供运行时扩展与测试使用。存储对象拥有写入、身份建立和回执变更；生产使用的前提是持有运行时的实例锁。接收消费者读取通知给出的不可变事件文件，使用公开 `ack`、`status` 命令；不得打开写入存储或修改其内部状态。已就绪事件形状：

```json
{
  "version": 2,
  "eventId": "sha256(JSON.stringify([sourceId, batch.id]))",
  "sourceId": "source-instance",
  "threadId": "11111111-1111-4111-8111-111111111111",
  "recordKeys": ["stable-id"],
  "sourceRef": { "kind": "receiver", "batchId": "stable-id" },
  "payload": { "id": "stable-id", "sourceSpecific": "whole batch" },
  "order": 1,
  "createdAt": "2026-10-22T00:00:00.000Z"
}
```

`eventId` 是小写 SHA-256 十六进制值。载荷经 JSON 边界校验和脱离共享引用的复制。NaN、Infinity、undefined、循环及非 JSON 对象失败。`order` 在发布时持久化，恢复按它排序；来源字段、原始记录序号和文件名字典序不控制通用投递。`EventJournal.orderedEvents()` 返回此顺序的事件数组。运行时存储契约为 `open`、`orderedEvents`、`summary`、`receipt`、`batchPath`，以及 receipts、root；运行时不调用 `pendingRecords` 或 `createBatches`。

相同事件 ID 的完整载荷、来源、目标及记录键必须一致。冲突返回 `EVENT_ID_CONFLICT`，保留旧事件，不确认冲突输入。文件写入先同步，再原子发布。进程级锁覆盖完整写入与确认周期。

每个实例最多保留 10000 个事件、64 MiB 事件文件。JSON 收件箱另保留最多 10000 条原始记录、64 MiB 原始记录。来源错误与核对证据历史最多 1000 条、4 MiB；相同错误不重复保存历史。达到容量时失败，未交接输入不确认，现有数据不删除。归档与更换状态目录的前提是停止实例、核对消费者结果及来源重放起点。没有自动淘汰或隐式保留期限。

| 位置 | 拥有的事实 |
|---|---|
| `identity.json` | 固定来源、选项和目标的身份签名。 |
| `batches/` | 已交接的不可变事件和顺序。 |
| `receipts/` | 通知进行中、确认、未知或人工核对后的待重试。 |
| `consumer/` | 接收会话的处理结果。 |
| `source-errors/`、`coverage-error.json`、`coverage-resolution.json` | 来源覆盖错误历史与尚未解决的缺口。 |
| `status.json`、`listener.lock`、`listener.log` | 运行状态、单写者与诊断。 |

覆盖错误不会因下一次成功读取消失。恢复采集时状态为 `source-coverage-blocked`，状态保留错误。解除缺口的前提是来源所有者提供补齐或起点变更证据、停止 watcher。执行 `reconcile-source --config <配置> --reason <来源核对证据> --apply`，命令取得实例锁，保存原错误及核对记录，以覆盖 ID 的匹配关系解除活动标记，不删除原错误。相同核对幂等；不同证据不能改写同一核对。来源再次返回错误会生成新的覆盖 ID 并重新阻塞。来源技能的恢复事实不由 watcher 猜测。

## JSON 原始记录收件箱

文件生产者使用 `source: { "kind": "json-inbox", "id": "local-source", "directory": "C:/task/inbox" }`，其余配置同上。首次采集读取全部未捕获文件。目录与 watcher 状态目录必须互斥，不能是根目录。生产者先写临时文件，再原子改名为 `.json`，单文件为普通文件且不超过 1 MiB。

```json
{ "id": "record-001", "groupKey": "topic-001", "text": "输入内容" }
```

该原始记录来源只接受 id、text 和可选 groupKey。ID 在来源内不可复用，文件已捕获后不可改写。没有 groupKey 时每个 ID 分组。`debounceMs` 为 0..60000，默认 0，由 inbox 来源根据观测时间执行分轮；不同分组互不延长，重复文件不延长窗口。只有 inbox 适配器持有 pendingRecords/createBatches。文件不删除；上游生产者负责保留期限。空正文标为 `needs-source-read`，不能等同于无任务。

## 通知与回执

通知后端提供 `check()`、`notify(event,eventFile,configFile)`。确认结果必须含匹配的 threadId；原生队列返回 queuedMessageId，AppToolsNotifier 返回工具与回合证据。原生队列通过参数数组调用配置程序，不使用 shell。`Queued message` 只证明持久入队，不能证明冷会话开始执行。

需要桌面应用唤醒时，组合入口注入 `scripts/app-tools-notifier.cjs` 导出的 `AppToolsNotifier`。它使用宿主现有 MCP stdio 服务，要求可信 serverFile、调用会话 ID 和执行器环境 CODEX_THREAD_ID、CODEX_APP_TOOLS_PIPE_PATH。不能伪造调用者或从载荷取连接参数。CLI 默认使用原生队列；AppToolsNotifier 需要外部组合注入，配置字段不能自行开启它。

AppToolsNotifier 核对本地 Codex 目标。空闲目标确认匹配回合后返回 activation:started；原本忙碌时返回 queued-behind-active-turn。工具接受后没有观察到匹配回合，保留 NOTIFY_ACTIVATION_UNKNOWN，不能重发。组合入口拥有注入通知器的关闭责任。可选 forward 方法供可信组合使用，语义分派不属于 watcher。

投递前保存 dispatching；异常保存 unknown 并停止后续通知。崩溃留下 dispatching 也按未知处理。消费者回执的 eventId 和 threadId 匹配时，可推进为 handled。否则核对接收会话，停止 watcher 后执行：

```text
node "<watcher>/scripts/trigger.cjs" retry --config "<配置>" --event-id <ID> --reason "核对结果：未接受且无延迟投递" --apply
node "<watcher>/scripts/trigger.cjs" ack --config "<配置>" --event-id <ID> --outcome completed --apply
```

ack 支持 accepted、completed、ignored、attention；accepted 证明下游持久接收，completed 记录本轮消费者处理结束，不证明其他会话的业务工作完成。ignored 需要 reason，原始 inbox 的未知正文不能忽略。receiver 的内容完整性由来源与消费者判断，watcher 不解析载荷。ack 文件排他创建，不能改写不同结果。retry 只接受未知或进行中状态，要求 reason 保存原通知未接受且不会延迟到达的核对证据；已有消费者回执时拒绝重试。

## 状态兼容

管道查询使用 version 1 所有者协议。旧运行时的管道不提供此协议；查询报告所有权未知，启动和停止返回 `LISTENER_OWNERSHIP_UNKNOWN`。升级的前提是使用旧入口停止旧进程，核对它已退出。持久事件格式没有变化。旧 `stop.json` 不由新运行时消费。

本包使用 version 2 身份文件和带 order 的 version 2 事件。旧 event-trigger 的身份文件、version 1 消息事件、无 order 批次及私有协调器状态不作隐式迁移。保持旧实例与原目录，核对待处理事件和未知通知，停止旧进程，使用新 watcher 状态目录建立实例。不要复制锁文件或把旧状态目录直接改名复用。来源状态与 dispatcher 状态各自迁移。
