# JVM backend adapter

Use this adapter for Java or Kotlin server-side work after repository evidence identifies the actual JDK, build system, framework, persistence stack, and deployment target. For broad learning, route through `../library/curriculum/java-jvm.md` or `../library/curriculum/kotlin.md` first.

## Establish project truth

Inspect the Maven/Gradle wrapper before relying on a system installation. Record JDK/toolchain version, language level, module/workspace structure, dependency-management/BOM strategy, annotation/code generation, test source sets, active profiles, packaging, container/runtime target, and framework version.

For Spring Boot, Quarkus, Micronaut or Ktor, identify which component owns HTTP/RPC entry, validation, security, transactions, persistence, messaging, scheduling and configuration. Do not infer behavior from annotations alone; framework proxies, build-time augmentation, reflection/native-image constraints and scope/lifecycle rules can change semantics.

## Guard JVM semantic boundaries

Reason explicitly about:

- Java Memory Model visibility, publication, `volatile`, monitor/lock and happens-before relationships;
- interruption and cancellation rather than swallowing `InterruptedException`;
- executor/thread-pool ownership, queue bounds and shutdown;
- virtual threads only when the deployed JDK/framework/database drivers support the intended blocking model;
- Kotlin nullability/platform types, coroutine scope/structured concurrency and Java interop;
- resource lifetime through try-with-resources / `use` and transaction/session ownership;
- class loading, reflection, serialization and native-image behavior where applicable.

A thread-safe collection does not make a compound workflow thread-safe. `@Transactional` does not prove a transaction applies to self-invocation, asynchronous callbacks or calls outside the proxy boundary.

## Framework and data stack

For Spring/Spring Boot, verify bean scope/lifecycle, proxy interception, transaction propagation/isolation, Security filter chain, MVC/WebFlux distinction, configuration binding, serialization, Actuator exposure and test-slice semantics. For Quarkus/Micronaut, distinguish build-time generated behavior from runtime reflection and check native-image constraints when native deployment is real. For Ktor, inspect coroutine/application lifecycle, plugins, structured routing and client/server engine configuration.

Persistence may use JPA/Hibernate, jOOQ, MyBatis, JDBC/R2DBC or framework data abstractions. Check query generation, fetching, transaction/session lifetime, locking, batching and schema migration behavior. Use the project's Flyway/Liquibase or other migration tooling instead of inventing a parallel mechanism.

## Verification stack

Prefer wrapper-driven project commands. Evidence commonly includes:

- compile/package plus the repository's `check`/`verify` lifecycle;
- JUnit 5/TestNG and AssertJ/Kotest according to project conventions;
- Testcontainers for database/broker semantics, WireMock/MockWebServer for protocol boundaries, Pact where consumer contracts require it;
- ArchUnit for architectural rules only when the project intentionally adopts executable architecture constraints;
- Checkstyle/Spotless, Error Prone, SpotBugs, PMD, NullAway or other configured analyzers;
- JaCoCo as coverage evidence, not as proof that assertions are strong;
- JMH only for controlled microbenchmarks whose workload represents the question.

For concurrency risk, use stress/repetition plus JVM-appropriate race/lock evidence; ordinary unit success does not prove memory-order or scheduling correctness.

## Diagnostics and performance

Choose tools from the symptom:

- `jcmd` for process/runtime commands, class/heap/native-memory/JFR operations supported by the runtime;
- JFR for low-overhead production-style event evidence;
- async-profiler for CPU, allocation and lock profiles where approved;
- thread dumps for deadlock, blocking, pool starvation and stuck requests;
- heap histograms/dumps for retention/leak questions, with sensitive-data handling;
- GC logs and runtime metrics for allocation/collector pressure;
- debugger only in safe environments; do not attach to production merely because the tool exists.

Correlate JVM evidence with database, network, queue and application telemetry before blaming GC or the JIT.

## Production consequences

Verify graceful shutdown, request/task draining, executor ownership, connection-pool limits, transaction timeouts, health/readiness, effective non-secret configuration, telemetry correlation, mixed-version compatibility and migration ordering. For containerized JVMs, inspect memory/CPU limits and runtime/container awareness rather than tuning from bare-metal assumptions.

## Typical failure patterns to challenge

- blocking calls hidden inside reactive/event-loop execution;
- N+1 ORM access or unintended eager loading;
- transaction annotations that do not intercept the actual call path;
- unbounded executors/queues or forgotten scheduled jobs;
- swallowed interruption/cancellation;
- static/global mutable state that fails under multiple instances;
- generated code or annotation processors out of sync with schemas;
- version upgrades that compile but change framework defaults, serialization, security or runtime behavior.