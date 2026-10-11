# CMClient HTTP SDK 协议

本参考依据客户端随包 `app/skills/src/cmclient.ts` 的请求构造、类型声明及接口验证。它记录 HTTP 层的字段和结果，不把 TypeScript 包装器补出的默认值当作原始返回。版本差异以当前随包源码、实际响应和目标文件为证据。

## 传输与通用类型

默认地址：`POST http://127.0.0.1:11328/sdk?func=<接口名>`。请求为 JSON 对象，内容类型 `application/json`。响应信封：

```json
{"code":0,"var":null,"msg":"<可选消息>"}
```

`code: 0` 表示 SDK 接受并处理请求，`var` 是接口结果；无返回内容的写入可为 `null` 或缺省。非零 `code` 是 SDK 失败。HTTP、JSON 解析或信封结构失败各自保留，不能当成空结果。客户端 SDK 不需要本技能存储登录凭据。

SDK 写入可能唤起原生确认框并等待用户界面完成。HTTP 超时不代表动作未执行；检查当前对话框与目标状态，再处理与本次请求及授权匹配的确认，避免重试产生重复副作用。

请求使用 JSON Unicode 转义传递非 ASCII 字符。ID 按来源保留，避免浮点或整数转换损失；`Flags` 使用可保留整数精度的位运算。日期范围使用 Unix 秒，含 `Begin` 和 `End`；边界包含关系未由类型声明完整定义，精确边界任务需要验证。

下文中的“账户选择器”表示 `Account?: string`（邮箱地址或 `@@any`）与 `AccountID?: string | number`。两者择一。`@@any` 选择第一个非离线账户，非所有账户。`Account` 中的数字字符串不是 `AccountID`。请求应显式选择当前目标；原始 HTTP 层不保证 TypeScript 包装器的默认填值。

## 1. `listAccount`

参数：`{}`。

结果 `var`：账户数组。声明字段如下：

| 字段 | 类型与含义 |
|---|---|
| `AccountID` | string 或 number，账户 ID |
| `AccountName` | string，账户地址 |
| `DisplayName` | string，显示名 |
| `ProtocolType` | `Pop3`、`Imap`、`EWS` 或 `Proprietary` |
| `Offline` | 可选 boolean，离线状态 |
| `ParentID` | 可选 string 或 number，父账户 |
| `PackageAccount`、`SharedAccount`、`ReferenceAccount` | 可选 boolean，账户属性 |
| `children` | 包装器可构建的子账户数组，不保证 HTTP 已返回树 |

实际响应可能带 `StorePath` 等扩展字段。保留需要的归属信息，不将本地数据目录当作绕过客户端的读取入口。

本接口提供客户端账户记录，不认证当前操作者的个人身份，也未声明完整邮箱别名清单。本人归属、别名及账户选择遵循[连接与账户](connection-and-accounts.md)；不从字段缺失推断共享属性为假或别名不存在。

## 2. `listFolder`

参数：账户选择器。

结果 `var`：文件夹数组。必需声明字段为 `FID: number`、`Name: string`、`ParentID: number`、`Type: number`。可选字段为 `Atts`、`FolderOrder`、`LastImapID`、`Priority`（number），`ExtKey`、`ColumnOrder`（string），`FolderArchInfo`（未知结构）。`children` 可由包装器生成。

已有响应中的 `Type` 包含：1 收件箱、2 草稿、3 已发送、4 废件箱、5 垃圾邮件、6 病毒邮件、254 本地存档、255 自定义。类型值不能替代实际 `FID`；未知值保留。

## 3. `listMails`

| 参数 | 类型与意义 |
|---|---|
| 账户选择器 | 目标账户 |
| `ReturnType` | 0 统计、1 邮件 ID、2 详情；声明默认 2 |
| `Condition.FID` | number；-1 表示所有文件夹，声明默认 -1 |
| `Condition.RecTime` | `{Begin, End}`，接收时间 |
| `Condition.MailTime` | `{Begin, End}`，信头时间 |
| `Condition.ModTime` | `{Begin, End}`，修改时间 |
| `Sort` | `MailTime`、`RecTime`、`ModTime` 或空字符串（不排序） |
| `SortDesc` | boolean，降序 |
| `Limit` | number；声明默认 100，-1 表示全部 |
| `Offset` | number，声明默认 0 |

