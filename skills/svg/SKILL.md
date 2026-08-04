---
name: svg
description: Create, edit, repair, validate, and optimize standalone SVG files with deterministic layout, valid XML, safe text handling, collision-aware geometry, and mandatory parse/render verification. Use for any task involving SVG, including icons, diagrams, flowcharts, architecture graphics, infographics, logos, illustrations, text layout, XML errors, rendering problems, optimization, or modification of existing SVG files.
---

# SVG

本 Skill 是所有 SVG 任务的通用入口。凡是涉及 `.svg` 文件的创建、绘制、修改、修复、检查、优化或渲染验证，都必须优先使用本 Skill。

根据任务选择工作模式：

- **CREATE**：从零创建 SVG；
- **EDIT**：修改已有 SVG；
- **REPAIR**：修复解析、引用、布局或渲染错误；
- **VALIDATE**：检查 XML 合法性、资源引用和视觉布局；
- **OPTIMIZE**：清理冗余内容并提高兼容性。

本 Skill 的目标不是“输出一段看起来像 SVG 的代码”，而是产出：

- 能被浏览器、Inkscape、CairoSVG 正常解析的独立 SVG；
- 元素位置稳定，不重叠、不越界、不乱跑；
- 文本可读，连接线不穿过节点或标签；
- 不使用 HTML 专属实体，避免 `Entity 'ensp' not defined`；
- 经过 XML 解析、引用检查和实际渲染验证。

## 0. 不可妥协的规则

以下规则是 **MUST / NEVER**，不能因为图很简单而跳过。

1. **MUST** 输出完整、独立的 `<svg>` 文档，而不是 HTML 片段。
2. 根元素 **MUST** 包含：

```xml
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 WIDTH HEIGHT"
     width="WIDTH"
     height="HEIGHT">
```

3. **MUST** 使用固定 `viewBox` 作为唯一坐标系统。核心布局不要混用百分比、CSS 流式布局和多个坐标系。
4. **NEVER** 使用 HTML 命名实体，例如：
   - `&nbsp;`
   - `&ensp;`
   - `&emsp;`
   - `&copy;`
   - `&times;`
5. XML 中只允许直接使用以下 5 个命名实体：
   - `&amp;`
   - `&lt;`
   - `&gt;`
   - `&quot;`
   - `&apos;`
6. 需要特殊字符时，优先直接写 UTF-8 字符；必要时使用数字字符引用，例如：
   - 不换行空格：`&#160;`
   - en space：`&#8194;`
   - em space：`&#8195;`
   但 **NEVER 用空格字符做布局**。对齐必须使用 `x`、`y`、`dx`、`dy`、`text-anchor`。
7. **MUST** 转义文本和属性中的裸 `&`，例如 `R&D` 必须写成 `R&amp;D`。
8. **MUST** 保证每个 `id` 唯一，所有 `url(#id)`、`href="#id"` 都能找到目标。
9. **NEVER** 输出 `NaN`、`Infinity`、`undefined`、空坐标或非法路径数据。
10. 除非用户明确要求，**NEVER** 使用：
    - `<script>`
    - `<foreignObject>`
    - 外部图片 URL
    - 外部字体 URL
    - 依赖网页 CSS 的类名
11. **MUST** 在交付前运行 `scripts/svg_preflight.py` 并生成 PNG 预览。
12. **MUST** 检查预览图，而不是只看 SVG 源码。

---

## 1. 先规划，再写 SVG

在生成任何元素前，先在内部建立一个布局计划。不要直接边写边猜坐标。

### 1.1 确定画布

根据内容选择简单整数尺寸：

- 图标：`64×64`、`128×128`
- 小型示意图：`800×500`
- 流程图：`1200×700`
- 信息图：`1440×900`

设置安全边距：

```text
safe_margin = max(24, min(width, height) * 0.04)
```

任何可见元素的包围盒都应位于：

```text
x >= safe_margin
y >= safe_margin
x + width  <= canvas_width  - safe_margin
y + height <= canvas_height - safe_margin
```

只有作为背景的元素可以贴边。

### 1.2 建立坐标表

在内部先列出主要元素：

