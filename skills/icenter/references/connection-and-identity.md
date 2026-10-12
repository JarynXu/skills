# 连接与身份

本技能的运行不要求 computer use。启动、发现与实例重启由本机进程工具负责；客户端任务使用 CDP。需要用户完成认证时说明认证状态，等待其完成，不索取密码或把认证界面当成通用 DOM 表单处理。

## 连接准备

脚本采用 Node.js 内置模块，需要 Node.js 22.4+ 和原生 WebSocket。没有 npm 依赖。缺少运行环境时报告所缺能力，不把依赖安装写入用户当前项目。

首次操作执行连接入口。客户端未运行时，连接工具查找 PATH、App Paths 和卸载注册项中的程序，以回环地址和动态调试端口启动。发现不到路径时从实际安装信息补足 `--executable`；多个安装路径需要选择。

```text
node "<技能目录>/scripts/icenter.cjs" connect
node "<技能目录>/scripts/icenter.cjs" connect --executable "<实际iCenter.exe路径>"
node "<技能目录>/scripts/icenter.cjs" connections
```

`connections` 仅探测主进程 PID、程序路径、版本和命令行中的端口，不建立连接，也不完成连接准备。不要因返回 `port:0` 就转用桌面工具或把启动工作交给用户。

## 运行中的实例

已有 CDP 时复用。多个实例使用 `connections` 返回的 PID 选择目标，不能取第一个或重启全部实例。CDP 有端口但未就绪时等候并检查原实例；连接暂时失败不触发重启。

普通运行的实例需要重启才能加入调试参数。沿用已确认的重启授权，保留草稿及进行中的文件传输、会议和通话。无法从连接前的状态确定这些事项时，只补足重启所需的信息。准备条件满足后执行：

```text
node "<技能目录>/scripts/icenter.cjs" connect --instance-pid <已确认PID> --restart
```

`--restart` 允许关闭所选实例后重启，不替代用户授权。工具先请求正常关闭；进程仍驻留托盘时终止所选 PID 的进程树。它不按进程名终止其他实例。原程序路径和启动参数保留，调试参数更新为回环地址和动态端口。

连接返回的 `status` 表示启动或复用 CDP。`clientState:signed-in` 才表示专用适配器已取得登录状态；`not-signed-in` 交由用户完成认证；`adapter-unavailable` 通过[CDP 页面](ui-and-settings.md)核对当前页面和身份。登录、认证和权限确认遵守宿主约束，不采集凭据。

`CDP_NOT_READY` 或进程调用超时表示就绪状态未确认。保留返回的 PID、端口及现有进程，重新探测，不重复启动或重启。业务写入后断线也先恢复原连接并核对副作用。

## 页面与连接生命周期

主窗口、图片窗口和其他页面可以属于同一实例。`targets --port` 通过运行时角色识别主窗口；多个主窗口使用已观察到的 `--target-id`。`targets --port --all` 列出页面及 webview 的 ID、标题和 URL，用于弹窗、会议和工作台的 CDP 操作。标题和 URL 是定位证据，不能代替登录主体或对象 ID。

记录本次使用的实例、端口和页面。任务中保持该连接，不能在业务命令间反复退出客户端。需要恢复普通启动方式时，先处理任务草稿、传输和会议，再退出本次调试实例并按原方式启动。保留用户原有的 CDP 实例，不把关闭已有客户端作为固定收尾步骤。

## 账户、本人和别名

实例、登录账户、用户本人、当前会话中的对方是四个对象。当前聊天标题和最近使用的联系人不能证明本人身份。

1. 从 `status` 或经 CDP 检查的本人资料取得登录账户原始 ID、名称和工号。不要移除前导零、截断域或根据姓名拼接 ID。
2. 当前账户归属用户需要会话授权或用户提供的上下文支持。共享电脑、代办账户、测试账户和多开客户端中，保留归属未知状态。
3. `unionId` 等客户端身份关联字段是有来源的关联标识。姓名、英文名、昵称和历史显示名属于显示信息，单独不能证明两个 ID 是同一人。企业、租户和账户边界仍需保留。
4. 别名或历史 ID 需要客户端资料、通讯录记录、明确的 ID 映射或用户确认。证据没有给出完整别名集合时，标注“已确认的标识”，不能称“所有别名”。
5. 本人识别用于筛选发送者、正式提及和回复对象。正式提及读取消息中的结构化身份；正文出现姓名只属于文本命中。处理转发和引用时保留原消息与当前发送者的区别。

