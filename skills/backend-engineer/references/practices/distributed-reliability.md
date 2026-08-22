# Distributed reliability and asynchronous work

Use this reference when behavior crosses processes or machines, depends on queues or external services, or must survive partial failure.

## Begin with a failure budget for every dependency

For each remote call or asynchronous step define:

- purpose and owner;
- latency budget and timeout;
- cancellation propagation;
- retryable conditions and maximum attempts/time;
- idempotency and duplicate behavior;
- concurrency and rate limits;
- circuit or degradation behavior;
- telemetry and operator control;
- reconciliation for ambiguous outcomes.

Timeouts must fit the end-to-end budget. A client timeout shorter than downstream work can create orphaned side effects and retry storms. Retry only failures likely to improve, use exponential backoff with jitter, respect server signals, and cap total work.

## Isolate failure and resource consumption

Use bounded queues, worker pools, connection pools, bulkheads, rate limits, admission control, and load shedding. Unbounded buffering moves failure into memory or latency. Circuit breakers can protect a failing dependency but require correct error classification, half-open behavior, and observable controls.

Backpressure should reach the producer or admission point. Dropping, delaying, rejecting, degrading, or spilling work is a product and operational decision, not merely a library setting.

## Engineer message processing

Assume duplicates unless a stronger guarantee is proven end to end. Define key, partitioning, ordering scope, consumer group behavior, acknowledgement point, poison-message handling, retry topic or dead-letter policy, retention, replay, schema evolution, and lag monitoring.

Acknowledge only after the durable effect required by the contract. If database state and message publication must correspond, use an outbox/inbox, change-data capture, or another reconciled mechanism. “Exactly once” at one broker layer does not guarantee exactly-once business effects.

## Coordinate cross-boundary workflows

Prefer local transactions within one authority. For multi-system work, model a state machine or saga with:

- durable workflow state;
- step preconditions and idempotency;
- forward recovery and compensation;
- timeouts and human or operator intervention;
- concurrency and stale-message handling;
- observable progress and terminal states.

Compensation is a new business action, not time travel. It may fail and require reconciliation. Preserve irreversible steps and authorization explicitly.

## Use distributed locks cautiously

First ask whether unique constraints, atomic operations, partitioning, leases, version checks, or serialized ownership solve the problem. A distributed lock needs a bounded lease, fencing or version protection, owner identity, safe renewal, failure behavior, and evidence that stale holders cannot commit effects after losing ownership.

## Design for deployment and topology changes

Instances restart, scale, move, partition, and run mixed versions. Avoid correctness that depends on in-memory singleton state, wall-clock agreement, stable pod identity, or simultaneous deployment. Define compatibility across rolling versions, graceful shutdown, drain, leader transfer, and in-flight work.

## Test resilience as behavior

Inject dependency errors, latency, cancellation, duplicate and reordered messages, partial writes, process restarts, expired leases, broker redelivery, and mixed versions at the smallest environment that preserves the real failure semantics. Verify recovery and telemetry, not just that an exception was thrown.
