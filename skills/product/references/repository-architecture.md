# 产品定义库的信息架构

仅在用户已经授权创建、更新、拆分、合并或移动产品文档时读取。本文件定义逻辑归属和物化规则；目录与文件名称是路由候选，不是生成清单。

## 先确定是否需要产品定义库

满足以下条件后才物化仓库内容：

1. 用户授权将产品判断持久化；
2. 信息需要超出当前对话或一次性交付继续维护；
3. 当前信息有明确语义责任和预期使用者；
4. 现有仓库中没有应当更新的权威位置。

用户只要求讨论、审查结论或独立的单一产物时，按该交付契约完成，不要暗中创建 `product/`。如果已有产品定义库，先读取其导航、来源、决定、开放项和变更记录，再选择更新位置。

## 物化原则

- 先更新现有权威文档，不创建竞争性同类文件。
- 仅当对应信息真实存在并需要独立维护时创建文件。
- 不创建空目录、空文档、TODO 占位文档或仅为展示完整度的文件。
- 同类且高度内聚的信息可以保留在一个文件中；文件短不是拆分理由。
- 不同语义责任不能只为减少文件数而混放。
- `product/README.md` 仅在建立持续维护的产品定义库或其导航发生变化时创建或更新。
- `01-context/source-register.md` 仅在来源需要被持续引用、比较或审计时创建或更新。

## 逻辑信息分类

始终使用一致的语义分类判断归属。目录编号表达稳定导航顺序，不要求全部存在。

| 逻辑责任 | 候选位置 | 仅在出现以下信息时物化 |
|---|---|---|
| 背景与来源 | `01-context/` | 产品背景、现状、持续引用的来源或共享术语 |
| 证据与探索 | `02-discovery/` | 可核查证据、研究结论、问题洞察、假设、替代方向或重建观察 |
| 战略与范围 | `03-strategy/` | 目标、指标、原则、优先级、版本范围或路线决定 |
| 用户与情境 | `04-users/` | 需要独立维护的用户、角色、需要、场景或旅程背景 |
| 产品模型 | `05-product-model/` | 共享业务对象、关系、流程、状态或能力结构 |
| 跨域规则 | `06-cross-cutting/` | 被多个能力共同使用的规则、权限、数据含义、内容、约束或合规要求 |
| 独立产品能力 | `07-features/<capability>/` | 能够独立定义、演进或交付的能力及其特有行为 |
| 验证与追踪 | `08-validation/` | 正式需求索引、跨阶段追踪、覆盖审查、测量计划或产品审查记录 |
| 决策与治理 | `09-governance/` | 需要持续维护的决定、假设、问题、冲突、风险或变化 |
| 跨专业交接 | `10-handoffs/` | 存在真实接收方、交接目的和待处理输入 |

## 候选权威文件

以下文件名用于已有或新增产品定义库中的一致路由。每一项都是候选位置，只创建命中当前信息责任的文件。

| 目录 | 候选文件 |
|---|---|
| `01-context/` | `source-register.md`、`product-brief.md`、`current-state.md`、`glossary.md` |
| `02-discovery/` | `evidence-register.md`、`research-summary.md`、`problems-and-insights.md`、`hypotheses.md`、`alternatives-analysis.md`、`product-observations.md`、`behavioral-inventory.md`、`anomalies-and-gaps.md`、`reconstruction-findings.md` |
| `03-strategy/` | `goals-and-metrics.md`、`product-principles.md`、`scope-and-priorities.md`、`releases-and-roadmap.md` |
| `04-users/` | `users-and-roles.md`、`user-needs.md`、`scenarios.md`、`journeys-context.md` |
| `05-product-model/` | `domain-model.md`、`business-processes.md`、`state-models.md`、`product-structure.md` |
| `06-cross-cutting/` | `business-rules.md`、`permission-matrix.md`、`data-definition.md`、`content-and-notifications.md`、`constraints-and-nfr.md`、`compliance-and-security.md` |
| `07-features/<capability>/` | `overview.md`、`requirements.md`、`rules.md`、`states-and-permissions.md`、`data-and-content.md`、`acceptance-criteria.md` |
| `08-validation/` | `requirement-register.md`、`traceability-matrix.md`、`coverage-review.md`、`measurement-plan.md`、`product-audit.md` |
| `09-governance/` | `decision-log.md`、`assumption-log.md`、`open-questions.md`、`conflict-log.md`、`risks-and-dependencies.md`、`change-log.md`、`normalization-log.md` |
| `10-handoffs/` | `ux-input.md`、`architecture-input.md`、`analytics-input.md`、`qa-input.md`、`release-operations-input.md` |

一个实际产品库可以长期只包含其中少数文件。

## 功能目录与共享定义

仅当某项产品能力能够独立定义、演进或交付时建立 `07-features/<capability>/`。不要按页面、按钮、字段或技术模块机械拆分。

功能目录中的六个候选文件也不是固定套件：

- 少量且内聚的信息可以先保留在 `overview.md` 或一个最匹配的权威文件；
- 只有规则、状态权限、数据内容或验收需要独立维护时才拆出对应文件；
- 被多个能力共享的事实应提升到产品模型或跨域规则位置，功能文档只引用它。

## 拆分、合并与停止

当同类信息出现多个独立责任、不同维护周期、不同接收方、稳定引用需求或明显编辑冲突时，可以把单文件扩展为目录。使用 `<domain>.md` 等占位路径表达结构，不把示例对象写成默认业务模型。

当多个文件表达同一语义责任、由同一主体维护且总是一起变化时，可以合并；合并后必须保留稳定引用或提供迁移关系。

满足以下条件时停止继续拆分或创建文件：

- 当前每个文件都有单一、可命名的语义责任；
- 重要事实拥有唯一权威位置；
- 预期使用者能够定位并安全使用当前信息；
- 进一步拆分只会缩短文件或补齐目录，不会改善维护边界。
