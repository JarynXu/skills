# Applying the contracts in Go

Read this only when Go constructs affect the changed ownership or lifecycle boundary. Use the project's supported Go version, actual APIs, and applicable backend guidance for language and library details. This appendix applies the skill's general reasoning model; it does not prescribe a concurrency architecture or require another installed skill.

- Distinguish a context cancellation request from completed work. Decide whether a context governs one caller's wait or the underlying activity, and expose completion when callers need to release dependent resources safely.
- For an owned goroutine, make start, stop, failure observation, and joining belong to a clear owner. Do not require ordinary callers to reconstruct an internal WaitGroup/channel protocol.
- For channels, define who closes, what closure signifies, and how multiple observers receive the result. Channel closure may signal publication or no more values; neither meaning automatically establishes that every associated resource has been released.
- For returned slices, maps, pointers, or structs containing references, decide whether ownership is shared, copied, borrowed, or transferred. Copying only an outer value may leave mutable representation exposed.
- Synchronize the invariant across the required operations. Individually protected reads and writes do not make a compound decision atomic. Avoid copying synchronization-bearing values after use or waiting for an activity while holding a resource it needs.
- Preserve error identity or classification that callers use. Define retry and partial-effect semantics; a non-nil error does not establish that nothing happened. Log where handling responsibility is owned while lower layers preserve the cause.
- Keep ordinary use within functions, methods, context, errors, and suitable typed values. Add interfaces at meaningful consumer or substitution boundaries; alternative backends must honor the same relevant guarantees.

Check exact semantics against the applicable [Go memory model](https://go.dev/ref/mem), [context package](https://pkg.go.dev/context), and [race detector guidance](https://go.dev/doc/articles/race_detector) when they matter. Use the project's existing verification commands. A clean race run does not by itself establish lifecycle correctness.
