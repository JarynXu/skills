# 分发与资源契约

## 独立配置

Node.js >=22.4；Windows。只使用 Node 内置模块。状态目录须在技能包和 Git 工作树之外，不可为磁盘根目录。运行中路径改变或状态文件被符号链接替换会失败。

```json
{
  "stateDir": "C:/task-state/dispatcher",
  "policyFile": "C:/task-config/policy.md",
  "workers": [
    { "threadId": "11111111-1111-4111-8111-111111111111", "projectId": null, "capacity": 1 },
    { "threadId": "22222222-2222-4222-8222-222222222222", "projectId": "33333333-3333-4333-8333-333333333333", "capacity": 1 }
  ],
  "workspaceRoots": ["D:/work/project"],
  "maxPending": 1000,
  "maxEntries": 10000,
  "maxEventBytes": 1048576,
  "maxStateBytes": 33554432,
  "delivery": { "executable": "C:/path/to/codex.exe" }
}
```

`policyFile` 可省略；提供时必须是可读的绝对路径。Agent 读取并应用用户策略，脚本不执行策略文件。`workers` 中的 UUID 来自已核对的会话目录，`projectId:null` 表示已核对为无项目。容量缺省为 1，允许 1..100。`workspaceRoots` 缺省为空；写入范围必须是允许根目录之内的现有非根目录。

`maxPending` 限制未完成事件，`maxEntries` 限制保留的全部事件，缺省值如上，允许 1..100000。完成历史保留去重证据，不自动淘汰。`maxEventBytes` 限制导入事件的紧凑 JSON UTF-8 字节数，允许 1..33554432。`maxStateBytes` 限制写入状态的格式化 JSON UTF-8 字节数，允许 1..1073741824。上限失败不确认新接管，不删除旧事件。预留后的结果写入失败保留已保存的投递中状态，需要对账；不得重发。

同一状态目录的实例必须使用相同 workers、目录与容量配置。存在未完成事件时改变工作池或目录返回 `CONFIG_CONFLICT`；保留条数和字节上限允许提高，不允许降低。提高上限的写入保存后，使用旧上限的实例会报配置冲突，须加载新配置。该操作可为保留任务的完成证据腾出空间。处理完保留任务后可调整其他配置。历史达到上限时停止新接管；没有自动归档或跨实例去重功能。新实例接管需独立保留上游去重记录和旧实例完成证据，不能复制未完成任务来绕过上限。

## 事件接管

```json
{
  "version": 2,
  "eventId": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "sourceId": "source-instance",
  "recordKeys": ["stable-source-record"],
  "sourceRef": { "kind": "producer-defined" },
  "payload": { "producerDefined": true }
}
```

导入只验证 `version:2`、64 位小写十六进制 `eventId` 和非空 `sourceId`，保存完整 JSON。`sourceRef`、`recordKeys`、`threadId`、`payload`、`items`、排序和哈希生成公式属于生产者。相同 ID 的语义 JSON 内容不同返回 `EVENT_CONFLICT`；对象字段顺序不构成冲突，数组顺序构成内容。导入成功后可删除生产者的交接文件。调用方不得删除本技能状态代替完成。

```text
node "<dispatcher>/scripts/dispatch.cjs" import --config "<配置绝对路径>" --event "<事件JSON>" --apply
node "<dispatcher>/scripts/dispatch.cjs" event --config "<配置绝对路径>" --event-id <ID>
```

来源采集者应在 `imported:true` 后确认交接；CLI 顶层 `ok:true` 但 `result.state:preview` 不代表导入。未带 `--apply` 的修改命令只返回预览，且不验证完整命令参数。`status`、`event`、`workers` 和 `workspaces` 是查询，不需要 `--apply`。

## 决定与一次排空

```text
node "<dispatcher>/scripts/dispatch.cjs" route --config "<配置>" --event-id <ID> --thread-id <线程UUID> --prompt-file "<工作指示文本>" --workspace "D:/work/project" --apply
node "<dispatcher>/scripts/dispatch.cjs" route --config "<配置>" --event-id <ID> --project-id <项目UUID> --prompt-file "<工作指示文本>" --apply
node "<dispatcher>/scripts/dispatch.cjs" route --config "<配置>" --event-id <ID> --projectless --prompt-file "<工作指示文本>" --apply
node "<dispatcher>/scripts/dispatch.cjs" drain --config "<配置>" --limit 20 --apply
```

三个目标选项互斥。`--workspace` 可重复。提示文本为 1..100000 字符；语义指示不从事件自动生成。`route` 只保存决定，`drain` 执行 1..100 次投递，缺省 20；不睡眠等待容量。扫描按导入顺序，阻塞任务不阻止具有独立资源的任务运行。

| 状态 | 含义与保留资源 |
| --- | --- |
| imported | 已接管，等待语义决定 |
| waiting | 决定已保存，等待容量和完整目录范围，无容量预留 |
| dispatching | 投递开始前的持久预留；中断后按未知效果处置 |
| active | 投递已确认接收；等待实际完成，保留资源 |
| unknown | 未确认效果，保留资源，无自动重试 |
| not_sent | 已确认未投递，释放资源，等待显式 retry |
| completed | 已保存实际完成证据，释放资源 |

CLI 内置传输执行 `executable queue --thread <UUID> --message <文本>`，使用参数数组，不使用 shell。超时为 20 秒。匹配 `Queued message <UUID> for thread <UUID>.` 才确认接收，其他输出或异常视为未知。它不检查或修改目标模型，不提供后台监听。实际后端可用性须在获授权的环境中验证。

