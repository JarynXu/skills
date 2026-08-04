# Pen 画布架构与空间管理规范

> 适用工具：pen.dev（原 Pencil）  
> 适用对象：使用 AI 在 `.pen` 文件中批量创建 UI 页面、组件、状态、流程和开发交付稿的设计 Agent  
> 核心目标：避免不同类型的设计对象堆叠、重叠、错位或失去分类，让大型交付稿保持清晰、可维护、可扩展。

---

## 1. Pen 与 Figma 的组织方式不同

Pen 使用无限二维画布和对象树，没有必要照搬 Figma 的 `Page → Section → Frame` 模型。

在 Pen 中，应使用以下层级：

```text
.pen Document
└── Zone Frame
    ├── Zone Header
    └── Board Frame
        └── Delivery Frame / Component / State / Overlay
```

定义：

- `Zone Frame`：顶层分区容器，承担类似 Section 的作用。
- `Zone Header`：分区标题、说明、版本和状态。
- `Board Frame`：分区内部的子类别容器。
- `Delivery Frame`：实际页面、组件、弹窗、状态或交付说明。
- `Component Origin`：设置为可复用的组件源。
- `Component Instance`：通过引用复用组件源。

Pen 中的 Frame 是实际容器，不只是视觉分组。因此必须明确其布局、尺寸、裁切和子元素定位方式。

---

## 2. 强制画布分区

不得把 Foundations、Components、页面、状态和交付说明直接散落在同一片画布上。

至少建立以下顶层 Zone：

```text
ZONE / 00 Cover
ZONE / 01 Requirements
ZONE / 02 Information Architecture
ZONE / 03 User Flows
ZONE / 04 Foundations
ZONE / 05 Components
ZONE / 06 Patterns
ZONE / 07 Layouts
ZONE / 08 Product Pages
ZONE / 09 Page States
ZONE / 10 Prototype
ZONE / 11 Assets
ZONE / 12 Handoff
ZONE / 13 Archive
```

小型项目可以合并部分 Zone，但不得把性质明显不同的内容混放。

允许合并示例：

```text
Requirements + Information Architecture
Product Pages + Page States
Assets + Handoff
```

禁止合并示例：

```text
Foundations + Product Pages
Components + Archive
User Flows + Random Screens
Current Design + Deprecated Design
```

---

## 3. Zone Frame 的定义

每个顶层 Zone 必须是独立 Frame，并具有清晰名称。

推荐结构：

```text
ZONE / 04 Foundations
├── HEADER / Foundations
└── BOARD / Foundations Content
    ├── BOARD / Colors
    ├── BOARD / Typography
    ├── BOARD / Spacing
    ├── BOARD / Grid
    └── BOARD / Effects
```

### Zone Frame 推荐属性

```text
type: frame
layout: vertical
gap: 48
padding: 80
width: fixed
height: fit_content 或经过计算的固定值
clip: false
```

规则：

- `clip` 应显式设为 `false`，避免设计对象被意外裁切。
- Zone 应有明显但低干扰的背景或边框。
- Zone Header 必须始终位于内容上方。
- Zone 必须预留后续扩展空间。
- Zone 不能设置为可复用组件。
- Zone 内部不得放入与其类别无关的对象。

---

## 4. Board Frame 的定义

Board Frame 是 Zone 内部的二级分类容器。

例如：

```text
ZONE / Components
├── BOARD / Actions
├── BOARD / Form Controls
├── BOARD / Navigation
├── BOARD / Feedback
├── BOARD / Overlays
└── BOARD / Data Display
```

```text
ZONE / Product Pages
├── BOARD / Authentication
├── BOARD / Chat
├── BOARD / History
├── BOARD / Settings
├── BOARD / Tool Management
└── BOARD / File Preview
```

Board Frame 必须包含：

- 标题
- 简短用途说明
- 当前状态，例如 Draft、Review、Approved
- 内部对象
- 足够留白

### Board Frame 布局选择

根据内容选择布局，不得统一使用默认布局。

