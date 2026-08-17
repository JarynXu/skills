# Pen adapter

Use this reference only when the authoritative design surface is pen.dev, Pen, Pencil, or a `.pen` document. Pen combines an object tree, explicit frame layout, reusable component references, and an infinite two-dimensional canvas; manage those relationships without imposing Figma's page model or a universal zone catalog.

## Inspect the document and canvas

Before editing, inspect the active document, current selection, top-level objects, frame hierarchy, computed bounds, layout modes, components, references, variables, themes, current and archived work, and existing naming conventions. Capture the relevant current visual state.

Determine:

- the established top-level grouping and where the requested work belongs;
- which component origins, references, variables, and themes are canonical or obsolete;
- how representative screens actually use the interface system;
- the parent bounds, neighboring bounds, required insertion space, and intended layout relationship;
- whether current clipping, overlap, wrong nesting, or default layout behavior must be understood before extension.

Do not create new top-level containers or component origins before inspecting the existing tree and computed geometry.

## Use the minimum honest hierarchy

Typical relationships may include:

```text
Document
-> Zone or other top-level work area
-> Board or logical group
-> Screen, State, Overlay, Component Origin, or Delivery Frame
-> Region
-> Component Reference or layer
```

Use the project's current vocabulary and hierarchy when coherent. When no structure exists, create only the containers needed to keep the requested objects classified, navigable, and spatially safe. Do not pre-create Foundations, Components, Patterns, Pages, States, Handoff, Archive, or other empty zones to simulate a mature design repository.

Keep current and archived sources separate. Do not hide rejected work by moving it to arbitrary distant coordinates, making it transparent, or layering new work over it.

## Make layout explicit

For every structural frame, set the applicable direction, sizing, padding, gap, alignment, wrapping, clipping, and child positioning. Use automatic layout for real structural relationships and free positioning for diagrams, flows, overlays, or other intentionally spatial work.

Before placing a non-layout sibling or top-level object, establish:

- parent and sibling bounds;
- the new object's expected width and height;
- required spacing and reading order;
- available area and whether a containing frame must expand;
- the effect of expansion on neighboring groups.

Never rely on repeated default coordinates. Never shrink a design to conceal insufficient canvas space. Recompute bounds after insertion or container growth.

Use the optional canvas-plan artifact only for a large or dense batch where placement relationships cannot be safely held in the current object tree and tool response.

## Operate in small verified batches

Use the equivalent of:

```text
inspect app state and hierarchy
-> inspect computed bounds and governing sources
-> execute one coherent edit
-> inspect hierarchy, layout, and problems
-> capture the rendered result
-> repair before continuing
```

One coherent edit may be a surface, state family, component source, instance migration, variable change, or handoff group. Keep object identifiers needed for later updates. Do not generate an entire large delivery before checking whether the first group is structurally and visually valid.

## Use components and variables through consumers

- Create a reusable Component Origin only for a stable responsibility or synchronization boundary.
- Place canonical origins in the document's governed component area, not inside a business screen by accident.
- Use component references in real screens instead of copying and detaching equivalent content.
- Prefer meaningful properties, slots, or governed variants over separate near-duplicate origins.
- Bind real screen and component properties to semantic variables and themes where supported.
- Keep foundations display objects consistent with the variables they explain; a specimen is not the variable authority by itself.
- After changing an origin, variable, or theme, inspect every relevant reference and affected frame in scope.
- When establishing a shared source, inspect similar existing objects, migrate semantically eligible consumers within scope, and leave out-of-scope adoption explicit.
- Do not promote a one-off surface fragment merely because the tool supports components.

Component Origin count and reference count are evidence, not success criteria. Verify that the intended consumers use the correct source and that lookalikes excluded from migration have a different contract.

## Use notes and context for maintained meaning

Use notes, prompts, or context objects only when the information must remain with the document for review, continuation, or handoff. Keep them outside the actual visual surface and do not let them obscure content.

Temporary reminders must be removed or converted into a maintained decision or handoff note before delivery. Do not leave consequential interaction rules only in chat, and do not copy visible properties into notes when the design source already expresses them.

## Verify the Pen result

Check the applicable evidence after each meaningful batch and before readiness:

- new objects have the correct parent and stable, discoverable names;
- structural frames use intentional layout and sizing;
- no unintended top-level or sibling overlap, clipping, overflow, or negative-space hiding exists;
- expanded containers still fit their children and do not collide with neighboring work;
- component origins, references, variables, themes, and overrides resolve correctly;
- real surfaces adopt the selected interface-system sources;
- current surfaces no longer reference deprecated or archived origins;
- representative content, states, and supported sizes render correctly;
- the inspected scope contains no unexplained duplicate source, detached equivalent, or unclassified object;
- archived, proposed, and current work remain distinguishable.

Canvas organization is complete when it enables people and agents to find, use, and safely evolve the requested design. A fully populated zone taxonomy, a passed object-count checklist, or a clean-looking distant canvas is not evidence of that outcome.
