# Typography, color, and palette selection

Use this reference when selecting or materially changing typography or color, when a new visual direction needs concrete foundations, or when a design looks generic because its type and palette have no product-specific rationale. Prefer the project's existing foundations when they are authoritative and adequate.

## Select typography by functional demands

Before comparing font personalities, record the demands that can eliminate unsuitable choices:

- reading duration and typical text size;
- UI labels versus long-form prose;
- numeric, tabular, code, scientific, or financial content;
- localization and script coverage;
- platform rendering and performance constraints;
- available weights, italics, variable axes, and licensing;
- brand voice and desired contrast between display and utility text.

Choose personality only among candidates that satisfy the functional demands.

## Build a role system, not a pile of sizes

Define the smallest useful set of roles. A role has a job, not just a font size. Typical families include display, title, heading, body, label, metadata, caption, code, and numeric data, but omit roles with no consumer.

Differentiate roles using several variables together: size, weight, line height, tracking, width, case, color, and placement. Avoid creating a hierarchy where every step differs only by two pixels or one font-weight increment.

Keep body text comfortable and interface labels compact enough for their frequency. Test the system with real wrapping, mixed emphasis, long labels, dense tables, errors, and translated strings.

## Pair fonts by contrast with compatibility

A pairing should have a reason. Useful contrasts include expressive display + neutral utility, serif editorial + sans navigation, or humanist text + technical mono for code/data.

Avoid pairings where both families compete for personality or where their x-height, weight, spacing, or optical texture clash. One family with multiple optical styles or axes is often more coherent than two unrelated families.

Do not select a font because it is fashionable or because another product uses it. Reproduce the needed qualities, not the borrowed identity.

## Construct palettes from roles

Start with semantic roles rather than a list of attractive hex values:

- canvas/background;
- primary and secondary foreground;
- subtle and strong boundaries;
- interactive accent and its states;
- focus/selection;
- success, warning, danger, and informational states;
- overlays and elevation relationships;
- data-series colors only when the product needs them.

Create enough tonal steps to support real hierarchy without turning every shade into a token. The palette should make common decisions easy and uncommon exceptions explicit.

## Choose an accent by product role

An accent may carry action, identity, selection, data meaning, or atmosphere. Decide which jobs it owns before using it.

A strong brand color does not need to fill every large surface. Often it is more distinctive when reserved for active states, key moments, imagery, or a characteristic repeated detail.

When multiple accents are needed, distinguish semantic roles. Do not use several saturated colors interchangeably for decoration and state.

## Dark surfaces require independent judgment

For dark themes:

- tune perceived contrast rather than mechanically invert light tokens;
- reduce overly bright foregrounds when sustained reading would glare;
- check saturated accents, which often appear stronger on dark backgrounds;
- use borders, fills, and elevation differences that remain visible without becoming luminous outlines;
- inspect images, charts, disabled states, focus, and overlays separately.

Pure black can be correct, but near-black surfaces often provide more room for hierarchy. Choose based on product and display context rather than convention.

## Data color is a separate system

For charts and analytical surfaces, select colors according to the data relationship:

- categorical: distinguish peers without implying order;
- sequential: encode magnitude with a perceptually ordered scale;
- diverging: encode movement around a meaningful midpoint;
- status: use the product's semantic state system;
- highlight: mute context and emphasize the compared item.

Never let decorative palette preferences distort data meaning. Verify legends, direct labels, contrast, color-vision robustness, and grayscale or non-color cues where the decision is important.

## Evaluate combinations in context

Do not approve fonts or palettes from swatches alone. Apply them to representative surfaces containing:

- primary and secondary actions;
- body text and dense labels;
- form and validation states;
- disabled and selected controls;
- realistic data or long content;
- light/dark variants if supported;
- a demanding accessibility state.

Reject combinations that look distinctive only in a mood board but collapse under real interface pressure.

## Warning signs

Reconsider the foundation when you see:

- five or more unrelated type personalities on one product surface;
- generic typography compensated for with excessive gradients or glow;
- a palette made mostly of decorative colors with weak semantic roles;
- low-contrast gray-on-gray used to signal sophistication;
- every action rendered in the brand color regardless of priority;
- arbitrary rainbow chart series with no data relationship;
- dark mode produced by inversion rather than visual tuning;
- copied font/color combinations whose brand associations overpower the product's own identity.

The goal is not a memorable swatch sheet. The goal is a foundation that repeatedly produces clear, characteristic decisions.