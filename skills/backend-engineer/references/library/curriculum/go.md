# Go learning track

Go is a good example of why this library uses a **teaching sequence** rather than a bag of famous links. A capable Go backend engineer needs exact semantics, idiomatic taste, modern engineering decisions, and runtime diagnostics.

## 1. Establish exact semantics

Read the bundled sources from `go-language` first when correctness depends on language behavior:

- `doc/go_spec.html` — the current Go language specification.
- `doc/go_mem.html` — the memory model and synchronization guarantees.
- `doc/godebug.md` — compatibility/debug settings that matter when runtime behavior changes across releases.

The memory model is essential before reasoning about goroutines, channels, atomics, mutexes, publication, or races. “It worked in my test” is not a concurrency guarantee.

## 2. Learn idiomatic Go, with historical context

Read `go-official-guides/_content/doc/effective_go.html` end-to-end once.

**Important caveat:** Effective Go is a foundational classic, but the Go project itself notes that it was written around the 2009 release and is not actively updated to teach later additions such as modules and generics. Treat it as an idiom primer, not the final authority on modern Go.

Then read:

- `_content/doc/code.html` for organization and code-writing conventions;
- `_content/doc/comment.md` for current doc-comment conventions;
- `_content/blog/package-names.md` for package naming and API surface thinking.

## 3. Internalize the design heuristics

Read `go-proverbs/README.md` or `proverbs.go` and learn the proverbs as prompts for judgment, not commandments. Examples such as “Don’t communicate by sharing memory; share memory by communicating” are useful questions to ask during design, but the correct synchronization mechanism still depends on ownership, workload, failure, and lifecycle constraints.

When a proverb and a concrete runtime requirement appear to conflict, the requirement and the memory model win.

## 4. Learn modern large-codebase decisions

Read the Google Go set in this order:

1. `google-styleguide/go/guide.md` — core style principles.
2. `google-styleguide/go/decisions.md` — specific decisions and trade-offs.
3. `google-styleguide/go/best-practices.md` — higher-level practices for maintainable codebases.

This set deliberately complements Effective Go. It covers decisions that arise in modern production code and should be compared with the consuming repository's formatter, lint and API conventions.

## 5. Compare another mature production guide

Read `uber-go-guide/style.md` after the official and Google material. It is useful for practical choices around interfaces, errors, synchronization, copying, initialization, time, testing and performance. When Uber and Google differ, identify whether the disagreement is semantic, stylistic, or organization-specific before choosing a side.

## 6. Learn diagnostics, not just coding

Read `go-official-guides/_content/doc/diagnostics.html`, then be able to use the project's real toolchain:

- `go test`, focused package tests, benchmarks and fuzzing;
- `go test -race` where the environment permits it;
- `go vet` and project-configured static analysis;
- `pprof` CPU, heap, allocation, block and mutex profiles;
- execution trace and goroutine dumps;
- escape-analysis/compiler diagnostics when allocation behavior matters.

## Completion questions

A Go engineer has not completed this track until they can answer from evidence:

- Who owns each goroutine and how does it stop?
- Which operations establish the happens-before relationships relied upon by correctness?
- How is `context.Context` propagated and cancelled without being stored as incidental global state?
- What is the boundary between a concrete type and an interface, and who actually consumes the abstraction?
- What happens when a channel blocks, a worker outlives its request, a dependency stalls, or shutdown begins?
- Which profile or trace would distinguish CPU, allocation, lock contention, I/O wait, and goroutine leakage?
- Which rule comes from Go semantics, which from project policy, and which is merely a style preference?
