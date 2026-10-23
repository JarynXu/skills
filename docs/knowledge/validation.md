# Knowledge 验证范围

## 2026-10-23：路径边界与影响分析修复

来源基点为 `dc7d71ca7d08f9830fe47721c20f2ef9fea798ea` 的未跟踪 knowledge 包。修改前的包保存在任务临时目录 `knowledge-path-fix-kr5m2y97/baseline`；本节描述随后提交的路径修复。主文、触发描述和知识取舍方法未变。

### 契约与修复

- 文档扫描、文档选择和来源读取拒绝符号链接及 Windows 目录联接。路径解析核对实际目标是否仍在显式工作区内；bundle 的原始路径在解析前接受检查。
- 影响分析使用宿主平台的路径比较规则，贯穿直接来源、派生来源与导航入链。输出保留文档名大小写；文件删除后的缺失路径继续参与分析，缺失错误仍然报告。
- Python 3.10 兼容性采用已有的 `lstat` 重解析标签与 `PurePath` 接口，未增加依赖。接口依据见 [Python stat](https://docs.python.org/3.10/library/stat.html#stat.IO_REPARSE_TAG_MOUNT_POINT) 与 [pathlib](https://docs.python.org/3.10/library/pathlib.html#general-properties)。最低版本未单独执行；下述实测使用 Python 3.14。

### 执行证据

新回归用例位于 `tests/test_tools.py` 和 `tests/test_impact.py`，通过 `bash skills/knowledge/tests/test.sh` 运行。

- Windows / Python 3.14.6：78 项，77 通过，1 项 POSIX 专用检查跳过。使用真实 NTFS 目录联接和真实 CLI，覆盖工作区外来源、全库扫描、指定文档、bundle/workspace 入口、工作区内联接、失效联接、大小写变体、派生及导航链、删除后的候选保留。
- WSL Linux / Python 3.14.4：78 项，71 通过，7 项 Windows 专用检查跳过。使用相同的固定依赖，验证 POSIX 路径大小写不会合并、符号链接拒绝和既有工具行为。
- 将 3 项新回归检查作用于修改前的脚本，得到 4 个失败断言：来源越界读取被接受、目录联接被遍历、文件存在及删除后的影响分析漏项。相同检查在修复版通过。该对照验证检查能识别原缺陷。
- 原始审查夹具复测：`source --hash` 拒绝目录联接并退出 2；`check --sources` 报告 `unsafe_source`，来源哈希数为 0；大小写不同的 `impact --source` 返回预期文档。
- 工作区的仓库结构校验和 CLI 发现通过，列出 23 项；`bash scripts/test_all.sh` 退出 0。前文记录的 Local 环境缺依赖及管道失败属于当时运行结果，本次 Windows 检查未复现。
- 暂存版本独立导出后，`python scripts/validate_repository.py`、`bash scripts/test_all.sh`、`npx --no-install skills add . --list` 通过。该版本包含 22 项技能，仅纳入 knowledge 包、维护记录、许可说明和对应 README 登记；其余工作区改动未进入此次提交。验证完成后的补充只涉及本节记录。
- Git 全范围空白检查报告上游 `okf-spec.md` 的四处行尾空格及 `OKF-LICENSE.txt` 的末尾空行。两份原文保持导入字节，规范哈希与 `okf-origin.json` 一致；不修改原文来消除提示。作者维护文件的空白检查通过。

这些证据针对工具路径契约，不扩展前次模型行为验证的结论。本次未执行模型自然触发或跨模型能力对照。

## 2026-10-23：共享知识收录边界

来源基点：main，HEAD dc7d71ca7d08f9830fe47721c20f2ef9fea798ea；knowledge 为已有未跟踪工作，本次没有提交、推送、安装或发布。比较基线主文 SHA-256 为 98df7e046301dd0cffe615da0e4bd2a454248665e77f57b96a7f800e9ad27cd8，候选主文为 093ecdb310d8fed2425972208f24ad26851b2f726512c3c1829e29ae27520883。本次改动仅涉及 knowledge 的主文、取舍/实例/验收参考、评测材料及本目录说明，不清理实际项目知识库。

### 已执行的行为任务

使用两个新上下文执行者分别读取修改前、修改后的运行资源，在相同的四组独立文件夹中实际完成维护。每个执行者按顺序处理四个任务；不向其提供评审答案或另一版本输出。此为显式加载技能的执行，不是自然发现试验。执行环境为 Local connector；使用继承模型及 xhigh 推理设置，平台未提供可核对的底层模型版本标识。

- 个人偏好与团队决定：只收录已接受的 PRV-12，保留非生产范围、48小时条件、成本原因和未实施状态，未复制个人偏好。
- 本机绕过与共享环境：修正 6.2 的共享 arm64 池限制，保留 x86_64 生产对照和 6.3 未核验状态，不把私人代理/路径写成团队要求。
- 聊天经过与事故因果：修正租约单位和无效重试指引，保留发布、故障、回滚的必要顺序及回放证据，不把猜测或聊天噪音写成事实。
- 无共享增量：全部文件逐字不变，不创建笔记、日志或无变化页。

基线和候选都满足这四例的主要语义验收。候选只改四个已有主题文件；基线还修改三个索引的显示标签，共七个文件。没有新增或删除文件，受保护的源码、记录和任务输入未改变。作者检查了实际输出及哈希差异；候选相对基线更少改动索引，但不能把单次样本当成稳定改进。四组输入与标准见 evals/cases.json；运行产物留在仓库外的独立临时工作区，不纳入技能。

### 包、材料与工具检查

- python scripts/validate_repository.py 通过，23项技能与 README 发现表一致。
- 新增四例通过真实 prepare_case.py 生成，文件逐字匹配输入定义，无评审字段泄漏；共42个行为案例。此检查只证明材料构造。
- 修改的运行文档相对文件链接、改动文件空白检查通过。
- 默认 Node 18 的离线发现命令因 node:util 缺少 styleText 失败；改用已有缓存 Node 22.20.0 运行同一 skills CLI 的 add . --list 成功，并确认列出 knowledge。未安装包或更改全局环境。
- bash skills/knowledge/tests/test.sh 未通过：当前 Python 缺 mdit_py_plugins，test_tools 无法导入，两个依赖真实 CLI/隔离包的检查随之失败。实际报告15项、2失败、1导入错误；不将旧记录的70项通过作为本次结果。可用解释器同样缺该依赖，未安装依赖绕过限制。
- bash scripts/test_all.sh 再现未修改的 backend-engineer/scripts/offline_library.py 中 command_search 的 BrokenPipeError，整库检查未通过；未修其他技能。
- 整库 git diff --check 仍报告无关既有工作中的空白问题；改动文件单独检查通过。工作树有并行的 maintainable-design 等改动，未覆盖或恢复它们；HEAD 与暂存区未变。

### 限制

未执行全42例、新客户端/跨模型试验、自然触发测量或实际项目知识库回放。四例是合成且证据清楚的任务，不足以测出困难场景中的错误率；两版都通过，不证明旧版缺陷已被统计复现或新版普遍优于旧版。脚本未改，但缺失依赖使完整 Knowledge 工具回归仍待在具备既定依赖的环境运行。

## 2026-10-14：历史验证

核验时点：2026-10-14T03:53:48.053868+00:00。对象为本地 `skills/knowledge/`，主文 SHA-256 为 `98df7e046301dd0cffe615da0e4bd2a454248665e77f57b96a7f800e9ad27cd8`。本记录不表示已经提交、推送或发布。

## 已执行

仓库结构校验通过，20项技能与README发现表一致。Knowledge的70项工具、包和评测材料回归通过，包含新名称的隔离目录运行和隐式场景输入隔离；没有失败或跳过。

使用缓存的Node 22.20.0和skills 1.7.2实际运行本地 `skills add . --list`，列出knowledge、不再列出maintain-knowledge。在项目外空目录通过 `skills add /workspace/skills --skill knowledge --agent codex claude-code --yes --copy` 安装成功；Codex与Claude Code两处安装的18个运行文件均与源码逐字相同，包括宿主的隐式调用配置。实际安装包的70项回归也全部通过；这是对安装结果的检查，不另计为70个不同用例。未改系统Node或用户全局安装。

原包参考资料、工具和许可证完整保留，运行脚本未改。原项目安装副本未自动迁移，没有改业务知识或项目规则。

## 失败与未执行

仓库 `bash scripts/test_all.sh` 在未修改的backend-engineer测试中因offline_library.py的command_search触发BrokenPipeError而停止，不能报告整库测试通过。Knowledge测试已独立执行；没有关闭检查或修改其他技能以消除失败。

38个行为任务包含8个不点名技能的触发正反例。材料生成及字段验证不能证明模型实际调用；未执行独立新会话的自然触发、旧新版模型对照或不同客户端行为测试。`allow_implicit_invocation: true`表示允许隐式调用，不是触发成功率保证。

方法与模型试验入口见[curation-design.md](curation-design.md)，旧名称对应的历史证据见[导入验证](history/2026-10-14-before-rename.md)。
