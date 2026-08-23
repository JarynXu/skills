# Backend risk and verification model

Use this reference when a backend task can change consequential behavior. The purpose is to make verification depth follow the actual failure surface instead of habit, test count, or available tooling.

## Classify the risk surface

Assess each affected dimension independently. One high-consequence dimension is enough to require deeper evidence even when the diff is small.

| Dimension | Questions |
|---|---|
| Public contract | Can a client, event consumer, integration, file format, CLI, or operator-observable semantic change? |
| Persistent data | Can data shape, meaning, ownership, retention, migration, index/constraint behavior, or recoverability change? |
| Security/privacy | Can identity, authorization, tenant isolation, validation, secrets, sensitive data, audit, or abuse resistance change? |
| Concurrency | Can ordering, visibility, atomicity, cancellation, synchronization, duplicate work, or resource ownership change? |
| Distributed effects | Can retries, timeouts, partial failure, remote side effects, messages, caches, replicas, or external systems change outcomes? |
| Performance/capacity | Can latency, throughput, memory, CPU, connection pools, queues, cardinality, or cost cross an operational limit? |
| Deployment/runtime | Can mixed versions, startup/shutdown, configuration, feature flags, health, rollout, rollback, or platform compatibility change? |
| Production state | Does the task directly mutate a shared environment, database, queue, cache, secret, deployment, traffic path, or external service? |

Do not compute a fake numeric score. Use the dimensions to select evidence and safeguards.

## Choose an evidence tier

### Tier A — local, reversible behavior

Typical examples: pure domain calculation, isolated validation, internal refactor with strong tests, formatting or nonfunctional cleanup.

Minimum evidence usually includes:

- focused unit or characterization tests;
- compiler/typecheck/linter/formatter required by the project;
- review of the local diff for unintended behavior.

Move to a higher tier whenever another risk dimension is actually crossed.

### Tier B — integration or compatibility behavior

Typical examples: endpoint changes, ORM/query changes, serialization, database access, cache behavior, dependency upgrade, background job, external adapter, framework configuration.

Add evidence that preserves the real mechanism:

- component/integration tests with the actual database, broker, cache, protocol, filesystem, or realistic external sandbox where relevant;
- contract/schema/generated-code checks;
- compatibility tests for old/new representations or clients;
- runtime/configuration checks;
- dependency and lockfile consistency;
- representative failure-path tests.

Mocks alone cannot close Tier B when the risk exists in integration semantics.

### Tier C — consequential state, security, concurrency, migration, or performance

Typical examples: schema/data migration, authorization change, tenant boundary, distributed workflow, concurrency primitive, retry/idempotency change, large query/index change, performance optimization, runtime/framework major upgrade.

Add focused evidence for the affected mechanism:

- forward and mixed-version migration tests; backfill/replay/reconciliation where applicable;
- security negative cases and permission-boundary checks;
- race detector, stress/model/property/fuzz testing as appropriate;
- query plans and production-like data for database performance;
- representative load/profile evidence for performance claims;
- failure injection, duplicate/reorder/restart behavior for distributed paths;
- explicit rollout and rollback conditions.

Tier C does not mean “run every test in existence.” It means preserve the mechanisms that can fail.

### Tier D — production-affecting action

Anything that changes shared runtime state is Tier D even if the command is trivial.

Before mutation establish:

```text
authorization
+ exact target/environment
+ current state
+ expected change
+ blast radius
+ backup/recovery
+ rollback trigger and mechanism
+ observation window
+ post-action verification
```

Prefer dry-run/plan/read-only inspection and canary/staged execution when the platform supports them. Do not infer authorization from repository write access, role title, credentials, or a previous operation.

## Bind evidence to change surfaces

Use this matrix as a routing aid, not a mandatory artifact:

| Changed surface | Evidence that usually matters |
|---|---|
| Domain rule | unit/state-machine/property tests; acceptance examples |
| HTTP/RPC/event contract | schema/serialization checks, consumer/provider compatibility, error/idempotency behavior |
| SQL/schema/data | constraints, migrations, real DB integration, query plans, old/new data compatibility, restore/backfill |
| Cache/index/read model | invalidation/freshness, fallback, rebuild/reconciliation, key/tenant isolation |
| Queue/event workflow | duplicate/reorder/redelivery, ack/commit point, retry/DLQ, replay, observability |
| Auth/security | positive and negative authorization, tenant isolation, validation, secret/audit behavior |
| Concurrency | race/stress/model evidence, cancellation/shutdown, ordering and resource bounds |
| Dependency/runtime upgrade | build matrix, API/binary/data compatibility, lockfile, release notes relevant to used features, rollback |
| Performance | baseline, representative workload, profiles/query plans, tail latency, saturation and correctness |
| Deployment/config | startup/readiness, mixed version, config validation, graceful shutdown, feature flag and rollback |
| Production operation | current-state capture, plan/dry-run, staged action, post-action metrics/logs/data verification |

## Establish the baseline

Before a consequential change, capture enough baseline evidence to distinguish pre-existing failure from regression. Prefer the project’s normal build/test commands. If the baseline is already red:

- record the failing command and relevant symptom;
- determine whether it blocks the requested verification;
- avoid silently fixing unrelated failures unless authorized;
- compare new behavior against the known baseline instead of claiming a clean pass.

## Use the progressive verification ladder

Run checks in increasing cost and environmental scope:

```text
static/local
-> focused behavior
-> component/integration
-> contract/migration/security/concurrency
-> performance/resilience
-> deployed/staged
-> production observation
```

Skip a rung only when it does not preserve a relevant failure mechanism. Stop when the risk surface has direct evidence or when an external authority/environment prevents further verification; label the remaining evidence gap explicitly.

## Reject weak evidence

Do not treat any of the following as sufficient by themselves:

- high line coverage;
- a mocked unit suite for real database/broker/protocol behavior;
- successful compilation for runtime semantics;
- one happy-path manual request;
- average latency for tail/capacity claims;
- a migration script that parses;
- a scanner with no exploitability/context review;
- a green deployment with no business or health observation;
- “works on my machine” without the environment relevant to the failure.

## Completion rule

Verification is sufficient when every consequential changed surface has evidence at the lowest layer that preserves its real failure mechanism, and any unavailable external evidence is named with the responsible environment or authority.

Do not widen the implementation merely to make verification easier. If an important property cannot be tested because the design has no observable seam, treat that as design evidence and improve the narrowest affected boundary.
