# 联系人与群组

本页的搜索框、通讯录、菜单和设置操作均通过 [CDP 页面](ui-and-settings.md)完成。界面名称描述客户端中的入口，不表示使用桌面自动化。

## 查找与选择

`chats` 返回当前账户已加载的会话，包括原始会话 ID、类型和名称。`--query` 用于筛选候选；没有命中不能证明通讯录中不存在此人。目标不在会话列表时，使用界面的搜索框或通讯录，检查组织、工号和联系人详情，再进入聊天。

从名称查找与执行分开。选择命令使用候选返回的 ID：

```text
node "<技能目录>/scripts/icenter.cjs" chats --port <端口> --account <账户ID> --query <名称>
node "<技能目录>/scripts/icenter.cjs" select --port <端口> --account <账户ID> --chat <会话ID>
node "<技能目录>/scripts/icenter.cjs" select --port <端口> --account <账户ID> --chat <会话ID> --apply
```

界面切换可能改变已读状态。需要保留未读状态的任务先明确查询路径和客户端行为。选择成功的依据是当前账户及当前会话 ID 与目标相符，点击完成不是成功证据。

个人、群聊、订阅号、机器人和会话盒子不能按名称长度或标点分类。保留客户端提供的类型；未知类型标记为未知。会话盒子可能包含子会话，不能把盒子名称作为收件人。

## 通讯录与联系人资料

### 12.1.0 搜索路径

主搜索框为 `.msgSearchInput`。`RendererSession.fill` 发出的 input 事件触发客户端搜索，客户端有输入延迟和异步请求。可从 `.Chat` 的 `globalSearch` 组件读取 `searchText`、`searchLoading`、`seachContactLoading`、`searchAddressBooks`、`searchGroupData`、`searchPubaccData`、`searchMsgSession`。保留客户端拼写。加载未结束不能当成零命中。

```javascript
// ui 的创建和关闭见 CDP 页面参考。query 来自用户或已确认的身份字段。
await ui.fill('.msgSearchInput', query, { apply: true });
const result = await ui.run(async (tools, query) => {
  const deadline = Date.now() + 10000;
  let search;
  do {
    search = tools.component('.Chat', 'globalSearch');
    if (search.searchText === query && !search.searchLoading && !search.seachContactLoading) break;
    await new Promise(resolve => setTimeout(resolve, 150));
  } while (Date.now() < deadline);
  tools.check();
  const pending = search.searchText !== query || search.searchLoading || search.seachContactLoading;
  return { state: pending ? 'pending' : 'loaded', query, contacts: pending ? [] : search.searchAddressBooks.map(person => ({
    employeeId: person.employeeShortId, unionId: person.unionID,
    name: person.nameCn || person.name, englishName: person.nameEn,
    department: person.deptFullNameCn || person.deptFullName,
    email: person.email,
  })) };
}, query);
```

示例只读取当前搜索返回的联系人，未遍历全部页。`pending` 中的空数组没有“无人匹配”的含义。搜索区类别和“查看更多”通过当前 `.ChatSearchList`、`.SearchInfo` 内的控件选择。候选人员位于 `.SearchContact .ContactInfo`，群位于 `.SearchGroup .GroupInfo`；从当前 DOM 核对 data 属性和显示资料，不能按行号进入聊天。已有搜索内容需要明确替换并保留恢复方式。

搜索返回的 `employeeShortId` 是工号字段，不保证是会话 SIP ID。`fullId`、`shortId`、`unionID`、邮箱也有各自含义。本人识别优先核对登录 unionID 与候选 unionID；再核对客户端工号、姓名和组织。不得从姓名命中一人就认定本人，不得将工号拼成 SIP 地址或将 SIP 地址当成邮箱。