已验证的 `var` 形状：

| `ReturnType` | 结果 |
|---|---|
| 0 | `{Total: number}` |
| 1 | `{MID: [string | number, ...], Total: number}` |
| 2 | `{Mails: [...], Total: number}` |

厂商包装器只按详情形状调用 `Mails.map`，不能用于统计或 ID 结果的解析。形状变化应报告协议差异，不能补造 `Mails: []`。

## 4. `searchMail`

| 参数 | 类型与意义 |
|---|---|
| 账户选择器 | 目标账户 |
| `Full`、`Sender`、`Rcpt`、`Subject`、`Body`、`Attach` | string，全文、发件人、收件人、主题、正文、附件名；至少一个非空 |
| `FID` | number；0 或 -1 表示所有文件夹，声明默认 0 |
| `RecTime`、`MailTime` | `{Begin, End}`，接收时间或信头时间 |
| `Policy` | 0 精确、1 普通、2 模糊；声明默认 1 |
| `ReturnType` | 0 统计、1 ID 列表、2 详情；声明默认 2 |
| `SearchSent` | boolean，搜索已发送 |
| `ConditionOr` | boolean；默认 false，多个条件按 AND 组合 |
| `Limit` | number，返回上限 |
| `Sort` | `MailTime`、`RecTime`、`Subject`、`From`、`Size`、`Unread` 或空字符串（默认匹配度） |
| `SortCharset` | string；声明默认 `gb18030` |
| `SortDesc` | boolean，降序 |

`ReturnType: 2` 声明返回 `{Mails, Total}`；包装器声明类型 1 返回 `{MID: [string | number, ...], Total}`。类型 0 的精确形状需按响应验证。该接口未声明 `Offset`，不得假造分页参数或把 `Limit` 截断结果算作全量。

搜索错误可能来自索引、账户或参数。检查 `code` 与当前会话的已知命中，必要时通过 `listMails` 核对相关范围。错误和未知覆盖不能证明无匹配邮件。

### 邮件列表记录

字段包括 `ID`/`MID`、`FID`、`Subject`、`Sender`/`From`、`Rcpt`/`To`、`Cc`、`Bcc`、`MailTime`/`Date`、`RecTime`、`Size`、`Flags`、`Tag`、`Summary`、`HMID`、`ThreadID`。可选声明包含 `Unread`、`HasAttach`、`Priority`；原始响应不保证已计算这些值。

扩展记录可带 `SenderDecode`、`MailStruct` 等结构；解析依赖其实际形状。列表摘要不等同于完整正文。

`Flags` 中已声明的位：

| 位或掩码 | 含义 |
|---|---|
| `1 << 0` | 已读 |
| `1 << 2` | 定时投递 |
| `(1 << 3) + (1 << 4) + (1 << 5)` | 优先级掩码；右移 3 位读取 |
| `1 << 6` | 系统邮件 |
| `1 << 7` | 附件 |
| `1 << 8`、`1 << 9` | SMIME 签名、加密 |
| `1 << 10` | 已回复 |
| `1 << 14`、`1 << 15` | 草稿、已推送 |
| `1 << 21` | 红旗 |
| `1 << 27` | 文件中转站附件 |
| `1 << 29` | 日程邮件 |
| `1 << 36` | 重要邮件 |
| `1 << 38`、`1 << 39` | 置顶、自销毁 |
| `1 << 41` | 内联附件 |
| `1 << 50` | 标签 |
| `1 << 56` | 待办 |

## 5. `readMail`

