---
name: frontend-audit
description: Audit and remediate frontend product experiences across web and desktop applications. Use when asked to review, clean up, redesign, or verify a frontend; find nonstandard or hand-built UI; align screens with business and domain truth; trace displayed information to authoritative sources; assess UX, accessibility, responsiveness, state handling, component-system compliance, or frontend architecture; or validate a frontend refactor end to end.
---

# Frontend Audit

Audit the frontend as a product interface and an engineering system. Base conclusions on product truth, repository evidence, and runtime behavior rather than screenshots or code style alone.

## Establish the task contract

1. Read applicable repository instructions, product documents, coding conventions, and design-system rules before judging the implementation.
2. Distinguish an audit-only request from an authorized remediation request. For audit-only work, inspect and report without changing product code. For remediation, carry the work through verification.
3. Identify the surfaces in scope: routes, layouts, workflows, roles, platforms, locales, and supported viewport or window constraints.
4. State only assumptions that materially affect the result. Resolve important uncertainty from local evidence before asking the user.

## Build the evidence base

1. Model the product before evaluating the interface:
   - Identify users, goals, decisions, responsibilities, and irreversible actions.
   - Separate domain invariants from accidental requirements and current API shapes.
   - Mark each displayed value as authoritative fact, client derivation, user input, or unknown.
2. Inventory the implementation:
   - Map routes to pages, layouts, domain features, data hooks, shared UI, localization, and native bridges.
   - Locate the design system and determine which rules are project requirements rather than universal preferences.
   - Trace important screen claims back through view models and API contracts to their source.
3. Inspect runtime behavior when the application can be run. Treat screenshots as evidence of appearance, not proof of correct state or data authority.

Read [references/audit-model.md](references/audit-model.md) before a broad audit or a product-semantics review. Run `node scripts/collect-frontend-evidence.mjs <project-root>` when the target uses text-based web frontend sources; treat its output as leads to inspect, not findings by itself.

## Audit the product surface

Evaluate the following relationships rather than walking files in discovery order:

### Product truth

- Verify that labels, counts, status, permissions, readiness, progress, and errors mean what the product claims.
- Never equate unknown with zero, unavailable with empty, missing with false, or a client inference with an authoritative decision.
- Detect duplicated business rules, hardcoded domain lists, parsed human-readable error strings, optimistic claims, and demo data presented as fact.
- Verify that the system of record also enforces any rule the interface presents as blocking or authoritative.

### User work

- Make the primary task, current state, required decision, and next valid action visible.
- Evaluate journeys across routes and roles, including recovery paths and cross-menu navigation.
- Remove implementation vocabulary from the primary interface unless the target user needs it; preserve technical identifiers as secondary detail when useful.
- Distinguish information, attention, decision, and action instead of rendering every datum with equal weight.

### Interaction and state

- Inspect loading, empty, error, forbidden, stale or conflict, partial-data, ready, submitting, success, and destructive states where applicable.
- Verify keyboard access, focus behavior, accessible names, validation feedback, motion, scroll containment, and reduced-motion behavior.
- Check every supported viewport or desktop window size. Do not infer mobile support when the product explicitly targets fixed desktop constraints.

### Design system and implementation

- Prefer the project's established primitives and domain components over page-local imitations.
- Keep pages responsible for data acquisition, state branching, and composition; keep reusable interaction and domain decisions in stable component or feature boundaries.
- Verify forms, dialogs, menus, tables, navigation, notifications, and error boundaries against project conventions.
- Preserve intentional behavior and unrelated user changes. Remove dead scaffolding only when evidence shows it has no supported role.

Read [references/frontend-implementation.md](references/frontend-implementation.md) when auditing component use, state coverage, responsive behavior, or frontend boundaries.

## Converge on findings or remediation

For each finding, record:

- Severity based on user or business harm.
- The violated product or engineering fact.
- Concrete evidence with a file, route, runtime observation, or API trace.
- The consequence for a user or downstream maintainer.
- The smallest direction that restores truth and consistency.

Prioritize false business claims, unsafe actions, inaccessible primary journeys, crashes, and unrecoverable states before visual polish. Do not inflate severity because a pattern is unfashionable.

For remediation work:

1. Consider at least one viable alternative for non-trivial design decisions; compare alternatives only when the difference affects the user or architecture.
2. Correct the authoritative boundary before polishing its presentation.
3. Reuse or extend stable project primitives before introducing parallel components.
4. Stop at the smallest model that no longer lies about the problem domain. Do not add speculative generality.
5. Add regression coverage for rules or failures that are easy to reintroduce.

## Verify the result

Read [references/verification.md](references/verification.md) before claiming a broad audit or remediation complete.

Use a verification ladder appropriate to the project:

1. Focused unit or component checks for changed decisions.
2. Static checks, type checks, lint, localization parity, dependency and dead-code audits.
3. Production frontend build.
4. Real-browser journeys across key routes, roles, interactions, and console or network failures.
5. Native or packaged build when the frontend ships inside a desktop or mobile shell.
6. Final worktree review for temporary dependencies, generated files, unrelated edits, and unverified claims.

Run `node scripts/compare-json-locales.mjs <baseline.json> <candidate.json> [...]` when locale catalogs are JSON objects and exact key parity is required.

## Report completion

- For audit-only work, organize findings by user impact and domain responsibility, not by search order.
- For remediation, lead with the resulting behavior and verification evidence; mention remaining limitations explicitly.
- Do not expose temporary scaffolding, speculative ideas, or a diary of tool use as product structure.
- Do not claim complete coverage when a required runtime, role, backend, device, or build target was unavailable.

## Resources

- [references/audit-model.md](references/audit-model.md): product-truth model, evidence hierarchy, and severity guidance.
- [references/frontend-implementation.md](references/frontend-implementation.md): state, component, accessibility, responsive, and architecture checks.
- [references/verification.md](references/verification.md): validation ladder and completion criteria.
- `scripts/collect-frontend-evidence.mjs`: read-only source inventory and audit-signal collector.
- `scripts/compare-json-locales.mjs`: deterministic JSON locale-key parity checker.
