# Windows 原生适配器

`scripts/native.ps1` 使用 Windows PowerShell 5.1、UI Automation、MSAA 和 Win32。调用 `powershell.exe`，不使用 `pwsh`。脚本无 npm 或桌面插件依赖。Windows 10/11 自带 OCR 语言包仅用于 wxRibbon 标签栏；其他原生动作不依赖 OCR。

## 观察对象与动作

```text
powershell.exe -NoProfile -File scripts/native.ps1 -Action windows
powershell.exe -NoProfile -File scripts/native.ps1 -Action inspect -ClientPid <PID> -Window <窗口HWND>
```

`windows` 列出 CMClient 的当前主进程及窗口，包含托盘中的隐藏主窗口。选择当前 PID、窗口标题和 HWND，不复用历史运行的句柄。`inspect` 返回控件 `runtimeId`、`parentRuntimeId`、名称、类、可用状态、位置、原生值及支持的动作。用父子关系区分同名页、分组和控件；列表中的顺序不是对象身份。

原生输入要求窗口归属、标题和控件标识匹配。先检查当前会话的交互桌面，再核对前台窗口及点击位置的归属。焦点失败、窗口被遮挡、控件禁用或标识失效会停止动作。锁屏或不同输入桌面不能靠操作 LockApp、伪造焦点或关进程处理。

| 动作 | 参数与含义 |
|---|---|
| `show` | 指定窗口恢复到前台，处理托盘隐藏 |
| `focus` | 指定控件取得输入焦点，核对实际 `focusedHwnd`；不改变文本或选择集合 |
| `click`、`double-click`、`context` | `RuntimeId` 与当前 `ExpectedName` 绑定控件。单击优先使用 Invoke；无 Invoke 时按当前原生位置输入，核对前台和遮挡 |
| `select-item` | 指定 `SysListView32` 控件与 `Text`；从 MSAA 读取实际列表项名称和位置，唯一匹配后选择 |
| `set-value` | 指定控件及 `Value`，包括空字符串。使用 ValuePattern 或标准 Edit 的 WM_SETTEXT，并读回；不向未知控件盲打 |
| `key` | `Keys` 为命名键或大写字母、数字数组，支持 Control、Shift、Alt、Enter、Escape、Tab、方向键及 F1–F12。快捷键含义取决于当前焦点与热键设置 |
| `ribbon` | 指定 wxRibbon 的控件及目标页 `Text`。根据当前标题锚点定位，核对实际原生页面切换；见下节 |
| `close` | 关闭指定窗口。写信窗口关闭、主窗口关闭和退出进程的含义不同；动作结果需复查 |

动作默认预览；`-Apply` 执行。每个动作携带当前 `-ClientPid`、`-Window` 和 `-WindowTitle`，控件动作另带 `-RuntimeId`、`-ExpectedName`。空控件名传空字符串，不能省去绑定。自然语言值以 PowerShell 的参数数组传递，不拼接可执行字符串。

```powershell
# 从 windows 与 inspect 的结果赋值，变量中不放历史机器数据。
& powershell.exe -NoProfile -File "$skill/scripts/native.ps1" -Action click `
  -ClientPid $clientPid -Window $window.hwnd -WindowTitle $window.title `
  -RuntimeId $control.runtimeId -ExpectedName $control.name -Apply

# 在 PowerShell 中使用键数组；不要把 Control,Enter 当作一个键名。
& "$skill/scripts/native.ps1" -Action key -ClientPid $clientPid `
  -Window $window.hwnd -WindowTitle $window.title -Keys @('Control','Enter') -Apply
