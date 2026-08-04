# 产品定义库的信息架构

在创建或移动任何产品文档前阅读。这里定义固定目录、信息归属、文件创建和扩展规则。

## 5. 固定产品信息架构

不得根据“项目大或小”选择不同文档体系。

始终使用同一套产品信息分类。项目规模只影响实际内容量，不影响信息归属。

```text
product/
├── README.md
│
├── 01-context/
│   ├── source-register.md
│   ├── product-brief.md
│   ├── current-state.md
│   └── glossary.md
│
├── 02-discovery/
│   ├── evidence-register.md
│   ├── research-summary.md
│   ├── problems-and-insights.md
│   ├── hypotheses.md
│   ├── alternatives-analysis.md
│   ├── product-observations.md
│   ├── behavioral-inventory.md
│   ├── anomalies-and-gaps.md
│   └── reconstruction-findings.md
│
├── 03-strategy/
│   ├── goals-and-metrics.md
│   ├── product-principles.md
│   ├── scope-and-priorities.md
│   └── releases-and-roadmap.md
│
├── 04-users/
│   ├── users-and-roles.md
│   ├── user-needs.md
│   ├── scenarios.md
│   └── journeys-context.md
│
├── 05-product-model/
│   ├── domain-model.md
│   ├── business-processes.md
│   ├── state-models.md
│   └── product-structure.md
│
├── 06-cross-cutting/
│   ├── business-rules.md
│   ├── permission-matrix.md
│   ├── data-definition.md
│   ├── content-and-notifications.md
│   ├── constraints-and-nfr.md
│   └── compliance-and-security.md
│
├── 07-features/
│   └── <feature>/
│       ├── overview.md
│       ├── requirements.md
│       ├── rules.md
│       ├── states-and-permissions.md
│       ├── data-and-content.md
│       └── acceptance-criteria.md
│
├── 08-validation/
│   ├── requirement-register.md
│   ├── traceability-matrix.md
│   ├── coverage-review.md
│   ├── measurement-plan.md
│   └── product-audit.md
│
├── 09-governance/
│   ├── decision-log.md
│   ├── assumption-log.md
│   ├── open-questions.md
│   ├── conflict-log.md
│   ├── risks-and-dependencies.md
│   ├── change-log.md
│   └── normalization-log.md
│
└── 10-handoffs/
    ├── ux-input.md
    ├── architecture-input.md
    ├── analytics-input.md
    ├── qa-input.md
    └── release-operations-input.md
```

### 5.1 文件创建原则

- `product/README.md` 和 `01-context/source-register.md` 应在开始正式工作时创建。
- 其他文件仅在出现对应信息或当前工作确实需要时创建。
- 不得创建空文件以“补齐目录”。
- 不得因为内容少而将其放进错误文件。
- 文件短不是问题，错误归档才是问题。
- 已有标准位置时，不得创建竞争性的同类文件。
- 同一事实只能有一个权威定义位置，其他文件使用稳定 ID 引用。

### 5.2 从单文件自然扩展为目录

当同类信息增长到多个可独立维护领域时，可以从：

```text
state-models.md
```

扩展为：

```text
state-models/
├── README.md
├── order.md
├── invitation.md
└── import-task.md
```

扩展条件应基于内容结构，而不是主观判断项目大小：

- 出现多个独立业务领域；
- 不同部分有不同维护周期；
- 文件已经难以定位和引用；
- 多个 Agent 需要并行编辑；
- 内容之间不再高度内聚。

---

## 6. 信息路由规则

每条信息都必须先分类，再写入其权威位置。

