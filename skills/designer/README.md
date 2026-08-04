# Designer Skill Package

This package contains a reusable `designer` skill with three layers:

1. `SKILL.md` — orchestration, tool selection, workflow, quality gates, and completion rules.
2. `references/professional-design-core.md` — complete professional product/UI design, document-reading, handoff, and self-review standard.
3. Tool adapters:
   - `references/figma-adapter.md`
   - `references/pen-adapter.md`
4. `templates/delivery-templates.md` — traceability, canvas planning, audit, and handoff templates.

## Recommended installation

Install or copy the entire `designer-skill` directory into the skill directory used by the target AI agent. Preserve the relative folder structure so `SKILL.md` can load its references.

## Generic upload use

For an AI system that only accepts one uploaded Markdown file, use:

- `designer-skill-single-file.md`

## Example invocation

```text
Load and follow the designer skill as a mandatory standard.

First read all PRD and UX sources, build the source index, atomic requirements,
design-object inventory, user flows, requirements traceability matrix, and Canvas Map.

The active tool is Pen. Inspect the current .pen file before editing, use the Pen
adapter, create clear Zone and Board containers, avoid overlapping top-level objects,
and verify each batch with hierarchy/bounds inspection and screenshots.

Then complete the missing design objects, perform the design review and coverage audit,
and do not declare development-ready while core requirements remain Partial or Not Covered.
```

For Figma, replace the tool sentence with:

```text
The active tool is Figma. Use Pages, Sections, Frames, Auto Layout, components,
variants, and variables according to the Figma adapter. Inspect the existing file and
find clear canvas space before creating top-level nodes.
```