#### 横向布局

适合：

- 同一组件的不同 Variant
- 同一页面的不同屏幕宽度
- 流程中的连续步骤
- 同层级页面

```text
layout: horizontal
gap: 80
```

#### 纵向布局

适合：

- 同一页面的状态列表
- 同一组件的状态矩阵
- 交付说明
- 数据规则

```text
layout: vertical
gap: 64
```

#### 自由布局

适合：

- User Flow
- Information Architecture
- 多行网格
- 大量不同尺寸页面
- 需要明确二维坐标的排版

```text
layout: none
width: fixed
height: fixed
clip: false
```

使用自由布局时，必须计算每个子对象的 `x`、`y`，不得依赖默认坐标。

---

## 5. Pen 默认布局风险

Pen 的 Frame 具有布局行为。AI 创建 Frame 时不得依赖默认值。

可能出现的问题：

- 多个子对象被默认横向排列。
- 子对象的 `x`、`y` 因父级布局被忽略。
- Frame 使用 `fit_content` 后尺寸意外变化。
- 新对象被加入布局末尾，而不是预期位置。
- 外层 Frame 尺寸不足导致视觉混乱。
- 使用绝对坐标和自动布局混合后产生不可预测结果。

因此，每个容器 Frame 必须显式定义：

```text
layout
width
height
gap
padding
justifyContent
alignItems
clip
```

如果需要绝对定位子对象，应满足至少一个条件：

```text
父级 layout: none
```

或：

```text
子对象 layoutPosition: absolute
```

不得在没有明确理由的情况下混用自动布局与绝对定位。

---

## 6. 推荐的交付层级

### Foundations

```text
ZONE / Foundations
├── BOARD / Colors
│   ├── FRAME / Brand Colors
│   ├── FRAME / Neutral Colors
│   ├── FRAME / Semantic Colors
│   └── FRAME / Theme Mapping
├── BOARD / Typography
├── BOARD / Spacing
├── BOARD / Grid
├── BOARD / Radius
├── BOARD / Shadows
├── BOARD / Icons
└── BOARD / Motion
```

### Components

```text
ZONE / Components
├── BOARD / Button
│   ├── COMPONENT / Button / Primary
│   ├── COMPONENT / Button / Secondary
│   ├── FRAME / Button / Sizes
│   └── FRAME / Button / States
├── BOARD / Input
├── BOARD / Select
├── BOARD / Navigation
├── BOARD / Feedback
└── BOARD / Overlay
```

### Product Pages

```text
ZONE / Product Pages
├── BOARD / Chat
│   ├── SCREEN / Chat / Default
│   ├── SCREEN / Chat / Streaming
│   ├── SCREEN / Chat / Approval Required
│   ├── SCREEN / Chat / Offline
│   ├── SCREEN / Chat / Message Failed
│   └── SCREEN / Chat / Sidebar Collapsed
├── BOARD / Settings
├── BOARD / History
└── BOARD / File Preview
```

### Page States

```text
ZONE / Page States
├── BOARD / Loading
├── BOARD / Empty
├── BOARD / No Results
├── BOARD / Error
├── BOARD / No Permission
├── BOARD / Offline
└── BOARD / Conflict
```

### Handoff

```text
ZONE / Handoff
├── BOARD / Interaction Notes
├── BOARD / Responsive Rules
├── BOARD / Content Rules
├── BOARD / Data Rules
├── BOARD / Accessibility
└── BOARD / Change Log
```

---

## 7. Canvas Map

批量绘制前必须先创建 Canvas Map。

Canvas Map 至少包含：

| Zone ID | Zone 名称 | 预计内容 | 顶层坐标 | 预计宽度 | 预计高度 | 状态 |
|---|---|---|---|---:|---:|---|
| Z-001 | Foundations | Tokens 与基础规范 | 0, 0 | 6000 | 5000 | Planned |
| Z-002 | Components | 组件与状态 | 6800, 0 | 8000 | 7000 | Planned |
| Z-003 | Product Pages | 业务页面 | 0, 7800 | 12000 | 9000 | Planned |
| Z-004 | Handoff | 开发说明 | 12800, 7800 | 6000 | 6000 | Planned |

