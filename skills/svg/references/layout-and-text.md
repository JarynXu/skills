# Layout and text

## Contents

- [Model the canvas](#model-the-canvas)
- [Build components from geometry](#build-components-from-geometry)
- [Route connectors](#route-connectors)
- [Fit and align text](#fit-and-align-text)
- [Control visual hierarchy](#control-visual-hierarchy)
- [Edit and repair layouts](#edit-and-repair-layouts)
- [Inspect collisions](#inspect-collisions)

## Model the canvas

Choose an integer `viewBox` that matches the content rather than a fixed template. Common starting points are `64×64` or `128×128` for icons, `800×500` for small diagrams, `1200×700` for flows, and `1440×900` for infographics.

Reserve a safe margin:

```text
safe_margin = max(24, min(canvas_width, canvas_height) * 0.04)
```

Keep visible non-background bounds inside that margin, including half the stroke width, marker tips, shadows, and filter expansion.

Choose one primary system—horizontal flow, vertical stack, grid, radial layout, or anchored illustration. Establish a coordinate table for the major regions:

```text
name      x    y    width  height  center_x  center_y
header    60   40   1080   72      600       76
node_a    90   190  260    120     220       250
```

Derive positions from the table. Use a small spacing scale instead of unrelated constants, and prefer integer or half-pixel coordinates where they improve stroke alignment.

## Build components from geometry

Give each repeated component one local coordinate system:

```xml
<g id="node-api" transform="translate(120 180)">
  <rect x="0" y="0" width="240" height="112" rx="16"/>
  <text x="120" y="38" text-anchor="middle">API</text>
</g>
```

Avoid deep transform stacks. Keep the drawing order stable: background, regions, connectors, node shapes, icons, text, and state accents.

Compute anchors instead of guessing them:

```text
left   = (x, y + height / 2)
right  = (x + width, y + height / 2)
top    = (x + width / 2, y)
bottom = (x + width / 2, y + height)
```

## Route connectors

Connect edges rather than centers. Use right-to-left anchors for horizontal flows and bottom-to-top anchors for vertical flows. Leave room for marker tips so arrowheads stop at the visual boundary.

Prefer simple orthogonal or single-curve paths:

```xml
<path d="M 360 236 H 420 V 320 H 480"/>
<path d="M 360 236 C 410 236 430 320 480 320"/>
```

Keep bends, parallel lines, labels, and arrowheads away from nodes and text. Draw connectors before nodes so node fills mask harmless endpoint overlap.

## Fit and align text

Use a system-font fallback appropriate to the content:

```xml
font-family="Inter, 'Noto Sans CJK SC', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif"
```

Use one vertical-alignment strategy per graphic. For simple single lines, `dominant-baseline="middle"` is acceptable after renderer verification. For compatibility-sensitive work, place an explicit baseline near `center_y + font_size * 0.35` and verify it visually.

Estimate text conservatively when font measurement is unavailable:

```text
CJK              ≈ font_size × 1.00 per character
uppercase Latin  ≈ font_size × 0.68
lowercase Latin  ≈ font_size × 0.55
digits           ≈ font_size × 0.58
space            ≈ font_size × 0.33
```

Compare the estimate with `box_width - 2 × horizontal_padding`. If it approaches the limit, wrap, shorten, or enlarge the container before reducing the font.

Use explicit `<tspan>` positions for multiline text:

```xml
<text x="120" y="38" text-anchor="middle" font-size="18">
  <tspan x="120" dy="0">第一行</tspan>
  <tspan x="120" dy="24">第二行</tspan>
</text>
```

Use `1.25–1.45 × font_size` line height. Never align columns with repeated spaces, tabs, or spacing entities. Put connector labels off the path or give them an opaque background plate.

## Control visual hierarchy

Use a restrained palette with clear semantic ownership. Keep equivalent nodes consistent in radius, stroke, padding, type scale, and shadow. Verify text contrast against its actual fill, including gradients and overlays.

Expand filter regions when shadows or blur extend past geometry:

```xml
<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
```

Use `vector-effect="non-scaling-stroke"` only when a stroke must remain constant through scaling.

## Edit and repair layouts

Parse before editing. Locate the owning `id`, group, definition, or stable geometric region; avoid global replacement of common colors and numbers. Preserve the original `viewBox` unless the requested composition requires a canvas change.

When a layout has drifted, reconstruct the major bounding boxes and anchors before adjusting local coordinates. Remove redundant nested transforms only after computing their composed effect.

## Inspect collisions

For neighboring axis-aligned bounds A and B, require at least one separating condition:

```text
A.right + gap <= B.left
B.right + gap <= A.left
A.bottom + gap <= B.top
B.bottom + gap <= A.top
```

Useful starting gaps are 12 px for ordinary elements, 12 px between text and borders, 24 px between peer nodes, 40 px between major regions, and 10 px between arrows and labels. Adapt them to scale and density.

Treat bounding-box arithmetic as evidence only for geometry it actually models. Inspect rendered pixels for curves, markers, filters, glyph metrics, rotations, and other bounds that the simple model cannot prove.
