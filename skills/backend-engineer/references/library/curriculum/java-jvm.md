# Java and JVM backend learning track

A senior Java backend engineer needs four different kinds of knowledge: **Java/JVM semantics, idiomatic API design, production conventions, and framework/runtime behavior**. Do not collapse them into one coding manual.

## 1. Establish the language and runtime model

For the JDK actually used by the project, know the authoritative semantics of:

- types, overload resolution, generics, erasure and variance boundaries;
- exceptions, try-with-resources and resource lifetime;
- initialization, class loading and reflective behavior;
- the Java Memory Model: visibility, publication, final-field semantics, `volatile`, locks and happens-before;
- threads, executors, interruption and cancellation;
- serialization boundaries and compatibility;
- the runtime's GC, JIT and module behavior relevant to the deployed version.

The Java Language Specification is authoritative but its redistribution terms do not permit this public library to mirror it as ordinary open content. Use a lawfully obtained/current JLS for exact conformance questions; the bundled materials below teach practice rather than replacing the specification.

## 2. Learn a broad production discipline

Read the bundled Alibaba P3C material as a **production practice guide**, not as the Java language definition. Learn it by topic instead of memorizing every rule:

1. naming and constants;
2. formatting and object-oriented conventions;
3. collections and concurrency;
4. control flow and comments;
5. exceptions and logging;
6. unit testing and security;
7. MySQL/schema/index guidance;
8. engineering structure and layering.

When P3C says something that depends on a particular Java era, library version, organization policy, or database workload, validate it against the actual project and current platform.

## 3. Compare a narrower style authority

Read `google-styleguide/javaguide.html` after P3C. Google Java Style is intentionally narrower: it is mostly about source form, naming, ordering, formatting and documentation. It is useful for distinguishing **style rules** from **correctness and architecture rules**.

The project's formatter, Checkstyle, Spotless, Error Prone, compiler flags and repository conventions outrank either company guide when they are intentionally configured.

## 4. Learn API and object-design judgment

Know the ideas commonly taught by *Effective Java*: construction, immutability, equality/hash contracts, composition, generics, enums, lambdas/streams, methods, concurrency and serialization. The commercial book is listed in `restricted-canon.md`; do not reproduce it here.

For each API, ask:

- Can invalid state be represented?
- Is mutability necessary and who owns it?
- Are equality and identity semantics explicit?
- Are nullability and optionality represented consistently?
- Is the abstraction required by a consumer or only imagined?
- Does the public API leak framework, persistence or transport details unnecessarily?

## 5. Learn concurrency as semantics, not folklore

Before using `synchronized`, `volatile`, atomics, concurrent collections, executors, virtual threads, futures or reactive APIs, state:

```text
shared state
-> ownership
-> required visibility/atomicity
-> synchronization mechanism
-> cancellation and lifecycle
-> overload/backpressure behavior
-> evidence used to find races or stalls
```

*Java Concurrency in Practice* remains influential conceptual canon, but pair its reasoning with current JDK APIs and the deployed runtime.

## 6. Learn Spring behavior from the framework itself

Use the bundled `spring-framework-docs` after the language model is clear. Prioritize:

- IoC/DI container lifecycle and scopes;
- proxy-based behavior and where proxies do **not** intercept calls;
- transaction propagation, isolation and rollback rules;
- JDBC/data-access resource and exception semantics;
- validation, conversion and serialization boundaries;
- MVC/WebFlux request lifecycles;
- testing support and context management.

Then use `spring-boot-docs` for:

- configuration and property binding;
- auto-configuration and conditional behavior;
- web/data/messaging/security integration;
- Actuator, health and observability;
- test slices and application tests;
- production packaging and operational behavior.

Never infer transaction/security/lifecycle behavior merely from seeing an annotation.

## 7. Learn the normal engineering toolchain

Be able to use the project's Maven/Gradle wrapper and understand dependency mediation, scopes/configurations, generated sources and build profiles. Typical evidence tools include:

- JUnit 5, AssertJ, Mockito, Testcontainers and WireMock;
- Checkstyle/Spotless, Error Prone, SpotBugs and configured static analysis;
- JaCoCo where coverage evidence is useful;
- JMH for controlled microbenchmarks;
- JFR, `jcmd`, thread dumps, heap histograms/dumps and GC logs;
- async-profiler or another approved profiler for CPU/allocation/lock evidence.

## Completion questions

The Java/JVM track is complete only when the agent can distinguish:

- a Java/JVM semantic guarantee from a P3C/Google convention;
- object ownership from DI scope;
- a local method call from a framework proxy interception point;
- a database transaction from a distributed workflow;
- thread safety from mere use of a concurrent collection;
- a GC/JIT symptom from an application-level latency cause;
- a unit-test mock result from evidence that Spring, the database, serialization and deployed configuration actually integrate.
