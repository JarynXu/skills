# Investigation and decisions

Investigate until the cause or decision boundary is supported by evidence. Do not confuse a plausible explanation, a matching string, or a symptom-disappearing edit with understanding.

## Frame the question

State:

- The observed behavior and expected behavior.
- The affected users, environment, data, role, route, and timing.
- Whether the issue is deterministic, intermittent, or inferred.
- The earliest boundary at which actual behavior diverges from expected behavior.
- Which unknown fact would change the next action.

Separate facts, hypotheses, and assumptions in working notes.

## Reproduce and reduce

1. Establish a minimal reliable reproduction when possible.
2. Capture the full state and transition, not only the final screenshot or exception.
3. Compare a working and failing path to find the first meaningful difference.
4. Reduce variables while preserving the failure.
5. Trace from user behavior to frontend state, contract, and authoritative system.

For intermittent problems, inspect races, lifecycle, identity, cancellation, stale closures, cache keys, timing, host events, and external dependencies before adding retries or delays.

## Manage hypotheses

- Generate at least one alternative explanation for non-trivial defects.
- Choose the next check by how well it distinguishes hypotheses, not by how easy it is to run.
- Prefer direct runtime and contract evidence over names, comments, and intuition.
- Falsify the leading hypothesis before broadening the search.
- Stop collecting evidence once one explanation accounts for the observations and predicts a verifying test.

Do not make several speculative fixes at once; they destroy the ability to attribute the result.

## Resolve contradictions

When product documents, designs, architecture, types, tests, and runtime disagree:

1. Identify each claim and its owner or authority.
2. Determine whether the disagreement is stale documentation, an implementation defect, an active migration, or a genuinely unresolved product decision.
3. Check the consequence of choosing each interpretation.
4. Resolve locally only when ownership and blast radius are clear.
5. Escalate an externally visible, cross-system, security, data-authority, or irreversible decision to the appropriate owner.

Do not pick the source that is easiest to implement.

## Make and record decisions

For a durable or consequential decision, retain:

- Context and the constraint being resolved.
- The chosen direction and essential rationale.
- Alternatives that were genuinely viable and why they lost.
- Consequences, compatibility, migration, and revisit conditions.
- Evidence or verification supporting the decision.

Use the project's existing ADR, issue, design note, or knowledge mechanism. A private reasoning transcript and command history are not decision documentation.

## Confirm the cause

A diagnosis is supported when it explains all relevant observations, the proposed change targets the owning boundary, and a focused test or experiment fails before the correction and succeeds after it. If the evidence cannot isolate the cause, report the remaining uncertainty and the next discriminating check rather than overstating confidence.
