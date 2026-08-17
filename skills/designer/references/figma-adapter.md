# Figma adapter

Use this reference only when the authoritative design surface is Figma Design. Preserve the connected file's language and sources before introducing a new hierarchy, component set, or variable collection.

## Inspect before writing

Identify the file, current page, selected nodes, relevant pages and sections, existing components and libraries, variables and modes, styles, prototypes, annotations, and available canvas space. Capture the relevant current state before editing.

Determine:

- which components and variables are canonical, local, published, deprecated, detached, or ambiguous;
- how representative product surfaces actually use them;
- the file's naming, grouping, responsive, and handoff conventions;
- current object bounds, parent-child relationships, layout modes, clipping, and nearby insertion space;
- whether the requested change belongs in the current file or a governed library.

Do not infer authority from a component's name or from its presence on a library page. Inspect real instances and project guidance.

## Use native structure proportionately

Use Figma's native relationships:

```text
File -> Page -> Section -> Frame -> Component, Instance, or Layer
```

- Use pages for established major work areas, not one page per state.
- Use sections for meaningful groups, review units, or shareable delivery areas.
- Use frames for screens, components, layout regions, states, overlays, and responsive variants.
- Use Auto Layout when child relationships are structural and content-responsive.
- Use absolute positioning only for genuinely spatial relationships such as overlays, diagrams, or freeform composition.

Follow the current file's coherent organization. If none exists, create only the minimum grouping needed by the requested scope; do not manufacture a complete numbered page taxonomy.

## Operate in small verified batches

For each logical group:

1. Select the target page and inspect its current nodes and bounds.
2. Resolve the governing variables, styles, components, and insertion relationship.
3. Create or update one coherent surface, state family, reusable source, or handoff group.
4. Record created and modified node IDs when the connector exposes them.
5. Inspect hierarchy, layout properties, computed bounds, clipping, and overlaps.
6. Capture a screenshot and review the actual visual result.
7. Correct defects before starting an unrelated group.

Do not assume page context persists between tool calls. Do not place top-level nodes at default coordinates without confirming the space is free. When batch size or canvas density creates real placement risk, use the optional canvas-plan contract.

If the host exposes mandatory Figma prerequisite or specialized workflow skills, load the required tool-use skill before writes and the relevant screen, library, motion, or design-to-code workflow only when the task needs it. Host integration must not replace the professional decisions in this skill.

## Bind the interface system to real surfaces

- Use semantic variables and styles for actual properties, not only specimen documentation.
- Use component instances in product surfaces; do not recreate canonical appearance with detached frames.
- Create a component only when a stable responsibility, synchronization need, state contract, or governed foundation justifies it.
- Extend variants and properties only for meaningful reusable differences.
- After changing a component, variable, style, or nested source, inspect affected instances and representative pressure states.
- Search for detached or parallel lookalikes when the task creates or migrates shared capability; classify semantic eligibility before replacing them.
- Keep an explicitly local design local until a shared contract is justified.

A source component with no product consumer is not adopted merely because it appears on a Components page. A component can still be valid with one current consumer when its foundational responsibility justifies canonical ownership; preserve that rationale and do not invent usage.

## Verify the Figma result

Check the applicable evidence:

- pages, sections, frames, and objects are in their intended parents;
- layout direction, sizing, padding, gap, alignment, wrapping, and min/max constraints express the design relationship;
- top-level and sibling objects do not collide or clip unexpectedly;
- variables, styles, component sources, instances, overrides, and modes are valid;
- no unexplained duplicate source or detached consumer remains in the affected scope;
- product surfaces render correctly with representative content, states, and supported dimensions;
- prototype relationships and annotations communicate only behavior not already evident from the maintained source;
- current, proposed, and archived work are distinguishable according to the file's governance.

Do not mark a section or revision ready because metadata is structurally valid. Readiness requires the requested experience, interface-system adoption, visual evidence, and unresolved conditions to satisfy the handoff-and-assurance contract.
