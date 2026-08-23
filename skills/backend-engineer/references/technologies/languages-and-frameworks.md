# Language, framework, and development-tool routing

Load only the section selected by repository evidence. Project configuration and version-specific official documentation override these defaults.

If the active language/runtime is unfamiliar, **learn before improvising**: start at [`../library/curriculum/languages.md`](../library/curriculum/languages.md), follow the detailed language track, and use `python scripts/offline_library.py search ...` against the processed Markdown layer for exact bundled guidance. If the agent already understands the ecosystem, use the sections below as routing hints rather than rereading the whole curriculum.

## JVM: Java and Kotlin

Use [`../library/curriculum/java-jvm.md`](../library/curriculum/java-jvm.md) or [`../library/curriculum/kotlin.md`](../library/curriculum/kotlin.md) when the task requires deeper language/runtime learning.

Strong signals include Maven or Gradle manifests and JVM source. Common frameworks: Spring Boot, Quarkus, Micronaut, Jakarta EE, Ktor, Vert.x. Inspect wrapper versions, toolchains, annotation/code generation, dependency management, profiles, and test source sets.

Use the project's Maven/Gradle wrapper. Typical evidence includes compile, focused tests, broader tests, static analysis, formatting, dependency insight, and packaging. Common tools include JUnit 5, AssertJ, Mockito/MockK, Testcontainers, WireMock, ArchUnit, SpotBugs, Checkstyle, PMD, Error Prone, JaCoCo, JMH, JFR, async-profiler, `jcmd`, and database migration tools.

Respect the Java/Kotlin memory model, checked versus unchecked error conventions, nullability boundaries, resource lifetime, thread pools, virtual threads where the actual runtime supports them, and framework proxy/transaction behavior. For Spring, verify transaction proxy boundaries, configuration binding, security filters, serialization, actuator exposure, and test slice semantics rather than relying on annotations by appearance.

## Go

Use [`../library/curriculum/go.md`](../library/curriculum/go.md) when the task requires deeper language/runtime learning.

Strong signals are `go.mod` and Go packages. Prefer standard library conventions unless the project adopts Gin, Echo, Fiber, Chi, gRPC, Connect, or another framework. Use `gofmt`, `go test`, `go vet`, race detection, benchmarks, fuzzing, `staticcheck` when configured, `pprof`, execution tracing, and module vulnerability/dependency tools available to the project.

Propagate `context.Context` across request-scoped work without storing it in long-lived objects. Define goroutine ownership, cancellation, channel closure, worker bounds, error propagation, and shutdown. Avoid interfaces before a consumer needs substitution or behavior abstraction.

## C# and .NET

Use [`../library/curriculum/csharp-dotnet.md`](../library/curriculum/csharp-dotnet.md) when the task requires deeper language/runtime learning.

Inspect solution/project files, `global.json`, NuGet lock or central package management, analyzers, nullable settings, and target frameworks. Common frameworks include ASP.NET Core, minimal APIs, gRPC, EF Core, Dapper, Orleans, and background services.

Use `dotnet restore/build/test`, format/analyzers, coverage, BenchmarkDotNet, `dotnet-counters`, `dotnet-trace`, and `dotnet-dump` through project conventions. Respect async cancellation, `IAsyncDisposable`, dependency-injection lifetimes, options validation, middleware order, EF tracking and query behavior, and nullable contracts.

## Python

Use [`../library/curriculum/python.md`](../library/curriculum/python.md) when the task requires deeper language/runtime learning.

Inspect `pyproject.toml`, lock and environment tooling, package layout, type checker, linter, and test configuration. Common frameworks include FastAPI, Django, Flask, Starlette, SQLAlchemy, Celery, and asyncio-based services.

Use the project's environment manager and commands. Typical tools include pytest, unittest, mypy/pyright, Ruff, Black when adopted, coverage, Hypothesis, tox/nox, Testcontainers, cProfile, py-spy, and tracemalloc. Make sync/async boundaries, process model, mutable global state, typing expectations, dependency injection, database session scope, and worker retry semantics explicit.

## Node.js and TypeScript

Use [`../library/curriculum/node-typescript.md`](../library/curriculum/node-typescript.md) when the task requires deeper language/runtime learning.

Inspect `package.json`, lockfile, workspace configuration, runtime version, module type, TypeScript configuration, and scripts. Common frameworks include Express, Fastify, NestJS, Koa, Hapi, serverless runtimes, and GraphQL servers.

Use the pinned package manager. Run project typecheck, lint, tests, build, and package/audit commands. Common tools include Vitest/Jest, Node test runner, Supertest, Testcontainers, ESLint, TypeScript compiler, clinic tools, inspector profiles, and diagnostic reports. Bound event-loop blocking, promise concurrency, streams and backpressure, unhandled rejection, process shutdown, and runtime schema validation.

## Rust

Use [`../library/curriculum/rust.md`](../library/curriculum/rust.md) when the task requires deeper language/runtime learning.

Inspect Cargo workspace, features, target, MSRV policy, build scripts, unsafe code, and generated bindings. Common frameworks include Axum, Actix Web, Rocket, tonic, Tokio, Diesel, and SQLx.

Use `cargo fmt --check`, `cargo check`, tests, Clippy as configured, feature-matrix checks, benchmarks, sanitizers or Miri where applicable, and profiling/debugging tools. Make ownership and lifetime design serve behavior rather than cleverness. Bound async tasks, cancellation, blocking work, error context, unsafe invariants, and FFI contracts.

## C and C++

Use [`../library/curriculum/c-cpp.md`](../library/curriculum/c-cpp.md) when the task requires deeper language/runtime learning.

Inspect CMake, Meson, Bazel, Make, Conan/vcpkg, compiler and language standard, generated compile commands, platform targets, and ABI constraints. Frameworks may include Boost.Asio/Beast, Drogon, gRPC, Qt service components, embedded RTOS stacks, or custom daemons.

Use warnings and project-selected static analysis, unit framework, sanitizers, fuzzers, Valgrind-family tools, perf, gdb/lldb, and reproducible release builds. Make ownership, lifetime, error propagation, thread safety, integer and buffer bounds, undefined behavior, ABI, endianness, alignment, and resource cleanup explicit. Do not apply one organization's style guide over the project's established standard.

## Tool selection rule

A tool is applicable only when it fits the detected stack, version, environment, and task risk. Prefer existing configured commands so local and CI behavior match. Introduce a new tool only when it closes a demonstrated evidence gap and its configuration, runtime cost, false-positive handling, ownership, and maintenance path are justified.