```

输入键前检查原生焦点和窗口内容。文本框、编辑器和邮件列表中的同一快捷键可能执行不同动作。热键页显示的配置是线索，不替代动作后核对；不能把 F3 等按键当作所有上下文中的固定入口。复合键在同一 PowerShell 进程中以数组调用，外部 `-File` 的字符串参数不承担数组解析。

`nativeState: {kind:"check",value:0|1|2}` 来自标准 Button 的 BM_GETCHECK，分别为未选、已选、不确定。普通按钮没有该状态。UIA 的 `toggle` 只在控件确有 TogglePattern 时提供。不要从标签、图标、Enabled、文件字段名或截图颜色猜复选状态。Edit 的 `value` 是实际控件值。缺少接口的数据保留未知，不从相邻控件推断。

## wxRibbon 与系统设置

Windows 4.2.3.1614 简体界面的 wxRibbon 未暴露单个标题按钮的动作。主窗口的原生树有一个 `control`，其直接页面子节点为“邮件、接收、文件夹、视图、设置”。用该父子关系识别栏，不能随便选择同名 `control`。

`ribbon` 读取当前原生页面标题及可见状态，在标签条中识别至少两个标题锚点，计算等距标签位置。它只在当前标签区域内点击，并重读原生页面的可见状态。标题缺失、锚点冲突、布局不符或所需页没有变为可见时失败。位置推算适用于已核对的布局；不能将本机布局推广到不同版本或其他组件。该 OCR 不用于收件人、邮件内容、复选框或发送判断。

```powershell
& "$skill/scripts/native.ps1" -Action ribbon -ClientPid $clientPid `
  -Window $main.hwnd -WindowTitle $main.title `
  -RuntimeId $bar.runtimeId -ExpectedName $bar.name -Text '设置' -Apply
```

切换后重读原生树。该版本的“设置”页下有一个同名设置组，组中的 `control` 包含三个等宽按钮：账号管理、系统设置、快捷键。**这个子 control 的中心是系统设置入口**，区别于整个页面或标签栏。在当前树中核对父子关系与组布局后用 `click`，等待同进程的“系统设置”窗口出现；返回 dispatched 时窗口可能仍在创建，不重复点按钮。

系统设置的左侧导航为 `SysListView32`，`items` 给出界面设置、操作习惯、回复设置、安全设置、日程设置、网络设置、高级设置、热键设置、AI 设置等当前项。使用其当前 runtimeId 和空名称，通过 `select-item -Text '操作习惯'` 选择。读取“新邮件弹窗的同时播放声音”的原生复选状态。它属于系统设置中的收信设置；不能据此证明每个账户或服务端没有额外提醒条件。

查询结束关闭本次打开的设置窗口，不点击保存。变更任务先保留原值，修改后保存，再重新打开或通过对应 SDK 状态核对。全局配置与账户配置分别说明。当前用户配置里的 `NewMailSound` 只证明该文件保存的全局值；安装目录 `app/conf/syssetting.js` 是默认值来源，不能冒充当前用户配置。账户的 `setting.edbx2` 等专有数据库不属于配置读取接口。

## 账户、联系人与其他表单

主窗口的 `MainMail`、`MainAddress`、`MainCalendar` 是当前可观察的导航控件。通过名称和 runtimeId 操作后重读窗口，确定账户、选中对象和页。它们不授予读取其他账户的权限。

账户管理用于查看当前账户配置、实际地址和别名入口，保留共享或代理关系，按[身份契约](connection-and-accounts.md#账户与本人身份)解释。联系人、群组、日程、规则、签名、存档等任务使用其当前表单中的命名控件、标准列表和消息桥，不依赖预先保存的坐标。缺少可访问控件时从[CEF 源接口](client-interfaces.md#页面求值与原生消息桥)检查对应能力，不能把未知按钮中心当成已知动作；上述系统设置中间按钮是已核对版本的组件契约。

原生确认和错误框用 `windows` 与 `inspect` 读取。提示的账户、对象、动作与当前请求匹配后执行获准选择。保持“不再提示”等持久选项的原值，不能为了测试省略确认而更改它。处理完对话框后查询业务结果。脚本的 dispatched、窗口关闭及控件值改变分别只支持相应事实。