```text
name        x      y      width   height   center_x   center_y
header      60     40     1080    72       600        76
node_a      90     190    260     120      220        250
node_b      470    190    260     120      600        250
node_c      850    190    260     120      980        250
```

所有位置都从这张表推导。不要在后续代码中重新“目测”中心点。

### 1.3 选择一种布局系统

每张图只选择一种主布局：

- 水平等分
- 垂直堆叠
- 网格
- 径向
- 自由插画

流程图和架构图优先使用网格。自由插画也要先建立主要锚点。

### 1.4 统一间距

使用少量间距变量，不要每处使用随机数字：

```text
space_x = 40
space_y = 32
node_padding_x = 24
node_padding_y = 18
corner_radius = 16
stroke_width = 2
```

同级元素宽高尽量一致。坐标优先使用整数或 `.5`，避免大量无意义小数。

---

## 2. 几何与分组规则

### 2.1 使用局部坐标分组

复杂组件使用一个父 `<g transform="translate(x y)">`，组件内部从 `(0,0)` 开始绘制：

```xml
<g id="node-api" transform="translate(120 180)">
  <rect x="0" y="0" width="240" height="112" rx="16"/>
  <text x="120" y="38" text-anchor="middle">API</text>
</g>
```

同一元素不要同时叠加多层难以追踪的 `translate + scale + rotate`。

### 2.2 组件的标准绘制顺序

保持固定 Z 顺序：

1. 背景
2. 装饰和分区
3. 连接线
4. 节点或主体形状
5. 图标
6. 文本
7. 强调和状态标记

连接线必须在节点之前绘制，避免压在节点和文字上。

### 2.3 中心点必须计算

矩形：

```text
center_x = x + width / 2
center_y = y + height / 2
```

圆：

```text
center_x = cx
center_y = cy
```

不要手动猜中心。

### 2.4 连接线从边缘出发

连接两个矩形时，不要默认从中心连到中心。根据方向选择边缘锚点：

```text
left   = (x, y + h/2)
right  = (x + w, y + h/2)
top    = (x + w/2, y)
bottom = (x + w/2, y + h)
```

水平流程使用 `source.right -> target.left`。垂直流程使用 `source.bottom -> target.top`。

连接线与节点边缘之间可预留 `4–10px`，箭头尖端不要进入节点内部。

### 2.5 折线和曲线

优先使用简单、可预测的路径：

```xml
<path d="M 360 236 H 420 V 320 H 480"/>
```

需要曲线时使用单段或两段贝塞尔，不要生成大量随机控制点：

```xml
<path d="M 360 236 C 410 236, 430 320, 480 320"/>
```

折线拐角应避开文本和节点。连接线之间至少间隔 `12px`。

### 2.6 防止裁切

- 描边会向形状两侧扩展 `stroke-width / 2`。
- 阴影和滤镜会扩大视觉边界。
- 箭头 marker 会超出路径终点。

所以元素的几何边界不能刚好等于 `viewBox` 边界。

---

## 3. 文本布局规则

文本是 SVG 最容易乱版的部分。必须按以下规则处理。

### 3.1 字体

使用可靠的系统字体回退：

```xml
font-family="Inter, 'Noto Sans CJK SC', 'PingFang SC', 'Microsoft YaHei', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
```

不要假设某个网络字体一定存在。

### 3.2 垂直居中

单行文字在简单组件中可使用：

```xml
<text x="120" y="56"
      text-anchor="middle"
      dominant-baseline="middle">标题</text>
```

若目标渲染器对 `dominant-baseline` 表现不一致，则用字体大小修正后的明确基线：

```text
baseline_y = center_y + font_size * 0.35
```

同一张图不要混用两套垂直居中策略。

### 3.3 文本宽度估算

在没有真实字体测量工具时，使用保守估算：

```text
CJK 字符宽度约为 font_size × 1.0
大写英文约为 font_size × 0.68
小写英文约为 font_size × 0.55
数字约为 font_size × 0.58
空格约为 font_size × 0.33
```

容器可用文本宽度：

```text
available_width = box_width - 2 * horizontal_padding
```

估算宽度超过 `available_width * 0.9` 时，必须：

1. 换行；或
2. 缩短文字；或
3. 增大容器。

