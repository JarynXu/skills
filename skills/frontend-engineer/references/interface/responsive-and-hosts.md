# Responsive behavior and hosts

Implement against the product's real support contract. Responsive engineering includes available space, content growth, input modality, zoom, and host capabilities; it is not synonymous with adding phone breakpoints.

## Establish the support matrix

Determine from product and project evidence:

- Supported viewport or window ranges and orientation.
- Browser engines, desktop shells, embedded views, or mobile platforms.
- Pointer, touch, keyboard, and assistive input expectations.
- Zoom, text scaling, density, safe areas, and virtual keyboard behavior.
- Host-only navigation, filesystem, notification, clipboard, drag, window, or authentication capabilities.

Do not infer mobile support for a fixed desktop product, and do not infer desktop-only behavior because current screenshots are wide.

## Build layouts from constraints

- Let content and available space determine layout changes; use project breakpoints when they encode those constraints.
- Prefer intrinsic sizing, flexible tracks, wrapping, and min/max constraints over coordinated magic numbers.
- Use logical properties where writing direction can vary.
- Give operational surfaces the width their tasks require; prose readability limits do not automatically belong on dashboards.
- Decide intentionally which region scrolls. Avoid nested scroll traps and clipped focus targets.
- Keep controls usable when labels grow, fonts scale, data is long, or localization changes direction.
- Preserve stable hit targets and avoid layout shifts during loading or animation.

Use container-aware behavior when a component responds to its actual allocation rather than the global viewport, provided the project and supported platform allow it.

## Adapt interaction, not only geometry

- Ensure hover affordances have focus and touch equivalents.
- Keep primary actions discoverable when menus or navigation collapse.
- Delay labels and complex content until expanding containers have usable space; avoid wrapping flashes.
- Reconsider dense tables, drag interactions, and side-by-side comparisons when space or input changes.
- Preserve state and task continuity across resize, orientation, and host navigation.

## Respect host boundaries

Keep host-specific operations behind explicit interfaces. A browser fallback proves only browser behavior, not native packaging or capability integration.

- Detect capability through the project's supported boundary rather than scattered user-agent checks.
- Define unavailable, denied, cancelled, and failed host states.
- Verify deep links, window lifecycle, app history, authentication handoff, and persisted state in the actual host.
- Avoid importing native dependencies into browser-only bundles through shared modules.
- Treat minimum window sizes as a declared constraint, not permission to clip at nearby supported sizes.

## Test representative pressure points

Exercise:

- Declared minimum, typical, and large widths or windows.
- Long localized labels, large values, empty content, errors, and dense data.
- Zoom and text scaling.
- Keyboard, pointer, and touch where supported.
- Open overlays near every viewport edge and with the virtual keyboard where relevant.
- Resize during loading, pending commands, and navigation.
- The packaged host for every changed host-only capability.

Capture the tested support matrix and state any platform boundary that was unavailable.
