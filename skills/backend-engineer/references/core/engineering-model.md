# Backend engineering decision model

Use this reference to turn requirements and architecture into an implementable, verifiable increment without either under-designing consequential behavior or manufacturing unnecessary layers. The implementation model should make invalid complexity harder to create, not rely on a later cleanup pass to discover it.

## Define the vertical outcome

Describe the change as an observable slice:

```text
actor or trigger
+ preconditions and authority
+ command, query, event, or schedule
+ state and side effects
+ success, rejection, failure, and recovery
+ quality and operational evidence
```

Keep unresolved product behavior outside code until the responsible owner decides it. Reversible low-risk implementation details may proceed as visible assumptions.

## Allocate responsibilities deliberately

A useful default separation is:

- **entry/transport:** protocol parsing, authentication context, validation envelope, serialization, status and error mapping;
- **application:** use-case orchestration, transaction boundary, policy coordination, idempotency, authorization decisions based on domain and identity facts;
- **domain:** business invariants and state transitions that should survive framework or storage changes;
- **ports/adapters:** persistence, messaging, external services, clock, identifiers, file/object storage, and runtime infrastructure;
- **operational surface:** configuration, health, telemetry, feature controls, admin or recovery operations.

Use only the distinctions that carry real responsibility. A simple CRUD endpoint may not need rich domain objects. A complex invariant should not be buried in a controller, ORM callback, queue consumer, or SQL fragment merely to avoid a domain layer.

When a proposed change creates repeated mode checks, nullable states, scattered special cases, duplicated authority, pass-through helpers, or wrappers whose only purpose is routing around an existing boundary, treat that shape as evidence that the responsibility allocation may be wrong. Reallocate the concept before turning accidental variation into a permanent abstraction.

## Select the narrowest stable ownership boundary

Place behavior where it can be changed and verified without coordinating unrelated consumers. Consider:

- which data and invariants belong together;
- who owns the contract and deployment;
- whether a transaction must be atomic;
- whether independent scaling or failure isolation is evidenced rather than imagined;
- team and operational capability;
- compatibility and migration cost;
- latency and availability coupling.

Prefer a modular monolith when boundaries are still evolving and one deployment can meet requirements. Use separate services when independent ownership, deployment, scaling, trust, data authority, or fault isolation justifies the distributed cost. Do not use network boundaries as a substitute for modular design.

For each new abstraction or branch family, ask two separate questions: what real responsibility or variability does it encode, and could a better ownership boundary make the mechanism disappear? Keep the abstraction only when it reduces cognitive load after this question, not merely because it makes the current patch look organized.

## Design the change at the point of consequence

Before coding, settle or preserve explicitly:

| Decision | Evidence needed |
|---|---|
| Public semantics | acceptance rules, consumers, compatibility expectations |
| Domain invariant | authoritative business rule and affected states |
| Transaction boundary | atomicity need, data authority, failure recovery |
| Data representation | query/write patterns, lifecycle, migration and privacy needs |
| Dependency behavior | timeout, retry, cancellation, idempotency, rate and failure contract |
| Security | identity, permission, input trust, data sensitivity, audit requirement |
| Verification | oracle, test level, environment, telemetry and rollout signal |

Create an ADR or architecture feedback only when the choice crosses the local implementation boundary or is difficult to reverse. Do not turn routine code design into ceremonial governance.

## Implement in coherent increments

A coherent increment has no knowingly false completion boundary. Depending on the task it may include:

- contract and generated artifacts;
- application and domain behavior;
- adapter or persistence changes;
- schema or migration changes;
- focused tests plus necessary integration evidence;
- telemetry, configuration, and operational controls;
- compatibility, rollout, and rollback support.

Choose the simplest clear expression of the accepted model. Prefer explicit control flow over clever compression, responsibility-oriented names over construction-history names, and comments about invariants or reasons over narration of syntax. Remove temporary scaffolding as soon as its purpose ends. Do not optimize for line count when the shorter form hides state, failure behavior, or responsibility.

Do not merge a public contract with placeholder behavior unless the partial state is intentionally feature-gated and safe. Do not create an abstraction whose only consumer is hypothetical.

## Regulate refactoring

Refactor when current structure makes the requested behavior unsafe, duplicated, untestable, structurally misleading, or materially harder to change. Preserve behavior with characterization tests or runtime evidence before structural change. Separate mechanical moves from semantic changes when that improves reviewability.

When refactoring is authorized, prefer transformations that delete a source of complexity over transformations that merely redistribute it: remove obsolete modes, collapse duplicate state, move decisions to the owning boundary, delete redundant wrappers, and make invariants explicit. Stop when the requested capability has a coherent home; do not make one feature pay for a codebase-wide idealization.

## Carry implementation evidence into handoff

The implementing role controls code and its direct consumers, so completion normally requires actual integration and verification. When another repository, team, or production environment owns the final consumer, provide the smallest usable contract, migration or rollout instructions, compatibility window, and expected return evidence. Mark adoption or production behavior as unverified until it is observed.