不要直接缩小到难以阅读的字号。

### 3.4 多行文字

多行文本使用一个 `<text>` 和多个 `<tspan>`，每行显式设置 `x`：

```xml
<text x="120" y="38" text-anchor="middle" font-size="18">
  <tspan x="120" dy="0">第一行</tspan>
  <tspan x="120" dy="24">第二行</tspan>
</text>
```

推荐：

```text
line_height = font_size * 1.25 到 1.45
```

多行总高度必须小于容器可用高度。

### 3.5 禁止用空格对齐

错误：

```xml
<text>名称&ensp;&ensp;状态</text>
```

正确：使用两个独立文本元素或显式坐标：

```xml
<text x="40" y="30">名称</text>
<text x="220" y="30">状态</text>
```

### 3.6 标签不能压线

连接线标签必须：

- 与路径保持至少 `8px` 间距；或
- 在标签后加一个与背景同色的圆角矩形；
- 不得与箭头或节点边框重叠。

---

## 4. 颜色、描边和视觉一致性

1. 一张图使用 1 个背景色、1 个主色、1–2 个辅助色、1 个文本色。
2. 相同语义必须使用相同颜色和样式。
3. 主要文本与背景必须保持清晰对比。
4. 同级节点统一：
   - `stroke-width`
   - `rx`
   - 内边距
   - 标题字号
   - 阴影
5. 不要对每个元素定义一套不同滤镜。
6. 阴影应轻量；滤镜区域必须放大，避免裁切：

```xml
<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
```

7. 描边缩放可能导致粗细变化；对需要固定描边的元素可使用：

```xml
vector-effect="non-scaling-stroke"
```

---

## 5. XML 与兼容性规则

### 5.1 推荐文档结构

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 1200 700"
     width="1200"
     height="700"
     role="img"
     aria-labelledby="svg-title svg-desc">
  <title id="svg-title">图形标题</title>
  <desc id="svg-desc">图形说明</desc>

  <defs>
    <!-- gradients, markers, filters -->
  </defs>

  <g id="background">...</g>
  <g id="connectors">...</g>
  <g id="nodes">...</g>
  <g id="labels">...</g>
</svg>
```

只有确实使用旧式 `xlink:href` 时才需要 `xmlns:xlink`。通常优先使用 `href`。

### 5.2 属性规范

- 属性值必须加引号。
- 不要省略闭合标签。
- CSS 数值必须有合法格式。
- 颜色使用 `#RRGGBB`、`rgb()` 或标准颜色名。
- `path d` 中命令和数字必须完整。
- 不要把 Markdown 代码围栏写入 `.svg` 文件。

### 5.3 引用规则

所有引用必须指向当前文档内存在的 ID：

```xml
fill="url(#panelGradient)"
filter="url(#shadow)"
marker-end="url(#arrow)"
clip-path="url(#clipCard)"
href="#iconDatabase"
```

每个被引用 ID 只定义一次。

### 5.4 禁止外部依赖

独立 SVG 默认不得依赖：

```xml
<image href="https://..."/>
<style>@import url(...)</style>
<use href="other.svg#icon"/>
```

如必须嵌入位图，使用用户提供的本地资源并转换为 data URI，但要提醒文件会变大。

---

## 6. 强制生成流程

### Step 1：解析需求

明确：

- 图的用途
- 画布比例
- 必须出现的元素
- 阅读顺序
- 风格和颜色
- 是否包含中文

信息不足时做保守假设，不要添加大量用户未要求的装饰。

### Step 2：建立布局计划

至少确定：

- 画布尺寸
- 安全边距
- 主分区
- 主要节点包围盒
- 文本区域宽度
- 连接线方向

### Step 3：先画骨架

先生成：

- 背景
- 容器
- 节点矩形或圆形
- 连接线

确认没有重叠后再添加文字和装饰。

### Step 4：添加文字

逐个检查：

- 是否超宽
- 是否超高
- 是否与图标重叠
- 是否包含裸 `&`
- 是否使用了 HTML 实体

### Step 5：源码自检

检查：

- `viewBox` 是否正确
- 所有标签是否闭合
- ID 是否唯一
- 引用是否存在
- 是否有 `NaN`、`undefined`
- 是否有外部资源
- 是否有非法命名实体

