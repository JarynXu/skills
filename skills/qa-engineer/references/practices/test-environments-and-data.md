# Test environments and data

Use this reference when test validity depends on environment topology, configuration, identities, datasets, dependencies, clocks, reset behavior, or production-like conditions. Environment and data design are part of the test oracle: a green result from the wrong topology, version, permissions, or data distribution may not support the intended claim.

## Define the environment contract

For consequential testing, record the environment properties that can change behavior:

- product/service versions, commit or artifact identity, feature flags and configuration;
- infrastructure topology, regions/zones, replicas, caches, queues, search/indexing, storage and external dependencies;
- database/schema/migration version and seed/backfill state;
- browser/OS/device/runtime versions and relevant locale/timezone/accessibility settings;
- authentication provider, tenant, roles/permissions and test identities;
- network path, proxies, TLS, DNS, gateways, service discovery and rate/traffic controls;
- observability surfaces available for diagnosis;
- isolation, reset, retention and cleanup rules.

Do not label an environment "production-like" without stating which production mechanisms it actually preserves and which it removes.

## Match fidelity to the risk

Use the cheapest environment that retains the mechanism being tested:

```text
in-process / unit fixture
-> component with controlled adapters
-> ephemeral real dependencies
-> shared integration environment
-> assembled staging/pre-production
-> authorized production-safe validation
```

Move outward because a lower environment removes a needed behavior—not because higher environments seem more realistic in general. Shared environments add interference, drift, queues, scarce data and ownership constraints; they are not automatically stronger evidence.

## Design test data deliberately

Classify the data need before generating fixtures:

- valid representative examples for normal behavior;
- boundary and invalid values for validation and limits;
- stateful sequences for lifecycle/workflow transitions;
- permission/tenant/account matrices for authorization;
- distribution and cardinality representative of query, cache or performance behavior;
- historical or migration shapes for compatibility and upgrade tests;
- adversarial/malformed structures for parsers and trust boundaries;
- production-derived statistical shapes only when privacy and policy permit them.

Use builders, factories, seeds, snapshots or data APIs according to ownership and reproducibility. A test fixture should make the intended precondition obvious without silently creating unrelated state.

## Protect privacy and secrets

Never copy real personal, customer, credential, payment, health, production-secret or regulated data into a test environment merely for realism. Prefer synthetic data, irreversible anonymization where valid, approved masked extracts, or generated distributions.

Treat screenshots, traces, HAR files, network captures, database dumps, logs, crash reports and test reports as possible sensitive artifacts. Apply retention, access and redaction rules to evidence as well as to input data.

## Preserve isolation

For parallel or repeated runs, isolate the mutable state that can collide:

- unique tenant/account/user namespaces;
- database schema or database instances;
- queue topics/consumer groups/correlation IDs;
- object-storage prefixes and filesystem roots;
- browser/device profiles and sessions;
- ports, processes and containers;
- clocks, random seeds and generated IDs.

Do not rely on test ordering unless order itself is the product behavior. If isolation is impossible, make serialization and ownership explicit and do not pretend the suite is parallel-safe.

## Reset and cleanup as test infrastructure

A reproducible suite needs a known starting state. Prefer reset mechanisms that are fast, bounded and observable:

- recreate ephemeral dependencies;
- transaction rollback where the tested mechanism permits it;
- truncate/reseed test-owned data stores;
- delete namespaced resources idempotently;
- restore known snapshots when snapshot semantics match the product;
- invoke supported product cleanup APIs for externally managed systems.

Cleanup must not erase the evidence needed to diagnose a failed run before artifacts are captured. When failed state is retained, assign an expiry and cleanup owner.

## Control time and nondeterminism

Use injected/fake clocks for lower-level expiration, scheduling and timeout logic when clock behavior itself is not under test. Use real clocks for end-to-end scheduling, timezone, DST, lease, certificate, token, distributed-skew and production integration behavior.

Record random seeds for generated/fuzz/property tests. Bound polling and eventual assertions by meaningful deadlines rather than fixed sleeps. Make concurrency worker counts and scheduling assumptions visible.

## Manage dependencies and service virtualization

Select the substitute by the behavior needed:

- mock for local branching and interaction checks;
- stub for fixed protocol responses;
- fake for simplified domain behavior;
- simulator/emulator for platform/device behavior;
- service virtualization for controllable remote scenarios;
- contract tests for producer/consumer compatibility;
- real dependency for persistence, broker, cache, TLS, driver, concurrency, quota or protocol semantics that substitutes remove.

A substitute should state which behaviors it does **not** model. Keep a smaller real-integration path for consequential semantics even when virtualization provides broad scenario coverage.

## Detect environment drift

Before interpreting failures, compare the current environment with the expected contract:

- artifact/version drift;
- pending or partial migrations;
- stale caches/indexes;
- feature-flag or secret/config differences;
- changed test identity or permission assignments;
- expired credentials/certificates/tokens;
- dependency version or sandbox behavior changes;
- capacity/resource exhaustion;
- residual state from previous runs.

Classify environment defects separately from product defects until evidence shows the product is responsible.

## Build a platform matrix from support and risk

Do not multiply every browser × OS × device × locale × database × dependency version blindly. Start with:

1. officially supported combinations;
2. highest usage/business exposure;
3. implementation differences likely to interact;
4. past defect clusters;
5. minimum/maximum supported versions;
6. upgrade and mixed-version states;
7. accessibility/localization/region-specific requirements.

Use pairwise/combinatorial reduction for broad interaction matrices, then add known high-risk combinations explicitly. Keep the matrix versioned with support policy changes.

## Production-safe validation

Production data and topology may be the only faithful evidence for some mechanisms, but production access does not make destructive testing acceptable. Prefer read-only observation, synthetic transactions, dedicated test tenants/accounts, canary traffic, shadow validation or bounded smoke checks.

Before production execution define target, authorization, data, traffic volume, side effects, observability, stop conditions, rollback/reconciliation path, support contact and cleanup. Never turn a test tool's default target into implicit production authorization.

## Evidence checklist

A material result should be reproducible from:

```text
product version/artifact
+ environment/topology/configuration
+ data generation or dataset identity
+ test identity/permissions
+ dependency versions/substitutes
+ tool/version and execution command
+ time/locale/random/concurrency controls
+ expected oracle
+ observed artifacts
+ cleanup/retained-state status
```

If one of these can change the conclusion and is unknown, report the evidence limitation rather than silently treating the result as representative.