同一实例切换账户会使旧会话 ID、消息游标及操作计划失效。专用业务命令执行时传入 `--account`，通用 CDP 动作在当前页面核对相同身份。跨账户重新查询目标。多个实例登录同一账户时，草稿仍各自独立。

本人邮箱需要读取本人资料或[通讯录搜索](contacts-and-groups.md#1210-搜索路径)返回的邮箱字段。登录 SIP、数字工号与企业邮箱的前缀可能不同。搜索结果的 unionID 可以与登录关联字段核对，不能从姓名或 SIP 后缀推导邮箱。搜索命中、本人映射和邮箱取值分别保留依据。

邮箱字段存在不代表已取得地址。先去除字段首尾空白，检查是否包含完整地址；空值、占位符、脱敏值和无法识别的格式保留为未取得。搜索摘要缺少地址时读取本人资料详情。详情仍为空时说明客户端没有返回可用地址，不能改写成“本人没有邮箱”。多个地址保留原字段及来源，不能自行指定主邮箱或宣称全部别名。

### 12.1.0 本人资料详情

`#UserHead` 的点击处理打开当前账户资料卡。实际资料位于 `.userZteExternalDivClass`，不是旧的 `showUserDetail` 布尔值。组件 `_getContactInfo` 的 `getContactInfo_ing` 表示请求尚在进行；`cardId`、`unionID` 和 `contactInfo.accountId` 用于核对所查对象。详情字段在 `userdetail` 中，以每项的 `code` 和 `value` 读取；当前模型的属性不一定能通过对象枚举或直接 JSON 序列化取得。

下面读取已登录账户的资料。前提是没有用户已打开的资料卡；保留已有资料卡时先检查其对象，不把它当作本次创建的窗口关闭。`expectedUnionId` 来自本次登录状态。

```javascript
await ui.click('#UserHead', { apply: true });
try {
  const profile = await ui.run(async (tools, expectedUnionId) => {
    const deadline = Date.now() + 10000;
    let card;
    do {
      try {
        card = tools.component('.userZteExternalDivClass', '_getContactInfo');
        if (!card.getContactInfo_ing) break;
      } catch (error) {
        if (error.code !== 'COMPONENT_NOT_UNIQUE') throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 150));
    } while (Date.now() < deadline);
    tools.check();
    if (!card || card.getContactInfo_ing) return { state: 'pending' };
    if (!expectedUnionId || card.unionID !== expectedUnionId) throw Error('Profile identity is not verified');
    const values = card.userdetail.filter(item => item.code === 'email').map(item => String(item.value ?? '').trim());
    return { state: 'loaded', cardId: card.cardId, unionId: card.unionID,
      emails: values.map(value => ({
        state: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'candidate' : 'unavailable', value,
      })) };
  }, expectedUnionId);
  console.log(JSON.stringify(profile));
} finally {
  await ui.run(tools => tools.component('.Menu', 'closeUserDetail').closeUserDetail());
}
```

格式检查用于筛掉空值和占位符，不证明地址可投递。脱敏地址、多个地址或其他格式需要检查原字段，不能靠替换字符补足。资料卡的“编辑个人资料”会打开系统浏览器，按[跨页面连接](ui-and-settings.md)处理，不是主窗口内的编辑弹窗。

## 版本与失败

CDP 传输与专用版本适配器分别判断。当前专用适配器面向 iCenter 12.1.0；字段不匹配时拒绝该适配操作，不返回假空列表。CDP 仍可用时通过 DOM、可访问性树和实际页面状态完成任务；DOM 路径也无法验证目标或结果时报告具体阻塞，不换用桌面自动化。

连接拒绝、认证未完成、多页面、账户变化和版本不兼容各自报告。建立 CDP 连接不能证明消息已发送或后台监控仍在运行。
