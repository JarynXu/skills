# 消息观察与归集

被动观察通过本机 CDP 读取 SDK 新消息通知，参考客户端版本见[版本记录](../scripts/client-version.json)。它不切换聊天、不置已读、不发送消息，也不代表完整历史。开始前按[连接与身份](connection-and-identity.md)核对端口、主窗口、账户和提及身份。需要连续观察、去重及按静默期归集时使用 `scripts/message-receiver.cjs`；只需原生通知缓冲或要自行管理归集状态时使用 `scripts/notifications.cjs`。

## 持久消息接收器

`scripts/message-receiver.cjs` 提供独立 Node.js 模块。接收器管理原生通知订阅、持久消息去重、静默分组和待交付批次。

```js
const { openMessageReceiver } = require('<icenter目录>/scripts/message-receiver.cjs');
const receiver = await openMessageReceiver({
  port: verifiedPort,
  stateDir: '<技能包和 Git 工作树之外的绝对状态目录>',
  accountId: verifiedAccountId,
  mentionIdentity: verifiedMentionIdentity,
  sources: [{ kind: 'group', chatId: verifiedGroupId, trigger: 'mention' }],
  quietMs: 3000,
  maxWaitMs: 30000,
});
try {
  const snapshot = await receiver.next({ timeoutMs: 60000 });
  if (snapshot.error) throw Object.assign(new Error(snapshot.error.message), snapshot.error);
  for (const batch of snapshot.batches) {
    await persistBatchAndIdMapping(batch);
    await receiver.confirm(batch.id);
  }
} finally {
  await receiver.close();
}
```

`openMessageReceiver(options)` 建立并拥有通知会话。`MessageReceiver.open({session,...options})` 借用调用方提供的会话；两者都需要 `stateDir`、`accountId` 和 `sources`，可选 `mentionIdentity`、`quietMs` 与 `maxWaitMs`。默认静默期为 3000 毫秒，取值为 0..60000；最长等待默认为 30000 毫秒，取值为 1..300000 且不小于静默期。端口和目标窗口不属于持久身份；同账户、同来源策略用同一状态目录重连时可恢复原状态。

| 来源 | 范围与触发 |
|---|---|
| `direct` | 所有单聊来信，含新联系人；排除本人、群及机器人。不能附带聊天、发送者或起点限制。 |
| `conversation` 或省略 kind | 指定 `chatId` 和非空 `senderIds` 的来信。 |
| `self-text` | 登录账户的本人自聊原生文本。可用 `textPrefix` 限定首个词；前缀含义由调用方决定。 |
| `group-mention` | 保留原生个人提及订阅语义；`chatId` 指定群。需要核对过的 `mentionIdentity`。 |
| `group` | 收集指定 `chatId` 范围内的全部来信，需要核对过的 `mentionIdentity`。可选 `trigger:'all'|'mention'`，省略时为 `all`。`trigger` 只标记批次，不过滤消息。 |

`trigger` 的批次结果为 `true`、`false` 或 `null`。`null` 表示提及证据缺失或不可用，不能按 `false` 忽略。批次内任一消息有肯定证据时结果为 `true`；没有肯定证据且至少一条证据未知时为 `null`。同一批次中，后续消息带提及时，批次仍保留该发送者此前连续消息的原文。

接收器按账户、聊天和发送者归组。新消息在静默期内延长批次；达到 `maxWaitMs` 时封批。批次含稳定 `id`、账户、聊天、发送者、原始记录、首末观测时间、封批时间、封批原因和 `triggered`。封批原因为 `quiet`、`max-wait` 或 `coverage-gap`。`coverage-gap` 表示覆盖中断或恢复边界截断了连续输入；封批时间取最后观测时间，不代表实际中断时刻或内容完整。归组只依据账户、聊天、发送者和时间，不保证同一主题。跨批次的后续内容由处理者结合上下文判断。

| 操作 | 返回及语义 |
|---|---|
| `read()` | 采集通知，持久化记录，确认已持久化的原生序号，并封存到期批次；返回 `{batches,error,nextReadyAt,accountId,generationId,baseline}`。 |
| `next({timeoutMs=60000,signal})` | 内部等待并返回同样的快照；到期无批次时增加 `timedOut:true`。接收器关闭或信号取消会结束等待。 |
| `confirm(batchId)` | 调用方已持久接收批次后，移除本地待交付批次。它不表示客户端已读、任务已分派或处理已完成。 |
| `inspect()` | 只读已保存快照、`pending` 中未封组的原始记录和 `reconciliations` 恢复回执；不访问客户端，不推进静默期限，也不清除覆盖错误。 |
| `reconcile({errorId,evidence})` | 核对当前订阅健康状态，记录调用方的历史核对依据，封存恢复边界处的未封组，清除指定覆盖错误。返回持久回执；不补写历史消息。详见下方恢复步骤。 |
| `close()` | 释放接收器拥有的连接和状态目录写锁，保留原生订阅缓存及未确认批次，以供同一状态目录恢复。借用会话时不关闭会话。 |
| `stop()` | 最后采集并保存通知；当前无错误时登记 `OBSERVATION_STOPPED`，已有错误则保留。随后注销本接收器的原生订阅并关闭接收器。 |

