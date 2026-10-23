# 本次验证范围

记录时点：2026-10-14T03:36:39+00:00。本记录对应尚未提交的源码和以下运行内容，不代表发布或所有模型均已验收。

- `SKILL.md`：`f02aba4a978d8ece33d089ebcb57b3623026e66d2e7b149f65599c6842e4f49f`
- `references/curation.md`：`47da9b10e6fa99c388b45969edfdcc6a691ef69d4ab4d7c7444b7f75e98d8ed1`
- `references/curation-examples.md`：`26b866e084356b8c3525f23930198f043de8b4ed88ae2ec68351c0aacc6dd3bf`
- `references/acceptance.md`：`e2e0aa702ffdd47087b5d3ad7c6b1bf387c6d531f224f0f9c614155339e5f770`

## 已执行

`tests/test.sh` 对应的通用工具回归实际执行68项，全部通过；包含独立目录复制后运行，不依赖MCX项目检查器。运行脚本与此前版本一致，新增的主要是提炼方法、路由与实例。本次最终实例补充后又执行4项包检查，全部通过，不把它们重复算成额外行为案例。

仓库 `python scripts/validate_repository.py` 通过，20个技能与README发现表一致。`skills add . --list` 在隔离Node 22.20.0、skills 1.7.2下成功列出 maintain-knowledge；系统Node未升级。系统Node 18.19.1的首次运行因缺少styleText失败，隔离运行解决了这项验证的环境条件，没有降低CLI要求。

30个行为案例的输入生成全部成功，任务正文一致，生成工作区不含评审期望文件。12个案例针对工作结束后的知识取舍；其余保留已有建设、迁移、事实、只读和工具边界。这只验证材料可准备，不表示任务模型执行通过。

已检查源码与项目安装副本的17个运行文件一致；暂存区未改变。没有提交、推送或修改业务源码及知识正文。

## 未通过或未执行

仓库 `bash scripts/test_all.sh` 未通过：运行到未修改的 backend-engineer 技能时，其 offline_library.py 输出触发 BrokenPipeError。测试在到达后续技能前停止；本技能的68项回归已独立执行，不能将这两项状态合并成仓库全绿。没有为本任务修改其他技能或关闭其检查。

未执行新会话模型任务、旧版与新版的同模型对照，以及跨模型自然触发试验。当前执行路径没有Codex、Claude、OpenCode或Aider客户端；作者阅读和教学实例不作为这些试验的替代证据。后续执行按[提炼设计及评测入口](../curation-design.md)，无需重新定义验收。

有限的包、工具和材料检查不证明模型已学会判断，也不支持准确率或零错误承诺。当前可确认的是方法、资源和分发源码已经落位，原有工具能按已测契约运行。
