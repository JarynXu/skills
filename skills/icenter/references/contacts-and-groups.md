# 联系人与群组

业务操作使用[客户端接口](client-api.md)。联系人、群、标签和筛选器分别由 contacts、groups、labels、filters 服务承担，查询及写入不依赖搜索框或资料侧栏。

## 联系人及身份

chats 是已加载会话的快照，不代表企业通讯录。按名称找人使用 contacts.searchAddressBook；已确认的工号或账号使用 contacts.getEmployeeInfo，详情使用 contacts.getUserInfoV2FromICenter 等当前接口。先读取 sdk-describe，核对关键词、是否需要电话资料、范围与分页参数；不将显示名称或默认第一条结果作为发送身份。

保留返回的工号、SIP URI、unionID、组织和邮箱各自的含义。不能从工号拼接 URI，从 SIP 推导邮箱，或把同名人员合成一个人。本人识别将登录 unionID 与资料中的对应身份核对；摘要占位符不作为邮箱。只读取本次需要的资料，不为模仿文风批量导出通讯录。

新增、移除和置顶使用 addOneSingleContact、removeOneSingleContact、setContactsTop。修改前核对原联系人及已有关系，修改后重查。个人备注和标签不授予修改组织主数据的权限。labels 服务提供标签查询、增删、排序及人员标签分配。

## 本人状态

当前状态和已保存的自定义状态条目是不同对象。`user-status` 读取指定登录账户的当前状态；`set-user-status` 设置目标状态，核对成功回调并回读结果。无状态的枚举名称为 `None`，全部内置名称从 `sdk-enum --name 22a3.b` 查询，不猜数字。

```text
node "<技能目录>/scripts/icenter.cjs" user-status --port <端口> --account <账户ID>
node "<技能目录>/scripts/icenter.cjs" set-user-status --port <端口> --account <账户ID> --status Custom --custom-id <已查询的状态ID>
node "<技能目录>/scripts/icenter.cjs" set-user-status --port <端口> --account <账户ID> --status Custom --custom-id <已查询的状态ID> --apply
node "<技能目录>/scripts/icenter.cjs" set-user-status --port <端口> --account <账户ID> --expected-custom-id <本次托管状态ID> --apply
```

最后一条省略 `--status`，目标默认为 `None`。`--expected-custom-id` 要求当前仍为该自定义状态；当前状态已变化时返回 `unchanged/current-status-differs`，不写入。该条件在写入前读取，无法锁住用户手动操作；共享账户的调用方负责协调修改。写入后回读不符或连接中断返回 `USER_STATUS_SET_UNKNOWN`，先查当前状态，不重复写入。

自定义条目使用 `contacts.getMyStatusList`、`saveUserStatusCustom`、`deleteUserStatusCustom`。先查方法定义与模型 `b7c5.a`；创建时设置 `content`、`icon` 和 `userStatusCustomId:null`，更新和删除使用查询取得的 ID。`icon:""` 使用客户端默认图标。保存成功后重读列表取得条目 ID；保存不激活状态。创建结果未知时按列表对账，不重复创建。

当前客户端最多保存 20 个自定义条目，名称上限为 40 个计数单位：U+3400–U+4DBF、U+4E00–U+9FFF 范围的字符计 2，其余 UTF-16 代码单元计 1。名称超限时不静默截断用户指定的文字；条目满额时不删除其他条目腾位置。

这些方法的回调位置见 `sdk-describe`；`getMyStatusList` 从第一个参数开始依次为 accepted、rejected、fulfilled、failed、timeout，保存和删除从业务参数之后开始。完成依据包含 fulfilled 且没有失败回调，以及列表中的目标结果。仅收到 accepted、返回空值或方法正常返回不能证明成功。

出差与休假同步属于另一项设置。`updateSyncSettingToICenter` 接受 `businessTrip`、`holidayTrip` 两项参数，其后为回调和超时参数；托管状态操作不修改同步偏好。

### 托管标识

