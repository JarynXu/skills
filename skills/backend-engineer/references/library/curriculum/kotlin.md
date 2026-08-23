# Kotlin learning track

Kotlin backend work is not “Java with shorter syntax.” Learn Kotlin’s own semantics and idioms first, then learn how those semantics interact with the JVM, Java libraries, coroutines, and the chosen framework.

## 1. Learn the language from the specification

Use the bundled `kotlin-spec` source when exact semantics matter. The language specification is the authority for grammar, types, overload resolution, expressions, declarations and other language rules represented in that source.

Read the specification selectively at first; use it as the exact-reference layer when behavior is ambiguous. Do not try to memorize the whole formal grammar before writing ordinary services.

## 2. Learn official Kotlin conventions

Read `kotlin-coding-conventions/docs/topics/coding-conventions.md` end-to-end once. It covers organization, naming, formatting and idiomatic source layout from the Kotlin project itself.

Treat formatting as automation where possible. If the consuming repository configures ktlint, detekt, IntelliJ formatting or another code-style tool, that project configuration wins over generic library defaults.

Use the bundled code-style migration guide when an existing codebase intentionally moves between style baselines instead of reformatting opportunistically.

## 3. Learn Kotlin/JVM interop deliberately

A production Kotlin backend frequently crosses Java boundaries. Be able to reason about:

- platform types and nullability at Java interop boundaries;
- checked-exception differences;
- SAM conversions, Java annotations and reflection;
- JVM generics/type erasure and variance;
- data/value classes and serialization frameworks;
- bytecode/runtime behavior when framework proxies or instrumentation depend on it;
- Java collection mutability and Kotlin read-only interfaces;
- resource lifetime and `use`/`AutoCloseable` boundaries.

Do not import Java style rules mechanically into Kotlin. P3C and Google Java guidance are useful when writing Java in a mixed repository, not as the Kotlin language style authority.

## 4. Learn coroutines as structured lifecycle management

For coroutine-based services, understand job hierarchy, cancellation, exception propagation, dispatcher selection, blocking boundaries, timeouts, flows/channels and structured concurrency. Every launched coroutine needs an owner and a termination path.

Framework scopes are lifecycle contracts. Do not create unmanaged global scopes or hide blocking calls inside coroutine code merely because a function is marked `suspend`.

Use the exact kotlinx.coroutines version documentation used by the project for operational details; the offline language specification does not define that library.

## 5. Learn the actual framework

For Spring Boot, Ktor, Micronaut, Quarkus or another framework, study the project’s installed version and specifically verify:

- dependency injection and lifecycle;
- proxy/open-class behavior;
- transaction boundaries;
- serialization and nullability;
- coroutine integration and blocking pools;
- authentication/authorization;
- configuration binding;
- tests and application context behavior.

## 6. Learn diagnostics and build evidence

Use the project’s Gradle/Maven wrapper and configured analyzers. For JVM production diagnosis, be able to use JFR, `jcmd`, thread dumps, heap histograms/dumps, GC logs and a profiler. Kotlin source syntax does not remove JVM resource, thread, allocation or class-loading behavior.

## Completion questions

A Kotlin backend engineer should be able to explain:

- which rule comes from Kotlin semantics and which from JVM or framework behavior;
- where nullability can be weakened by Java interop or serialization;
- who owns each coroutine and how cancellation reaches it;
- which calls can block a dispatcher/thread;
- how transactions behave across suspend/framework boundaries;
- which formatter/analyzer defines local style;
- which JVM evidence would distinguish CPU, allocation, GC, lock/thread and I/O problems.