`stateDir` 保存私有消息正文，必须位于技能包和 Git 工作树之外。入口拒绝文件系统根目录，以及祖先含 `SKILL.md` 或 `.git` 的目录；检查覆盖链接解析后的真实路径和尚未创建的子目录。同一目录仅允许一个活动写者。接收器最多保留 10000 条待处理消息、100000 个已见消息 ID 和 32 MiB 检查点。达到限制时返回错误并保留已有数据，不淘汰旧记录。首次订阅从建立订阅后开始观察，不重放历史。

进程重启时以相同账户、来源策略和状态目录恢复，不需调用方传入 `ownerId`、`generationId` 或 mention 窗口。账户变化、原生订阅丢失、序号不连续或通知覆盖错误会保留原数据并返回错误；快照中的批次不能证明中断区间的内容完整，等待超时也不能解释成无消息。需要按消息 ID 在客户端历史核对缺口；接收器不自动补洞。账户或来源策略变化需保留旧状态并建立独立核对路径，不能重置状态来消除错误。

### 覆盖错误后的恢复

覆盖错误含稳定 `id`。出现新的覆盖故障或重建订阅时，错误 ID 会变化。恢复保留状态目录、批次 ID、已见消息索引和未确认内容；原版本检查点在打开时迁移，不要求编辑私有文件。迁移后的检查点不兼容旧接收器实现。

1. 停止使用此接收器的后台消费者，通过 `read()`、`inspect()` 保存并核对错误、已捕获消息和基线。恢复原配置账户。原生订阅仍报告错误或序号缺口时，用 `stop()` 注销，再按原参数重新打开接收器；这段停止区间也属于待核对范围。
2. 通过客户端历史按消息 ID 核对缺口，包括旧基线至新基线之间的内容。缺失消息的处理使用独立任务；接收器不注入历史消息。无法补全的区间保留缺失结论，续收须有相应授权，不能记作历史完整。
3. 从当前快照取得 `error.id`，调用 `reconcile({errorId: snapshot.error.id, evidence: '核对范围、处理结果和证据位置'})`。`evidence` 为 1..4096 字符的非空说明。接收器检查账户、序号和原生错误；订阅尚未恢复时报 `RECEIVER_NOT_READY`。错误已变化时报 `STALE_COVERAGE_ERROR`，需核对新范围。
4. 保存返回回执，再调用 `read()` 核对当前错误为空。随后恢复消费者。外层消费者若持有覆盖错误标记，应根据此回执解除自身标记。

回执包含原错误、核对依据、当前代次、基线和恢复时间。相同错误 ID 与依据的重复调用返回原回执；不同依据报 `RECONCILIATION_CONFLICT`。旧回执不会清除后来发生的错误。`inspect().reconciliations` 可用于核对保存结果未知的恢复请求。证据由调用方提供，接口不验证证据中的历史结论；成功只证明回执已保存、检查时订阅可读及接收状态已恢复。

从升级前的原生内存订阅迁移时，旧签名不能由接收器复用，也不能强制接管。先由原 owner 保存并处理待确认记录，再注销旧订阅，记录观察空档，然后建立接收器。低层 `notifications.cjs` 保留原读、确认和原生 followups 行为；传入旧 `quietMs`、`mentionWindows` 或 `sources[].followups` 时，`subscribe()` 会在结果中返回 `compatibility.code: 'LEGACY_FOLLOWUPS'`。新接收器不使用这些参数，需将分组和续发策略迁至接收器。

## 原生通知会话

`scripts/notifications.cjs` 是公开 Node.js 模块，仅使用本技能及 Node.js 内置模块。`openNotifications({port,targetId?})` 连接唯一主窗口并返回 `NotificationSession`。独立使用不需安装事件或分发技能。

```js
const { openNotifications } = require('<icenter目录>/scripts/notifications.cjs');
const session = await openNotifications({ port: verifiedPort });
const owner = { ownerId: persistentOwnerId, accountId: verifiedAccountId };
try {
  const baseline = await session.subscribe({ ...owner, generationId: freshGenerationId,
    sources: [{ kind: 'conversation', chatId: verifiedChatId, senderIds: [verifiedSenderId] }] });
  const snapshot = await session.readPending(owner);
  await persist(snapshot.records);
  if (snapshot.records.length) await session.confirm({ ...owner, sequence: snapshot.records.at(-1).sequence });
  if (snapshot.error) throw Object.assign(new Error(snapshot.error.message), snapshot.error);
  await session.unsubscribe(owner);
} finally {
  session.close();
}
```

`ownerId` 是订阅所有者标识，不是收件人。订阅绑定创建时的账户；读取和确认要求当前账户与订阅账户一致。`generationId` 标识渲染订阅代次。相同配置可复用现存订阅；每个渲染窗口只允许一个所有者。不同所有者不能读取、确认或移除对方的订阅。

