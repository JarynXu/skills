# Review and audit

Use a formal audit to evaluate the frontend as both a product interface and an engineering system. Conclusions require product truth, repository evidence, and runtime behavior; visual preference or static search results alone are insufficient.

## Establish scope and authority

Confirm whether the request is audit-only or includes remediation. For audit-only work, do not change product code. Define the routes, journeys, roles, hosts, locales, viewports, and implementation boundaries covered, plus any inaccessible environment.

Build a compact product model:

| Concern | Question |
|---|---|
| User | Who acts, observes, approves, or recovers? |
| Goal | What outcome are they trying to reach? |
| Authority | Which system decides that a fact is true? |
| Action | What changes state, and can it be reversed? |
| Constraint | What must always be true and where is it enforced? |
| Knowledge | What is fact, derivation, input, stale, partial, or unknown? |

Define the problem domain of each surface. API fields, storage identifiers, internal enums, integration metadata, and diagnostics belong onscreen only when the target user needs them to decide, act, verify, or recover.

## Use an evidence hierarchy

When sources conflict, prefer:

1. Enforced domain behavior and persisted authoritative state.
2. API contracts, schemas, and integration tests.
3. Product and architecture documentation that matches runtime behavior.
4. Frontend projections, state logic, and component contracts.
5. Rendered behavior and screenshots.
6. Names, comments, examples, and placeholder text.

Lower evidence remains a useful lead. State uncertainty instead of converting it into a confident finding.

For important screen claims, trace:

```text
visible claim → view projection → client state or query → contract → authority
             → failure and freshness behavior
```

## Inspect the complete experience

Evaluate relationships, not files in discovery order:

- Product truth, permissions, enforcement, status, counts, readiness, progress, and irreversible actions.
- Primary journeys, cross-route navigation, roles, decisions, consequences, and recovery.
- Loading, empty, unavailable, partial, stale, forbidden, pending, success, conflict, and error behavior.
- Components, forms, dialogs, tables, navigation, notifications, error boundaries, and design-system compliance.
- Keyboard, focus, semantics, names, contrast, zoom, motion, and supported input modes.
- Responsive and host-specific behavior across declared constraints.
- Content, localization, copied text, notifications, errors, and exports.
- Frontend boundaries, duplicated business rules, state authority, dependency direction, and testability.

Run the application when practical. A screenshot proves appearance at one instant; it does not prove state transitions, data authority, focus, network behavior, or host integration.

Use `node scripts/collect-frontend-evidence.mjs <project-root>` to gather source inventory and inspection leads for text-based frontend projects. Its matches are not findings until project convention and user impact are confirmed.

## Assign severity from impact

- **P0 — critical:** security boundary failure, destructive data loss, credential exposure, or broad production outage.
- **P1 — high:** false authoritative claim, blocked primary journey, crash, unsafe irreversible action, or missing authoritative enforcement.
- **P2 — medium:** meaningful recovery, accessibility, state, responsive, resilience, or maintainability failure with a practical workaround.
- **P3 — low:** localized inconsistency or polish issue without material task failure.

Do not raise severity because a pattern is unfashionable or lower it because the code change is small. Record confidence separately from impact.

## Write verifiable findings

Each finding should include:

```text
[severity] Concise violated fact
Evidence: route, runtime observation, file, contract, or data trace
Consequence: concrete user, business, accessibility, or maintenance harm
Direction: smallest boundary or behavior that restores truth and consistency
```

Avoid checklist-only consequences, vague “best practice” claims, and findings that combine unrelated problems. Organize the report by user impact and responsibility, not by search order. State clean areas only when they were actually inspected.