| 信息类型 | 主要归属 |
|---|---|
| 资料来源、访谈、口述、外部文档 | `01-context/source-register.md` |
| 产品背景、价值、总体目标、当前范围 | `01-context/product-brief.md` |
| 现有产品和业务实际状态 | `01-context/current-state.md` |
| 术语、对象名称和业务定义 | `01-context/glossary.md` |
| 可核查事实和数据证据 | `02-discovery/evidence-register.md` |
| 用户研究和业务研究综合结论 | `02-discovery/research-summary.md` |
| 用户问题、洞察、机会 | `02-discovery/problems-and-insights.md` |
| 未验证判断 | `02-discovery/hypotheses.md` |
| 替代方案、竞品、人工流程 | `02-discovery/alternatives-analysis.md` |
| 对现有产品的原始观察 | `02-discovery/product-observations.md` |
| 现有产品行为清单 | `02-discovery/behavioral-inventory.md` |
| 异常、矛盾和无法解释的现状 | `02-discovery/anomalies-and-gaps.md` |
| 重建后已交叉验证的候选结论 | `02-discovery/reconstruction-findings.md` |
| 产品目标、业务目标、指标、护栏指标 | `03-strategy/goals-and-metrics.md` |
| 长期决策原则 | `03-strategy/product-principles.md` |
| 范围、非范围、优先级、MVP 边界 | `03-strategy/scope-and-priorities.md` |
| 产品版本范围和阶段演进 | `03-strategy/releases-and-roadmap.md` |
| 用户类型、业务角色、系统角色 | `04-users/users-and-roles.md` |
| 用户需要完成的事情 | `04-users/user-needs.md` |
| 具体使用情境 | `04-users/scenarios.md` |
| 跨阶段业务旅程背景 | `04-users/journeys-context.md` |
| 业务对象、关系和生命周期 | `05-product-model/domain-model.md` |
| 业务运行流程 | `05-product-model/business-processes.md` |
| 对象状态和迁移 | `05-product-model/state-models.md` |
| 产品能力域和模块关系 | `05-product-model/product-structure.md` |
| 跨功能业务规则 | `06-cross-cutting/business-rules.md` |
| 角色、操作、字段和数据范围权限 | `06-cross-cutting/permission-matrix.md` |
| 产品层字段、校验和业务含义 | `06-cross-cutting/data-definition.md` |
| 术语文案、通知和内容要求 | `06-cross-cutting/content-and-notifications.md` |
| 技术约束、平台限制、性能、安全、可用性等 | `06-cross-cutting/constraints-and-nfr.md` |
| 合规、隐私、审计和敏感操作要求 | `06-cross-cutting/compliance-and-security.md` |
| 某一功能的产品行为 | `07-features/<feature>/requirements.md` |
| 某一功能的特有规则 | `07-features/<feature>/rules.md` |
| 某一功能的状态和权限 | `07-features/<feature>/states-and-permissions.md` |
| 某一功能的字段和内容要求 | `07-features/<feature>/data-and-content.md` |
| 某一功能的可测试完成条件 | `07-features/<feature>/acceptance-criteria.md` |
| 全部需求主索引 | `08-validation/requirement-register.md` |
| 来源到设计、开发、测试的追踪关系 | `08-validation/traceability-matrix.md` |
| 完整性自检 | `08-validation/coverage-review.md` |
| 上线后验证方案 | `08-validation/measurement-plan.md` |
| 产品审查发现 | `08-validation/product-audit.md` |
| 已确认决策 | `09-governance/decision-log.md` |
| 暂时使用的假设 | `09-governance/assumption-log.md` |
| 尚待回答的问题 | `09-governance/open-questions.md` |
| 不同来源或定义之间的冲突 | `09-governance/conflict-log.md` |
| 风险和外部依赖 | `09-governance/risks-and-dependencies.md` |
| 产品定义变化 | `09-governance/change-log.md` |
| 规范化迁移记录 | `09-governance/normalization-log.md` |
| UX 需要接收的产品输入 | `10-handoffs/ux-input.md` |
| 架构需要验证或决定的问题 | `10-handoffs/architecture-input.md` |
| 数据和分析输入 | `10-handoffs/analytics-input.md` |
| QA 输入 | `10-handoffs/qa-input.md` |
| 发布、迁移和运营输入 | `10-handoffs/release-operations-input.md` |

---

## 17. 文档创建触发条件

### 17.1 `state-models.md`

满足任一条件时创建：

- 对象存在两个或更多状态；
- 状态决定允许操作；
- 存在自动变化；
- 存在过期、撤销、恢复或失败；
- 状态影响 UX 展示。

### 17.2 `permission-matrix.md`

满足任一条件时创建：

- 存在两个或更多角色；
- 不同角色看到不同数据；
- 操作权限不同；
- 存在字段级权限；
- 存在受限操作、敏感操作或数据访问差异。

### 17.3 `architecture-input.md`

满足任一条件时创建：

- 存在技术硬约束；
- 存在性能或规模目标；
- 产品能力需要可行性验证；
- 依赖外部系统；
- 存在安全、部署或数据问题；
- 技术结论可能改变产品范围。

### 17.4 `ux-input.md`

当产品定义具备可供 UX 使用的内容时创建或更新：

- 用户和角色；
- 用户需求；
- 核心场景；
- 业务流程；
- 对象和状态；
- 权限；
- 必须承载的信息；
- 异常和边界；
- 不可改变的约束；
- 待 UX 探索的问题。

### 17.5 功能目录

当出现一个可独立定义、演进或交付的产品能力时创建。

不要按页面、按钮或技术模块机械拆分。

---
