# 通讯录与日程

## 联系人与组织

`listAddressBook` 的 `type` 区分个人分组 `personGroup`、组织部门 `orgGroup`、个人联系人 `personContacts`、组织联系人 `orgContacts`。先确定用户需要的范围；不为一个联系人导出全部组织。

个人联系人可按 `personGroupID` 读取，0 表示未分组，-1 表示所有分组。组织联系人需要实际 `orgGroupID`。部门查询支持 `parentOrgGroupID` 和 `Recursive`：0 或省略读取当前子部门，-1 读取整个组织，正数指定递归层数。

`searchAddressBook` 使用 `keyword`；源码声明多个词以空格分隔，关系为 AND。结果可包含姓名、地址、位置及可选组织字段。缺失字段不能由姓名推断；相同姓名需要地址或组织信息消歧。

用通讯录确认本人或解释 `alias` 时，应用[连接与账户](connection-and-accounts.md)的身份及别名规则。联系人备注名不自动成为邮箱地址别名，群组成员身份不证明群组地址属于个人。

```text
python scripts/coremail.py call listAddressBook --params "<通讯录参数.json>"
python scripts/coremail.py call searchAddressBook --params "<联系人搜索参数.json>"
```

联系人、通讯组和部门地址具有不同含义。选择群组地址可能触达多个成员；准备发送时核对用户所指对象。用户没有请求写信时，读取联系人不会授权开启或发送邮件。

新增、修改、删除联系人和分组的 SDK 接口未在当前清单声明。使用客户端可观察的通讯录操作，核对个人与组织数据的权限及变更结果。组织通讯录同步依赖协议与服务端配置；查询结果也受[同步周期](https://help-cmc.coremail.cn/3-address-book/#auto-sync)影响。最近联系人与正式联系人是不同对象，删除入口参见[最近联系人说明](https://help-cmc.coremail.cn/10-other-operations/#recent-contacts)。

## 日程查询

`listCalendar` 参数为账户和 `Time: {Begin, End}`，时间为 Unix 秒。将用户时区、查询起止与显示时区明确关联；无时间范围时依据会话推断可逆范围，影响结论的歧义需要澄清。

```text
python scripts/coremail.py call listCalendar --params "<日程范围参数.json>"
```

保留原始 `calendar` 记录及 ID、`StartTime`、`EndTime`、全天字段、状态、组织者和响应者。未知状态码原样呈现，不解释成接受或取消。

判断用户是否为组织者、受邀者或响应者时，使用该任务已确认的本人地址与别名核对参与者。可查看某账户或共享日历不证明用户本人具有这些角色；缺失参与者信息保留未知。

循环日程保留 `RruleStr` 和 `ExceptionsData`。不把本地推算的实例当成 SDK 或客户端返回结果。需要确认某天发生的循环会议、跨日实例、时区或例外时，在客户端日历核对对应日期；无法核对时报告原始规则和实例验证缺口。

## 日程维护

创建、修改、删除、邀请、接受或拒绝日程不在当前 SDK 函数清单中。查找客户端日历和邮件邀请界面的实际操作，核对目标日程、组织者、参与者和操作范围。

循环日程的单次实例与整个系列属于不同变更范围；以当前界面提供的选择及用户目标确定。可能对外发送邀请或响应的动作遵循会话授权边界。保存后查看目标日程或响应状态；填写表单不等于日程保存，日历事件存在不证明邀请已送达。

[官方日程帮助](https://help-cmc.coremail.cn/4-calendar/)覆盖创建、会议、提醒、循环及同步。[发起会议](https://help-cmc.coremail.cn/4-calendar/#cannot-create-meeting)需要私有协议及服务等级中的日程开关。客户端[不能设置日程共享](https://help-cmc.coremail.cn/4-calendar/#set-up-shared-calendar)，共享配置在 Webmail；客户端可查看收到的共享日程，编辑取决于授权。不得把 Webmail 能力写成客户端控件。