| 操作 | 返回及语义 |
|---|---|
| `subscribe(scope)` | 返回 `reused,generationId,baseline,sequence`。`baseline` 含聊天 ID、类型及当前最新消息 ID，不重放历史。配置变化拒绝复用。 |
| `readPending(owner)` | 返回未确认记录副本及 `error,sequence,acknowledged,checkedAt`。错误可与已捕获记录并存。 |
| `confirm({...owner,sequence})` | 清除不大于指定序号的本订阅缓冲，不改变客户端已读。调用方先持久化记录。确认期间到达的新消息保留。 |
| `unsubscribe(owner)` | 仅注销本所有者观察者。注销会丢弃原生内存缓冲；调用方需先保存遗留记录或登记未保存范围。 |
| `sendReply({accountId,chatId},text,options?)` | 向核对后的聊天发送并取得客户端消息 ID。原生会话使用 SDK，不切换聊天、不改草稿。可选 `{markOrigin:true}` 按来源策略附加标记。发送需要用户授权，详见[编写与发送](compose-and-send.md)。 |
| `close()` | 释放本会话拥有的 CDP 连接，不清除缓冲、错误或订阅。借用连接构造会话时不取得关闭权。 |

`session.call(operation,input)` 提供本技能适配的单次客户端调用，遵守[工具契约](tools.md)。`sendReply(client,recipient,text,options?)` 可借用客户端；直发能力及旧客户端兼容见[SDK 与消息来源](sdk-and-origin.md#调用方契约)。它不决定业务回复内容，也不保存任务完成状态。当前 SDK 发送与服务调用在同一主窗口共享互斥，见[客户端接口](client-api.md#结果并发与恢复)；调用方仍负责业务去重及旧 call-only 客户端的协调。用户手动操作不受该互斥约束。

原生 `scope` 包含 `ownerId,accountId,generationId,sources`，可选 `mentionIdentity,quietMs,replyAwareness,mentionWindows`。它不接受接收会话、工作池、模型或持久事件字段。低层来源项 `conversation`、`direct`、`group-mention` 和 `self-text` 的范围见上表。`group-mention.followups:true` 可让同群同发送者在原生静默窗口内的无提及消息成为候选；它不产生批次。重复 SDK 通知可能扩大渲染候选。需要可靠归集时使用持久接收器。

`replyAwareness:true` 返回授权范围内本人已确认的对外回复。未确认发送不算回复。它记录账户行为，不推断操作者是人还是 AI。本人自聊与对外回复的路径分开。

记录含 `sequence,accountId,chatId,chatType,id,incoming,sourceKind` 及可用的聊天名称。有效来信含 `message`，本人确认回复含 `ownReply`。消息包含原生 ID、发送者、类型、正文、观测时间及提及证据；`self-text` 的方向为 `self-text`，不宣称控制授权。

`readPending` 为 `message` 和 `ownReply` 附加 `origin`，原始 `text` 与确认序号保持原值。标记只用于来源排除，不能据此授予控制权限或认定真人作者，见[SDK 与消息来源](sdk-and-origin.md#代发来源与文风取样)。

长消息通知可能只有 ID 和 `contentState:needs-client-read`。按 ID 从原客户端补读，不能用空正文判断无内容。图片、附件元数据不证明内容已读。

## 连续性与错误

原生缓冲上限为 2048 条或 16 MiB。溢出、未知字段或通知失败会保留错误；账户核对通过时，已有记录仍可读取。账户切换后拒绝复用、读取和确认原订阅，保留原缓冲。页面或订阅丢失返回 `LISTENER_LOST`；低层调用方核对代次、原记录及基线，未知最新消息需查历史补齐。首次基线和重新订阅不能证明无遗漏。

升级前创建的原生内存订阅缺少账户绑定时返回 `LISTENER_ACCOUNT_UNKNOWN`。不能用当前登录身份补认旧记录；原所有者保存或登记其记录后注销订阅，再按原账户持久记录和客户端历史对账。

低层调用方负责在 `confirm` 前持久保存原始记录及覆盖错误。重连原所有者可接回未确认缓冲。停止、关闭连接或清理订阅不能把缺口变成“没有新消息”。本接口不自动启动、重启客户端或清除其他所有者资源。

## 有时限观察

`icenter.cjs watch` 观察当前聊天已加载消息，包含本人消息。核对 `senderId` 及方向；它不替代全账户订阅。

```text
node "<icenter目录>/scripts/icenter.cjs" watch --port <端口> --account <账户ID> --chat <聊天ID> --duration-seconds 120 --idle-seconds 60 --checkpoint "<任务目录>/cursor.json"
```

首次建立基线，不输出既有消息。期限、空闲结束或范围变化后退出。检查点保存账户、聊天及最后 ID；锚点不在窗口时报告缺口并需补齐历史。无检查点重启是新基线。

验证：`node --test "<icenter目录>/scripts/tests/notifications.test.cjs" "<icenter目录>/scripts/tests/message-receiver.test.cjs"`。隔离测试使用 fixture，不证明真实客户端版本、账户、连续性或就绪。外部自动处理程序运行自己的组合回归。