坐标仅为示例。实际值应根据当前画布边界动态计算。

### Canvas Map 规则

- 每个 Zone 必须有唯一 ID。
- 每个 Zone 必须提前分配坐标范围。
- 新建 Zone 不得占用其他 Zone 已分配区域。
- Zone 扩大后必须同步更新 Canvas Map。
- 新设计对象必须先确定所属 Zone 和 Board。
- 无法确定分类的对象暂时放入 `ZONE / Inbox`，评审后重新归类。
- `ZONE / Inbox` 不得作为最终交付区。

---

## 8. 顶层 Zone 排布

推荐使用大网格排列 Zone。

### 方案 A：横向带状

```text
Cover → Requirements → Flows → Foundations → Components
Pages → States → Prototype → Handoff → Archive
```

适合 Zone 数量少、画布横向浏览。

### 方案 B：二维网格

```text
Row 1: Cover | Requirements | Flows
Row 2: Foundations | Components | Patterns
Row 3: Layouts | Product Pages | Page States
Row 4: Prototype | Assets | Handoff
Row 5: Archive
```

适合大型交付文件。

### 推荐间距

```text
Zone 与 Zone：800px
Board 与 Board：240px
同组 Screen：80px
不同状态组：120px
Zone 内边距：80px
Board 内边距：64px
```

项目已有规范时，优先使用项目规范。

---

## 9. 同一 Board 内的排列方式

### 页面与状态

同一页面的状态应按行列组织：

```text
第一行：Default | Loading | Empty | Error
第二行：Offline | No Permission | Conflict | Processing
第三行：Desktop | Tablet | Compact
```

### 流程

流程必须从左到右：

```text
Entry → Step 1 → Step 2 → Success
                  ├── Error
                  └── Cancel
```

### 组件

组件应按以下顺序：

```text
Anatomy
→ Variants
→ Sizes
→ States
→ Content Rules
→ Usage
→ Do / Don't
```

不得把同一组件的状态分散到多个不相邻区域。

---

## 10. 防止对象重叠的坐标规则

任何新对象创建前，必须取得：

- 父容器边界
- 已有兄弟对象边界
- 新对象宽度
- 新对象高度
- 所需间距
- 排列方向

### 横向放置

```text
new.x = previous.x + previous.width + gap
new.y = rowTop
```

### 纵向放置

```text
new.x = columnLeft
new.y = previous.y + previous.height + gap
```

### 换行

```text
if new.x + new.width > board.width - board.paddingRight:
    new.x = board.paddingLeft
    new.y = currentRowBottom + rowGap
```

### 碰撞判断

两个非嵌套对象 A、B 不得满足以下全部条件：

```text
A.left < B.right
A.right > B.left
A.top < B.bottom
A.bottom > B.top
```

若满足，表示发生重叠，必须重新计算位置。

### 强制规则

- 不得为多个顶层对象重复使用同一 `x`、`y`。
- 不得在创建后才依靠人工拖拽解决全部重叠。
- 不得把新对象放到负坐标或极远坐标以隐藏问题。
- 不得通过缩小 Screen 解决画布空间不足。
- 不得把缺失对象覆盖在已有对象下方。
- 不得依靠图层顺序掩盖碰撞。

---

## 11. 动态扩容规则

当 Board 或 Zone 内容增加时，应扩大容器，而不是让内容溢出。

### 横向扩容

```text
requiredWidth =
paddingLeft
+ 所有列宽度
+ 所有列间距
+ paddingRight
```

### 纵向扩容

```text
requiredHeight =
headerHeight
+ headerGap
+ 所有行高度
+ 所有行间距
+ paddingBottom
```

### 扩容后检查

