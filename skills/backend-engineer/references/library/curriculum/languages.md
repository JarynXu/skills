# Language learning tracks

A backend engineer should learn each language through **semantics -> idioms -> engineering conventions -> tooling**, not by memorizing syntax or one company's style guide.

## Go

Use the detailed [`go.md`](go.md) path. The critical sequence is current specification and memory model, Effective Go with its age caveat, Go Proverbs as design heuristics, Google Go Guide/Decisions/Best Practices, Uber Go Style Guide, and official diagnostics guidance.

## Java / Kotlin on the JVM

Recommended sequence:

1. Understand Java's type, exception, resource, concurrency, memory-model, class-loading, and runtime behavior from the JDK/JLS appropriate to the project's version. Formal Oracle/Java specification redistribution rights vary, so the library records these as authoritative sources rather than assuming the standard text can be mirrored.
2. Read the bundled **Alibaba Java Development Manual / P3C** as a broad production-oriented practice guide, especially naming, collections, concurrency, exception/logging, tests, security, MySQL, and layering.
3. Read the bundled **Google Java Style Guide** for a second, narrower organization convention and compare it with the project's formatter/checkstyle rules.
4. For Spring/Jakarta/Quarkus/Ktor, learn the actual framework version's transaction, dependency-injection, proxy, lifecycle, configuration, serialization, security, and test semantics before applying annotation folklore.
5. Learn JVM diagnostics: JFR, `jcmd`, thread dumps, heap dumps/histograms, GC evidence, async-profiler, and JMH.

Do not treat P3C or Google Java Style as the Java language specification. Do not treat Effective Java, Java Concurrency in Practice, or framework books as redistributable originals; see `restricted-canon.md`.

## Python

Recommended sequence:

1. Python language/reference semantics for the project's supported version.
2. Bundled **PEP 20** for the compact design philosophy, **PEP 8** for coding style, **PEP 257** for docstrings, and **PEP 484** for the foundations of typing.
3. Bundled **Google Python Style Guide** as a mature organization practice guide, not as a replacement for project formatter/linter/type-checker configuration.
4. Learn environment and packaging truth from `pyproject.toml`, the selected build backend and lock/tooling.
5. Learn pytest/unittest, Hypothesis where useful, type checking, Ruff/formatting if configured, asyncio/task behavior, process models, profiling, `tracemalloc`, and py-spy.

Python style evolves with tooling. Prefer the project's formatter and static-analysis configuration when it intentionally differs from PEP 8 line-layout details.

## C# / .NET

Recommended sequence:

1. Current C#/.NET language and runtime semantics for the target framework.
2. Bundled Microsoft **.NET/C# Coding Conventions**.
3. Bundled Google C# Style Guide as comparative organization guidance.
4. Learn async/await and cancellation, `IDisposable`/`IAsyncDisposable`, nullable reference types, dependency-injection lifetimes, ASP.NET middleware order, options/configuration validation, EF Core query/tracking/transaction behavior, and background-service lifetime.
5. Learn `dotnet` build/test/analyzers plus `dotnet-counters`, `dotnet-trace`, `dotnet-dump`, and BenchmarkDotNet.

## Node.js / TypeScript

Recommended sequence:

1. JavaScript/TypeScript runtime semantics that matter to servers: event loop, promises, streams/backpressure, module system, memory, process lifecycle, and structured concurrency/cancellation patterns available in the selected runtime.
2. Bundled Google TypeScript/JavaScript guidance for language conventions.
3. Bundled **Node.js Best Practices** for errors, project structure, security, testing, performance, and production operation. Treat it as community practice, not normative Node.js specification.
4. Learn the project's package manager, TypeScript configuration, runtime schema validation, framework lifecycle, test runner, lint/typecheck, diagnostics, CPU/heap profiles, and event-loop delay.

## Rust

Recommended sequence:

1. The Rust language and ownership/lifetime model for the project's toolchain/MSRV.
2. Bundled **Rust API Guidelines** for public API quality, traits, conversions, naming, documentation, flexibility, and future compatibility.
3. Learn Cargo features/workspaces, error-context conventions, async runtime task ownership/cancellation, blocking boundaries, unsafe invariants, FFI and platform contracts where relevant.
4. Use `cargo fmt`, check/test, Clippy, feature-matrix validation, Miri/sanitizers/fuzzing where appropriate, and runtime profiling.

The API Guidelines teach library/API shape; they do not replace The Rust Reference, The Rustonomicon for unsafe work, or runtime-specific documentation.

## C / C++

Recommended sequence:

1. The exact language standard/version and compiler/platform ABI required by the project.
2. Bundled Google C++ Style Guide only when it is compatible with project policy; organization style is not the language standard.
3. Learn ownership/lifetime, RAII, error behavior, concurrency/memory ordering, undefined behavior, integer/buffer bounds, ABI, alignment, endianness, allocators, and resource cleanup.
4. Use warnings, compiler sanitizers, static analysis, fuzzing, debugger/core dumps, perf/eBPF/Valgrind-family tools as appropriate.

The **C++ Core Guidelines** are important conceptual canon, but their current repository license does not grant unrestricted open redistribution; this library therefore records the work in `restricted-canon.md` instead of vendoring it.

## Shell as a backend-adjacent language

Backend engineers routinely write build, migration, diagnostic, CI and operational scripts. Use the bundled Google Shell Style Guide for conventions, but prefer a real application language when state, parsing, concurrency, error recovery, or portability makes shell brittle. Use ShellCheck and explicit strictness only with an understanding of the script's compatibility requirements.