| 参数 | 类型与意义 |
|---|---|
| `mail_id` | 必需 string；由列表 `ID`/`MID` 取得 |
| `Account` | 可选 string，账户地址；该接口未声明 `AccountID` |
| `bodyType` | 使用已验证的 `Text`、`Html`、`Markdown` 或 `All`；类型声明还列空字符串与 `MD` |
| `ExportAttach` | 可选 boolean，导出附件到客户端临时目录 |

类型声明中的 `MD` 与厂商命令帮助中的 `Markdown` 冲突。客户端验证中，`MD` 返回 `code: 0` 却没有正文路径；`Markdown` 返回 `markdownFilePath`。`Text` 返回 `mailFilePath`，`Html` 返回 `htmlmailFilePath`，`All` 返回三个路径。读取 Markdown 使用 `Markdown`；正文是否可用以路径和文件为证据，不能只看 `code`。

结果 `var` 为 `{json: string, mail?: object}`。`json` 是本地描述文件路径；`mail` 声明有 `ID`、`FID`、`Flags`、`Size`、`Tag`、`RecTime`、`Priority`。读取描述文件后可见：

| 字段 | 内容 |
|---|---|
| `mailHeader` | 头部数组；包装器使用首项的 `Subject`、`sender`、`to`、`cc`、`bcc`、`Date` |
| `mailProperties` | 邮件扩展属性；按实际结构读取 |
| `mailFilePath` | 文本正文路径 |
| `htmlmailFilePath` | HTML 正文路径 |
| `markdownFilePath` | Markdown 正文路径 |
| `mailAttachments` | 附件数组；可有 `filename`/`name`、`size`、`contentType`、`tmpFile`/`path` |

正文路径可以是导出目录下的绝对路径。检查实际路径归属与文件存在；文件读取失败不能吞掉。附件路径与名称的缺失、歧义和文件不存在均需呈现；临时文件名不能推导附件原名。头部、`MailStruct` 或其他元数据指示有附件却未找到文件时，保留附件缺失状态。

## 6. `startCompose`

参数：账户选择器；`to`、`cc`、`bcc` 为 string 数组；`subject`、`body`、`htmlbody`、`htmlfile` 为 string；`attachment` 为本地路径数组。TypeScript 包装器接受单个 string 并转换为数组，原始 HTTP 请求采用数组形式。

账户在类型声明中可省略，实际使用必须选择目标账户；省略账户可能返回 `Account not found`。正文多个来源的优先关系没有声明，按任务选择一个。`htmlfile` 是正文文件路径，不是 URL。

结果没有业务数据；作用是打开预填写信窗口。它不发送、不保存草稿、不建立回复或转发线程契约。后续通过界面执行并检查实际结果。

## 7. `createFolder`

参数：账户选择器，必需 `FID: number`（父文件夹），`Name: string`。无业务返回数据。创建后以 `listFolder` 获取目标文件夹身份。

## 8. `deleteFolder`

参数：账户选择器，必需 `FID: number`（删除目标）。无业务返回数据。接口声明未给出子文件夹、邮件处置及恢复契约；执行前检查当前客户端行为和目标范围。

已观察到该调用弹出原生删除确认框，HTTP 请求等待确认并可能超时。完成匹配本次请求的确认后，通过 `listFolder` 核对删除结果；不能以超时或窗口关闭代替结果判断。

## 9. `moveMail`

参数：账户选择器，必需 `FID: number`（目标文件夹），`MID: number | string | (number | string)[]`。无业务返回数据。不增加未声明的跨账户来源或目标参数。

## 10. `listTags`

参数：账户选择器。结果为 `{Tag: [...]}`。标签结构为 `id?: string`、`tagname: string`、`color?: number`。字段缺失要与空标签集合区分。

## 11. `addTags`

参数：账户选择器，必需 `tagname: string`，可选 `color: number`（0–24 颜色下标）。厂商包装器会在省略颜色时生成下标；原始 HTTP 是否具有同一默认行为需按响应验证。

结果可为 `null`，不保证返回标签 ID。包装器返回的 `{tagname}` 是本地构造值；获取实际新标签应调用 `listTags`。

