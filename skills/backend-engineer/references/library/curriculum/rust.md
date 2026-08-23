# Rust learning track

Rust backend engineering requires more than knowing the borrow checker. Learn ownership and type semantics deeply enough to make resource, concurrency, error, API and unsafe boundaries explicit, then connect them to the async/runtime and framework actually used by the project.

## 1. Read The Rust Programming Language as the primary teaching text

The bundled `rust-book` source is the official Rust Book. For an agent new to Rust, read it in sequence rather than using it only as a dictionary. The core learning arc is:

- ownership, borrowing, references and slices;
- structs, enums, pattern matching and modules;
- collections and error handling;
- generics, traits and lifetimes;
- testing, iterators, closures and smart pointers;
- concurrency and shared state;
- object-oriented patterns where relevant;
- advanced language features and unsafe Rust;
- Cargo/workspaces and project organization.

Do not skip ownership/lifetimes and jump directly to an async web framework. Most later Rust design becomes easier once ownership and trait boundaries are understood.

## 2. Use Rust API Guidelines for public design

After the Book, read the bundled `rust-api-guidelines` material for public API quality: naming, conversions, traits, type safety, flexibility, documentation, future compatibility and predictable behavior.

Treat the guidelines as API design practice, not as a substitute for the language/reference semantics.

## 3. Separate safe abstractions from unsafe invariants

When `unsafe` is required, state the invariant that safe callers may rely on and the assumptions that the unsafe implementation must maintain. Minimize unsafe scope, document safety contracts, and test/fuzz at boundaries where malformed input, FFI or aliasing/lifetime assumptions can break them.

For deep unsafe-language questions, consult the official Rust Reference and Rustonomicon in an authorized/current form. They are curriculum-mapped even when not mirrored in the current baseline pack.

## 4. Learn async/runtime semantics from the selected runtime

Tokio, async-std and other runtimes define task scheduling, timers, I/O, blocking boundaries and shutdown behavior outside the Rust language itself. For the runtime actually used by the project, understand:

- task ownership and cancellation;
- `Send`/`Sync` consequences across task/thread boundaries;
- blocking work and dedicated pools;
- channels/backpressure;
- timeout and graceful shutdown;
- pinning and stream/future behavior where exposed;
- tracing/instrumentation integration.

Do not spawn detached tasks with no owner or recovery path simply because spawning is cheap.

## 5. Learn Cargo and feature behavior

Inspect the workspace, MSRV/toolchain, features, target platforms, build scripts, generated bindings and dependency policy. Test the feature combinations the product actually supports; code that builds under the default feature set may fail or change behavior elsewhere.

## 6. Learn diagnostics and verification

Use project-configured `cargo fmt`, `cargo check`, tests and Clippy. Add targeted tools according to risk:

- Miri or sanitizers for memory/undefined-behavior questions;
- fuzzing for parsers/protocol/unsafe boundaries;
- property tests for broad invariants;
- benchmarks for performance-sensitive code;
- `perf`, flamegraphs, heap/allocation tools and debugger/core dumps for runtime diagnosis.

## Completion questions

A Rust backend engineer should be able to explain:

- who owns each resource and when it is dropped;
- why a lifetime or trait bound is necessary rather than merely how to satisfy the compiler;
- which errors are expected domain outcomes versus internal context-bearing failures;
- what `Send` and `Sync` imply at each concurrency boundary;
- who owns every background task and how shutdown/cancellation works;
- what invariant justifies each unsafe block;
- which feature/target/toolchain combinations were actually verified;
- which profiler/test can distinguish CPU, allocation, lock contention, blocking and async scheduling problems.
