# Vue

Inspect the installed Vue version, build mode, router, state, data, and meta-framework conventions before selecting an API. Do not mix patterns from different major versions or composition modes by analogy.

## Use the reactive graph

- Reactive reads establish dependencies; writes notify dependent computations and rendering according to Vue's scheduler.
- Use computed values for pure derivation.
- Use watchers for effects or coordination that must occur when reactive sources change, not to maintain avoidable copies of state.
- Understand whether a value is reactive, a ref, a plain snapshot, or a destructured value before relying on updates.
- Preserve identity and avoid replacing or mutating values in ways the chosen project pattern cannot observe.

When updates are missing or excessive, trace which reactive value was read, where it was unwrapped, which computation owns it, and when the scheduler runs.

## Keep component communication explicit

- Treat props as inputs and emitted events or explicit model contracts as outputs.
- Avoid mutating ownership through shared objects merely because proxy mutation is possible.
- Use slots for caller-owned composition and scoped data when they preserve a clear responsibility boundary.
- Use provide and inject for stable shared dependencies in a subtree, not invisible feature-wide mutation.
- Keep template refs for imperative element or component access that cannot be expressed declaratively.

Follow project conventions for component naming, event naming, model bindings, script style, and type declaration.

## Design composables around lifecycle and ownership

- Give a composable one coherent reusable responsibility.
- Make reactive inputs and returned state explicit.
- Start subscriptions and external resources at the appropriate lifecycle boundary and release them reliably.
- Do not conceal unrelated global state or command side effects behind a utility-like interface.
- Keep server data in the project's query, store, or framework data mechanism rather than copying it into parallel local refs.

## Separate derivation from effects

Prefer computed derivation over watchers that write another reactive value. When a watcher is necessary, define its source, timing, cleanup, race behavior, and failure handling. Avoid broad deep observation when a precise dependency expresses the real contract.

## Respect application and server boundaries

Determine which code runs during server rendering, hydration, client navigation, build, and host execution. Avoid browser-only access during server execution. Follow router and meta-framework conventions for data loading, errors, head state, caching, and navigation guards. Treat hydration mismatches as ownership or determinism defects, not warnings to suppress.

## Verify Vue behavior

Test rendered user transitions, emitted commands, reactive updates, cleanup, navigation, and failure recovery. Use current official Vue and framework documentation for macros, typing, reactivity edge cases, server behavior, and deprecated APIs. Confirm exact behavior against the project's compiler and tooling rather than remembered syntax.
