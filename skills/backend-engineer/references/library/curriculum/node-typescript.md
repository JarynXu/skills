# Node.js and TypeScript backend learning track

Learn Node backend engineering through **JavaScript runtime behavior -> Node process/I/O semantics -> TypeScript contracts -> engineering practice -> framework lifecycle -> diagnostics**. TypeScript types do not change Node's runtime or make untrusted input safe.

## 1. Learn the Node runtime first

Use `node-runtime-docs` for the exact server-side mechanisms that repeatedly cause production mistakes:

- errors and process-level failure behavior;
- async context propagation;
- streams and backpressure;
- HTTP/HTTP2 request and connection lifecycles;
- worker threads versus ordinary event-loop concurrency;
- process signals and shutdown;
- performance hooks, diagnostic reports and diagnostics channels;
- built-in test runner behavior when the project uses it.

For every asynchronous operation ask whether it is queued work, a promise continuation, libuv-backed I/O, thread-pool work, a worker thread, or another process. They have different saturation and failure behavior.

## 2. Understand event-loop ownership

Avoid the vague rule “never block Node”; identify what can actually monopolize or overload execution:

- synchronous CPU-heavy loops;
- expensive parsing/serialization/compression/crypto;
- unbounded promise concurrency;
- synchronous filesystem/process APIs on request paths;
- streams without backpressure;
- runaway timers/listeners;
- large object retention and queue growth.

A fast average response does not disprove event-loop stalls. Measure event-loop delay, CPU profiles, heap/allocation behavior and dependency latency.

## 3. Learn TypeScript as a static contract layer

Use the project's `tsconfig` as executable truth. Understand:

- strictness/nullability settings;
- structural typing and excess-property limitations;
- narrowing/discriminated unions;
- generics and inference;
- module/ESM/CommonJS boundaries;
- declaration/runtime mismatch;
- what `unknown`, `any` and assertions remove from the type checker.

External JSON, environment variables, database rows, messages and user input require runtime validation even when the consuming variable has a TypeScript type.

## 4. Learn style after semantics

Use the bundled Google JavaScript/TypeScript guidance for organization conventions and compare it with the repository's ESLint/formatter/type-check configuration.

Style automation wins for source form. The runtime and compiler configuration win for semantics.

## 5. Learn mature production practice

Use `node-best-practices` after the runtime model. The library intentionally keeps its canonical English rules rather than all translations so search results remain high-signal.

Study it by capability:

- project structure;
- error handling;
- testing and quality;
- security;
- performance;
- production operation;
- code style where it adds more than project automation.

Treat community guidance as hypotheses backed by experience, not normative Node specification.

## 6. Learn framework lifecycle from the selected framework

For Express/Fastify/Nest/Koa/GraphQL servers or serverless runtimes, establish:

- request lifecycle and middleware/interceptor ordering;
- dependency/singleton/request scope;
- error propagation and serialization;
- schema validation and authorization boundaries;
- startup/readiness/shutdown behavior;
- connection pools and client ownership;
- streaming/cancellation behavior;
- test harness semantics.

Do not introduce a framework abstraction because it is popular; use it where it owns a real responsibility.

## 7. Learn diagnostics and capacity

Be able to use project-approved tools to distinguish:

- event-loop delay from dependency latency;
- CPU hot paths from queueing;
- heap growth from high temporary allocation;
- listener/timer/resource leaks;
- socket/pool exhaustion;
- worker/thread/process saturation;
- retry storms and unbounded concurrency.

Useful evidence paths include Node inspector CPU/heap profiles, diagnostic reports, `perf_hooks`, process/resource metrics, Clinic-style tools when approved, OpenTelemetry, load tests and operating-system network/process evidence.

## Completion questions

A capable Node/TypeScript backend engineer can explain:

- what TypeScript proves versus what runtime validation proves;
- how this asynchronous work is actually scheduled and bounded;
- how backpressure travels through streams and queues;
- who owns each client/socket/pool/background task and how it closes;
- what happens on SIGTERM during in-flight work;
- how an error becomes a response, retry, process failure or operator signal;
- which profile or metric would distinguish CPU, event-loop, heap, I/O, pool and downstream failure.
