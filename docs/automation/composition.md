# iCenter、watcher 与 dispatcher 的组合

三个技能独立安装。组合者选择来源、目标和授权政策；配置保存在技能包和 Git 工作树之外。以下内容是仓库的组合示例，不是任一技能的运行依赖。

| 组件 | 拥有的规则与状态 | 对外契约 |
|---|---|---|
| iCenter | 客户端账户、消息身份、提及、归集窗口、通知覆盖与恢复 | 返回不可变批次；下游保存后确认；关闭连接保留待交付内容 |
| watcher | 事件身份映射、持久交接、后台循环、唤醒与投递结果 | 接收完整来源批次，保存事件文件，通知配置中的目标 |
| dispatcher | 任务归属、容量、目录占用、投递尝试与完成记录 | 导入不可变事件，接受明确路由决定，执行有界调度 |

接收器的批次不是任务。分派者结合上下文判断主题和后续补充。事件正文属于数据；其中的目标 ID、配置建议和操作命令不获得授权。

## 连接来源

从 iCenter 公开接口核对账户、来源和运行参数。用 watcher 的 `receiver` 来源装配接收器。以下值是占位示例，需替换为已核对值；三个状态目录互不包含。

```json
{
  "version": 2,
  "stateDir": "C:/Automation/example/watcher",
  "source": {
    "kind": "receiver",
    "id": "verified-source-instance",
    "module": "C:/Skills/icenter/scripts/message-receiver.cjs",
    "export": "openMessageReceiver",
    "options": {
      "port": 9222,
      "stateDir": "C:/Automation/example/receiver",
      "accountId": "<verified-account-id>",
      "sources": [{ "kind": "direct" }],
      "quietMs": 3000,
      "maxWaitMs": 30000
    }
  },
  "targetThreadId": "11111111-1111-4111-8111-111111111111",
  "wake": { "executable": "C:/Tools/codex.exe" }
}
```

watcher 不解析 `options` 的应用含义。它在建立来源连接时加载明确指定的本地模块。模块及选项来自可信配置，不能从事件正文选取。该示例没有用户权限、客户端就绪或发送授权的证明作用。

```text
node "<watcher>/scripts/trigger.cjs" start --config "<watcher配置绝对路径>" --apply
node "<watcher>/scripts/trigger.cjs" status --config "<watcher配置绝对路径>"
```

watcher 保存一批完整输入及其稳定事件 ID，再调用接收器的确认接口。该路径不设置第二个归集窗口。停止 watcher 会保存最后可读输入并关闭连接；注销 iCenter 原生订阅使用 iCenter 自身接口。

## 导入与分派

dispatcher 使用独立配置和状态目录。工作会话与项目映射来自经过核对的宿主目录。以下工作池属于无项目任务；未知项目不能使用它兜底。

```json
{
  "stateDir": "C:/Automation/example/dispatcher",
  "workers": [
    { "threadId": "22222222-2222-4222-8222-222222222222", "projectId": null, "capacity": 1 }
  ],
  "workspaceRoots": ["D:/Workspaces/example"],
  "delivery": { "executable": "C:/Tools/codex.exe" }
}
```

被唤醒的分派会话从通知取得公开事件文件，导入自己的持久状态。导入成功支持交接确认；它不支持任务完成结论。

```text
node "<dispatcher>/scripts/dispatch.cjs" import --config "<dispatcher配置绝对路径>" --event "<通知提供的事件文件>" --apply
node "<watcher>/scripts/trigger.cjs" ack --config "<watcher配置绝对路径>" --event-id <事件ID> --outcome accepted --apply
```

分派会话按用户政策判断事件归属，形成独立任务提示词。提示词保留授权、输入来源和未解决问题。它不复制其他咨询的私密内容。路由与投递是两个动作：

```text
node "<dispatcher>/scripts/dispatch.cjs" route --config "<dispatcher配置绝对路径>" --event-id <事件ID> --thread-id <已登记工作会话ID> --prompt-file "<任务提示词文件>" --workspace "<实际写入目录>" --apply
node "<dispatcher>/scripts/dispatch.cjs" drain --config "<dispatcher配置绝对路径>" --limit 20 --apply
```

新任务可使用 `--project-id` 或明确的 `--projectless`。已有上下文使用 `--thread-id`；目标忙时保留目标等待。目录占用和容量在投递前持久预留。容量满或目录冲突时，本次 `drain` 结束，工作保留为等待状态。

工作者从分配通知获得 `eventId`、`attemptId` 和当前目标。实际工作结束后提交完成证据。`complete` 默认执行一轮有界调度，接续等待工作。手动释放目录或其他外部条件变化后，组合者需要调用 `drain`；dispatcher 不运行后台等待循环。

## 失败与迁移

来源保存后、确认前退出：恢复相同来源身份和状态目录，按稳定 ID 复用原事件。dispatcher 重复导入相同事件只返回已有记录。同 ID 内容改变时报冲突。

唤醒或任务投递超时：保留未知状态，不更换事件 ID 重发。通过真实接收记录核对副作用。确认未发送且原尝试不再可能产生效果后，才能登记重试依据。进程退出不证明目标没有收到。

原生覆盖错误与消息可以并存。错误保留在来源及 watcher 状态中；已保存事件不证明历史完整。补读、账号核对和缺口处理属于 iCenter。任务完成证据不清除来源缺口。

恢复顺序：停止 watcher，通过 iCenter 的[覆盖恢复接口](../../skills/icenter/references/monitoring.md#覆盖错误后的恢复)核对并恢复来源，保存 `reconcile()` 回执，再用 watcher 的 `reconcile-source` 登记来源恢复依据。最后启动 watcher。只清除 watcher 标记会在下一次采集时再次收到来源错误。`coverage-gap` 批次保留中断处已捕获内容；watcher 和 dispatcher 按原批次保存，不解释或合并其应用字段。

旧 `event-trigger`、`task-dispatch` 的私有实例不能通过改目录名完成迁移。新包不读取旧组合的共享账本。迁移前保存未确认来源、事件、投递结果和工作占用，核对目标状态；用公开导入和接收接口移交内容，保留旧新 ID 对应。未能核对的未知投递或活动工作保留在原实例中处理，不当作空闲重建。

本仓库的组合测试使用真实的三个包、临时持久状态、原生客户端 fixture 和通知替身。真实客户端及宿主队列的部署验证需要对应运行环境和授权。