- 新尺寸是否覆盖全部子对象。
- 是否与相邻 Zone 发生碰撞。
- 是否需要移动后续 Zone。
- Canvas Map 是否更新。
- Zone Header 是否仍位于正确位置。
- 是否保留后续扩展空间。

---

## 12. 嵌套规则

### 允许的嵌套

```text
Zone
└── Board
    └── Screen
        └── Page Region
            └── Component Instance
```

### 禁止的嵌套

- Screen 被嵌套在另一个无关 Screen 中。
- Component Origin 放入具体业务 Screen 内。
- Archive 对象放入当前交付 Board。
- 同一对象同时作为布局容器和视觉状态示例。
- 为了对齐而创建大量无意义 Frame。
- 嵌套层级超过理解需要。

### 建议层级上限

普通页面建议不超过：

```text
Zone
→ Board
→ Screen
→ Region
→ Component
→ Internal Layer
```

出现更深层级时，应检查是否存在过度嵌套。

---

## 13. Component 与 Ref 管理

可复用 UI 必须创建 Component Origin，而不是重复复制。

规则：

- Component Origin 设置为可复用。
- 页面中使用实例引用。
- Component Origin 集中放在 `ZONE / Components`。
- 业务 Screen 中不得散落多个独立 Component Origin。
- 不同状态优先通过属性覆盖或独立状态组件管理。
- 修改 Component Origin 后检查全部实例。
- 不得把 Zone 或 Board 设置为可复用组件。
- 不得通过复制实例后解除关系来制造变体。

推荐命名：

```text
COMPONENT / Button / Primary
COMPONENT / Input / Default
COMPONENT / Toast / Error
REF / Button / Save
REF / Input / Project Name
```

---

## 14. Variables 与 Themes

Foundations 中展示的 Token 必须与 `.pen` 文档变量对应。

至少管理：

- Color
- Typography
- Spacing
- Radius
- Border
- Opacity
- Layout Size
- Theme

规则：

- 页面中优先引用变量，不得大量硬编码。
- 亮色和暗色模式通过 Theme 变量管理。
- 不同信息密度可以使用单独 Theme Axis。
- Foundations 展示值与文档变量必须一致。
- 修改变量后检查所有受影响 Frame。
- Theme 示例应作为独立 Screen 或状态展示，不能只写文字说明。

---

## 15. Notes、Prompt 与 Context 的使用

Pen 支持说明类对象时，应区分用途。

### Note

用于：

- 评审备注
- 未决问题
- 修改说明
- 临时提醒

### Prompt

用于：

- 保存可复用的 AI 设计指令
- 指定某个区域的生成要求
- 描述后续编辑目标

### Context

用于：

- 提供产品规则
- 提供 UX 约束
- 提供组件使用说明
- 为 AI 指明当前 Zone 的设计背景

规则：

- Prompt 和 Context 不得覆盖在实际 Screen 上。
- 说明对象应放在 Board 的说明区。
- 临时 Note 在交付前必须清理或转为正式 Handoff Note。
- 不得把重要交互规则只保存在聊天记录中。

---

## 16. 批量绘制工作流

AI 批量生成设计时必须按以下顺序执行。

### 阶段 1：盘点

1. 读取当前 `.pen` 文件对象树。
2. 识别全部顶层对象。
3. 记录每个顶层对象的边界。
4. 识别已有 Zone、Board、Screen 和 Component Origin。
5. 检查已有重叠与错误分类。

### 阶段 2：规划

1. 建立或更新 Canvas Map。
2. 为新对象分配 Zone。
3. 为新对象分配 Board。
4. 计算预计宽高。
5. 计算坐标。
6. 执行碰撞预检。

### 阶段 3：创建结构

1. 先创建 Zone。
2. 再创建 Zone Header。
3. 再创建 Board。
4. 最后创建 Screen、State、Overlay 和 Component。
5. 创建后立即命名。

### 阶段 4：绘制内容

1. 优先使用 Component Instance。
2. 使用 Variables 和 Themes。
3. 明确 Frame 布局。
4. 不得临时使用默认坐标。
5. 每批最多创建一个逻辑分组。

