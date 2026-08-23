# Rust backend adapter

Use this adapter after identifying the Rust toolchain/MSRV policy, Cargo workspace/features, async runtime, web/RPC framework, data layer, unsafe/FFI boundaries and deployment target. For broad learning, start with `../library/curriculum/rust.md`.

## Establish project truth

Inspect `Cargo.toml`, workspace inheritance, `Cargo.lock` policy, toolchain files, features/default features, target-specific dependencies, build scripts, generated bindings, unsafe blocks, CI feature matrix and production binary/container configuration. Determine whether the service uses Tokio/async-std, Axum, Actix Web, Rocket, tonic or another stack, and whether persistence uses SQLx, Diesel, sea-orm or direct clients.

Feature selection can change the compiled program materially. Do not test one default-feature configuration and imply every supported target/feature set works.

## Guard Rust semantic boundaries

Make ownership/lifetime design serve actual resource and concurrency behavior. Check:

- `Send`/`Sync` boundaries and what crosses tasks/threads;
- cancellation/drop behavior of futures and resources;
- holding locks across `.await` and resulting contention/deadlock risk;
- blocking work on async executor threads;
- bounded channels/tasks/fan-out;
- pinning/self-referential or unsafe invariants only when genuinely necessary;
- panic versus recoverable error policy;
- `unsafe` contracts, aliasing, validity, FFI ownership/lifetime and unwinding boundaries;
- zero-copy/borrowing complexity only when it closes a measured need.

Memory safety does not guarantee deadlock freedom, bounded resources, logical correctness or safe external effects.

## Framework and data stack

For Axum, understand Tower layers/middleware order, extractors, state sharing, body limits and graceful shutdown. For Actix Web, verify worker/application-data ownership and async/blocking separation. For tonic, define deadlines/status mapping, streaming cancellation, message limits and generated protobuf compatibility. For Rocket or other frameworks, map framework state/lifecycle back to Rust ownership and runtime behavior.

For SQLx/Diesel/ORMs, inspect pool bounds, transaction lifetime, query compile/check modes, migration ownership, blocking versus async drivers and generated/schema assumptions. SQLx compile-time query checking is valuable evidence only when its schema/offline metadata is current.

## Verification stack

Use Cargo/project configuration:

- `cargo check`/build/test for the actual package/workspace/feature set;
- `cargo fmt -- --check` and `cargo clippy --all-targets` according to repository policy;
- doctests where public API documentation examples are contractual;
- property testing with proptest/quickcheck when invariants/input spaces justify it;
- Testcontainers or disposable real dependencies for integration semantics;
- `cargo nextest` only when the project adopts it;
- Miri for undefined-behavior questions in supported code, not as a universal test runner;
- Loom for carefully modeled concurrency interleavings where its model applies;
- sanitizers/fuzzing for unsafe/native/parser boundaries when the toolchain/target supports them.

Do not treat compiler success as proof of distributed, database, cancellation or resource semantics.

## Diagnostics and performance

Use structured `tracing`/OpenTelemetry when configured for request/task correlation. Use `perf`, platform profilers/flame graphs, heaptrack or allocator-specific tools according to the symptom. Use gdb/lldb for safe interactive/native/crash debugging. Inspect Tokio/task/runtime metrics where available to distinguish executor starvation, blocking work and dependency latency.

Benchmark with Criterion or project tooling when a stable comparative workload exists. Avoid optimizing clones/allocations from aesthetics; use profiles/benchmarks and preserve correctness.

## Production consequences

Verify graceful shutdown and dropped/cancelled futures, spawned-task ownership, pool/channel bounds, panic policy, signal handling, telemetry flushing, native/openssl/libc dependencies, target architecture and mixed-version/data compatibility. Static or musl builds can change DNS/TLS/native behavior; verify the deployed artifact rather than assuming portability.

## Typical failure patterns to challenge

- holding mutex/RwLock guards across `.await`;
- detached spawned tasks with no cancellation/error ownership;
- blocking CPU/filesystem work on executor threads;
- feature combinations not tested by the default build;
- `unsafe` or FFI code whose validity/lifetime contract is undocumented or untested;
- pool/channel/task fan-out without bounds;
- SQLx offline metadata/generated protobuf/bindings stale relative to source;
- panic propagation unexpectedly aborting a worker/process;
- benchmark improvements that trade correctness, latency tails or memory without measuring the whole service.
