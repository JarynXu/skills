# CDP 页面与设置

## 页面定位与操作

所有客户端页面交互经过 CDP。专用命令未覆盖功能时使用通用 `cdp` 命令；版本适配器失败不阻止 CDP 的 DOM 和输入操作。不要改用桌面截图、坐标点击或桌面键盘工具。

```text
node "<技能目录>/scripts/icenter.cjs" targets --port <端口> --all
node "<技能目录>/scripts/icenter.cjs" cdp --port <端口> --target-id <页面ID> --method DOM.getDocument --params-file "<JSON参数文件>"
node "<技能目录>/scripts/icenter.cjs" cdp --port <端口> --target-id <页面ID> --method DOM.getDocument --params-file "<JSON参数文件>" --apply
```

通用命令默认预览，查询也要追加 `--apply` 才向页面发送协议请求。参数文件为 UTF-8 JSON 对象，方法名为 `Domain.command`。`state:executed` 只表示 CDP 请求返回，业务结果仍需核对。

每次 `cdp` 命令建立并关闭一个连接。节点 ID、远程对象 ID 和已启用的协议域属于该连接，不能从一次命令取出后交给下一次命令。单次 DOM 检查或动作可写成一个 `Runtime.evaluate` 表达式；多步 DOM、输入或文件操作复用已有 `CdpClient`，不新增协议脚本语言：

```javascript
const { CdpClient, listTargets } = require('<技能目录>/scripts/cdp.cjs');
const target = (await listTargets(port, 5000, { allPages: true }))
  .find(page => page.id === targetId);
if (!target) throw new Error('Target no longer exists');
const client = await CdpClient.connect(target.webSocketDebuggerUrl);
try {
  const { root } = await client.send('DOM.getDocument', { depth: 0 });
  const { nodeId } = await client.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#app' });
  const result = await client.send('DOM.describeNode', { nodeId, depth: 0 });
  console.log(JSON.stringify(result));
} finally { client.close(); }
```

示例中的 `port`、`targetId` 和模块路径来自已确认连接。代码放入异步函数后执行。真实动作仍需核对目标身份与授权；页面导航后重新取得节点。

先检查目标页面及其可观察状态，再执行动作：

- `DOM.getDocument`、`DOM.querySelector`、`DOM.querySelectorAll`、`DOM.describeNode` 和 `Accessibility.getFullAXTree` 用于结构与控件定位。按任务限制遍历和输出范围，避免把整个会话或客户端状态导出。
- `Runtime.evaluate` 读取 DOM、可访问属性及当前页面已有状态。表达式放入参数文件，使用 `returnByValue:true`；异步表达式使用 `awaitPromise:true`。CDP 成功返回仍可能包含 `exceptionDetails`，需要检查。
- 点击可使用已核对节点的 DOM 动作，或先用 `DOM.getBoxModel` 取得当前节点位置，再用 `Input.dispatchMouseEvent`。输入使用实际编辑器与 `Input.insertText` 或对应输入事件。坐标来自该页面当前节点，不能沿用桌面坐标。
- 虚拟列表通过 CDP 滚动或搜索后重新读取。弹窗、菜单、页面切换和导航会使旧节点及对象引用失效，重新定位目标。
- 需要图像证据时使用 `Page.captureScreenshot`，核对当前页面及截图范围。图像不能代替消息 ID、登录身份或传输状态。

写操作把账户、会话和控件的核对放在实际动作前。能够在一次渲染进程调用中核对并执行时使用同一调用；不能用“已读过一次状态”保证此后目标未变。不要批量导出令牌、完整存储或企业通讯录。

