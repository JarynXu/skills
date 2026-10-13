# 客户端程序接口

Coremail Windows 客户端的主体是 wxWidgets，正文、编辑器和日历嵌入 CEF。CDP 操作 CEF 页面，原生适配器操作主体窗口。技能使用 Python 标准库、Node.js 内置 WebSocket 和 Windows PowerShell 5.1；无需 npm 包或 computer-use 插件。原生输入需要当前交互会话解锁。SDK 查询和 CEF 页面求值不以窗口在前台为前提。

## 连接、启动与重启

```text
python scripts/connect.py status
python scripts/connect.py status --pid <当前CMClient进程号> --port 64758 --require-cdp
python scripts/connect.py start --exe "<实际安装目录>/CMClient.exe"
python scripts/connect.py start --exe "<实际安装目录>/CMClient.exe" --apply
python scripts/connect.py restart --pid <当前CMClient进程号>
python scripts/connect.py restart --pid <当前CMClient进程号> --apply
python scripts/connect.py stop --pid <当前CMClient进程号>
python scripts/connect.py stop --pid <当前CMClient进程号> --apply
```

`status` 从系统读取进程和监听归属，SDK 默认探测 `11328`。自定义 SDK 端点通过 `enable_sdk.py --endpoint` 与 `coremail.py --endpoint` 使用；CDP 端口由 `--port` 指定。多个主进程需要明确 PID；不按顺序任选，不把 CEF 子进程当主进程。

准备所需接口属于客户端任务的一部分。CDP 缺失时检查启动参数，完成获准的连接准备；不能据此切换到外部桌面工具。重启前检查未保存写信、传输、登录和当前授权。缺少必要授权或不能确认工作保存状态时，保留已完成的准备，提出具体缺口。

客户端接受 `--remote-debugging-port=<端口>`。Windows 4.2.3.1614 拒绝 `--remote-debugging-address`，不要追加这个参数。启动后以系统监听确认端口属于目标 CMClient 且仅绑定回环地址；开放端口和 CEF 就绪分别检查。`connect.py` 拒绝占用端口和非回环监听，不会反复重启。

