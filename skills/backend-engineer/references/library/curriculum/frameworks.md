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

## Spring Framework and Spring Boot

Use the bundled Spring Framework material for the core container, beans/DI, AOP/proxies, transactions/data access, testing, MVC/WebFlux and integration semantics. Use Spring Boot material for application configuration, auto-configuration behavior, data/messaging integration, web applications, security integration, testing and Actuator/observability.

Critical questions:

- Does the call cross the proxy boundary required for transaction/AOP behavior?
- Which bean scope and lifecycle owns a resource?
- Which work runs on servlet threads, reactive schedulers, virtual/platform threads, executors or coroutine dispatchers?
- What exactly makes a transaction begin/commit/rollback?
- Which auto-configuration is active and why?
- Which Actuator endpoints or metrics are exposed, and to whom?
- Is the test exercising plain code, a Spring slice, or the full application context?

Do not infer behavior from an annotation name; trace the configured runtime path.

## Django

Use Django's official topic documentation for async behavior, authentication, caching, database queries/transactions, migrations, security, testing, logging, performance and deployment guidance.

Critical questions:

- Is the deployment ASGI or WSGI and where can synchronous work block?
- What transaction behavior is provided by `atomic`, request wrapping and ORM operations?
- When does a QuerySet actually execute and what queries are generated?
- How are migrations ordered, reversed and deployed with mixed application versions?
- Which middleware, authentication and permission checks guard the request?
- What state is cached and what invalidates it?

Django's ORM convenience is not evidence of efficient SQL; inspect queries and plans for consequential paths.

## FastAPI / Starlette / Pydantic stack

Use FastAPI's official material for async/concurrency, dependency injection, validation, security, background tasks, lifespan, testing and deployment. Remember that major semantics are provided by Starlette, Pydantic, AnyIO and the ASGI server.

Critical questions:

- Is a handler/dependency async because it performs non-blocking I/O, or is blocking work hidden inside it?
- What is created per request, per dependency scope or per application lifespan?
- What validation/coercion occurs at the Pydantic boundary, and what domain validation remains?
- How do cancellation, client disconnects and background tasks affect work lifetime?
- Which Uvicorn/Gunicorn worker/process model is deployed?
- Does the test use the same lifespan/dependency/runtime behavior as production?

## ASP.NET Core

Use Microsoft's official ASP.NET Core docs for hosting, dependency injection, configuration, middleware, request handling, minimal APIs/controllers, authentication/authorization, diagnostics, performance, testing and deployment.

Critical questions:

- What service lifetime owns this dependency: singleton, scoped or transient?
- Does `CancellationToken` propagate through the entire request and dependency path?
- Is middleware order correct for routing, authentication, authorization, exceptions and endpoints?
- Which configuration provider won for this key and is it reloadable?
- What does EF Core track and when is a query executed?
- How does graceful shutdown affect hosted/background services and active requests?
- Which health/diagnostic/log/metric surface proves deployed behavior?

## Node.js framework layer

Node runtime semantics come first. Express, Fastify and NestJS differ in routing, plugin/module lifecycle, injection, validation and error handling, but all still run on Node's event loop and stream/process model. The baseline offline library therefore treats **official Node runtime docs + mature Node backend practices** as mandatory and framework-specific docs as selected specialization.

When a project uses NestJS/Fastify/Express, inspect its installed major version and learn:

- request lifecycle and error pipeline;
- plugin/module/provider ownership;
- schema/runtime validation;
- async context and cancellation strategy;
- stream/backpressure behavior;
- graceful shutdown and process signals;
- test server/application lifecycle.

## Rust async web frameworks

For Axum, Actix Web, tonic or another Rust service stack, learn Tokio/runtime behavior before framework extractors/handlers. Understand task ownership, `Send`/`Sync`, blocking boundaries, graceful shutdown, state sharing, middleware/tower layers, request-body streaming and tracing.

The Rust Book and API Guidelines are the language/design baseline. Framework APIs should be pinned to the project's version because the Rust web ecosystem evolves faster than the language fundamentals.

## Go HTTP frameworks

Prefer understanding `net/http`, context, middleware composition, request-body/resource lifetime and concurrency before framework conventions. Gin, Echo, Chi, Fiber and similar frameworks primarily change routing, middleware, binding/validation and convenience APIs; they do not change the Go memory model or network failure semantics.

When a project uses one, load that exact framework/version's docs after the Go track. Do not introduce a framework into a standard-library service merely because the agent knows it.

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
