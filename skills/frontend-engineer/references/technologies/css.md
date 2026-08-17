# CSS

Treat CSS as a constraint, cascade, and layout system. Understand the project's token, reset, layer, module, utility, component, and browser-support strategy before adding local rules.

## Work with the cascade

For every rule, know why it wins:

- Origin, importance, cascade layer, specificity, scope, and source order.
- Inheritance and initial or reverted values.
- The boundary created by modules, scoped styles, shadow roots, or CSS-in-JS.

Prefer predictable layer and selector structure over escalating specificity or `!important`. A selector that wins today by accident is not a stable contract.

## Choose layout from the relationship

- Use normal flow for document relationships whenever possible.
- Use flex layout for one-dimensional distribution and alignment.
- Use grid for two-dimensional tracks and shared alignment.
- Use intrinsic sizing, flexible tracks, wrapping, and min/max constraints before hardcoded coordination.
- Use absolute or fixed positioning for genuine overlay or anchored relationships, not ordinary page layout.
- Define the intended scroll container and verify overflow, sticky elements, focus visibility, and nested scrolling.

Account for long content, empty content, replaced elements, min-content behavior, zoom, and localization. Visual success with one fixture is not layout proof.

## Use tokens and component boundaries

- Reuse project tokens for color, typography, spacing, radius, elevation, motion, and breakpoints when they encode design decisions.
- Keep semantic tokens between product meaning and raw palette values.
- Extend tokens or variants only when a repeated semantic need exists.
- Keep page-specific business states out of global utility or primitive layers.
- Avoid arbitrary values that duplicate an existing token without a documented exception.

Follow the project's theming mechanism. Verify light, dark, high-contrast, forced-color, or branded modes that the product supports.

## Express responsive behavior as constraints

- Let components respond to their allocation and content when possible.
- Use viewport breakpoints for viewport-level composition and container queries for allocation-level composition when supported by the project.
- Prefer logical properties for bidirectional layouts.
- Preserve usable controls under text scaling, zoom, and translated content.
- Avoid hiding necessary content merely to make a layout fit.

## Preserve interaction and accessibility

- Keep focus indicators visible and unclipped.
- Do not remove native appearance without rebuilding every required state and affordance.
- Respect reduced motion and avoid animating layout in ways that move active targets.
- Use color with non-color state cues and verify rendered contrast.
- Ensure hover styles have focus and touch-compatible behavior.
- Avoid generated visual content as the only accessible label or status.

## Control cost and compatibility

Avoid broad style invalidation, unnecessary layout reads and writes, huge paint areas, and unbounded animation. Use containment, content visibility, or newer platform features only when they fit the support matrix and their side effects are understood.

Consult current official platform and browser documentation for unfamiliar or recently introduced CSS features. Verify in the project's supported engines and actual host; successful parsing in one browser does not establish support or correct accessibility.
