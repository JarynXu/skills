# Orient to a backend system

Use this reference before broad implementation, review, migration, or diagnosis in an unfamiliar or uncertain codebase. The goal is not an exhaustive inventory. Establish the sources and relationships that can change the requested decision.

## Establish authority and scope

Read repository instructions first. Locate the current product or acceptance source, architecture decisions, service ownership, contracts, schemas and migrations, deployment configuration, runbooks, telemetry, incident evidence, and current tests. Classify each source as authoritative, observed, historical, generated, proposed, or unresolved.

A code path proves that behavior exists. It does not by itself prove that the behavior is intended, secure, supported, or still consumed. A diagram or wiki page proves prior communication, not current implementation. Reconcile disagreements by authority, recency, runtime evidence, and responsible ownership.

## Build the smallest useful system map

Determine the subset relevant to the task:

- entry surfaces: HTTP, RPC, event, scheduled job, CLI, file, database trigger, or embedded callback;
- service and module boundaries, public and internal contracts, and dependency direction;
- domain objects, state transitions, invariants, permissions, and side effects;
- systems of record, read models, caches, indexes, replicas, queues, object stores, and analytics sinks;
- synchronous and asynchronous dependencies, timeouts, retries, ordering, and duplicate-delivery assumptions;
- build, package, generated-code, migration, test, container, CI/CD, and deployment paths;
- configuration, feature flags, secrets, identity, certificates, and environment differences;
- logs, metrics, traces, health endpoints, dashboards, alerts, runbooks, and known incidents.

Do not turn this into a repository tour. Every retained item must affect scope, design, verification, compatibility, risk, or handoff.

## Detect the stack from evidence

Use manifests and executable commands over filenames alone. Common evidence includes:

| Ecosystem | Strong signals | Typical commands to confirm |
|---|---|---|
| JVM | `pom.xml`, `build.gradle*`, `settings.gradle*` | Maven/Gradle wrapper tasks, runtime version, dependency tree |
| Go | `go.mod`, `go.work` | `go env`, `go list`, `go test`, `go vet` |
| .NET | `*.sln`, `*.csproj`, `global.json` | `dotnet --info`, restore, build, test |
| Python | `pyproject.toml`, lock files, `requirements*.txt` | environment manager, package metadata, pytest or project test command |
| Node.js | `package.json` plus lock file | package-manager scripts, typecheck, lint, test, build |
| Rust | `Cargo.toml`, `Cargo.lock` | `cargo metadata`, check, test, clippy |
| C/C++ | CMake, Meson, Bazel, Make, Conan/vcpkg files | configure, compile commands, test runner, sanitizer build |

Run `scripts/inspect_backend.py` for a read-only first pass when useful. Verify detections before relying on them; monorepos often contain several stacks, generated fixtures, or abandoned experiments.

## Reconstruct the execution path

Trace one representative request or job through:

```text
entry -> authentication and validation -> application behavior
-> domain rules -> persistence or messaging -> external effects
-> response or completion -> telemetry and operational controls
```

Then trace a boundary and a failure path. Note transaction boundaries, context propagation, cancellation, retries, duplicate handling, and any point where the system can acknowledge work before it is durable.

## Establish a runnable baseline

Before a consequential change, record what can actually run in the available environment:

- dependency and toolchain availability;
- build or compile result;
- focused and broader test result;
- local service or container startup when applicable;
- database or external dependency strategy;
- current known failures and whether they predate the change.

Do not fix unrelated baseline failures silently. Preserve them as prior evidence, isolate their effect on the requested work, and avoid claiming a clean baseline.

## Stop orientation when it changes no further decision

Proceed when the requested scope has a trustworthy behavior path, ownership and authority boundary, technology route, data and dependency model, verification path, and known material uncertainty. Continue only when a missing fact could select a different public behavior, data migration, security control, integration contract, or difficult-to-reverse implementation direction.
