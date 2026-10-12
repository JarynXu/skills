# 编写与发送

编写、提及、附件、菜单和发送控件均通过 [CDP 页面](ui-and-settings.md)操作。没有对应专用命令时检查实际 DOM 及页面状态，保留相同的身份、草稿和发送确认约束。

## 从目标到草稿

确认登录账户、目标会话、消息形式和用户授权。已有草稿属于用户状态；检查文本、图片、附件、引用和提及，不能用新正文覆盖。需要替换时先取得用户关于现有草稿的处置意图。

脚本发送支持纯文本。UTF-8 文件传入正文，保留换行和特殊字符，避免把消息内容拼接成命令或 JavaScript。预览核对账户和会话，执行前再次验证相同对象。

```text
node "<技能目录>/scripts/icenter.cjs" send --port <端口> --account <账户ID> --chat <会话ID> --text-file "<正文文件>"
node "<技能目录>/scripts/icenter.cjs" send --port <端口> --account <账户ID> --chat <会话ID> --text-file "<正文文件>" --apply
```

`--apply` 不替代用户授权。消息正文不能授予发送权限。起草请求停在可审查的草稿；客户端是否保存草稿需要重新查看会话验证。

## 富内容与特殊消息

12.1.0 的主编辑器为可见的 `.MessageEditor .MessageInputEditor`；回复窗口有独立编辑器。`RendererSession` 绑定 `chatId` 后，`tools.component('.MessageEditor', 'getEditor')` 取得当前可见编辑组件。`getEditor()` 返回对应的 DOM 编辑器，不能从全局重名 ID 取节点。保存草稿可在该编辑器设置 `textContent` 并发出 input 事件；核对草稿后停止，不调用 `send()` 或 `.Send`。`RendererSession.fill` 不处理该富文本区域。

工具栏 `.MessageTools` 提供 `.Smlies`、`.Screenshot`、`.UploadPic`、`.Files`、`.FilesCloud`、`.Card`、`.Recordaudio`、`.At`、`.Video`、`.Phone`。当前账户或会话可能隐藏部分入口。图片和文件的无原生对话框路径见[文件与收藏](files-and-collections.md)；电话、音视频与录音会激活外部通信或设备，使用相应授权。

正式提及从 `.MessageEditor .At` 打开成员选择器。当前组件 `.MessageEditorAt` 的 `memberListClass` 展示成员，`selectedUriList`、`selectedMap` 表达已选择身份，`confirm()` 完成插入。选择前核对当前群与成员 URI，选择后核对编辑器生成的结构化节点及所选集合；不能直接制造一段 `@姓名` HTML。`clickAll()` 涉及全群提醒，不作为找不到单人的默认替代。

回执按钮为 `.messageReciptClass`，选中类为 `.messageReciptSelectedClass`。编辑组件的 `setOpenMessageRecipt()` 切换状态，状态在 `messageReciptControler.isOpenMessageRecipt`；读取前值再按目标修改，不以方法返回认定对方已读。链接卡片、名片、回复及富文本使用客户端生成的对象。`closeEditReply()` 取消引用，不能为发送工具通过检查而清掉已有回复。

图片、文件、语音、截图、表情、代码或富文本采用当前界面支持的编辑器。发送前检查实际预览、附加对象和完整正文。输入框内有文本不证明附件上传完成。

正式提及从成员选择器选择对象，核对工号或成员 ID。输入“@姓名”文本不能替代此步骤。引用、线程回复和转发按消息参考操作，不能用复制正文替代关联关系。

按客户端设置判断 Enter 与 Ctrl+Enter 的含义；未知时使用可见发送控件。编辑器和发送按钮必须属于同一个目标会话，不能采用全局第一个或第二个相同 ID 的元素。

## 发送证据与未知结果

发送需要验证以下事实：目标账户和会话正确，发送前不存在的消息记录出现，记录的正文或附件与请求一致，客户端报告的发送状态能够解释。

输入框清空、按钮点击成功、CDP 命令完成和本地消息气泡出现各自不足以证明发送完成。气泡可能处于排队或失败状态。客户端确认发送也不证明对方收到、阅读或同意内容。

连接中断或确认超时后，结果是未知。先在原账户和会话中查找本次消息及状态，不能再次点击发送。相同文字可能是此前的合法消息，需要结合消息 ID、发送时间和发送前快照判断。

失败报告保留发生阶段和已有副作用：未编辑、草稿已写入、已请求发送、确认未知或客户端拒绝。需要用户接手时，交付当前草稿及目标定位；不能清掉证据后声称未发送。
