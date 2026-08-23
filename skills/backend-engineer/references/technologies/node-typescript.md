# Node.js and TypeScript backend adapter

Use this adapter after identifying the Node.js runtime version, package manager/lockfile, module system, TypeScript configuration, framework, data layer, worker model and deployment target. For broad learning, start with `../library/curriculum/node-typescript.md`.

## Establish project truth

Inspect `package.json`, the pinned package manager/lockfile, workspace configuration, runtime/version managers, `tsconfig*`, lint/test/build scripts, ESM/CommonJS mode, framework bootstrap, generated clients/schemas and production start command. Prefer actual package scripts over generic `npm test` assumptions.

Determine whether the service uses Express, Fastify, NestJS, Koa/Hapi, GraphQL servers, serverless handlers, worker threads or background queues. Identify the ORM/query layer such as Prisma, TypeORM, Sequelize, Knex or direct drivers only when present.

## Guard runtime semantic boundaries

Reason explicitly about:

- event-loop blocking and synchronous filesystem/crypto/compression/CPU work;
- promise ownership, rejection and cancellation/AbortSignal propagation;
- bounded concurrency rather than unbounded `Promise.all` fan-out;
- streams and backpressure;
- process versus worker-thread isolation;
- AsyncLocalStorage/request-context lifetime;
- timer/socket/handle leaks that keep processes alive;
- ESM/CommonJS import, package exports and build/runtime differences;
- TypeScript erasure: compile-time types do not validate untrusted runtime input.

An `async` function is not automatically non-blocking. A successfully resolved promise does not prove downstream durability.

## Framework and data stack

For Express/Koa, inspect middleware order, async error propagation, request-body limits, proxy trust, response completion and shutdown. For Fastify, account for encapsulation/plugin lifecycle, schemas/serialization and hooks. For NestJS, verify provider scope, module graph, guards/interceptors/pipes/filters order, transport adapters and shutdown hooks instead of treating decorators as behavior guarantees.

For GraphQL, control authorization at resolvers/domain boundaries, query depth/complexity/cost, batching/N+1 behavior, persisted schema compatibility and subscription lifecycle.

For Prisma/TypeORM/Sequelize/Knex/direct drivers, inspect connection pooling, transaction lifetime, generated clients, migration ownership, query count/shape and runtime serialization. Never hand-edit generated Prisma/OpenAPI/GraphQL clients when the schema/generator is authoritative.

## Verification stack

Use the pinned package manager and actual scripts. Evidence may include:

- TypeScript compiler/typecheck and repository lint/format scripts;
- Node built-in test runner, Vitest, Jest or Mocha according to project convention;
- Supertest or framework-native injection for HTTP behavior;
- Testcontainers/disposable real services for database/broker/cache semantics;
- Pact/contract fixtures where consumers/providers require compatibility evidence;
- package audit/license/security tooling only when the project adopts or delegates it;
- built artifact/startup checks because TypeScript compile success does not prove runtime module/package behavior.

For timing/concurrency tests, wait for observable states with bounded deadlines; do not hide nondeterminism behind arbitrary sleeps.

## Diagnostics and performance

Use the inspector/debugger in safe environments. CPU profiles and flame graphs answer hot-code questions; heap snapshots/heap profiles answer retention questions but may contain secrets or user data. Monitor event-loop delay/utilization, active handles, GC/runtime metrics and outbound/database pool saturation. Node diagnostic reports can preserve process/native/runtime evidence after severe faults. Clinic-family tooling or equivalent profilers can be useful when available and authorized.

Use `--trace-*`, heap limits or runtime flags only to answer a specific hypothesis. Increasing heap size does not fix a leak; more worker processes do not fix event-loop-blocking code that saturates CPU.

## Production consequences

Verify signal handling, graceful server shutdown, in-flight requests, keep-alive/connection behavior, queue workers, background promises, database pools, structured logs/traces, health/readiness and process supervisor/container semantics. In serverless environments, reason about cold/warm reuse and do not assume process-local caches or background tasks are durable.

## Typical failure patterns to challenge

- blocking the event loop with CPU/sync APIs;
- unbounded parallel promises or missing AbortSignal/timeout propagation;
- middleware order or async error-handling gaps;
- runtime payload trusted because TypeScript compiled;
- N+1 GraphQL/ORM access;
- package script/build output differing from development execution;
- mixed ESM/CJS assumptions that fail only after packaging;
- process-local state treated as cluster/serverless shared truth;
- promise/background work surviving response completion only by accident;
- tests passing against mocks while actual driver/framework lifecycle behaves differently.