## 12. `modifyMailTags`

参数：账户选择器，必需 `MID: number | string | (number | string)[]`、`id: string`、`set: boolean`，可选 `clear: boolean`。`set` 指添加或移除；`clear: true` 指设置前清理全部标签。无业务返回数据。

## 13. `listAddressBook`

| 参数 | 类型与意义 |
|---|---|
| 账户选择器 | 目标账户 |
| `type` | 必需：`personGroup`、`orgGroup`、`personContacts`、`orgContacts` |
| `personGroupID` | number，供 `personContacts`；0 未分组，-1 全部分组，其他值指定分组 |
| `orgGroupID` | number，供 `orgContacts`，该类型必需 |
| `parentOrgGroupID` | number，供 `orgGroup`；-1 或省略表示根部门 |
| `Recursive` | number，供 `orgGroup`；0 或省略为当前子部门，-1 全组织，正数指定层数 |

结果为 `{value: [...]}`；记录形状由 `type` 决定：

| 类型 | 记录字段 |
|---|---|
| `personGroup` | `groupID: number`、`name: string`；可选 `email`、`memberCount`、`description` |
| `orgGroup` | `orgGroupID: number`、`name: string`；可选 `email`、`parentOrgGroupID`、`memberCount`、`childCount` |
| `personContacts` | `contactID: number`；可选 `name`、`email`、`mobile`、`phone`、`company`、`address`、`personGroupID` |
| `orgContacts` | `contactID: number`、`orgGroupID: number`；可选 `name`、`email`、`mobile`、`phone`、`company`、`position` |

群组或部门 `email` 可能面向全部成员；读取联系人不授权向该集合发送。

## 14. `searchAddressBook`

参数：账户选择器，必需 `keyword: string`。多个关键词以空格分隔，源码声明为 AND。

结果为 `{value: [...]}`。记录字段均可缺省：`email`、`true_name`、`location`、`contactID`、`name`、`mobile`、`phone`、`company`、`position`、`orgGroupID`、`orgGroupName`、`personGroupID`、`personGroupName`、`alias`。不将缺失 ID 补成 0。

## 15. `listCalendar`

参数：账户选择器，必需 `Time: {Begin: number, End: number}`（Unix 秒）。结果为 `{calendar: [...]}`。

每条记录声明必需 `ID: number`、`StartTime: number`、`EndTime: number`。可选字段：

| 字段 | 意义 |
|---|---|
| `Title` / `Subject` | 标题及备用字段 |
| `Location` | 地点 |
| `AllDayEvent` / `IsAllDay` | boolean，全天标志 |
| `Content` / `Description` | 描述及备用字段 |
| `Acceptors`、`Rejectors`、`Waitors` | 接受、拒绝、待定参与者字符串 |
| `Organizer` | 组织者 |
| `Status` | number，状态码 |
| `RemindTime` | number，提醒分钟数 |
| `RruleStr` | 循环规则原文，RFC 5545 格式 |
| `ExceptionsData` | 例外数据原文 |

已声明状态：0 未响应、1 取消、2 接受、3 待定、4 拒绝、5 更新、6 添加到日历、7 已添加、8 组织者无需响应、10 不显示。未知值保留原码。原始日程不等于全部发生实例；不使用包装器推算结果替代客户端对循环和例外的确认。

## 包装器与原始协议的边界

厂商示例 CLI 包含把异常转换成普通输出字符串的路径，退出成功不能证明操作成功。`listMails` 包装器对所有 `ReturnType` 使用 `Mails.map`，统计或 ID 结果可能被误解析；`readMail` 包装器忽略部分正文文件读取错误。日程 CLI 会在本地展开循环规则，解析失败存在回退路径。

本技能使用保留 SDK 状态及原始数据的工具。诊断时核对 HTTP 信封、文件与客户端状态，不把包装器美化后的文字当作唯一证据。未声明的接口名称、参数和返回形状需要来源或实际验证，不能根据功能名猜测调用。
