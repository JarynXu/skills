# Planning and scope

Plan non-trivial frontend work around dependencies, risks, and observable deliverables. The plan should remain valid if the order of discovery changes; it should not expose a search or tool-use diary.

## Define the delivery contract

Capture:

- The user-visible outcome and acceptance evidence.
- Affected journeys, roles, routes, hosts, locales, and viewport constraints.
- Product and architecture invariants that must remain true.
- Existing ownership boundaries and contracts likely to change.
- Explicit non-goals and unrelated debt to preserve or report separately.
- Required verification and currently unavailable environments.

If requirements describe a specific implementation, confirm whether that shape is essential or merely one suggested solution.

## Find the dependency order

Sequence by what must become true before later work is valid. A common dependency shape is:

```text
product fact and authority
  → contract or state model
  → feature behavior and shared capability
  → interface states and content
  → migration of consumers
  → verification and handoff
```

Do not polish presentation before the data or command can support its claim. Do not write broad tests against an interface that is still being decided.

## Compare real alternatives

For a consequential or difficult-to-reverse choice, compare two or three viable directions using only relevant criteria:

- Product correctness and recovery.
- Fit with current architecture and migration state.
- Blast radius and reversibility.
- Accessibility, performance, resilience, and host impact.
- Verification cost and operational risk.
- Long-term responsibility and maintenance.

Select a direction because it fits the current problem, not because it is newer or more familiar. Simple or mechanically determined changes do not need invented alternatives.

## Control scope

Separate:

- **Required work:** necessary to deliver the requested behavior honestly.
- **Enabling repair:** local structural work required to implement or verify safely.
- **Adjacent opportunity:** beneficial but not required.
- **Systemic debt:** broader work needing separate authorization or migration.

Include enabling repair when its necessity is concrete. Keep adjacent opportunity and systemic debt outside the change unless explicitly accepted.

## Use verifiable increments

Choose increments that leave the code in a coherent state and can be checked independently, such as:

1. Establish or correct the contract.
2. Implement the owning state or command boundary.
3. Compose the interface and state branches.
4. Migrate affected consumers.
5. Verify focused behavior, then integrated journeys.

At each checkpoint, update the plan from new evidence. Do not keep executing a stale plan merely because it was written first.

## Replan or stop when necessary

Reassess when:

- The source of truth differs from the assumed one.
- A local change becomes a public contract or migration.
- A shared primitive cannot express required behavior safely.
- Baseline failures prevent meaningful verification.
- Product, architecture, design, or runtime evidence materially conflict.
- The task expands into unrelated cleanup.

Report the changed fact, its impact on scope, and the smallest viable next decision.
