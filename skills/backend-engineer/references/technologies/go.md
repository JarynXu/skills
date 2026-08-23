# Go backend adapter

Use this adapter for Go services after identifying the module/workspace, Go version, HTTP/RPC stack, persistence layer, generated code, test conventions and deployment model. For broad learning, start with `../library/curriculum/go.md`.

## Establish project truth

Inspect `go.mod`, `go.work`, toolchain directives, `go.sum`, build tags, generated files, `//go:generate` directives, Make/task files and CI commands. Determine whether the service uses `net/http`, Chi, Gin, Echo, Fiber, gRPC, Connect or another framework, and whether persistence uses `database/sql`, pgx, sqlc, ent, GORM or custom adapters.

Prefer standard-library semantics over framework folklore. A router or ORM changes convenience and lifecycle, not the underlying context, goroutine, memory, network or transaction model.

## Guard Go semantic boundaries

Make goroutine ownership explicit: who starts it, how it stops, where errors go, what bounds its work and what happens during shutdown. Propagate `context.Context` through request-scoped calls; do not store it in long-lived structs or use it as an optional bag of unrelated values.

Check:

- cancellation propagation and whether downstream calls respect it;
- channel ownership and closure rules;
- data races, atomicity and compound operations over maps/structs;
- mutex scope, lock ordering and blocking while holding locks;
- worker-pool and queue bounds;
- timer/ticker cleanup;
- error wrapping and `errors.Is/As` semantics;
- zero values, nil interfaces/pointers/slices/maps and ownership of mutable buffers;
- escape/allocation behavior only when measured performance makes it relevant.

“Share memory by communicating” is a design heuristic, not a requirement to replace every mutex with channels.

## HTTP, RPC and data stack

For HTTP, verify middleware order, request-body limits, timeouts, streaming, cancellation, authentication context, panic recovery, response commitment and graceful server shutdown. For Gin/Echo/Fiber/Chi, map framework context/lifecycle back to standard Go semantics rather than retaining framework-owned objects after the request.

For gRPC/Connect, define deadlines, status/error mapping, interceptors, streaming cancellation, message limits, compatibility and generated-code freshness.

For `database/sql`/pgx/ORMs, make connection-pool bounds, transaction ownership, isolation, context cancellation, prepared/batched operations, scan/null semantics and migration ownership explicit. Tools such as goose, migrate or dbmate are only authoritative when the project adopts them.

## Verification stack

Use the Go toolchain first:

- `go test` for packages and integration suites exposed by the repository;
- `go test -race` when concurrency/shared-memory risk matters and the target/platform supports it;
- built-in fuzzing for parsers, protocol boundaries and invariant-heavy functions when appropriate;
- benchmarks for measured performance questions;
- `go vet`, `staticcheck` or `golangci-lint` only according to project configuration;
- `httptest`, real disposable dependencies/Testcontainers and protocol fixtures instead of over-mocking network/data semantics.

Use table tests when they improve coverage/readability, not as ritual. Avoid timing tests based on arbitrary sleeps; wait for observable conditions with bounded deadlines.

## Diagnostics and performance

Use Delve for interactive debugging in safe environments. Use `pprof` profiles for CPU, heap, allocations, goroutines, mutex/block contention and compare them to a representative workload. Use `go tool trace` for scheduler, goroutine, network and GC timing questions. Goroutine dumps are useful for leaks, deadlocks and stuck I/O. Escape-analysis/compiler output can explain allocation behavior after profiling identifies allocation as material.

Do not “optimize allocations” from intuition while the bottleneck is database/network queueing. Preserve a benchmark or workload oracle before changing pooling, buffer reuse or concurrency.

## Production consequences

Handle OS signals, graceful HTTP/RPC shutdown, worker cancellation, in-flight work, connection pools, queue drain and background goroutines. Expose bounded structured telemetry, health/readiness and effective non-secret configuration. Treat goroutine count, heap, GC, connection saturation and queue lag as diagnostic signals tied to workload rather than standalone health scores.

## Typical failure patterns to challenge

- goroutine leaks and fire-and-forget work without cancellation/error ownership;
- loop-variable/captured-state bugs in code targeting older language behavior or mixed assumptions;
- unbounded fan-out or worker creation;
- `context.Background()` used to sever required cancellation;
- HTTP clients without timeouts or response bodies not closed/drained appropriately;
- copying mutex-containing structs or unsafe shared maps;
- ORM/query abstraction hiding N+1 or transaction boundaries;
- generated protobuf/sqlc/ent artifacts not regenerated with the pinned tool version;
- benchmarks whose compiler optimizes away the work or whose environment measures the wrong layer.