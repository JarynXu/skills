# Framework learning tracks

Frameworks are specialization layers. An agent should first understand the language/runtime and the cross-language backend mechanisms in `languages.md` and `systems.md`, then load only the framework actually used by the project.

## How to learn a framework

For every framework, learn the same questions rather than memorizing annotations or recipes:

1. **Application lifecycle** — startup, shutdown, background work, resource ownership.
2. **Dependency/configuration model** — dependency injection, configuration binding, secrets, environment overrides.
3. **Request/concurrency model** — thread, event-loop, coroutine/task, cancellation and blocking boundaries.
4. **Data/transaction semantics** — transaction scope, ORM/session/unit-of-work behavior, lazy loading, retries, migrations.
5. **Protocol behavior** — routing, serialization, validation, errors, streaming, WebSocket/RPC behavior.
6. **Security** — authentication pipeline, authorization point, CSRF/CORS/session/token behavior and safe defaults.
7. **Testing** — unit versus container/context/application tests, test client/server semantics, dependency replacement and fixtures.
8. **Production operation** — health, metrics, tracing/logging, graceful shutdown, configuration inspection, deployment and diagnostics.

A framework abstraction never overrides the language, HTTP, database or distributed-system semantics underneath it.

## Bundled framework and specialization canon

Use these source IDs as deliberate entry points rather than searching the whole library blindly:

| Project evidence | Bundled source | Use it to learn or verify |
|---|---|---|
| Spring Framework | `spring-framework-docs` | container/DI, proxies/AOP, transactions, MVC/WebFlux, testing, integration semantics |
| Spring Boot | `spring-boot-docs` | auto-configuration, external configuration, web/data/messaging integration, testing, Actuator and production features |
| Quarkus | `quarkus-core-docs` | build/runtime lifecycle, Arc CDI, configuration, REST/reactive execution, virtual threads, transactions/Hibernate, testing, security, JFR/observability |
| Micronaut | `micronaut-core-docs` | DI/scopes/lifecycle, configuration, HTTP server execution, context propagation, shutdown, debugging and management |
| Ktor server | `ktor-server-docs` | application/DI lifecycle, request lifecycle, routing, auth/JWT, status/error handling, testing, telemetry and persistence integration |
| Django | `django-core-docs` | async/ASGI behavior, ORM/transactions, migrations, auth/security, caching, testing, logging and deployment |
| FastAPI | `fastapi-core-docs` | ASGI concurrency, dependency lifecycle, Pydantic boundaries, security, lifespan/background tasks, testing and deployment |
| SQLAlchemy | `sqlalchemy-core-docs` | Session/unit-of-work ownership, transactions/savepoints, AsyncSession concurrency, relationships/cascades and failure semantics |
| Celery | `celery-core-docs` | task idempotency/acks/retries, calling/routing, workers/shutdown, monitoring, security, configuration and performance |
| ASP.NET Core | `aspnetcore-core-docs` | hosting/DI/configuration, middleware/request pipeline, auth, testing, diagnostics, performance and deployment |
| EF Core | `efcore-core-docs` | DbContext lifetime, transactions, optimistic concurrency, query performance, diagnostics/metrics and testing strategy |
| Fastify | `fastify-core-docs` | request lifecycle/hooks, encapsulation/plugins, routes/request/reply, logging and error behavior |
| NestJS | `nestjs-core-docs` | application context, DI/provider scope/lifecycle, execution context, guards/interceptors/errors, security, testing and deployment |
| Gin | `gin-core-docs` | routing, middleware, binding/validation, request/response helpers, testing and deployment conventions |
| Tokio | `tokio-guides` | async/task ownership, shared state/channels, I/O, `select!`, streams, graceful shutdown, testing and tracing |

The source pack is an offline teaching baseline, not a version oracle. When behavior is version-sensitive, verify the project's installed version through lock/build files and its exact official documentation before changing code.

## JVM framework layer

### Spring Framework and Spring Boot

Use `spring-framework-docs` for the core container, beans/DI, AOP/proxies, transactions/data access, testing, MVC/WebFlux and integration semantics. Use `spring-boot-docs` for application configuration, auto-configuration behavior, data/messaging integration, web applications, security integration, testing and Actuator/observability.

Critical questions:

- Does the call cross the proxy boundary required for transaction/AOP behavior?
- Which bean scope and lifecycle owns a resource?
- Which work runs on servlet threads, reactive schedulers, virtual/platform threads, executors or coroutine dispatchers?
- What exactly makes a transaction begin/commit/rollback?
- Which auto-configuration is active and why?
- Which Actuator endpoints or metrics are exposed, and to whom?
- Is the test exercising plain code, a Spring slice, or the full application context?

