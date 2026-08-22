# Domain modeling and implementation architecture

Load this reference when business complexity, responsibility boundaries, DDD, clean architecture, hexagonal architecture, modularity, or service decomposition affects the implementation.

## Start from behavior, not DDD vocabulary

Identify commands, decisions, invariants, lifecycle, permissions, state transitions, time rules, and external facts. Use domain modeling when these rules would otherwise scatter across handlers, ORM entities, scripts, and integrations.

- **Entity:** identity persists while attributes change.
- **Value object:** meaning comes from the complete value; make invalid states hard to construct.
- **Aggregate:** consistency and transaction boundary for invariants that must hold immediately.
- **Domain service:** domain behavior that does not naturally belong to one entity or value object.
- **Repository:** domain-oriented access to aggregate persistence, not a generic CRUD wrapper required for every table.
- **Domain event:** a meaningful fact after a state transition; distinguish it from an integration event published for other boundaries.
- **Bounded context:** a boundary within which terms, models, rules, and ownership remain coherent.

Do not create an aggregate around every database relationship. Keep aggregates small enough for contention and transaction needs. Reference other aggregates by identity unless immediate consistency truly requires one boundary.

## Separate policy from mechanism

Clean and hexagonal approaches are dependency rules, not mandatory directory trees. Stable business and application policy should not depend directly on transport frameworks, ORMs, queues, cloud SDKs, or the wall clock. Adapters implement ports shaped by the application's need.

Use this separation when it improves tests, replacement, and comprehension. Direct framework use is acceptable in local infrastructure or simple behavior; do not wrap every library with a mirror interface.

## Choose an architecture form from constraints

| Form | Fit | Warning |
|---|---|---|
| Layered application | conventional workflows and shared deployment | prevent business rules leaking across presentation and persistence layers |
| Modular monolith | evolving domains, one deployment, need for internal boundaries | enforce module APIs and data ownership; folders alone are not modules |
| Hexagonal/clean | important domain policy with several adapters or strong testability needs | avoid ceremonial ports that expose vendor-shaped abstractions |
| Event-driven | temporal decoupling, fan-out, long-running work, independent consumers | make ordering, duplicates, schema evolution, observability, and recovery explicit |
| Microservices | independently owned, deployed, scaled, trusted, or isolated capabilities | accept distributed data, operations, testing, and incident cost |

A system may combine forms at different scopes. Do not declare one pattern as the architecture of every module.

## Model cross-context relationships

For each boundary, establish:

- upstream and downstream authority;
- shared language versus translation;
- synchronous contract, event, file, or data replication;
- compatibility and change protocol;
- failure and recovery ownership;
- whether data is authoritative, copied, cached, or derived.

Use an anti-corruption layer when an external model would otherwise distort local policy. Avoid shared database access across independently owned services; it bypasses contracts and obscures migration authority.

## Preserve invariants under concurrency

State the invariant and choose the mechanism from contention and storage semantics:

- database constraint or atomic statement;
- optimistic concurrency/version check;
- pessimistic lock within a bounded transaction;
- serialized command processing;
- idempotency key or deduplication record;
- reservation/lease with expiry;
- compensating workflow for cross-boundary effects.

An in-process mutex does not protect multiple instances. A distributed lock does not make a multi-system transaction atomic. Prove the actual failure and ownership model.

## Evolve architecture through evidence

When implementation disproves an architectural assumption, return evidence: coupling, latency, transaction need, operational burden, team boundary, test difficulty, or runtime failure. Propose the smallest architecture change that addresses the demonstrated driver. Preserve superseded decisions and migration state rather than rewriting history.
