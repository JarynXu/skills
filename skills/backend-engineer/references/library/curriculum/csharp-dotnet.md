# C# and .NET backend learning track

Learn .NET backend engineering through **C# semantics -> CLR/runtime/resource semantics -> platform conventions -> ASP.NET Core behavior -> diagnostics**. A framework tutorial is not a substitute for the language and runtime model.

## 1. Learn the C# language contract

Use the C# standard committee text when exact language semantics matter. The public `dotnet/csharpstandard` working space is suitable for an offline standards source because its standard text is published under CC BY 4.0.

Prioritize:

- type system, conversions and overload resolution;
- value/reference semantics, boxing and nullable behavior;
- generics and variance;
- delegates, lambdas, closures and events;
- exceptions and disposal;
- async/await state-machine semantics;
- pattern matching and expression semantics;
- memory/threading rules relevant to ordinary application code.

Do not infer language behavior from one compiler warning or ASP.NET convention.

## 2. Learn CLR and resource lifetime

A backend engineer should understand the operational consequences of:

- managed allocation and GC generations;
- finalization versus deterministic disposal;
- `IDisposable` and `IAsyncDisposable`;
- thread pool and async continuations;
- synchronization primitives and concurrent collections;
- cancellation tokens;
- native/managed boundaries and pinned resources;
- assembly/loading/version behavior when deployment depends on it.

`using` is a lifetime construct, not merely syntax. `async` does not imply a new thread. Cancellation must be propagated and observed deliberately.

## 3. Learn the platform conventions

Read the bundled Microsoft C#/.NET Coding Conventions, then compare them with the bundled Google C# guide and the real repository's `.editorconfig`, analyzers, formatter and nullable settings.

Treat organization style as style. Correctness comes from the language/runtime contract and application invariants.

## 4. Learn ASP.NET Core as a request/runtime pipeline

Use `aspnetcore-core-docs` after the language/runtime model. Prioritize:

- application startup and environment/configuration;
- dependency-injection lifetimes and scope boundaries;
- middleware order and short-circuit behavior;
- request context and cancellation;
- outbound HTTP connection/retry ownership;
- routing, validation and error representation;
- logging and operational behavior;
- authentication versus authorization;
- antiforgery, CORS, XSS and data protection;
- integration and load testing.

A scoped service captured by a singleton, fire-and-forget task that outlives a request, or retry layer duplicated across `HttpClient`/proxy/service can all create production defects without any compile error.

## 5. Learn data access separately from web transport

For EF Core or Dapper-based systems, establish:

- connection/session lifetime;
- tracking/no-tracking behavior;
- query translation versus client execution;
- transaction and savepoint boundaries;
- optimistic concurrency tokens;
- migration and mixed-version behavior;
- N+1, overfetch and index implications.

Framework convenience does not change the underlying database consistency model.

## 6. Learn testing and diagnostics

Typical evidence tools include:

- `dotnet restore/build/test` and repository analyzers;
- xUnit/NUnit/MSTest according to project conventions;
- Testcontainers and real integration dependencies;
- ASP.NET `WebApplicationFactory`/test server where appropriate;
- BenchmarkDotNet for controlled benchmarks;
- `dotnet-counters` for live runtime counters;
- `dotnet-trace` for EventPipe traces;
- `dotnet-dump`/SOS for crash, heap and thread investigation;
- profiler or OpenTelemetry evidence for distributed latency.

## Completion questions

The track is complete when the agent can answer:

- What does the C# standard guarantee here?
- Which object owns this disposable/async-disposable resource?
- Which DI scope owns this state, and can it escape that scope?
- How does cancellation reach database/network/background work?
- Where is middleware ordering part of correctness or security?
- What is the actual transaction and concurrency boundary?
- Which runtime trace/dump/counter distinguishes CPU, GC, allocation, lock, thread-pool and dependency latency?