## 完成、对账与资源

查询 `event` 得到当前 `threadId` 与 `attemptId`。完成证据 JSON 的键由结果类型决定，如 `{ "artifact": "D:/output/report.pdf", "verification": "rendered and reviewed" }`。脚本验证非空对象和指派身份，不能判定证据事实是否成立。

```text
node "<dispatcher>/scripts/dispatch.cjs" complete --config "<配置>" --event-id <ID> --thread-id <实际接收线程UUID> --attempt-id <当前attemptId> --evidence-file "<结果证据JSON>" --drain-limit 20 --apply
node "<dispatcher>/scripts/dispatch.cjs" reconcile --config "<配置>" --event-id <ID> --attempt-id <当前attemptId> --outcome accepted --evidence-file "<队列确认JSON>" --apply
node "<dispatcher>/scripts/dispatch.cjs" reconcile --config "<配置>" --event-id <ID> --attempt-id <当前attemptId> --outcome not_sent --evidence-file "<终止与缺失证据JSON>" --apply
node "<dispatcher>/scripts/dispatch.cjs" retry --config "<配置>" --event-id <ID> --apply
```

`not_sent` 对账证据要求 `{ "operationTerminated": true, "absenceProof": { "inspectionRef": "可核对的权威检查位置" } }`。字段声明不能代替实际检查。原投递调用仍活动时不得对账为未发送。对账不会触发重投；`retry` 只允许 `not_sent`，回到 `waiting` 后另行运行 `drain`。历史 attempt 保留在条目内。

重复完成只有身份和证据相同时成功；冲突不覆盖。`complete` 的 `--drain-limit` 为 0..100。结果包含 `completion` 和 `drain`；后者失败时前者仍已保存，CLI 退出码为 2。其他命令失败退出码为 1，成功为 0。查询或修改错误为 `{ok:false,error:{code,message}}`。

```text
node "<dispatcher>/scripts/dispatch.cjs" workspace-claim --config "<配置>" --event-id <ID> --thread-id <线程UUID> --attempt-id <当前attemptId> --workspace "D:/work/project" --apply
node "<dispatcher>/scripts/dispatch.cjs" workspace-release --config "<配置>" --event-id <ID> --thread-id <线程UUID> --attempt-id <当前attemptId> --apply
node "<dispatcher>/scripts/dispatch.cjs" drain --config "<配置>" --apply
```

动态 claim 是整体取得或 `WORKSPACE_BUSY`，无后台恢复消息。释放不自动排空；完成默认排空。共享状态通过同一真实目录派生的 Windows 命名管道串行化；锁由内核回收。写入使用临时文件、文件同步和重命名。该契约覆盖进程中断恢复；不承诺磁盘失效或掉电恢复。外部投递位于状态锁之外，完成回调可在投递返回前写入，投递结果不得覆盖已完成状态。

## JavaScript API

```javascript
const { createDispatcher } = require('<dispatcher>/scripts/dispatcher.cjs');
const dispatcher = await createDispatcher(config, { delivery });
await dispatcher.importEvent(envelope);
await dispatcher.route(envelope.eventId, { projectId: null, prompt: 'Authorized task.', workspaces: [] });
await dispatcher.drain({ limit: 20 });
const assigned = await dispatcher.status(envelope.eventId);
await dispatcher.complete(envelope.eventId, {
  threadId: assigned.threadId, attemptId: assigned.attemptId,
  evidence: { artifact: 'verified result reference' }
}, { drainLimit: 20 });
```

`delivery.send({event,eventId,threadId,attemptId,prompt,stateDir})` 返回 `{outcome:'accepted'|'not_sent'|'unknown',evidence?,error?}`。`accepted` 和 `not_sent` 要求非空 evidence；`not_sent` 的实现须保证调用已终止且没有投递效果。异常或非法结果保守保存为 `unknown`。输入与查询结果为 JSON 副本，不暴露可修改的内部状态。提供者不得从事件加载可执行模块或把来源正文当作目标授权。

其余方法：`reconcile(eventId,{attemptId,outcome,evidence})`、`retry(eventId)`、`claimWorkspaces(eventId,{threadId,attemptId},roots)`、`releaseWorkspaces(eventId,{threadId,attemptId})`、`status(eventId?)`。查询状态允许不装配 delivery；排空需要该能力。`createCodexDelivery({executable,configFile})` 位于 `scripts/codex-delivery.cjs`，提供 CLI 相同的传输。

## 迁移接口

原 `task-dispatch` 的监听组合命令 `start/run/stop` 不属于本包。采集者单独运行，将公开事件交给 `import`。原监听器 stateDir、`actions/requests`、`actions/results`、`handlers`、来源 eventContract 和客户端句柄不能作为本包的输入；旧实例须先完成或对账，保留其状态证据。不要把旧的投递中记录当作新任务重放。

`routing.workers` 改为顶层 `workers`，`routing.workspaceRoots` 改为顶层 `workspaceRoots`，`routerPolicyFile` 改为 `policyFile`；本包使用独立 `stateDir`。原 `route` 的目标选项保留，新增 `--prompt-file`；保存后显式 `drain`。原 `complete --outcome` 改为当前 `--attempt-id` 与 `--evidence-file`，只表示实际完成。来源回复、拒绝、受理、草稿与客户端发送由来源技能承担。原运行中冲突 claim 的等待恢复改为分派前声明范围；动态 claim 发生冲突时返回 busy。