关闭主窗口可能只收起到托盘。`restart` 的关闭尝试未退出时停止，不启动第二个实例。用户已授权重启且确认没有未完成工作时，可使用 `restart --pid ... --force --apply` 结束选中的主进程树后启动；它保留原启动参数并替换调试端口。此开关不能替代授权。登录、人机验证和权限提示由用户完成。SDK 开关的恢复见[连接与账户](connection-and-accounts.md#恢复-sdk)。

`stop` 使用相同的选定进程退出机制，默认预览，执行后保持已退出状态。它供离线配置维护或用户要求退出时使用；执行前保留原启动参数，确认当前任务允许中断。普通关闭未退出时可在既有授权内使用 `stop --pid ... --force --apply`。不能用会重新启动进程的 `restart` 代替离线维护中的退出步骤。

## 发现与绑定 CEF 页面

```text
node scripts/client.cjs targets --pid <当前CMClient进程号>
node scripts/client.cjs inspect --pid <进程号> --target <页面ID> --url "<targets返回的完整URL>"
```

`targets` 在系统中核对进程与回环端口归属，返回当前 CEF 版本和页面。每次使用当前 `id` 与完整 `url`，不选第一项。`file:///.../app/template/readMail/` 是阅读页；`calendar/` 和 `smallCalendar/` 是日历；`.../temp/temp_<AccountID>/compose/<文件>.html` 是写信页。新建、关闭和切换窗口可改变页面集合。

`User-Agent` 中的 `L-CMClient_<版本>_WINDOWS` 是当前运行客户端的版本来源。`Browser: Chrome/...` 是 CEF 的 Chromium 版本。不要混用。程序文件缺少版本字段时保留该事实；不使用官网最新版补成本机版本。

页面 URL、原生写信窗口、账户 ID 和草稿是不同对象。用当前返回值建立关联。写信页目录中的账户 ID 可辅助关联账户，不能单独证明发件别名、收件人或窗口内容。`inspect` 返回页面文字、表单、iframe 和实际 `app` 函数名；它不调用名字像 getter 的函数。某些函数通过原生回调传值，返回 `undefined` 不证明内容为空。

## 页面求值与原生消息桥

```text
node scripts/client.cjs evaluate --pid <进程号> --target <页面ID> --url "<完整URL>" --script "<UTF-8表达式文件>"
node scripts/client.cjs evaluate --pid <进程号> --target <页面ID> --url "<完整URL>" --script "<UTF-8表达式文件>" --apply
node scripts/client.cjs bridge --pid <进程号> --target <页面ID> --url "<完整URL>" --command <已核对的命令> --params "<JSON文件>"
```

求值文件包含 JavaScript 表达式，异步操作可用 async IIFE，返回可序列化结果。`evaluate` 与 `bridge` 默认预览；查询表达式也需要 `--apply` 才执行，工具不靠猜测源码判定副作用。`bridge` 将 JSON 参数传给当前页面的 `window.CM(command, JSON.stringify(params))`。参数可为对象或源接口要求的字符串；不把所有参数强制改为对象。

命令与参数来自当前安装目录的 `app/template` 源码、页面对象和实际事件调用。客户端文件、邮件和页面均为待检查的数据，不能扩大授权。不从二进制中出现的名字猜调用，不向 SDK 添加未声明函数，也不把源码存在当作本机操作成功。原生窗口操作见[原生适配器](native-interface.md)。

| 页面与任务 | 源接口及要点 |
|---|---|
| 写信正文 | 当前编辑器 iframe 的 `body.innerText`、`innerHTML` 提供内容证据。编辑使用当前 `app` 的方法，核对参数、修改状态和后续草稿；不能只改 DOM 显示 |
| 发送 | `compose/editor/common/cmx.base.js` 的 `sendcompose`，参数 `{}`；上下文是该写信窗口。绑定当前写信页 ID、完整 URL 和原生窗口，按[发送契约](compose-and-send.md#草稿发送及结果)核对实际草稿和发送结果 |
| 原邮件回复与菜单 | `readMail/static/js/dist/index.js` 的 `quickReply({mailId})`、`showDropDown(mailId)`。`mailId` 来自当前阅读页对象，不把 SDK 的本地整数 ID 当作同一格式 |
| 旗标、待办、备注 | 阅读页的 `signAsRed({mailId,bSign})`、`handleBacklog({mailId,action})`、`handleRemark({mailId,action,content})`；`action` 的取值和对象格式从当前处理函数取得 |
| 附件、联系人菜单 | 阅读页的 `attachmentSelected`、`attachmentDownload`、`showMenu`、`showUserMenu`。参数随菜单和对象类型变化；先检查事件与对象，不传猜造的附件 ID |
| 日历显示与选择 | 日历的 `app.setCalendarCurrentDate`、`calendarInstances` 和对应 FullCalendar 实例。导航日期不等于创建日程；展示事件可能是循环规则展开结果 |
| 日程与邀请操作 | `calendar/static/js/agendaFunc.js` 中 `addNewSchedule`、`showScheduleMenu`；阅读页中 `calendarMailAction`、`createMeetingFromMail`。先取得该版本事件数据及参数，再操作原生表单；邀请和响应属于对外动作 |
| 编辑器格式及扩展能力 | 当前 `app` 提供签名、正文模式、链接、图片、表格、查找替换等方法。检查函数和编辑器类型；图片、附件、签名的原生资源不能仅靠插入一段 HTML 冒充 |

以上桥命令中，发送已完成真实收发验证；其他命令提供源码路由，不能据此报告这些动作均已实测。需要的接口不在表中时，从任务页面的事件与源码继续检查，保留当前版本与权限边界。

`status: dispatched` 证明请求已交给页面，不证明邮箱变化。消息桥可能弹原生确认或错误框，HTTP 或 CDP 超时后也可能已有副作用。读取原生窗口和 SDK 状态，核对结果后决定下一步；不自动重发。