Do not infer behavior from an annotation name; trace the configured runtime path.

### Quarkus

Use `quarkus-core-docs` after identifying the actual Quarkus platform/version and selected extensions. Quarkus deliberately shifts significant behavior to build time, so runtime intuition copied from a traditional reflection-heavy JVM stack can be wrong.

Critical questions:

- Which behavior is produced during augmentation/build time and which remains runtime behavior?
- What Arc CDI scope/interception boundary owns the component?
- Does REST/reactive work execute on an event loop, worker thread or virtual thread, and where can blocking occur?
- What is the actual transaction/Hibernate session boundary?
- Which native-image constraints are relevant to this deployment rather than hypothetical?
- Which Quarkus test mode is running and which external services are real, Dev Services, mocked or substituted?
- Which JFR/telemetry/management evidence can prove the production symptom?

### Micronaut

Use `micronaut-core-docs` for compile-time DI/configuration, bean scopes/lifecycle, HTTP server behavior, context propagation, shutdown, debugging and management. Then add the project's exact Micronaut Data/Security/etc. module docs when those modules own the behavior.

Critical questions:

- Which bean definition was generated and why is that candidate selected?
- What scope owns the state and when is it created/destroyed?
- Which executor/thread model handles the request and blocking work?
- How does context propagate across reactive/async boundaries?
- Which effective configuration/property source won?
- What does graceful shutdown wait for, and what can still be interrupted?
- Can the issue be proven from DI/debug logs or management surfaces before changing code?

### Ktor

Use `ktor-server-docs` for application structure, DI/resource lifecycle, HTTP request lifecycle, routing, auth/JWT, status handling, tests and OpenTelemetry. Kotlin coroutine semantics remain the lower-level authority for concurrency and cancellation.

Critical questions:

- Which application/plugin/resource lifecycle owns the dependency?
- Which coroutine scope/job owns request and background work?
- Where can blocking I/O escape into coroutine execution?
- Which routing/plugin phase transforms or rejects the request?
- How are auth failures and application exceptions mapped to responses?
- Does the test start the same application/lifecycle configuration used in production?

## Python framework and data layer

### Django

Use `django-core-docs` for async behavior, authentication, caching, database queries/transactions, migrations, security, testing, logging, performance and deployment guidance.

Critical questions:

- Is the deployment ASGI or WSGI and where can synchronous work block?
- What transaction behavior is provided by `atomic`, request wrapping and ORM operations?
- When does a QuerySet actually execute and what queries are generated?
- How are migrations ordered, reversed and deployed with mixed application versions?
- Which middleware, authentication and permission checks guard the request?
- What state is cached and what invalidates it?

Django's ORM convenience is not evidence of efficient SQL; inspect queries and plans for consequential paths.

### FastAPI / Starlette / Pydantic stack

Use `fastapi-core-docs` for async/concurrency, dependency injection, validation, security, background tasks, lifespan, testing and deployment. Remember that major semantics are provided by Starlette, Pydantic, AnyIO and the ASGI server.

Critical questions:

- Is a handler/dependency async because it performs non-blocking I/O, or is blocking work hidden inside it?
- What is created per request, per dependency scope or per application lifespan?
- What validation/coercion occurs at the Pydantic boundary, and what domain validation remains?
- How do cancellation, client disconnects and background tasks affect work lifetime?
- Which Uvicorn/Gunicorn worker/process model is deployed?
- Does the test use the same lifespan/dependency/runtime behavior as production?

### SQLAlchemy

Use `sqlalchemy-core-docs` when SQLAlchemy is actually present. Treat `Session`/`AsyncSession` as explicit unit-of-work and connection/transaction ownership, not as a generic repository implementation detail.

Critical questions:

- Who owns the Session and transaction lifetime?
- Is implicit autobegin behavior understood at the call site?
- Are savepoints/nested transactions being used for the intended failure boundary?
- Is an `AsyncSession` being shared concurrently where it must not be?
- What SQL/fetch/cascade behavior is generated and when does it execute?

### Celery

Use `celery-core-docs` for distributed task semantics rather than treating Celery as merely a function-call wrapper around a broker.

Critical questions:

- Is the task idempotent under retry/redelivery?
- When is the message acknowledged and what failure window follows from that choice?
- Which retry/backoff/time-limit behavior is application policy versus worker default?
- How are routing, prefetch/concurrency and worker shutdown configured?
- What monitoring evidence distinguishes broker backlog, worker saturation, task failure and dependency latency?

## .NET framework and data layer

### ASP.NET Core

