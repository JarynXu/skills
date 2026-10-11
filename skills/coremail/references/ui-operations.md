# 客户端界面操作

SDK 负责其声明的结构化操作；客户端界面补足回复、转发、发送、草稿、邮件状态、通讯录和日程维护等任务。具体版本、账户协议、服务端策略和权限可能改变可用能力。

## 以当前界面建立操作依据

使用当前环境允许的桌面或浏览器控制能力。观察窗口、标签、菜单、可访问性信息或截图，确定对象和控件；工具本身另有操作技能时读取其约定。没有可观察界面时不能编造控件名称、坐标、快捷键或执行结果。

在目标对象处打开相关菜单或页面，读取可用操作与作用范围。SDK 中没有函数是切换入口的信号；界面中没有入口则检查版本、权限、账户类型和客户端帮助，保留“未确认”或实际阻塞。不要宣称整个客户端不支持该任务。

客户端帮助是能力依据，不是本机控件观察。下表给出任务入口；只读取与当前任务相关的页面。

| 用户任务 | 官方参考与边界 |
|---|---|
| 登录、切换或管理账户 | [账户登录](https://help-cmc.coremail.cn/2-download-and-login/1-account-login/#login-account)、[多账户](https://help-cmc.coremail.cn/2-download-and-login/1-account-login/#switch-account)；核对协议、当前会话及账户归属 |
| 移动、待办和规则 | [邮件管理](https://help-cmc.coremail.cn/3-mailbox/1-email-management/)；对象契约见邮件整理参考 |
| 新邮件提醒、日程提醒 | [邮件提醒](https://help-cmc.coremail.cn/3-mailbox/1-email-management/#set-email-reminder)、[日程提醒](https://help-cmc.coremail.cn/4-calendar/#canceled-meeting-reminder-window)；确认生效账户和范围 |
| 签名及附件设置 | [签名](https://help-cmc.coremail.cn/10-other-operations/#break-signature)、[附件](https://help-cmc.coremail.cn/10-other-operations/#add-attachment)；准确菜单路径由当前界面确认 |
| 存档、备份或迁移 | [存档模式](https://help-cmc.coremail.cn/3-mailbox/1-email-management/#email-archive)、[自动存档](https://help-cmc.coremail.cn/9-archive/#auto-archive-status)、[导出账户目录](https://help-cmc.coremail.cn/9-archive/#export-directory)、[迁移目录](https://help-cmc.coremail.cn/9-archive/#move-directory) |
| 更新客户端 | [安装与更新](https://help-cmc.coremail.cn/2-download-and-login/0-install-and-update/#update)；更新或重启需要在当前授权范围内 |
| 共享、S/MIME 或其他增值能力 | [增值功能](https://help-cmc.coremail.cn/11-value-added-feature/)；功能依赖许可、模块及权限，不因帮助中列出就认定本机可用 |

## 操作与检查

1. 识别当前账户、文件夹、邮件、联系人、日程或设置页。选择项的数量和对象必须与任务吻合。
2. 根据可观察的状态执行一个连贯动作。界面变化后取得新证据，避免在过期坐标上连续操作。
3. 读取确认对话框和错误消息。确认框不是默认点击目标；检查其影响是否仍在用户授权内。
4. 从保存状态、目标列表、SDK 查询或文件检查结果核对变化。排队、进行中、失败和完成分别报告。

写信编辑器检查参见[写信与发送](compose-and-send.md)；对象整理参见[邮件整理](organize-mail.md)。授权由技能入口统一定义。

## 设置与数据生命周期

设置变更需要知道作用账户、原值、候选值及生效方式。跨账户、对外发送、数据删除、客户端重启或服务端同步的影响须落在用户请求范围内。保留可恢复的原状态；不可确认的设置不靠试错写入定位。

存档具有经典、打包、批量等模式，可能涉及本地留存和服务器删信。确认具体模式、源邮件范围、目标位置、服务器处置与恢复路径。存档完成后检查目标内容和源端状态；普通文件夹移动不能证明存档或备份完成。

账户目录迁移和恢复要遵循当前客户端支持的流程，核对源与目标并保留恢复材料。不得把复制正在写入的数据目录称为一致性备份。

客户端提供的人机验证、登录确认、管理员审批或权限门槛属于外部边界。需要用户或管理员处理时说明具体入口和缺口，不绕过控制。
