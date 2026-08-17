# Codebase assessment

Assess whether the existing frontend is a coherent system to extend. The goal is not to grade style or justify a rewrite; it is to avoid reproducing harmful patterns while preserving intentional local consistency.

## Separate dialect from debt

A project dialect is a repeated, understandable choice that keeps responsibilities clear and behavior reliable, even if it differs from personal preference. Debt is a pattern that creates false product behavior, unsafe changes, inaccessible interactions, unstable dependencies, duplicated authority, or disproportionate maintenance cost.

Evaluate patterns using evidence:

- Is the rule documented, enforced by tooling, or repeated in healthy code?
- Does it preserve product truth and clear ownership?
- Can a maintainer predict where behavior belongs and how it is tested?
- Does it handle failure, permissions, accessibility, and host constraints?
- Does it force unrelated modules to know implementation details?
- Is the apparent inconsistency part of an active migration?

Do not label code poor merely because it is unfamiliar, old, verbose, library-free, or unlike a preferred framework pattern.

## Inspect the baseline

Sample representative paths and assess:

| Area | Healthy signal | Risk signal |
|---|---|---|
| Product modeling | explicit states and authoritative sources | UI guesses business facts |
| Boundaries | features and shared layers have stable responsibilities | circular imports and cross-layer reach-through |
| Components | coherent primitives and domain composition | page-local imitations and hidden business rules |
| State and data | ownership and invalidation are explicit | duplicated mutable sources and silent fallbacks |
| Errors | failures remain distinguishable and recoverable | errors become empty data or generic success |
| Styling | tokens and cascade strategy are predictable | specificity escalation and arbitrary duplication |
| Tests | important decisions and regressions are covered | snapshots or builds are the only proof |
| Tooling | prescribed checks run reproducibly | baseline failures are unexplained or ignored |

Run relevant baseline checks when practical before a broad change. Distinguish pre-existing failures from regressions and do not silently normalize either.

## Choose a response

Use the smallest response that keeps the new work sound:

### Follow the convention

Use an existing pattern when it is coherent, safe, understood, and appropriate for the new behavior.

### Repair the touched boundary

Make a local cleanup with the feature change when the existing pattern would otherwise require duplication, false modeling, inaccessible behavior, or fragile coupling. Keep the cleanup tightly connected to the requested outcome and verify unchanged callers.

### Isolate the new work

Create a clear compatibility boundary when legacy behavior cannot safely be changed within scope. Avoid spreading legacy assumptions into new modules.

### Propose systemic work separately

Report and scope a broader refactor when debt spans many owners, changes public contracts, requires migration, or cannot be verified safely as part of the task. Do not begin a repository-wide cleanup without authorization.

### Stop for a critical contradiction

Escalate before implementation when project instructions, product truth, architecture, and runtime behavior disagree in a way that changes externally visible behavior, data authority, security, or irreversible actions.

## Preserve useful precedent without inheriting defects

- Copy intent, not accidental syntax.
- Reuse stable interfaces, not private implementation shortcuts.
- Match naming and placement where they communicate ownership.
- Improve a pattern only when the benefit is concrete and the migration boundary is explicit.
- Avoid introducing a second competing architecture merely to keep new code aesthetically clean.

The readiness question is not “Is this codebase good?” It is “Which local rules are trustworthy, which touched boundary needs repair, and what must remain outside this task?”