Use `aspnetcore-core-docs` for hosting, dependency injection, configuration, middleware, request handling, minimal APIs/controllers, authentication/authorization, diagnostics, performance, testing and deployment.

Critical questions:

- What service lifetime owns this dependency: singleton, scoped or transient?
- Does `CancellationToken` propagate through the entire request and dependency path?
- Is middleware order correct for routing, authentication, authorization, exceptions and endpoints?
- Which configuration provider won for this key and is it reloadable?
- How does graceful shutdown affect hosted/background services and active requests?
- Which health/diagnostic/log/metric surface proves deployed behavior?

### EF Core

Use `efcore-core-docs` when EF Core owns persistence behavior. It complements ASP.NET Core guidance; it is not interchangeable with it.

Critical questions:

- What scope owns the `DbContext` and is it crossing unsupported concurrency boundaries?
- What transaction/savepoint behavior applies to this operation?
- Which concurrency token detects lost updates and how is conflict resolution handled?
- Is query shape causing N+1, cartesian explosion, over-fetching or unnecessary tracking?
- Which logging/diagnostic/metric evidence proves database-side versus client-side cost?
- Does the test use a real relational provider when relational semantics matter?

## Node.js framework layer

Node runtime semantics come first. Use `node-runtime-docs` for event-loop/process/stream/async context behavior, then load only the detected framework pack.

### Fastify

Use `fastify-core-docs` for lifecycle/hooks, encapsulation/plugins, request/reply behavior, routing, logging and errors.

Critical questions:

- In which lifecycle phase does this hook run and what can it safely mutate?
- Which encapsulation context owns the plugin/decorator/configuration?
- Is schema validation/serialization aligned with the actual route contract?
- What does Fastify log automatically versus what the application must correlate?
- Which error handler/hook owns the final response?

### NestJS

Use `nestjs-core-docs` for modules/providers/DI, provider scopes and lifecycle, execution context, guards/interceptors/exception filters, security and testing.

Critical questions:

- What provider scope owns mutable state?
- What execution context is active: HTTP, RPC, WebSocket or another transport?
- In what order do middleware, guards, interceptors, pipes/validation, handler and exception filters affect behavior?
- Is framework DI hiding a circular dependency or lifetime mismatch?
- Does the test instantiate plain providers, a testing module, or a real application server?

### Express and other Node frameworks

Express is still supported, but no Express offline pack is bundled yet because current official guidance is MDX-heavy. Use Node runtime canon plus the project's exact Express version documentation. Do not use Fastify or NestJS packs as a substitute for Express semantics.

## Go HTTP framework layer

Prefer understanding `net/http`, `context`, middleware composition, request-body/resource lifetime and concurrency before framework conventions.

When Gin is detected, `gin-core-docs` is the bundled specialization for routing, middleware, binding/validation, request/response helpers, tests and deployment. For Echo, Chi, Fiber or another framework, use the Go canon plus that project's exact official version docs rather than borrowing Gin behavior.

Critical questions for any Go HTTP framework:

- Does request cancellation/deadline propagate to database and remote calls?
- Is mutable state request-local, synchronized or accidentally shared?
- Who owns request/response body close/drain behavior?
- Which middleware order changes auth, recovery, logging, tracing or response behavior?
- Does binding/validation distinguish transport validation from domain invariants?

## Rust async service layer

Learn Rust ownership/concurrency semantics first, then use `tokio-guides` for async runtime behavior: task ownership, channels/shared state, I/O, `select!`, graceful shutdown, testing and tracing.

For Axum, Actix Web, tonic or another Rust service stack, verify framework APIs against the project's pinned version. Axum does not currently have a bundled pack because much of its authoritative guidance is Rustdoc/source-oriented and upstream `main` can represent unreleased behavior.

Critical questions:

- Which task owns this work and what cancels it?
- Is blocking work isolated from async executor threads?
- Which values must be `Send`/`Sync` and why?
- How is shared state synchronized without holding locks across inappropriate `.await` points?
- What graceful-shutdown signal reaches listeners, tasks and dependent resources?
- Which Tower/framework layer owns request transformation, timeout, auth or error mapping?

## Framework completion test

The agent should be able to trace one real request as:

```text
server/runtime admission
-> framework middleware/filter pipeline
-> authentication/authorization
-> parse/validation/serialization boundary
-> application/domain behavior
-> transaction and persistence
-> remote/asynchronous dependencies
-> response/error mapping
-> logs/metrics/traces
-> cancellation/shutdown/failure behavior
```

If the agent cannot explain where a framework abstraction begins and where language/runtime/database semantics take over, it has not learned the framework deeply enough.