协议字段以当前客户端支持的 CDP 版本为准。查阅 [DOM](https://chromedevtools.github.io/devtools-protocol/tot/DOM/)、[Runtime](https://chromedevtools.github.io/devtools-protocol/tot/Runtime/) 和 [Input](https://chromedevtools.github.io/devtools-protocol/tot/Input/) 的官方定义，使用前核对目标版本支持情况。

## 文件与非 DOM 对话框

文件发送先检查当前页面是否存在对应 `input[type=file]`，有证据的节点可使用 `DOM.setFileInputFiles`。Electron 原生文件选择框不属于网页 DOM，CDP 不能给任意原生对话框键入路径。

12.1.0 的文件与图片按钮使用原生选择框。已核实的后续处理方法、无对话框发送和指定路径下载见[文件与收藏](files-and-collections.md)。其他原生能力需要检查当前控件调用的桥接及参数契约。不能猜私有 SDK、安装外部模块、修改厂商程序或绕过认证。没有可验证的 CDP 路径时说明该功能受阻。

## 页面工作流工具

`scripts/renderer.cjs` 提供 `RendererSession`，复用一个 CDP 连接。调用者拥有会话，结束时在 `finally` 中关闭。它检查主窗口、登录账户及可选的当前会话，不要求专用版本适配器成功。DOM 和 Vue 组件结构仍须符合当前页面。

```javascript
const { RendererSession } = require('<技能目录>/scripts/renderer.cjs');
// 放入 async 函数；参数来自 connect/status。
const ui = await RendererSession.connect({ port, targetId, accountId });
try {
  console.log(await ui.inspect('.Menu [title]', 20));
  await ui.click('.Menu .Contacts', { text: '通讯录', apply: true });
  console.log(await ui.inspect('.ContactList', 10));
} finally { ui.close(); }
```

| 接口 | 契约 |
|---|---|
| `inspect(selector, limit=20)` | 返回匹配数和最多 100 个可见节点的属性、有限文本、选中态及 data 字段。检查范围取决于选择器；不等于整个数据集合。 |
| `click(selector, {text, button='left', apply=false})` | 选择器及可选精确文本必须命中一个可见控件。预览不点击；执行用当前 DOM 位置发送 CDP Input。`right` 打开上下文菜单。结果 `input-dispatched` 不表示业务成功。 |
| `fill(selector, text, {replace=false, apply=false})` | 对唯一可见的文本 input/textarea 赋值并发出 input 事件。已有不同文本需明确 `replace:true`。不处理密码、文件框或消息的富文本编辑器。 |
| `run((tools, ...args) => result, ...args)` | 在渲染进程执行无闭包回调，参数和返回值通过 JSON 传递。不能引用脚本外层变量。返回可序列化结果。 |
| `tools.check()` | 核对当前账户和绑定的会话；返回它们的 ID。异步查询结束后、写入前再调用。 |
| `tools.element(selector, text?)`、`tools.elements(selector)` | 定位可见节点；单节点接口拒绝歧义。节点只在该次调用中使用。 |
| `tools.component(selector, method)` | 从 Vue 树定位包含该可见节点、实现指定方法的唯一组件，返回当前代理。只用于参考中的已核实方法或当前页面中已检查的方法。它不替调用者批准方法的副作用。 |

点击由多个协议请求组成，无法锁住用户操作。菜单、窗口焦点或布局变化后重新定位。重要写入优先在一次 `run` 中核对对象并调用对应动作；异步客户端方法仍可能受用户切换影响。遇到 `ACTION_UNKNOWN`、协议超时、断连或动作后的异常，检查已有副作用，不能按失败自动重做。

主导航的当前选择器为 `.Menu .Messages`、`.Meeting`、`.Contacts`、`.SMS`、`.IGPT`、`.Help`。后五个也要加 `.Menu` 前缀，排除内容区的同名类。工作台和收藏的外部浏览器边界见[协作与应用](collaboration-and-apps.md)。

## iframe、webview 与外部浏览器

`targets --all` 不能列出所有 iframe。通过 `Page.getFrameTree` 取得当前 frame ID；读取前核对 iframe 的来源、当前用途和登录主体。跨来源 iframe 的 DOM 不能由父页面 `document` 直接读取。在同一个 CDP 连接中调用 [Page.createIsolatedWorld](https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-createIsolatedWorld)，参数为 `{frameId, worldName:'icenter-task'}`，用返回的 `executionContextId` 作为 `Runtime.evaluate` 的 `contextId`。该上下文读取对应 frame 的 DOM，不拥有主窗口的 Node/Vue 状态。页面导航后重建上下文。iframe 停留在 `about:blank` 时报告未加载，不能把空白视为没有业务数据。

webview 或独立窗口可能有自己的 target。重新发现并核对角色、URL 和来源。外部浏览器需要该浏览器的 CDP 连接；iCenter 的端口不自动覆盖它。不能通过读出令牌或向另一来源注入认证来代替登录。没有该连接或认证时保留受阻状态，完成不依赖它的部分。

## 客户端设置

12.1.0 的系统设置在主窗口内。用 `ui.click('#MenuSystemSetting', {text:'设置', apply:true})` 打开菜单，再点 `#settingDetailShow .SystemSetting`（文本“系统设置”）。等 `#SystemSettingDetail` 可见后定位其菜单。通知入口为 `.NotificationText`，另有 `.GeneralText`、`.ShortcutKeyText`、`.AbnormityText`。关闭入口为 `#SystemSettingDetail .SystemSettingDetailClose#close`。

通知的当前状态可从 `.MessageAudioSetting .CheckBox`、`.MessageFlashSetting .CheckBox` 是否包含 `CheckBoxSelect` 读取。相应登录状态字段为 `$store.state.settingInfo.messageTipsAudio`、`messageTipsFlash`。核对两种观察是否一致；不点击开关来判断原值。通知开关调用 `setMessageTipsAudio`、`setMessageTipsFlash`，它们是切换动作，不能当成幂等赋值重试。

通用页涵盖 Excel 粘贴形式、会议外网、语言、翻译语言、历史同步、缓存目录和缓存清理；快捷键页涵盖发送消息、显示主窗口、截图；异常诊断页有崩溃收集设置。修改目录可能迁移文件并重启，清理缓存可能删除本地数据。这些动作不属于读取设置。版本菜单、日志上传、注销和退出位于 `#settingDetailShow`，各自有独立副作用。

通过 CDP 操作个人头像或设置控件，读取资料、版本和设置项。区分个人资料、在线状态、通知、快捷键、消息显示、文件保存位置、音视频设备、企业策略和安全选项。

读取与修改是不同动作。按用户目标改动对应项，记录原值，检查保存后的值。不能按菜单含有“免打扰”判断当前已开启；读取开关、选中态或设置值。宿主禁止操作的安全、隐私、权限和认证界面交给用户处理，不改用另一种工具绕过限制。

日志上传会对外传输诊断数据，不是连接失败的默认修复步骤。注销、退出、升级和重启会影响草稿与进行中的任务；按[连接与身份](connection-and-identity.md)处理生命周期。

## 未列出的能力

从 CDP 可观察的主导航、搜索结果、会话菜单、消息菜单、工具栏和设置页寻找入口。记录入口、目标身份、必需输入、可见结果及权限约束。找不到入口时报告查询过的位置和限制，不编造成功或推断所有版本都没有此功能。
