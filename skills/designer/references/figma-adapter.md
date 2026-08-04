# Figma Adapter

Use this reference only when the target design tool is Figma Design.

## 1. Native hierarchy

Use Figma's native structure:

```text
Figma File
└── Page
    └── Section
        └── Frame
            └── Component / Instance / Layer
```

### Page

Use a Page for major work areas:

```text
00 Cover
01 Requirements
02 Information Architecture
03 User Flows
04 Foundations
05 Components
06 Patterns
07 Layouts
08 Product Pages
09 Page States
10 Prototype
11 Assets
12 Handoff
13 Archive
```

Do not create excessive Pages for individual states or single screens.

### Section

Use a Section to group related canvas content:

```text
Section / Chat
Section / Settings
Section / Authentication
Section / Button
Section / Form Controls
```

A Section is the appropriate large visual grouping container. It can organize related designs, provide a direct share target, and later represent a ready-for-development unit.

Do not use one giant Frame as a replacement for a Section.

### Frame

Use Frames for:

- Actual screens
- Components
- Layout regions
- State examples
- Overlays
- Responsive variants
- Prototype destinations

Use nested Frames and Auto Layout to express structural relationships.

---

## 2. File organization

Recommended Product Pages structure:

```text
Page / Product Pages
├── Section / Authentication
│   ├── Frame / Login / Default
│   ├── Frame / Login / Error
│   └── Frame / Login / Loading
├── Section / Chat
│   ├── Frame / Chat / Default
│   ├── Frame / Chat / Streaming
│   ├── Frame / Chat / Offline
│   ├── Frame / Chat / Message Failed
│   └── Frame / Chat / Sidebar Collapsed
└── Section / Settings
```

Recommended Components structure:

```text
Page / Components
├── Section / Actions
├── Section / Form Controls
├── Section / Navigation
├── Section / Feedback
├── Section / Overlays
└── Section / Data Display
```

Inside a component Section, order content:

```text
Anatomy
→ Variants
→ Sizes
→ States
→ Content Rules
→ Usage
→ Do / Don't
→ Developer Mapping
```

---

## 3. Canvas Map for Figma

Before creating many Frames, produce:

| Page | Section | Frames | Direction | Starting position | Status |
|---|---|---|---|---|---|
| Product Pages | Chat | Default, Streaming, Offline | Grid | Clear area right of current content | Planned |
| Components | Button | Anatomy, Variants, States | Vertical | Inside Button Section | Planned |

### Placement rules

- Inspect the target Page before inserting.
- Find the rightmost and bottommost top-level nodes.
- Allocate a clear rectangle for the Section.
- Place the Section with a consistent gap from existing Sections.
- Let Frames live inside their Section.
- Do not append unrelated top-level Frames directly to the Page.
- Never assume `(0, 0)` is empty.

Recommended gaps:

```text
Frame in same row: 80
State row gap: 120
Section gap: 240
Page-level category gap: 400
Section padding: 80
```

---

## 4. Auto Layout rules

Use Auto Layout when children are:

- Stacked
- Aligned
- Spaced
- Repeated
- Content-responsive
- Expected to reflow

Use absolute positioning only when the relationship is intentionally spatial, such as overlays, diagrams, or freeform flow maps.

For each Auto Layout container define:

- Direction
- Padding
- Gap
- Primary-axis sizing
- Counter-axis sizing
- Alignment
- Wrapping
- Min/max constraints where supported

Do not create related children as separate absolute-positioned layers without a container.

---

## 5. Components, variants, and variables

### Components

Create a component when an object:

- Appears more than once
- Has reusable behavior
- Has multiple variants or states
- Is part of the design system
- Must remain synchronized

Use instances in product screens.

### Variants

Use variants for meaningful axes such as:

```text
Type: Primary / Secondary / Danger
Size: Small / Medium / Large
State: Default / Hover / Pressed / Disabled / Loading
Icon: None / Leading / Trailing
```

Do not create a variant for arbitrary content differences.

### Variables and styles

Use semantic variables:

```text
color.text.primary
color.background.surface
color.border.default
color.action.primary
space.4
radius.medium
```

Bind variables to properties where possible.

Avoid hardcoded values when an approved variable exists.

---

## 6. Figma connector operation

When an API/MCP connector is used:

1. Inspect pages and the current page.
2. Switch to the correct Page using the connector's supported method.
3. Inspect existing Sections, Frames, components, variables, and available space.
4. Create or update one logical group at a time.
5. Return or record all created and modified node IDs.
6. Validate node hierarchy and computed positions.
7. Capture screenshots.
8. Correct issues before moving to the next group.

When the environment provides the following specialist skills:

- Load `figma-use` before programmatic Figma operations.
- Load `figma-generate-design` for complete pages, screens, or multi-section layouts.
- Load `figma-generate-library` for components, variables, tokens, and design-system libraries.
- Load the matching FigJam, Slides, motion, SwiftUI, or design-to-code skill when the task specifically requires it.

Do not call a specialized Figma write tool before loading its required prerequisite skill.

---

## 7. Multi-page safety

For connector environments where page context resets:

- Explicitly target the Page on each operation.
- Do not assume the previously active Page remains active.
- Avoid switching across many Pages inside one fragile script.
- Separate work by Page and validate independently.
- Keep object IDs for follow-up edits.

---

## 8. Visual verification

After every logical batch:

- Inspect the layers tree.
- Check Section containment.
- Check Frame bounds.
- Check clipping.
- Check overlapping siblings.
- Check incorrect absolute positioning.
- Check component/instance usage.
- Capture a screenshot.
- Compare against requirements and nearby design language.

A structurally valid file can still be visually wrong. Screenshot verification is mandatory for complex layouts.

---

## 9. Ready-for-development rule

A Section may be marked Ready for development only when:

- Its requirements are Covered.
- Its screens and key states are present.
- Components are linked or documented.
- Interaction notes are complete.
- Responsive behavior is defined.
- No P0 remains.
- P1 issues have human acceptance.
- The design and coverage audits agree.

Do not use Ready-for-development status as a substitute for actual review.

---

## 10. Figma Canvas Audit

```markdown
# Figma Canvas Audit

## Pages
- Missing expected pages:
- Misclassified content:

## Sections
- Missing sections:
- Frames outside sections:
- Sections containing unrelated content:
- Sections ready for development:

## Frames
- Overlapping top-level frames:
- Incorrectly clipped frames:
- Screens missing states:
- Frames without Auto Layout where structure requires it:

## Design System
- Duplicate components:
- Detached instances:
- Missing variants:
- Hardcoded values with existing variables:

## Verification
- Screenshot reviewed:
- Requirement coverage updated:
- Result: Pass / Requires correction / Blocked
```
