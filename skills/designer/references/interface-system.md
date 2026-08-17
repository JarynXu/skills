# Interface system

Treat an interface system as the maintained language through which product surfaces express meaning and behavior. Foundations, variables, components, patterns, layouts, and guidance are valuable only when real design objects use them and changes propagate through a coherent ownership boundary.

## Discover before creating

Inspect the relevant existing system and its actual use:

- design principles and visual language;
- semantic variables, styles, themes, modes, and raw scales;
- primitive and composite components, variants, properties, slots, and states;
- repeated interaction and content patterns;
- layout shells, page families, responsive transformations, and representative surfaces;
- usage guidance, extension policy, ownership, deprecations, and archived sources;
- detached copies, local imitations, conflicting sources, and gaps between library examples and product screens;
- corresponding frontend components or constraints when available.

Do not infer a system from a library page alone. Inspect healthy consumers to learn which sources are canonical, how they are combined, and which documented assets are unused or obsolete.

## Resolve every need at the narrowest honest layer

For each interface need, choose one result:

1. **Adopt an existing source** when its semantic, visual, interaction, and state contract fits.
2. **Extend an existing source** when the responsibility is the same and the missing variation belongs to that contract.
3. **Create a new shared source** when a stable responsibility must remain synchronized across actual or strongly justified consumers.
4. **Keep it local** when the need is surface-specific, exploratory, or not yet a stable reusable contract.
5. **Reopen the design decision** when existing system rules conflict with approved intent, accessibility, or technical truth.

Do not promote an object merely because it looks reusable or appears twice. Similar appearance may hide different meanings; different appearance may share a stable interaction or accessibility mechanism.

One current consumer does not automatically forbid a shared source. A foundational semantic variable, accessibility-critical primitive, or independently governed capability may deserve canonical ownership immediately. State the stable responsibility rather than inventing future consumers.

## Build from real consumers

Use this loop whenever adding or changing reusable capability:

```text
surface need
-> discover current sources and consumers
-> decide adopt, extend, create, localize, or reopen
-> define the smallest sufficient contract
-> bind or instantiate it in the real surface
-> inspect other semantically eligible consumers
-> migrate within authorized scope or preserve an explicit adoption boundary
-> verify the source and every affected consumer
```

A component displayed on a library page but unused by product surfaces is available, not adopted. A token documented in Foundations but replaced by local values is not governing the design. A pattern described in prose but not represented by reusable composition or mapped surface behavior is not part of the working interface system.

## Model foundations by semantics

Establish only the foundations needed by the current design scope and expected evolution. Typical concerns include color, typography, spacing, sizing, grid, radius, border, elevation, iconography, motion, and responsive constraints.

- Name semantic meaning separately from raw values.
- Bind actual design properties to variables or styles where the tool supports it.
- Keep theme and mode differences behind semantic roles.
- Do not create a scale merely to fill a foundations page.
- Use local optical correction only when the governing rule permits it and the exception remains understandable.
- After changing a shared variable or style, inspect the affected components and surfaces rather than assuming propagation is visually safe.

## Define component and pattern contracts by responsibility

Describe only dimensions that affect use. Depending on the capability, these may include:

- purpose and applicable contexts;
- anatomy and stable regions;
- semantic variants, sizes, properties, slots, and content limits;
- default, hover, focus, pressed, selected, expanded, disabled, read-only, invalid, pending, success, and failure behavior as applicable;
- responsive transformation and content pressure;
- accessibility semantics and input behavior;
- composition rules and incompatible combinations;
- mapping to implemented components or technical dependencies;
- deprecation and migration conditions.

Do not manufacture every possible state or variant. Include those supported by the product model, shared interaction contract, or implementation obligations.

Patterns coordinate several components around a repeatable user problem. Their contract must explain when to use them, what order and state transitions they preserve, how failure and recovery work, and when the pattern does not apply. A screenshot of a repeated arrangement is not yet a pattern.

## Complete adoption, not placement

Before claiming a reusable design asset complete, verify:

- its responsibility and ownership layer are clear;
- at least one real consumer uses it, unless a foundational responsibility justifies canonical creation before broad adoption;
- intended consumers use instances, bindings, or the tool's equivalent rather than detached reconstruction;
- related existing surfaces were inspected for semantic eligibility;
- migrated consumers preserve their content, states, responsive behavior, and accessibility;
- excluded lookalikes have a real contract difference;
- non-migrated eligible consumers are outside the authorized scope and remain visible as adoption work;
- duplicate sources, obsolete variants, and stale instances are removed or explicitly deprecated only after supported consumers no longer depend on them.

Do not claim project-wide consistency from one newly built screen. Report the inspected and adopted scope accurately.

## Treat change as fan-out

When a canonical source changes, inspect affected:

- component instances and nested components;
- patterns and page templates;
- core flows, overlays, states, and responsive variants;
- themes, locales, content extremes, and accessibility states;
- frontend mappings, handoff notes, examples, and archived replacements when they remain referenced.

Classify each consumer by shared semantic contract before changing it. Reverify the actual rendered result after propagation; synchronized structure does not guarantee valid layout or preserved meaning.
