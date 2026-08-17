# Engineering discipline

Apply this as an inner loop during every frontend change. The goal is to prevent defects while choices are still local and inexpensive, not to run a ceremonial checklist at the end.

## Before editing

- Restate the observable user outcome and the authoritative fact or transition behind it.
- Locate the existing ownership boundary and representative precedent.
- Identify states, roles, locales, viewports, hosts, and callers that the change can affect.
- Define the narrowest evidence that could prove the proposed behavior wrong.
- Note pre-existing failures or uncertainty that could be confused with a regression.

Do not start from a file layout or requested implementation detail when the underlying behavior is still unclear.

## While designing

- Consider at least one alternative for non-trivial decisions; compare only dimensions that matter to the task.
- Prefer stable responsibilities, explicit contracts, narrow dependencies, and one source of truth.
- Model valid variability without encoding incidental current examples as permanent branches.
- Stop generalizing when the model represents the real domain and known change safely.
- Follow coherent project conventions, but do not reproduce false business claims, inaccessible mechanics, or structurally harmful shortcuts.

Best practice is a decision rule grounded in technology semantics, project constraints, community experience, and measured consequences—not a universal folder template.

## While implementing

- Keep each edit tied to the implementation contract.
- Separate orchestration, domain decisions, external effects, and presentation according to project boundaries.
- Make invalid, unavailable, forbidden, stale, pending, conflicting, and failed behavior explicit where they can occur.
- Preserve user input and recoverable context across failures.
- Reuse approved primitives and utilities before adding parallel mechanisms.
- Keep comments focused on non-obvious invariants and reasons; let names and structure express routine mechanics.
- Remove temporary scaffolding when its purpose ends.

After each meaningful increment, review the changed path from both directions:

```text
user intent → interaction → state transition → authoritative effect
authoritative result → data projection → state branch → visible claim
```

## Review the diff as a maintainer

Ask:

- Does the structure reveal product and ownership concepts rather than the order in which the solution was built?
- Did any private implementation detail leak into a public component, route, or data contract?
- Is there duplicated authority, synchronized state, defensive fallback, or condition that hides an impossible model?
- Can the next maintainer discover how this behavior is validated and changed?
- Did a shared contract change without reviewing all consumers?
- Are errors actionable and distinguishable, rather than swallowed or converted into normal data?
- Are accessibility, localization, responsive behavior, and host constraints preserved?
- Did the change introduce an unused dependency, dead branch, debug output, generated artifact, or unrelated formatting churn?

## Match proof to the decision

- Test pure decisions and state transitions directly.
- Test components at the interaction boundary, including failure and recovery.
- Use integration or browser journeys for routing, data coordination, focus, and host behavior.
- Run repository-prescribed static checks and production builds.
- Inspect runtime console and network failures where a real journey is available.

Do not broaden the implementation merely to satisfy a preferred test shape. Do not claim behavior from compilation or appearance alone.

## Stop conditions

Pause rather than push through when:

- The requested behavior conflicts with authoritative product or architecture evidence.
- A safe local change requires an unapproved public contract or cross-system migration.
- The available data cannot support the UI claim.
- Verification cannot distinguish success from a pre-existing or environmental failure.
- Unrelated user changes overlap the same boundary and cannot be preserved confidently.

Resolve the smallest blocking uncertainty, propose the needed scope change, or report the exact unverified boundary.
