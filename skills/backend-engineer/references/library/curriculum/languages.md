# Language learning tracks

A backend engineer should learn each language through **semantics -> runtime/resource model -> idioms and API design -> framework behavior -> tooling/diagnostics**, not by memorizing syntax or one company's style guide.

## Detailed tracks

- [Go](go.md) — language specification and memory model, Effective Go with its age caveat, Go Proverbs, Google/Uber production guidance, diagnostics.
- [Java and JVM](java-jvm.md) — Java/JVM semantics, P3C and Google conventions, API/concurrency judgment, Spring behavior, build/test/JFR diagnostics.
- [Kotlin](kotlin.md) — official Kotlin specification, conventions, JVM interop, coroutines/runtime behavior, framework use.
- [Python](python.md) — Python/CPython semantics, PEPs, typing, asyncio/process models, Django/FastAPI, profiling and tracing.
- [C# and .NET](csharp-dotnet.md) — C# standard semantics, CLR/resource lifetime, conventions, ASP.NET Core, data access and runtime diagnostics.
- [Node.js and TypeScript](node-typescript.md) — event loop/process/I/O semantics, TypeScript static contracts, production practice, framework lifecycle, profiling.
- [Rust](rust.md) — Rust Book, Reference, API Guidelines, Rustonomicon/unsafe invariants, async runtimes, Cargo and diagnostics.
- [C and C++](c-cpp.md) — exact standard/compiler/ABI context, ownership/lifetime, undefined behavior, concurrency, native API boundaries and sanitizers/debuggers.

## Cross-language rules

Regardless of language, complete the same learning layers:

1. **Normative semantics.** Know what the language/runtime actually guarantees and which behavior is implementation-specific.
2. **Resource and concurrency model.** Know ownership, lifetime, cancellation, synchronization, process/thread/task behavior, and shutdown.
3. **Idiomatic API design.** Learn the official/ecosystem conventions after semantics, and distinguish them from organization style.
4. **Project truth.** Read formatter/linter/compiler/build configuration, supported versions, package/dependency rules, generated-code boundaries, and repository instructions.
5. **Framework semantics.** Learn the real framework version's DI/lifecycle/transactions/security/serialization/testing behavior rather than annotation/decorator folklore.
6. **Quality evidence.** Use language-appropriate unit/integration/property/fuzz/concurrency tools according to the failure mode being proved.
7. **Diagnostics.** Know how to gather CPU, memory/allocation, GC/runtime, thread/task, lock, network, database and crash evidence without guessing.

## Authority order

When sources disagree, use this order as a default:

```text
project/repository rules and configured automation
> accepted product/architecture contracts
> language/protocol/runtime specification
> official framework/tool guidance for the installed version
> adopted organization conventions
> mature community/industry practice
> generic skill defaults
```

A language track is not complete when an agent can merely produce compiling code. It is complete when the agent can explain which rule comes from semantics, which from the framework, which from project policy, which is a convention, and what evidence would prove the behavior in the actual environment.