用户授权代办时，使用 `{名称}托管中` 作为默认状态文字，例如 `Codex托管中`；名称未明确时使用 `AI托管中`。用户指定的文字优先。查找并复用本账户中匹配的自定义条目；同名条目有歧义时核对图标和 ID，缺少匹配项才创建。代办流程就绪后启用该条目。设置状态不启动监听，也不证明后台任务已运行；调用方承担代办的启动、停止和授权范围。

结束托管的目标优先使用用户明确指定的状态，其次使用会话上下文已有的恢复目标；缺少目标时清为 `None`。不为恢复采集旧状态快照，不建立恢复文件或状态台账。`expectedCustomId` 沿用本次启用结果或会话中已知的 ID，清除前核对本次状态；用户后来手动设置的状态保持原值。用户明确要求改成其他状态时按该指令执行。

正常结束清除当前状态即可，已保存的托管条目可供下次复用。删除条目需要对应意图。连接丢失或进程退出无法保证清除已发生；重连后核对当前状态与会话中的结束目标，报告未完成结果，不声称已恢复。

Node.js 调用使用 `SdkSession.userStatus()` 与 `SdkSession.setUserStatus({status:'Custom',customId,apply:true})`。结束时调用 `setUserStatus({expectedCustomId:customId,apply:true})`；显式恢复目标使用 `status` 和所需 `customId`。这些方法借用会话，不关闭连接、不保存恢复数据。可见消息后缀的选择与发送见[编写与发送](compose-and-send.md#可见消息后缀)。

## 群信息及成员

groups.getCacheGroupFull 读取已核对群的原生资料，checkRosterPublicGroup 提供服务端核对路径。按当前定义识别群 URI、成员 URI、unionID、总人数及完整成员集合，不能用头像数或消息活跃度推断成员关系。缓存与服务端结果分别报告，不把尚未加载写成空群。

`getCacheGroupFull` 的前两项参数为群 URI、查询原因；`checkRosterPublicGroup` 的前三项为群 URI、请求流水号、查询原因。可选参数的位置查 `sdk-describe`，不能沿用旧调用中的回调位置。

群名、公告、成员、权限和二维码分别使用 modifyGroupName、modifyGroupBulletin、inviteMembersToPublicGroup、deleteMembersFromPublicGroup、modifyAllowmemberInvite、modifyDisplayDeleteInfo、modifymemTransNotifyEnable、modifyShareQRCode、getQRCode 等接口。参数中的成员结构由当前模型定义提供，不能传一组名字冒充成员对象。

`groups.getGlobalMemtransnotify`、`setGlobalMemtransnotify` 读取和设置本人接收成员调岗通知的全局开关。单群的 `modifymemTransNotifyEnable` 保留该群范围，不能互相替代。全局读取核对 `success`、`enableTransNotify`；设置后重读目标值。

创建、退出、解散、批量退出或批量删除是不同动作。createPublicGroup、leavePublicGroup、deletePublicGroup 及批量接口均保留相应授权。需要管理员、群主或受企业策略限制时保留服务端拒绝，不把请求受理当作关系变更成功。

转移管理权、应用和机器人等操作按 sdk-list 查当前方法及模型。已登记动作没有专用命令时可用 sdk-call；接口未覆盖时按[操作方式选择](../SKILL.md#选择操作方式)核对其他路径。功能未加载、接口契约变化和账户缺少权限分别处理。

## 会话偏好及筛选器

messages.modifyChatRoomAttribute 设置置顶、免打扰、关注、@所有人提醒及自动翻译等属性；14ce.b 提供当前属性位值。显式传入聊天、unionID、类型、属性和目标值，不以切换动作代替幂等赋值。个人提醒与群政策分别核对。

filters 服务管理自定义会话筛选器的查询、创建、修改、删除、排序及会话归属。盒子、群、个人和机器人保留原始类型，不能按名称特征分类。

修改后按对象 ID 重查目标状态，逐项报告部分完成和失败。选择聊天只是界面展示动作；SDK 业务调用不依赖 select 命令。