搜索摘要可返回邮箱占位符。本人邮箱的取值判断与详情读取见[连接与身份](connection-and-identity.md#1210-本人资料详情)。

通讯录导航为 `.Menu .Contacts`。类别入口为 `.ContactList .contactuser`、`.group`、`.tags`、`.Pubacc`。内容区 `.AddressBookList` 提供当前联系人、群、标签和订阅号；它与主窗口会话列表的覆盖范围不同。`.AddressBookSetup` 是搜索和添加联系人的入口。`showEmployee`、`getEmployeeDetail`、`showGroupSetUp`、`showTagSetting` 是对应组件的处理方法；参数按所选行的实际绑定取得，不能把姓名字符串当作这些方法的参数。

通过通讯录导航或搜索定位组织和人员。详情中核对显示名、工号、组织和账户标识；手机、邮箱、昵称是各自独立字段。只读取当前任务需要的字段，不整批导出组织资料。

新增联系人、修改备注或标签、组织联系人分组和删除联系人使用当前界面提供的动作。区分个人备注与对方资料；个人可编辑字段不代表可以修改组织主数据。操作完成后重新打开对应对象核对。搜索和分组结果需要说明筛选条件及是否遍历完毕。

## 群资料和群成员

12.1.0 的会话标题组件 `.MessageTitle` 提供无参数 `setup()`，用于切换资料侧栏。会话切换后等当前资料及消息加载结束，再调用。侧栏为 `.MessageChatSetup`。群设置中的 `.GroupSettingTitleAll` 可用作群组件定位点；`tools.component('.GroupSettingTitleAll', 'openGroupMemberSelect')` 定位包含该标题、实现群操作方法的组件。该组件根节点不一定有类名。

| 功能 | 当前入口或处理方法 | 写入及结果 |
|---|---|---|
| 成员、搜索成员、成员详情 | `.AllMembers`、`.ViewAllGroupMember`、`.MemberSearch`；组件的 `messagesList`、`groupMemberListWithOrder`、`memberLessList` 是不同加载或展示集合 | 核对成员 URI、unionID、声明总人数、加载结束状态。不能拿可见头像数当群人数。 |
| 群名和公告 | `.GroupNameEditImg`、`.GroupNotifyEditImg`；编辑框 `.GroupNameDisplayTextarea`、`.GroupNotifyContentTextarea` | 提交后重新读取群名或公告，保留权限拒绝。 |
| 邀请、移除和转让 | `.AddMember`、`.DeleteMember`、`.TransferOwnership`；`openGroupMemberSelect`、`chooseDeleteMember`、`openSelect` | 进入选择器不代表已变更；提交前逐个核对 URI，提交后重查成员或群主。 |
| 置顶、免打扰、自动翻译和会话盒子 | `.StickOnTop`、`.MuteNotifycation`、`.RealTimeTranslateAll`、`.MoveIntoChatBox` | 读取选中态与原值，再修改并复查。 |
| 邀请权限、移除通知、人员调整提醒、@所有人 | `.AddGroupMembersSettingAll`、`.NotifyRemoveMemberAll`、`.NotifyAdjustments`、`.AtAllNotifycation` | 群政策及个人提醒分别处理；缺少编辑权限时保留只读结果。 |
| 群二维码 | `.AllowShareQRCodeAll`、`.QRCodeButtonAll`；`fowardQrcode`、`saveQrcode`、`copyQrcode` | 启用分享、保存和转发是不同动作。核对有效期与转发对象。 |
| 群应用与机器人 | `.GroupApp`、`.AddAppEnter`；`showGroupAppAll`、`clickGroupBotsList`、`addGroupBots` | 添加或移除服务会改变群能力，不作为读取群资料的附带动作。 |
| 同步、导出、群成员导出和群文件 | `.SynchronizeChatHistory`、`.ExportHistory`、`.SaveGroupList`；`syncChatHistory`、`exportChatHistory`、`downGroupMember`、`fileList` | 核对群、日期、输出范围及实际文件，见消息与文件参考。 |
| 退出、解散和清空记录 | `.ExitGroupText`、`.DismissGroupText`、`.ClearMessageHistory` | 独立授权；不能为关掉侧栏执行这些动作。 |

表中的类和方法用于定位当前实现，不能证明当前账号有相应权限。点击前检查可见与禁用状态。尚未加载的子组件需要等待，不能把空侧栏写成没有成员。

进入已确定的群，在会话右上方打开群设置。读取群名、群标识、公告和成员资料。成员列表可能虚拟加载；界面声明的总人数、已取得的成员条数和当前可见条数分开记录。

群成员的姓名不能代替成员 ID。重名时核对成员资料。群主、管理员和普通成员的操作权限由当前群设置决定，不能从消息活跃程度推断。

群创建、邀请、移除成员、转移管理权、退出或解散涉及成员关系。先确定目标群及成员集合，说明实际变化，再执行已有授权范围内的操作。拒绝、人数限制或权限不足保留为失败，不能报告为已完成。

## 会话与群设置

按任务检查当前客户端提供的置顶、免打扰、关注、提醒、群昵称、群公告、群二维码、群文件或会话盒子入口。读取开关的选中状态或可访问性状态，文字标签存在不能证明功能已开启。

修改前保留原状态，修改后重新读取。多个开关不能合并成“设置成功”。批量整理应保留每个会话的身份和结果；删除聊天入口、删除本地记录、撤回消息、退出群是不同操作。
