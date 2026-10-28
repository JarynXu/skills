# 协作与应用

会议及通话的已登记操作使用[客户端接口](client-api.md)中的 meetings 服务；页面或原生设备任务按[操作方式选择](../SKILL.md#选择操作方式)确定路径。

## 会议、通话与直播

| 目标 | 当前服务方法及核对 |
|---|---|
| 列表、历史和详情 | getMyConfList、queryMyHistoryConfList、queryMyHistoryConfInfo、getConfDetail、getCurConfDetail。保留会议 ID、confUri、callId、时间及分页各自含义，不互相替代。 |
| 创建、预约、修改、取消 | createMeeting、bookConference、modifyReservedConference、cancelReservedConference。核对主题、时间、时区、参与人和通知影响，再按授权提交；受理后重查。 |
| 加入、呼叫、挂断与成员 | joinMeeting、jointGroupMeeting、createP2PCall、acceptCall、rejectCall、inviteMemberToConf、endCall、endConf 等。调用前核对实际对象和当前通话，分别判断呼叫中、连接、拒绝、离开和结束。 |
| 设备与共享 | 查询设备、麦克风、扬声器和摄像头，使用相应设置、会议屏幕请求、Bfcp、远程控制接口。改变设备、共享或控制均需该动作授权；客户端状态和设备实际效果分别核对。 |
| 直播及回放 | getMyLiveList、getLiveInfo、getLiveReserverList、createlive、modifyLive、cancelLive、enterLiveRoom、leaveLiveRoom、startLive、controlLive、getLiveStat 等。主持、管理和观众权限不同。 |
| 转写、纪要和活动 | voiceTrans、getOneConfVoiceTransRecordInfo、getOneConfMinutes、createOneConfMinutes、editVoiceTransRecord、getLuckyBagList 等。实际内容、访问范围和对外通知分别核对；读取不授予创建或参与活动权限。 |
| 转写热词与资源 | getHotWords、setHotWords、oprVTAsset。热词设置核对增量或全量模式；资源操作核对会议和操作类型，不以管理资源为由删除转写材料。 |

方法名用于查定义，不代表可以凭名字填写参数。先核对 sdk-describe、模型和枚举，查实际成功与失败路径。便利方法可能依赖当前会议或页面状态；独立查询使用显式会议、成员及条件对象，不能把当前会议字段改成目标来伪造操作。

`setHotWords` 使用 `8620.lb` 模型：`mode:0` 为增量，`changedHotWords` 中的 `8620.L` 项以 `word`、`oprType` 表达新增或删除；`mode:1` 使用 `totalHotWords` 替换全量列表。`sourceType` 区分通用、会中及会后设置，实际取值查 `sdk-type`。全量模式须包含需要保留的旧热词。`oprVTAsset` 使用 `8620.rb`，按目标会议填写 `callID`、`confID`、`confNum`，核对 `opType` 对应的行为及授权。

会议邀请、拨号、录制、直播、屏幕共享和远程协助不作为技能迁移的真实试验。系统的设备与隐私提示保留用户确认，不用另一个工具绕过。任务结束核对实际共享和控制状态。

## 独立网页应用

短信、日历、兴小助、智能客服入口和工作台使用[独立应用接口](web-app-api.md)中的 web-list、web-describe 与 web-call。原生初始化、身份、HTTP、文件及流式响应各自由应用适配承担；主窗口登录与接口名称存在不证明网页业务成功。

原生 frame、隐藏应用窗口和外部系统保留各自来源。工具只释放自己的连接资源，认证留在客户端或原应用内。智能客服先查 getSystems；认证或入口失败时保留该失败，不猜测子系统接口。服务要求应用签名时按其原有接入方式处理，不能从另一个系统复制令牌。

frame、webview 或系统浏览器承载。桌面 SDK 能打开入口或发送桥接事件，不证明这些页面的数据 API 已接入。主窗口的登录和 CDP 不覆盖外部浏览器。

需要该应用操作时，核对对应来源、页面与登录主体，在原登录上下文中观察实际应用请求、模型及响应，按已授权动作建立应用接口调用。认证由原客户端或网页处理，不提取令牌、伪造认证或向其他来源注入身份。没有该来源的连接或有效登录时保留受阻项，不能把打开页面写成已完成业务。

frame、webview 与外部浏览器的连接核对见[页面与桌面操作](ui-and-settings.md)。接口未覆盖的任务可以使用经核对的页面或桌面路径；交付说明实际使用的方式及结果，不把页面执行写成接口已适配。

短信号码、国家或地区代码、正文、收件人数、费用和送达回执分别核对。iCenter 会话身份不证明电话号码归属。向机器人、智能客服或企业应用提交文字与附件属于对外提交，不是读取旧消息的附带权限。
