# Backend tooling and evidence selection

Use this reference when the task requires choosing build, test, migration, protocol, database, debugger, profiler, static-analysis, package/security, or observability tools. A tool is useful only when it closes a specific evidence gap in the real project.

## Start from the question, not the tool

Map the uncertainty to the smallest evidence path:

| Question | Prefer evidence such as |
|---|---|
| Does it compile/typecheck? | project compiler/build/typecheck command |
| Does local policy hold? | focused unit/property tests, static analysis |
| Does serialization/protocol work? | contract/schema validation, real client/server integration |
| Does persistence behave correctly? | real disposable database, migrations, constraints, query plans |
| Is shared state safe? | race/sanitizer/concurrency stress plus code-level invariant |
| Is a dependency reachable/compatible? | resolved graph, artifact inspection, integration/startup |
| Why is it slow? | profile/trace/query plan/queue and saturation evidence |
| Why is it leaking? | heap/allocation/native-memory/task/goroutine/handle evidence |
| Why is it stuck? | thread/task/goroutine dumps, locks, event-loop/scheduler evidence |
| Is a migration safe? | schema diff/plan, representative data, lock/runtime behavior, rollback/recovery |
| Is production healthy after change? | behavior-specific metrics/logs/traces, error/latency/saturation, business effect |

Do not run a large suite or invasive profiler merely because it is familiar. Start with evidence capable of falsifying the current hypothesis.

## Prefer project-native entry points

Use wrappers, package scripts, Make/task targets, CI commands, tool configuration and repository instructions before generic commands. A project may deliberately wrap Maven/Gradle/Cargo/pytest/dotnet/npm/CMake to inject profiles, generated code, containers, credentials or supported flags.

`python scripts/plan_backend_checks.py <project-root>` can produce read-only candidate commands from detected repository evidence. Treat them as candidates requiring inspection, not as commands that must run.

## Testing tools

Select the test level by mechanism:

- **pure policy/calculation:** language-native unit framework;
- **database/queue/cache semantics:** Testcontainers/disposable real service or project integration environment;
- **HTTP/RPC contract:** framework-native test client plus real serialization/auth middleware when those semantics matter;
- **third-party boundary:** sandbox/recorded contract/mock server with explicit limitations;
- **state-machine/invariants:** property/model-based tests;
- **parser/native boundary:** fuzzing and sanitizer-assisted tests where appropriate;
- **concurrency:** race detectors/sanitizers/stress/model checking plus deterministic invariants;
- **performance:** benchmark/load/soak tool whose arrival model and environment answer the actual requirement.

Mocks are useful for local branch control; they do not prove a real driver, protocol, transaction, serializer, security filter or deployed configuration.

## Protocol and API tools

Use curl/HTTPie, grpcurl, GraphQL clients, WebSocket clients, OpenAPI validators, protobuf tooling, Pact or project-specific clients according to the contract. Capture status/error semantics, headers/metadata, payload shape, timing and correlation IDs when relevant. Never put secrets in shell history/examples or share sensitive production payloads casually.

A manual request is useful for diagnosis but should become an automated regression check when it represents a durable requirement.

## Database and migration tools

Use the actual database client and migration framework. Prefer read-only inspection first: schema metadata, migration history, locks/waits, query plans, row/cardinality estimates and representative data shape. For mutations, establish environment, transaction/lock behavior, backup/recovery, rollback/forward-fix and observability.

`EXPLAIN`/query-plan evidence answers optimizer/access questions; it does not prove production latency without representative parameters/data/cache/concurrency. A generated migration file does not prove online execution safety.

## Static analysis, linters and formatters

Configured compiler warnings, analyzers and linters are part of project policy. Run the existing configuration and fix causal findings in scope. Do not introduce a new linter merely to produce more warnings during an unrelated task.

Classify scanner results before acting: syntactic defect, likely bug, security weakness, style preference, false positive or policy exception. A zero-warning run does not prove runtime correctness.

## Debuggers, dumps and live inspection

Debuggers can change timing and stop execution. Dumps can contain credentials, user data and cryptographic material. Use them only in authorized environments with explicit retention/access handling.

Prefer non-invasive telemetry or sampling first for production diagnosis. Attach/heap/core capture is justified when the evidence gap cannot be closed safely otherwise. Record exact binary/build/source/runtime identity so evidence remains interpretable.

## Profilers and benchmarks

Choose CPU, allocation, heap, lock/contention, scheduler/event-loop, syscall/network or database profiling based on the observed symptom. Preserve workload and correctness. Compare before/after under equivalent conditions and inspect latency tails and secondary resources.

Do not optimize an implementation detail because it is visible in a profile if the end-to-end budget is dominated elsewhere. Microbenchmarks answer local mechanism questions; load tests answer system behavior under workload.

## Dependency and supply-chain tools

Use the project package manager to inspect the resolved graph and lockfile. Vulnerability/SBOM/license/provenance tooling should be interpreted against the built artifact and reachable code path. Distinguish advisory presence from resolved vulnerable version, artifact inclusion and exploitability.

Publishing, signing, credential rotation or registry mutation always requires explicit authorization.

## Observability systems

Use logs, metrics and traces as a correlated evidence set. Search by stable operation/workflow IDs, version, dependency, tenant/region where safe, and time window. Avoid high-cardinality exploratory queries that can overload production telemetry stores.

A dashboard screenshot is not a root cause. Relate demand, errors, latency, queueing/saturation, dependencies and completed business work.

## Evidence recording

For each consequential command or tool interaction, preserve enough context to reproduce the conclusion:

- command/tool and relevant flags;
- target environment/process/artifact;
- runtime/build/version where material;
- representative input/workload;
- observed result and timestamp/window;
- limitations or missing scope.

Report conclusions, not raw tool dumps, unless the raw evidence is the requested artifact.