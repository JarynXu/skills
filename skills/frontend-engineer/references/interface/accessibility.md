# Accessibility

Treat accessibility of supported user journeys as functional correctness. Begin with semantic structure and native behavior, then add only the custom interaction required by the product.

## Semantics and names

- Use native elements for their intended roles whenever possible.
- Give every control an accessible name that describes its result.
- Preserve heading hierarchy, landmarks, lists, tables, labels, and relationships.
- Use links for navigation and buttons for commands unless the platform contract dictates otherwise.
- Add ARIA only to fill a semantic gap; incorrect ARIA is worse than native semantics.
- Keep accessible names stable enough for users and automated tests to recognize controls.

When wrapping a design-system primitive, verify that roles, states, properties, and names survive composition.

## Keyboard and focus

- Make every supported command reachable and operable without a pointer.
- Preserve a logical focus order that follows the task, not arbitrary DOM or visual order.
- Show a visible focus indicator with sufficient contrast.
- Move focus only when context changes and the destination helps the user continue.
- Trap focus only for truly modal surfaces and restore it when they close.
- Support expected keys for the chosen native element or composite widget pattern.
- Avoid positive `tabindex` and hidden focus targets.

Test escape behavior, menus, dialogs, comboboxes, grids, drag alternatives, and any custom keyboard model directly.

## Dynamic state and feedback

- Associate validation messages with their fields and provide a useful summary when the form is long or submission fails.
- Announce asynchronous status only when users need to know it; avoid noisy live regions.
- Keep loading, error, success, expanded, selected, pressed, checked, current, and disabled states programmatically available.
- Do not remove focused content without moving focus to a meaningful surviving target.
- Ensure virtualized or incrementally loaded content remains understandable to assistive technology.

## Visual and sensory access

- Do not encode meaning with color, position, shape, sound, or motion alone.
- Verify text and non-text contrast against the actual rendered background.
- Support text zoom, browser zoom, reflow, and user font settings within the product's declared platform constraints.
- Provide alternatives for hover-only information and fine pointer gestures.
- Keep touch and pointer targets usable without causing accidental activation.
- Honor reduced-motion preferences and avoid motion that blocks interaction or obscures state.

## Content and errors

Use clear labels, concrete action names, and recovery-oriented errors. Placeholder text is not a label. Tooltips do not carry essential instructions, validation, safety information, or status. Time limits, authentication steps, and destructive actions require accessible warning and recovery behavior.

## Verification

Use complementary evidence:

1. Static accessibility checks for detectable markup and rule failures.
2. Keyboard-only traversal of changed journeys.
3. Accessibility-tree or name/role/state inspection.
4. Focus behavior through loading, overlays, validation, navigation, and failures.
5. Zoom, reflow, contrast, reduced motion, and high-contrast or forced-color behavior when supported.
6. Targeted screen-reader checks for custom or high-risk interactions.

Automated checks cannot prove usability or a coherent reading and focus order. Test the actual primary journey.
