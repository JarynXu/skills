# Rust learning track

Rust backend engineering requires more than knowing the borrow checker. Learn **ownership and core language concepts -> exact reference semantics -> API design -> unsafe invariants -> async/runtime behavior -> diagnostics**.

## 1. Read The Rust Programming Language as the primary teaching text

The bundled `rust-book` source is the official Rust Book. For an agent new to Rust, read it in sequence rather than using it only as a dictionary. The core learning arc is:

- ownership, borrowing, references and slices;
- structs, enums, pattern matching and modules;
- collections and error handling;
- generics, traits and lifetimes;
- testing, iterators, closures and smart pointers;
- concurrency and shared state;
- advanced language features and unsafe Rust;
- Cargo/workspaces and project organization.

Do not skip ownership/lifetimes and jump directly to an async web framework.

## 2. Use The Rust Reference for exact semantics

The bundled `rust-reference` source is the official Reference. Use it when the Book intentionally teaches at a higher level or when correctness depends on exact semantics such as:

- expressions, statements and pattern behavior;
- type/coercion and trait boundaries;
- attributes and conditional compilation;
- destructors and object lifetime;
- ABI/calling convention questions;
- undefined behavior and unsafe boundaries;
- concurrency or platform-specific semantics documented by the language.

The Reference is the semantic authority within its documented scope; a blog post, compiler accident or framework convention does not override it.

## 3. Use Rust API Guidelines for public design

After the Book, read `rust-api-guidelines` for public API quality: naming, conversions, traits, type safety, flexibility, documentation, future compatibility and predictable behavior.

Treat the guidelines as API design practice, not as a substitute for the Reference.

## 4. Study The Rustonomicon before consequential unsafe work

The bundled `rust-nomicon` source is advanced material for unsafe Rust. Read the relevant sections before implementing or reviewing unsafe abstractions involving:

- aliasing and validity;
- uninitialized memory;
- layout and ownership tricks;
- drop checking and exception/panic safety;
- atomics and concurrency;
- FFI and representation boundaries;
- `Send`/`Sync` or other unsafe traits.

For each unsafe block or unsafe implementation, write down the invariant that safe callers may rely on and the assumptions the implementation must maintain. Minimize unsafe scope and use Miri/sanitizers/fuzzing where they can exercise the risk.

## 5. Learn async/runtime semantics from the selected runtime

Tokio, async-std and other runtimes define task scheduling, timers, I/O, blocking boundaries and shutdown behavior outside the Rust language itself. For the runtime actually used by the project, understand:

- task ownership and cancellation;
- `Send`/`Sync` consequences across task/thread boundaries;
- blocking work and dedicated pools;
- channels/backpressure;
- timeout and graceful shutdown;
- pinning and stream/future behavior where exposed;
- tracing/instrumentation integration.

Do not spawn detached tasks with no owner or recovery path simply because spawning is cheap.

## 6. Learn Cargo and feature behavior

Inspect workspace membership, MSRV/toolchain, features, target platforms, build scripts, generated bindings and dependency policy. Test the feature combinations the product actually supports; code that builds under the default feature set may fail or change behavior elsewhere.

## 7. Learn diagnostics and verification

Use project-configured `cargo fmt`, `cargo check`, tests and Clippy. Add targeted tools according to risk:

- Miri or sanitizers for memory/undefined-behavior questions;
- fuzzing for parsers/protocol/unsafe boundaries;
- property tests for broad invariants;
- benchmarks for performance-sensitive code;
- `perf`, flamegraphs, heap/allocation tools and debugger/core dumps for runtime diagnosis.

## Completion questions

A Rust backend engineer should be able to explain:

- who owns each resource and when it is dropped;
- which claim comes from the Book versus the exact Reference;
- why a lifetime or trait bound is necessary rather than merely how to satisfy the compiler;
- what `Send` and `Sync` imply at each concurrency boundary;
- who owns every background task and how shutdown/cancellation works;
- what invariant justifies each unsafe block and which Nomicon/Reference rule applies;
- which feature/target/toolchain combinations were actually verified;
- which profiler/test can distinguish CPU, allocation, lock contention, blocking and async scheduling problems.
