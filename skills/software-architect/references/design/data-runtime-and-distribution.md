# Data, runtime behavior, and distribution

Model how authoritative facts change and how architectural elements collaborate under normal, concurrent, degraded, and recovery conditions. Static decomposition is incomplete without these behaviors.

## Establish data authority

For architecture-significant data, identify:

- Business meaning and lifecycle.
- Authoritative owner and permitted writers.
- Consumers and derived projections.
- Classification, privacy, residency, retention, deletion, and audit obligations.
- Identity, keys, invariants, and relationships independent of storage representation.
- Freshness, staleness, and reconciliation expectations.

Do not let a shared database silently become the ownership model. Separate logical authority from physical storage, cache, replica, index, event, and analytical copy.

For each architecture-significant authoritative or derived content class, classify retention, deletion, legal hold, privacy, compaction, and archival as established, proposed, open, or inapplicable with a reason. Omission is not reconciliation. Keep the result at architecture depth: one compact invariant can cover several stores that genuinely share a lifecycle authority.

Reconcile every immutability, append-only, permanent-history, never-removed, or always-addressable claim with that complete information lifecycle. In the same sentence, bullet, table row, or directly attached qualifier that makes the claim, state the period in which it applies and the deletion or other lifecycle rule that supersedes it. If the scope is unknown, avoid the absolute term and mark the lifecycle question `[OPEN]`. `Append-only` never means exempt from an authoritative deletion obligation.

## Describe critical runtime scenarios

Select scenarios that expose architecture decisions:

- Important end-to-end commands and queries.
- Cross-boundary state changes.
- Concurrent updates or duplicate requests.
- External dependency failure or degraded operation.
- Timeout, retry, cancellation, compensation, or rollback.
- Startup, shutdown, failover, recovery, and reconciliation.
- Deployment or version coexistence when behavior changes across releases.

For each scenario, identify participants, sequence or causality, state transitions, authority, consistency boundary, failure behavior, observability, and user or operator consequence.

## Make distributed semantics explicit

When work crosses process, machine, region, or ownership boundaries, decide deliberately:

- Synchronous, asynchronous, batch, or streaming interaction.
- Delivery, ordering, duplication, and idempotency semantics.
- Timeout, retry budget, backoff, cancellation, and overload behavior.
- Transaction, consistency, and isolation boundaries.
- Conflict detection and reconciliation authority.
- Schema evolution and mixed-version compatibility.
- Partial failure, partition, clock, and stale-knowledge behavior.

Unknown, delayed, duplicated, and contradictory information are normal distributed states. Do not encode them as success, absence, zero, or `false` without domain authority.

## Decide whether to distribute

Use a distributed boundary only when drivers justify its costs, such as independent ownership, isolation, scale, availability, location, technology, or external integration. Account for operational complexity, latency, failure modes, consistency, security surface, observability, testing, and coordinated evolution.

A modular in-process boundary can preserve responsibility without network distribution. Distribution is a deployment and failure decision, not a maturity badge.

## Define event and integration contracts

For significant messages and events, establish producer authority, semantic meaning, schema ownership, identity, ordering scope, delivery expectations, privacy, retention, replay behavior, versioning, and consumer failure handling. Distinguish a fact that occurred from a request for another owner to act.

Do not use human-readable error messages, log text, or incidental database fields as integration protocols.
