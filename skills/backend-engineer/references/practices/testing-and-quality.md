# Backend testing and quality engineering

Use this reference to select test levels, design seams and fixtures, prevent regressions, and prove backend behavior without confusing test quantity with confidence.

## Derive tests from risk and observable behavior

Identify the oracle for each consequential property:

- business invariant and state transition;
- authorization and tenant isolation;
- serialization and contract semantics;
- transaction, lock, concurrency, and idempotency behavior;
- query and persistence behavior;
- dependency timeout, retry, and degradation;
- migration and mixed-version compatibility;
- resource, performance, and resilience limits;
- telemetry and operator controls.

Choose the lowest test level that preserves the mechanism being proved. Move upward when mocks or in-memory substitutes remove the relevant behavior.

## Use complementary test levels

- **Unit tests:** pure policy, calculations, state transitions, validation, parsing, and error mapping.
- **Component/service tests:** application behavior with controlled real adapters or realistic substitutes.
- **Integration tests:** actual database, broker, cache, filesystem, protocol, or external sandbox behavior.
- **Contract tests:** provider/consumer compatibility and schema semantics.
- **System/end-to-end tests:** critical deployed workflows across boundaries.
- **Migration tests:** old and new schemas/data, forward deployment, rollback constraints, and backfill resumability.
- **Performance and resilience tests:** workload and failure semantics with measurable acceptance.

A broad end-to-end suite is not a substitute for local diagnostic tests. A large mocked suite is not a substitute for real integration evidence.

## Keep tests deterministic and diagnostic

Control time, randomness, identifiers, external I/O, and concurrency explicitly. Isolate mutable state. Generate data through domain-aware builders or factories, not copied opaque fixtures. Assert meaningful state and effects rather than implementation call counts unless the call is itself the contract.

For asynchronous tests, wait on observable conditions with bounded time rather than sleeping. On failure, preserve useful logs, traces, request IDs, database state, broker offsets, or artifacts without leaking secrets.

## Test databases and middleware realistically

Use disposable containers, ephemeral schemas, embedded implementations only when semantics match, or dedicated test environments. Apply real migrations. Verify constraints, isolation, indexes or query plans when they carry the risk. Reset state through transactions, truncation, namespaces, or disposable instances with known parallel behavior.

For queues and events, test serialization, partition or ordering scope, redelivery, duplicates, acknowledgement, poison handling, schema evolution, and replay. For caches, test miss, stale, invalidation, stampede, failure, and source-of-truth fallback.

## Add stronger techniques where they pay

- property-based tests for broad input spaces and invariants;
- mutation testing to expose weak assertions in critical policy;
- fuzzing for parsers, protocols, serialization, and native boundaries;
- model-based or state-machine testing for workflows;
- concurrency stress and race detection;
- differential testing during rewrites or migrations;
- snapshot/golden tests for stable serialized contracts with deliberate review.

Do not adopt a technique merely because a tool exists. Tie it to a failure class the ordinary suite may miss.

## Integrate quality into delivery

Run fast deterministic tests locally and in CI. Separate environment-dependent suites with clear ownership and failure evidence, but do not allow permanent quarantine to become silent acceptance. Track flaky tests as defects, identify the nondeterministic mechanism, and repair or remove false confidence.

Before handoff, state commands actually run, environment assumptions, passed and failed scopes, tests not available, and residual risk. Coordinate independent release evidence with `qa-engineer`; backend self-tests do not grant business acceptance.