### Step 6：运行预检和渲染

在 Skill 根目录运行：

```bash
python scripts/svg_preflight.py output.svg --render output.png --strict
```

预检失败时必须修改 SVG，不能把错误文件交付给用户。

### Step 7：检查 PNG

实际查看 `output.png`，按以下清单检查：

- 所有文字完整可见；
- 没有文字压住边框或图标；
- 节点之间间距一致；
- 连接线从正确边缘出发；
- 箭头方向正确；
- 连接线不穿过节点；
- 元素没有贴边或被裁切；
- 图的视觉中心没有明显偏移；
- 同级元素对齐；
- 不存在意外黑块或缺字。

### Step 8：必要时进行第二次渲染

复杂 SVG 再使用 Inkscape 验证：

```bash
inkscape output.svg --export-type=png --export-filename=output-inkscape.png
```

两个渲染器都正常后再交付。

---

## 7. 碰撞检查清单

对每对可能相邻的元素 A、B，使用包围盒判断是否相交：

```text
no_overlap =
  A.right  + gap <= B.left  OR
  B.right  + gap <= A.left  OR
  A.bottom + gap <= B.top   OR
  B.bottom + gap <= A.top
```

推荐最小间距：

```text
普通元素：12px
文字与边框：12px
节点与节点：24px
不同分区：40px
箭头与文字：10px
```

如果无法可靠计算复杂路径的包围盒，应通过 PNG 预览检查，不要假装已验证。

---

## 8. 修改已有 SVG 时

1. 先解析原文件，确认它是合法 XML。
2. 保留原始 `viewBox`，除非用户要求改变画布。
3. 找到目标元素的 `id` 或明确位置后再修改。
4. 不要全局替换常见数字或颜色，避免误伤其他元素。
5. 修改后重新运行预检和渲染。
6. 如原文件含 `&ensp;` 等实体，替换策略：
   - 仅为视觉间距：删除实体，改用独立 `x` / `dx`；
   - 必须保留字符：改为 `&#8194;`；
   - 更推荐拆成独立 `<text>` 元素。

---

## 9. 常见失败模式与修复

### 错误：`Entity 'ensp' not defined`

原因：SVG 是 XML，不是 HTML。XML 没有预定义 `&ensp;`。

修复顺序：

1. 删除 `&ensp;`；
2. 使用坐标进行布局；
3. 只有在表达字符本身时才使用 `&#8194;`。

### 元素位置乱七八糟

常见原因：

- 未建立布局表；
- 反复嵌套 transform；
- 混用百分比和固定坐标；
- 文字宽度没有估算；
- 不同组件各自猜中心点；
- 连接线从中心穿过节点；
- 只检查源码，没有渲染。

修复：回到固定 `viewBox`，重建主要元素包围盒，统一锚点和间距。

### 文字垂直位置不一致

原因：不同文字混用了 `dominant-baseline`、手工基线和 transform。

修复：整张图只采用一种垂直定位策略。

### 阴影或箭头被裁切

原因：滤镜区域或安全边距不足。

修复：扩大滤镜区域，缩小内容范围，增加画布边距。

### 浏览器能打开但其他软件打不开

原因：依赖 HTML、外部 CSS、`foreignObject` 或宽松解析。

修复：使用独立 XML SVG，去掉网页依赖，并在 CairoSVG/Inkscape 中验证。

---

## 10. 最终交付标准

只有同时满足以下条件，SVG 才算完成：

- [ ] XML 可以严格解析；
- [ ] 没有非法 HTML 命名实体；
- [ ] 根元素存在合法 `viewBox`；
- [ ] ID 唯一，所有引用有效；
- [ ] 没有外部依赖；
- [ ] 没有 `NaN`、`Infinity`、`undefined`；
- [ ] CairoSVG 可以渲染 PNG；
- [ ] PNG 已被实际检查；
- [ ] 无重叠、越界、裁切；
- [ ] 文字完整、清楚、对齐；
- [ ] 连接线与箭头合理；
- [ ] 最终文件只包含 SVG，不包含 Markdown 围栏或解释文字。

若任何一项不满足，继续修复，不得交付。
