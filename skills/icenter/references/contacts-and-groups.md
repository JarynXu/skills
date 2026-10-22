# 联系人与群组

业务操作使用[客户端接口](client-api.md)。联系人、群、标签和筛选器分别由 contacts、groups、labels、filters 服务承担，查询及写入不依赖搜索框或资料侧栏。

## 联系人及身份

chats 是已加载会话的快照，不代表企业通讯录。按名称找人使用 contacts.searchAddressBook；已确认的工号或账号使用 contacts.getEmployeeInfo，详情使用 contacts.getUserInfoV2FromICenter 等当前接口。先读取 sdk-describe，核对关键词、是否需要电话资料、范围与分页参数；不将显示名称或默认第一条结果作为发送身份。

保留返回的工号、SIP URI、unionID、组织和邮箱各自的含义。不能从工号拼接 URI，从 SIP 推导邮箱，或把同名人员合成一个人。本人识别将登录 unionID 与资料中的对应身份核对；摘要占位符不作为邮箱。只读取本次需要的资料，不为模仿文风批量导出通讯录。

新增、移除和置顶使用 addOneSingleContact、removeOneSingleContact、setContactsTop。修改前核对原联系人及已有关系，修改后重查。个人备注和标签不授予修改组织主数据的权限。labels 服务提供标签查询、增删、排序及人员标签分配。

## 群信息及成员

groups.getCacheGroupFull 读取已核对群的原生资料，checkRosterPublicGroup 提供服务端核对路径。按当前定义识别群 URI、成员 URI、unionID、总人数及完整成员集合，不能用头像数或消息活跃度推断成员关系。缓存与服务端结果分别报告，不把尚未加载写成空群。

群名、公告、成员、权限和二维码分别使用 modifyGroupName、modifyGroupBulletin、inviteMembersToPublicGroup、deleteMembersFromPublicGroup、modifyAllowmemberInvite、modifyDisplayDeleteInfo、modifymemTransNotifyEnable、modifyShareQRCode、getQRCode 等接口。参数中的成员结构由当前模型定义提供，不能传一组名字冒充成员对象。

创建、退出、解散、批量退出或批量删除是不同动作。createPublicGroup、leavePublicGroup、deletePublicGroup 及批量接口均保留相应授权。需要管理员、群主或受企业策略限制时保留服务端拒绝，不把请求受理当作关系变更成功。

转移管理权、应用和机器人等操作按 sdk-list 查当前方法及模型。已登记动作没有专用命令时可用 sdk-call；接口未覆盖时按[操作方式选择](../SKILL.md#选择操作方式)核对其他路径。功能未加载、接口契约变化和账户缺少权限分别处理。

## 会话偏好及筛选器

messages.modifyChatRoomAttribute 设置置顶、免打扰、关注、@所有人提醒及自动翻译等属性；14ce.b 提供当前属性位值。显式传入聊天、unionID、类型、属性和目标值，不以切换动作代替幂等赋值。个人提醒与群政策分别核对。

filters 服务管理自定义会话筛选器的查询、创建、修改、删除、排序及会话归属。盒子、群、个人和机器人保留原始类型，不能按名称特征分类。

修改后按对象 ID 重查目标状态，逐项报告部分完成和失败。选择聊天只是界面展示动作；SDK 业务调用不依赖 select 命令。