### 阶段 5：空间验证

1. 检查 Frame 重叠。
2. 检查容器溢出。
3. 检查错误嵌套。
4. 检查 Zone 间距。
5. 检查 Layers 层级。
6. 检查命名。
7. 更新 Canvas Map。

---

## 17. 批量创建的停止条件

出现以下任一情况时，必须暂停继续生成并先整理画布：

- 新对象所属 Zone 不明确。
- 新对象将与现有对象重叠。
- Board 剩余空间不足。
- 已有 Zone 边界不准确。
- 当前对象树存在错误嵌套。
- 多个对象名称重复。
- 组件源和实例关系不清楚。
- 需求变更导致原 Canvas Map 失效。
- 发现旧版本与当前版本混放。
- 无法确认对象是否属于交付范围。

不得在结构混乱的基础上继续叠加页面。

---

## 18. 创建后的画布审计

每批创建结束后，必须输出 Canvas Audit。

```markdown
# Canvas Audit

## Structure

- Zone Count:
- Board Count:
- Screen Count:
- Component Origin Count:
- Instance Count:

## Collision Check

- Overlapping Top-level Objects:
- Overlapping Sibling Frames:
- Objects Outside Parent Bounds:

## Classification Check

- Unclassified Objects:
- Objects in Wrong Zone:
- Current and Archived Objects Mixed:

## Layout Check

- Frames Missing Explicit Layout:
- Frames Using Unexpected Default Layout:
- Absolute Children in Auto Layout:
- Containers with Incorrect Sizing:

## Naming Check

- Duplicate Names:
- Default Names:
- Unclear Names:

## Result

- [ ] Pass
- [ ] Requires Reorganization
- [ ] Blocked
```

---

## 19. 命名规范

推荐：

```text
ZONE / 04 Foundations
BOARD / Foundations / Colors
FRAME / Color / Semantic Tokens
ZONE / 08 Product Pages
BOARD / Chat
SCREEN / Chat / Default
STATE / Chat / Offline
OVERLAY / Chat / Delete Confirmation
COMPONENT / Button / Primary
REF / Button / Save
NOTE / Chat / Pending Decision
CONTEXT / Chat / UX Rules
```

禁止：

```text
Frame 1
Frame 328
New Frame
Group 7
Copy
Untitled
Test
Final Final
```

ID 与名称都应保持唯一、稳定和可追踪。

---

## 20. Archive 管理

废弃设计必须移入单独 Zone：

```text
ZONE / 13 Archive
├── BOARD / 2026-07-20
├── BOARD / Rejected Directions
└── BOARD / Previous Components
```

规则：

- Archive 与当前交付保持至少一个 Zone 间距。
- Archive 使用明显但低干扰的标识。
- Archive 对象不得继续作为当前组件源。
- 当前页面不得引用已废弃 Component Origin。
- Archive 中应记录废弃原因和替代方案。
- 不得用隐藏、透明或移出视野代替归档。

---

## 21. 交付标准

只有满足以下条件，才能认为 Pen 画布组织合格：

- 所有顶层内容已被明确分类。
- 每类内容拥有独立 Zone。
- 每个 Zone 内部拥有清晰 Board。
- 每个 Screen、State、Overlay 和 Component 都位于正确位置。
- 不存在非预期重叠。
- 不存在被错误裁切的对象。
- 所有容器都显式定义布局。
- 不依赖默认 `x`、`y` 或默认布局。
- Component Origin 与 Instance 关系清晰。
- Variables 与 Foundations 对应。
- 当前设计和 Archive 完全分离。
- Canvas Map 已更新。
- Canvas Audit 已通过。
- 评审者可以快速找到某一功能的全部页面、状态和交互对象。

最终原则：

> 在 Pen 中，专业交付稿不仅要设计正确，还必须通过可计算的画布分区、对象树和坐标管理，让人类与 AI 都能准确理解每个设计对象属于哪里、与什么相关，以及后续应该在哪里继续扩展。
