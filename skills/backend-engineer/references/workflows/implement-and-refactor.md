# Implement and refactor backend changes

Use this workflow for BUILD, REFACTOR, and most HARDEN work. The goal is a coherent backend increment whose behavior, integration, tests, and operability agree.

## Frame the change before editing

Translate the delegated outcome into a small behavior map:

```text
trigger/input
-> permission and preconditions
-> application/domain decision
-> authoritative state change or query
-> external side effects
-> result/error
-> telemetry
```

Identify the owner of each step and the smallest module/service boundary that can implement it. Preserve unresolved product behavior as an open decision; do not encode a guess into a public contract.

Use the change-surface model from `../core/risk-and-verification.md` to decide which of these are affected:

- source modules and internal APIs;
- public API/event/file/schema contracts;
- database schema/data/indexes;
- caches/search/read models;
- remote dependencies/messages;
- configuration/secrets/feature flags;
- generated code or codegen sources;
- tests/fixtures;
- logs/metrics/traces/health;
- build/package/release/runtime behavior.

## Read before writing

Inspect the closest existing implementation that performs comparable work. Determine:

- local naming, layering and error conventions;
- transaction and authorization boundaries;
- how dependencies are injected/constructed;
- how tests create data and real integrations;
- how telemetry and configuration are expressed;
- what code is generated and what source owns it;
- what formatter/linter/typechecker/compiler actually enforces.

Prefer the existing project pattern when it carries the correct responsibility. Do not copy a pattern whose semantics are wrong for the new behavior.

## Choose the implementation shape

Use direct code for simple behavior. Add an abstraction only when there is a real stable responsibility, multiple consumers, substitution boundary, policy/mechanism separation, or test/operational need.

For domain-heavy behavior:

- keep invariants close to the state they protect;
- make transaction boundaries explicit;
- prevent transport/ORM/vendor APIs from becoming the domain model by accident;
- choose synchronous versus asynchronous work from consistency, latency and failure needs;
- design idempotency where duplicate execution is possible.

For CRUD-heavy behavior, do not manufacture entities, repositories, services and ports solely to satisfy an architectural label.

## Plan failure behavior at the same time as success

For every I/O or state-changing edge, decide the applicable behavior for:

- timeout and cancellation;
- retryability and retry budget;
- duplicate delivery or repeated client requests;
- concurrency/conflict;
- partial success;
- dependency unavailability;
- resource exhaustion/backpressure;
- shutdown/restart;
- reconciliation or compensation.

Do not add a retry before identifying idempotency and the failure classification. Do not hold a database transaction or lock across slow remote I/O unless the design explicitly requires and tolerates it.

## Implement a coherent vertical slice

Prefer a small sequence of complete increments over broad scaffolding. A slice may include, as required:

1. authoritative contract/schema source;
2. generated artifacts;
3. entry validation/authentication context;
4. application/domain behavior;
5. persistence/message/external adapter;
6. configuration and operational controls;
7. telemetry;
8. focused and integration tests;
9. migration/compatibility support.

Do not leave knowingly fake implementations behind a public contract unless the partial state is intentionally gated and safe.

## Refactor with a behavioral anchor

Before structural refactoring, establish one of:

- existing automated tests;
- characterization tests;
- contract fixtures;
- differential output;
- runtime traces/log evidence;
- another explicit correctness oracle.

Separate mechanical movement/renaming from behavior changes when it improves reviewability. Refactor only the area needed to give the delegated change a coherent home. Stop when the code is understandable and the requested change no longer depends on accidental coupling.

## Use project-native engineering tools

Run the commands configured by the repository before inventing replacements. According to the detected stack, this may include:

- formatter and lint/static analysis;
- compiler/typechecker;
- package/dependency resolution;
- unit/component/integration tests;
- database migration/validation tools;
- code generation;
- vulnerability/license checks;
- container/build packaging.

Read `../technologies/languages-and-frameworks.md`, `../practices/build-dependencies-and-generated-code.md`, and the applicable offline curriculum when exact tooling or semantics matter.

## Verify from inside out

Before claiming completion:

1. run focused tests closest to the change;
2. run the project checks that can catch compile/type/style/generated/lockfile inconsistencies;
3. exercise the real integration mechanism for each consequential external surface;
4. run deeper security/concurrency/migration/performance/resilience evidence selected by risk;
5. inspect the final diff and runtime/telemetry consequences.

A passing inner test does not excuse a missing outer mechanism. A failing unrelated broad suite does not erase valid focused evidence; record both accurately.

## Handoff

Lead with the resulting behavior, not a file list. Mention contract/schema/configuration effects, commands actually run, rollout/rollback implications, and remaining external evidence.

Do not claim deployment, consumer adoption, or production correctness unless that state was actually observed within the authorized task.
