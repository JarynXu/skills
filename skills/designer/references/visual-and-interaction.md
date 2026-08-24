# Visual and interaction design

Design a usable experience whose visual structure, content, interaction, and system behavior express the same product intent. Do not optimize an isolated screenshot while leaving the task, states, responsive behavior, or implementation meaning unresolved.

## Begin with the surface's job

For each surface or flow increment, determine:

- the user's current context, goal, and next decision;
- the primary information and action, supporting information, and secondary actions;
- entry, continuation, exit, cancellation, return, and recovery;
- role and permission differences;
- data availability, freshness, volume, and content pressure;
- supported viewport, host, input, locale, zoom, and accessibility conditions.

Let these relationships determine layout and hierarchy. Do not start from a fashionable component arrangement or a fixed page template.

## Route deeper visual knowledge

Load only the additional reference justified by the current design decision:

- Read [visual-direction-and-taste.md](visual-direction-and-taste.md) when establishing a new visual direction, exploring alternatives, or diagnosing a usable design that still feels generic or visually uncommitted.
- Read [visual-craft.md](visual-craft.md) when typography, color, spacing, density, surfaces, imagery, iconography, or finishing details materially determine the result.
- Read [motion-and-physicality.md](motion-and-physicality.md) when transitions, gestures, overlays, direct manipulation, animated state, or perceived responsiveness matter.
- Read [visual-anti-patterns.md](visual-anti-patterns.md) when auditing generic, over-styled, incoherent, or recognizably default-generated visual treatment.
- Read [apple-design-language.md](apple-design-language.md) only when the requested or evidence-supported direction is explicitly Apple-like, iOS/macOS-native, Apple.com-inspired, or calls for that family of restraint, material depth, and physical motion.

These references provide design knowledge, not a mandate to produce every described effect. Preserve the product model, interface-system authority, accessibility requirements, and task scope.

## Structure information and flow

- Make the surface identity and primary task quickly understandable.
- Group information by meaning and decision relationship, not by the order in which requirements were received.
- Preserve stable navigation, return paths, and task continuity.
- Keep primary and irreversible actions distinguishable from routine or secondary actions.
- Use progressive disclosure when it reduces cognitive load without hiding necessary context or consequences.
- Avoid excessive cards, containers, headings, or decoration that flatten hierarchy instead of clarifying it.

For multi-step or cross-surface work, model the smallest complete flow that covers material success, cancellation, failure, and recovery. Prototype interactions whose timing, spatial transition, or state change cannot be communicated reliably by static states and notes.

## Design observable states

Derive states from the product and technical model. Consider only those that can occur or materially change the user decision, including as applicable:

- initial, loading, refreshing, pending, and long-running work;
- empty, no-result, partial, stale, unavailable, and offline data;
- default, hover, focus, pressed, selected, expanded, disabled, read-only, and invalid interaction;
- forbidden, expired, missing, conflict, failure, retry, success, and irreversible completion;
- unsaved changes, cancellation, and return after interruption.

Never use a polished happy path as evidence that the experience is complete. Keep unknown distinct from empty, unavailable distinct from none, requested distinct from completed, and disabled distinct from forbidden.

## Design content as interface behavior

- Use the user's vocabulary consistently and name actions by their real consequence.
- Preserve visible labels; placeholders are examples or format hints, not replacements for identity.
- Make errors explain what happened and the next valid action without exposing irrelevant internals.
- State destructive and irreversible consequences before commitment.
- Define formatting, missing values, precision, truncation, wrapping, and disclosure where they affect understanding.
- Test realistic short, long, missing, translated, malformed, and high-volume content instead of designing around ideal placeholders.

## Build visual hierarchy from relationships

- Reuse the approved semantic color, typography, spacing, radius, border, elevation, icon, and motion system.
- Align related content to coherent visual axes and use spacing to express grouping.
- Limit high-emphasis color, weight, elevation, and primary actions to the decisions that deserve them.
- Use normal layout relationships and content-driven sizing before fixed coordination or absolute placement.
- Apply optical correction only within the design language and verify the result visually.
- Use motion to explain continuity, causality, or state—not as decoration or a delay before interaction.

Visual consistency does not require identical appearance where information priority, state, input, or host constraints differ. Preserve the shared semantic rule and make the adaptation intentional.

## Adapt to space and input

Responsive design expresses priorities under changing constraints; it is not a scaled desktop screenshot.

- Determine which information and actions remain, reflow, wrap, collapse, reorder, scroll, or change representation.
- Preserve the primary task and necessary consequences at supported sizes.
- Let components respond to their allocation and content when possible; use viewport-level changes for page composition.
- Account for text scaling, zoom, long localization, bidirectionality, safe areas, virtual keyboards, pointer, touch, keyboard, and host chrome as applicable.
- Define intentional scroll ownership and avoid clipped focus, inaccessible controls, and nested traps.
- Test declared minimum, representative, and large conditions with relevant state and content pressure.

Do not infer support from the dimensions of one design frame. Use the product and host support contract.

## Design accessibility as behavior

- Preserve semantic names, roles, relationships, and reading order in the handoff and component mapping.
- Make focus visible and place it according to task order.
- Ensure keyboard and non-pointer users can discover, operate, dismiss, and recover from interactions.
- Do not use color, motion, hover, or spatial position as the only carrier of meaning.
- Provide adequate target sizes, contrast, error association, status communication, and reduced-motion behavior.
- For overlays, define initial focus, containment, dismissal, return focus, scroll behavior, and nested-layer constraints.

Accessibility requirements must participate in component and flow design, not be attached as a final annotation after the visual structure is fixed.

## Work in visual evidence loops

After each coherent increment:

1. Render or capture the actual design state.
2. Inspect hierarchy, alignment, spacing, content, clipping, overlap, state communication, and interaction affordance.
3. Compare with governing requirements, approved design intent, interface-system rules, and neighboring surfaces.
4. Exercise relevant content, viewport, locale, and state pressure.
5. Classify differences as a defect, intentional adaptation, unresolved design decision, system conflict, or unavailable evidence.
6. Repair the candidate and repeat the affected checks.

Metadata, layer structure, and numeric values cannot substitute for looking at the rendered result. A screenshot cannot by itself prove interaction, accessibility semantics, or flow closure; use the evidence appropriate to each claim.
