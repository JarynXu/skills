# .NET backend adapter

Use this adapter for C#/.NET server-side systems after identifying target frameworks, SDK pinning, solution/project boundaries, package management, hosting model, ASP.NET Core version, data stack and deployment environment. For broad learning, start with `../library/curriculum/csharp-dotnet.md`.

## Establish project truth

Inspect `global.json`, solution/project files, `Directory.Build.*`, `Directory.Packages.props`, NuGet configuration/lock strategy, analyzers, nullable settings, generated sources, publish profiles and container/deployment files. Determine whether the application uses controllers, Minimal APIs, gRPC, background services, Orleans or another hosting pattern, and whether persistence uses EF Core, Dapper, ADO.NET or another provider.

## Guard .NET semantic boundaries

Make async and resource lifetime explicit:

- propagate `CancellationToken` across request-scoped and long-running work;
- avoid sync-over-async and thread-pool starvation;
- distinguish `Task` scheduling from dedicated threads;
- use `IDisposable`/`IAsyncDisposable` according to actual resource lifetime;
- understand DI singleton/scoped/transient ownership and avoid capturing scoped services in singletons;
- keep `HttpClient` lifetime/handler reuse aligned with the configured factory/client model;
- preserve nullable contracts and exception/cancellation semantics;
- use channels/background queues with bounded capacity and shutdown behavior.

An `async` method can still block. A service registered in DI is not safe merely because the container constructs it.

## ASP.NET Core and data stack

Verify middleware order, endpoint routing, authentication versus authorization, exception/problem-details behavior, model binding/validation, body/request limits, forwarded headers, CORS/CSRF, data protection, configuration/options validation, logging scopes and health checks.

For EF Core, inspect tracking/no-tracking behavior, query translation, includes/projections, transaction boundaries, concurrency tokens, execution strategies/retries, migrations and connection-pool/provider behavior. Do not assume an expression executes client-side or server-side without checking generated SQL/query behavior. Dapper or raw SQL reduces ORM machinery but does not remove transaction, parameterization, mapping or migration responsibilities.

## Verification stack

Prefer the repository's `dotnet` commands and pinned SDK. Evidence may include:

- restore/build/test/publish for the actual solution or project;
- xUnit, NUnit or MSTest according to existing conventions;
- `WebApplicationFactory`/TestServer for ASP.NET integration behavior;
- Testcontainers or disposable real dependencies for database/broker semantics;
- analyzer/compiler warnings and `dotnet format` only when configured/adopted;
- EF migration generation/script checks when schema changes are in scope;
- BenchmarkDotNet for controlled microbenchmarks;
- contract/security tests at the HTTP/gRPC boundary rather than controller-only mocks.

Treat code coverage as one signal, not an oracle for assertion strength or integration fidelity.

## Diagnostics and performance

Select evidence from the symptom:

- `dotnet-counters` for runtime/application counters and saturation trends;
- `dotnet-trace`/EventPipe for CPU/runtime/event evidence;
- `dotnet-dump` or approved dump tooling for crash/deadlock/heap investigations;
- `dotnet-gcdump`/GC diagnostics for managed-heap questions;
- PerfView or platform profilers for deeper CPU/GC/ETW analysis where available;
- debugger only in authorized non-production or controlled incident contexts.

Distinguish managed allocation/GC pressure from native memory, database waits, HTTP dependency latency and thread-pool starvation.

## Production consequences

Verify host shutdown, request/background-service cancellation, readiness/liveness, options/config reload semantics, secret providers, data-protection key persistence, forwarded proxy headers, connection pools, HTTP handler lifetimes and deployment/runtime version compatibility. For self-contained/AOT/trimming scenarios, test reflection/serialization/generated-code behavior explicitly.

## Typical failure patterns to challenge

- scoped service captured by singleton/background lifetime;
- `.Result`/`.Wait()` or blocking work causing starvation;
- missing cancellation propagation;
- EF Core N+1, accidental tracking, client evaluation assumptions or long transactions;
- middleware/security order errors;
- `HttpClient`/handler misuse or unbounded outbound concurrency;
- data-protection keys lost across restarts/replicas;
- migrations generated but not validated against production-like schema/data;
- trimming/AOT breaking reflection/serialization paths that ordinary debug builds never exercise.