# Engineering discipline

Apply this throughout every frontend change. The purpose is to shape the implementation while decisions are still local and inexpensive, then verify what cannot be guaranteed during generation. Do not treat this as a cleanup checklist appended after coding.

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
- When the design introduces a new mode, boolean flag, repeated condition family, synchronized state, fallback path, wrapper, helper layer, or generic component mechanism, identify the real responsibility or variability it represents. Reconsider ownership when moving that responsibility would remove the mechanism.
- Distinguish reusable structure from displaced complexity. A helper, hook, component, context, or utility is not an improvement when it merely hides branching or passes data through without owning a stable concept.
- Stop generalizing when the model represents the real domain and known change safely.
- Follow coherent project conventions, but do not reproduce false business claims, inaccessible mechanics, or structurally harmful shortcuts.

Best practice is a decision rule grounded in technology semantics, project constraints, community experience, and measured consequences—not a universal folder template.

## While implementing

- Keep each edit tied to the implementation contract.
- Separate orchestration, domain decisions, external effects, and presentation according to project boundaries.
- Make invalid, unavailable, forbidden, stale, pending, conflicting, and failed behavior explicit where they can occur; do not invent defensive branches for states the model should make impossible.
- Preserve user input and recoverable context across failures.
- Reuse approved primitives and utilities before adding parallel mechanisms, but do not force reuse through an abstraction that makes consumers harder to understand.
- Prefer explicit readable control flow over nested ternaries, dense expressions, or clever compression.
- Reduce nesting when guard clauses, a clearer state model, or a responsibility split makes the path easier to follow.
- Remove duplicated mechanics rather than preserving them behind differently named helpers.
- Name components, hooks, functions, variables, and types by responsibility or domain meaning rather than construction history.
- Keep comments focused on non-obvious invariants, constraints, and reasons; let names and structure express routine mechanics.
- Remove temporary scaffolding when its purpose ends.

After each meaningful increment, review the changed path from both directions:

```text
user intent → interaction → state transition → authoritative effect
authoritative result → data projection → state branch → visible claim
```

Before building more work on top of the increment, ask whether the current structure is already accumulating avoidable condition growth, duplicated authority, state synchronization, boundary leakage, wrapper layers, or unrelated component responsibilities. Correct the source while it is local. Only after the structure holds should you polish naming, nesting, duplication, comments, and local expression.

## Review the diff as a maintainer

Read the final diff in two passes.

First, challenge the structure:

- Does the structure reveal product and ownership concepts rather than the order in which the solution was built?
- Did a private implementation detail leak into a public component, route, state, or data contract?
- Is there duplicated authority, synchronized state, defensive fallback, or condition growth that points to an impossible or misplaced model?
- Did a mode, flag, helper, wrapper, context, generic component, or compatibility branch become necessary only because responsibility sits in the wrong place?
- Did one component or module gain unrelated reasons to change?
- Did a shared contract change without reviewing all consumers?

Then refine the accepted structure:

- Is control flow direct and readable without unnecessary nesting or clever compression?
- Are names precise enough that routine mechanics do not need explanatory comments?
- Is duplicated code expressing one invariant that should have a single owner, or is the apparent duplication actually clearer when kept local?
- Can a redundant abstraction disappear without losing a useful boundary?
- Are errors actionable and distinguishable rather than swallowed or converted into normal data?
- Are accessibility, localization, responsive behavior, and host constraints preserved?
- Did the change introduce an unused dependency, dead branch, debug output, generated artifact, or unrelated formatting churn?

Do not optimize for fewer lines. A shorter implementation is worse when it hides state, merges responsibilities, or becomes harder to debug and extend.

## Match proof to the decision

- Test pure decisions and state transitions directly.
- Test components at the interaction boundary, including failure and recovery.
- Use integration or browser journeys for routing, data coordination, focus, and host behavior.
- Run repository-prescribed static checks and production builds.
- Inspect runtime console and network failures where a real journey is available.

A passing test does not excuse a structural regression. A cleaner diff does not prove that behavior, accessibility, or state semantics were preserved. Do not broaden the implementation merely to satisfy a preferred test shape.

## Stop conditions

Pause rather than push through when:

- The requested behavior conflicts with authoritative product or architecture evidence.
- A safe local change requires an unapproved public contract or cross-system migration.
- The available data cannot support the UI claim.
- Verification cannot distinguish success from a pre-existing or environmental failure.
- Unrelated user changes overlap the same boundary and cannot be preserved confidently.

Resolve the smallest blocking uncertainty, propose the needed scope change, or report the exact unverified boundary.
