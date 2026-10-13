# 邮件整理

## 确定变更集合

从用户条件形成账户、邮件 ID、当前文件夹和目标变化。批量变更前核对检索覆盖和命中对象。预览用于发现错误，不替代会话授权。变更失败或超时后核对已发生的结果，不默认整批成功或失败。

## 文件夹与移动

使用 `listFolder` 取得当前树和 `FID`。文件夹角色来自 `Type`、名称及客户端表现；不得硬编码某个账户的 ID。

- `createFolder` 使用账户、父文件夹 `FID` 和 `Name`。创建前检查同名位置；创建后重新读取树，取得实际新 ID。
- `deleteFolder` 使用账户和目标 `FID`。SDK 源码未定义删除对邮件、子文件夹和恢复能力的全部影响。检查目标内容及客户端规则，确认其影响在用户授权内，再执行。
- `moveMail` 使用账户、目标 `FID` 和单个或数组 `MID`。核对目标属于同一账户；接口未声明跨账户移动契约。

```text
python scripts/coremail.py call createFolder --params "<创建参数.json>"
python scripts/coremail.py call createFolder --params "<创建参数.json>" --apply
python scripts/coremail.py call moveMail --params "<移动参数.json>" --apply
```

变更后检查新位置、原位置和相关数量。`code: 0` 表示接口处理成功；不能替代对象状态核对。批量范围变化时保留成功、失败和未确认对象。

SDK 写入可能等待客户端原生确认框。`deleteFolder` 已观察到这种行为：HTTP 超时期间文件夹仍存在，完成对应确认后才删除。超时先查看客户端对话框及目标状态；确认框的账户、对象和动作须匹配本次请求及授权。未检查状态前不要重试，HTTP 超时不能证明未执行。

## 标签

`listTags` 返回标签集合。`addTags` 创建标签，其结果不保证返回标签 ID；创建后读取列表获取实际 `id`。`color` 的请求值是 0–24 的颜色下标；读取返回的颜色数值不能直接视为同一编码。

`modifyMailTags` 参数为账户、`MID`、标签 `id`、`set` 和可选 `clear`。`set: true` 添加，`false` 移除；`clear: true` 会在设置前清理全部标签。用户只要求新增一个标签时不能附带清理其他标签。

检查目标邮件的标签结果。重名标签需要结合 `id` 和当前列表处理；不要以显示名替代稳定身份。

## 删除、状态与规则

当前 SDK 清单未声明删除邮件、修改已读状态、红旗、待办、置顶、垃圾邮件规则或来信分类规则的专用函数。通过[程序接口](client-interfaces.md#页面求值与原生消息桥)和[原生适配器](native-interface.md)处理这些任务；接口缺失不证明客户端没有该能力。

当前阅读页源码包含 `signAsRed`、`handleBacklog`、`handleRemark` 等事件。参数中的 `mailId` 与 `action` 由该页面的对象和事件调用取得；不直接把 SDK ID、某次邮件中的取值或猜测的动作码写入请求。先核对阅读页指向目标邮件，变更后查询目标 Flags、备注或客户端状态。原生热键需核对焦点和当前设置，不能把编辑器中的 Ctrl+U 等格式快捷键当邮件状态命令。

用户要求移入废件箱时，可以将已确认目标通过 `moveMail` 移到实际废件箱。移入废件箱不等于永久删除。永久删除、清空文件夹或整批清理需要核对当前作用范围、恢复能力及用户授权。

官方帮助说明[已删除邮件仍占容量](https://help-cmc.coremail.cn/10-other-operations/#delete-mail)，客户端[不支持用 Shift+Delete 直接永久删除](https://help-cmc.coremail.cn/10-other-operations/#shift-shortcut)。永久清理从已删除邮件夹的实际操作入口确认，不套用其他邮件客户端的快捷键。

通过界面修改已读、旗标、待办或置顶状态时，观察目标控件、变化后的视觉状态及可用的 SDK `Flags`。读取邮件造成的状态变化也需要根据客户端实际行为判断，不能假定所有阅读路径无副作用。标记入口与当前区域有关，参见[标记与标签说明](https://help-cmc.coremail.cn/10-other-operations/#mark-mail)和[待办邮件](https://help-cmc.coremail.cn/3-mailbox/1-email-management/#set-up-todo-email)。

来信分类规则可能移动、处理历史邮件或自动转发。核对条件、动作、适用账户和执行范围，不能把建规则当作无副作用配置。功能依据见[来信分类](https://help-cmc.coremail.cn/3-mailbox/1-email-management/#email-classification)、[处理历史邮件](https://help-cmc.coremail.cn/10-other-operations/#classify-rules)及[自动转发](https://help-cmc.coremail.cn/3-mailbox/0-email-receive-and-send/#auto-forward-available)。公开版[不支持导出来信分类规则](https://help-cmc.coremail.cn/10-other-operations/#export-rules)；不得把内测能力承诺为当前可用。

存档、导入导出、账号设置遵循[界面操作](ui-operations.md)。这些任务可能影响服务器数据与本地持久化，不能当作普通文件夹移动。
