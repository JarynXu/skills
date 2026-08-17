# Default Architecture Document Composition

Use this fallback only for a general architecture description or design document whose structure and depth are not defined by the user, project, organization, or a selected profile. Do not apply it to a focused ADR, evaluation, migration plan, diagram, presentation, or other artifact with a more specific contract. This composition is an internal default, not an external standard or maintained architecture authority.

## Use the five-section structure

Load and fill [templates/default-architecture-document.md](templates/default-architecture-document.md). Preserve these top-level section meanings and their order:

1. Scope and status
2. Architecture drivers
3. Proposed architecture
4. Consequential decisions
5. Fitness, risks, and open items

Keep exactly these five `##` sections unless a governing requirement supplies another structure. Translate their labels into the artifact's language while preserving their numbering, meaning, and order; exact English wording is not part of this fallback contract. Fit relevant concerns into their semantic homes rather than creating a chapter for every loaded reference. Adapt or omit optional `###` blocks under **Proposed architecture** when they add no useful content.

## Assign one semantic home

- **Scope and status** states the covered entity, boundary, represented architecture state, source basis, authority, exclusions, and material coverage limits.
- **Architecture drivers** states the architecturally significant requirements, constraints, assumptions, and quality scenarios that shape the architecture.
- **Proposed architecture** states the selected structures, responsibilities, relationships, authority, invariants, and critical behavior needed to understand the design.
- **Consequential decisions** records choices with credible alternatives or material cross-boundary, quality, or reversibility consequences, including their rationale and revisit conditions.
- **Fitness, risks, and open items** records the evidence needed to test important claims, material risks, unresolved decisions, ownership gaps, and closure conditions.

Give a concern its full account only in its primary section. Use stable identifiers or brief references elsewhere. In this fallback, decisions reference their driving requirements or scenarios; fitness, risk, and open records reference the drivers and decisions they materially address. Do not mirror the same relationship as full link lists in both directions.

## Keep decision-level depth

- Lead **Proposed architecture** with the architecture outcome and the invariants that preserve it.
- Include context, decomposition, runtime, data, deployment, and cross-cutting material only when it explains a significant boundary, decision, quality, or implementation constraint.
- Use prose, diagrams, and tables for different semantics. Do not narrate a diagram or repeat a table merely to fill the section.
- Leave exhaustive APIs, schemas, events, controls, metrics, tests, runbooks, and delivery backlogs with their specialist authorities unless their exact shape is architecture-significant.
- Keep a mechanism with its parent architecture decision unless it has independent system-level alternatives and consequences.
- Treat schedule, team capacity, and skills as constraints; include delivery stages or handoff material only when the output contract requires them.

## Confirm fallback conformance

Before delivery, remove placeholders and template comments, confirm the five-section hierarchy, resolve every identifier reference, and verify that each item is in its semantic home. Apply the general artifact contract and the selected concern references for source meaning, status, authority, and professional correctness; do not restate those rules here.
