---
name: maintainable-design
description: Design, implement, refactor, and review maintainable code with coherent responsibilities, useful abstractions, explicit contracts, and clear state and ownership boundaries. Use from the start when writing new code or changing behavior, and when assessing existing designs. Preserve a stable mental model, make ordinary use easy through dependable defaults, and keep changes understandable from local context.
---

# Maintainable Design

Make the affected behavior understandable from a component's responsibility, its own state, and the contracts of its direct dependencies. Apply this while writing ordinary code as well as during design, refactoring, and review.

Keep the effort proportional to the task. A small change may need only a clear local decision and a focused check. Work within the requested scope and existing project conventions; do not turn every edit into an architecture exercise or default to a broad rewrite.

## Start with useful behavior

When a choice among plausible designs depends on user goals, project vocabulary, compatibility, or competing costs, use `design-judgment` if available to resolve that choice. Apply the result here through concrete responsibilities, contracts, ownership, and checks. This skill remains usable independently: establish the relevant goal and constraints before optimizing maintenance, and make any tradeoff with required behavior explicit.

Identify what callers need to accomplish and what the implementation should make dependable. Choose the responsibility, model, and contract that support that behavior before choosing mechanisms.

State the relevant preconditions, guarantees, invariants, and failure semantics. Include ownership, permitted interference, timing, and resource bounds when they affect correct use. A contract is an obligation the implementation must satisfy, not a description that makes an inconvenient implementation somebody else's problem.

Absorb avoidable coordination, validation, and lifecycle work into the component that owns it. When a limitation is real, make it explicit and actionable; first consider whether a better model or ownership boundary can remove the burden. Do not replace useful guarantees with warnings that require callers to reconstruct hidden internals.

## Put knowledge and responsibility together

Keep a business rule or invariant under a coherent owner with the state and decisions it governs, even if its implementation spans files. Separate domain knowledge from transport, storage, scheduling, and vendor mechanisms when they change for different reasons. Apply this at the level of functions, types, fields, and packages, not just directories.

Before a nontrivial split or reorganization, trace a representative business change grounded in the request, code, tests, or history through both the current and proposed structures. Compare which decisions must change together, where a maintainer must look, and which edits require coordination to prevent inconsistency. Use this evidence to choose the boundary; do not invent future requirements to justify it. A small local edit needs no separate analysis document.

Distinguish one-time migration work from recurring change burden. A many-file refactor is not itself shotgun surgery; investigate whether one evolving decision requires scattered, synchronized edits because its knowledge lacks a coherent owner. File count alone cannot establish this: a real contract change can legitimately affect several boundaries. Keep unrelated reasons to change separate, and retain or recombine cohesive code when splitting adds coordination without a compensating benefit.

Let an abstraction express a meaningful concept, invariant, or substitution boundary. A wrapper that merely renames calls, spreads one decision across layers, or requires callers to know the wrapped implementation may add work without adding a useful guarantee.

Make state ownership and transitions explicit. Model legal states and combinations instead of accumulating independent flags that admit impossible situations. Decide who can mutate or observe each value, whether returned references are shared or detached, and who owns cleanup and completion.

Use the same quality standard inside and outside an API. Convenient public use does not justify tangled internals; clean internals do not justify shifting bookkeeping to every caller. Keep internal helpers, state transitions, and failure handling cohesive enough to maintain locally.

For uncertain decomposition, abstraction, validation ownership, or invariant and composition boundaries, read [Foundations](references/foundations.md). It develops the reasoning model without prescribing a layer count or design pattern.

## Make contracts compose

Check both sides of an interaction: establish preconditions at the boundary responsible for accepting the value, and verify that the dependency's actual guarantees support its caller. Internal code can rely on an established invariant while its validity is preserved; do not repeat input checks at every helper merely because failure is imaginable. A new trust boundary, transformation, or state change may invalidate that guarantee and require validation or synchronization again. Matching types, method names, or an “internal” source label is insufficient.

Include partial effects, concurrent interference, completion, ordering, and retained resources where relevant. Individually correct components can still compose incorrectly. Put genuinely system-wide obligations at the composition boundary rather than making every leaf understand the entire application. Place error handling where it can enforce the failure contract, recover, clean up, or add useful context; propagate failures otherwise instead of disguising them as successful defaults. Judge a check, catch, or helper by the guarantee or clarity it supplies, not its syntax or use count.

Keep alternative backends behaviorally substitutable for the supported contract. For example, an in-memory replacement and a remote implementation must agree on meaningful identity, ordering, consistency, error, and lifecycle semantics that their callers rely on. If a difference matters, represent it as an explicit capability or contract distinction rather than a hidden backend branch in each caller.

For asynchronous work, cancellation, shutdown, or shared mutable state, read [Concurrency and lifecycle](references/concurrency-and-lifecycle.md). For a concrete Go boundary needing language-specific interpretation, use the narrow [Go application notes](references/go.md) alongside the project's applicable language guidance.

## Keep ordinary and advanced use coherent

Prefer reliable defaults and established conventions where they express the intended behavior. Add configuration when there is a real supported variation; each option adds states, interactions, and knowledge that somebody must maintain.

Keep simple and advanced use within the same mental model. Advanced controls should expose genuine choices without silently changing what success, ownership, cancellation, or completion means. Prefer ordinary language constructs and clear extension points over a new DSL or hidden registry without a demonstrated need.

Do not hide meaningful distinctions merely to shorten an interface. Good defaults remove avoidable choices while preserving the ability to express required behavior.

## Treat growing cognitive burden as feedback

During iteration, notice when a change requires tracking state across more modules, remembering more special rules, relying on implicit ordering, or repeatedly digging into lower layers. Treat that growth as a design signal: revisit the affected responsibility, abstraction, state model, or contract before appending another exception.

Examine the dimensions that matter to the change:

- Function flow: branching, nesting, jumps, and the conditions that must be held in mind together.
- State model: legal states, transitions, combinations, and invariants spanning operations.
- Coupling: which unrelated modules must change together and why knowledge propagates between them.
- Implicit dependencies: shared state, sequencing, configuration, ambient context, and hidden resource ownership.
- Use and maintenance: the concepts and exceptions callers and maintainers must understand simultaneously.

Judge improvement by reducing simultaneous information, exceptions, and dependencies while preserving required behavior. Fewer lines, extracted functions, more layers, or a lower metric do not by themselves establish improvement. Keep necessary domain complexity visible and organized.

Distinguish a tool's Cognitive Complexity score, which measures aspects of control flow, from this broader cognitive burden. Honor the project's metric and threshold where specified; do not impose a universal threshold such as 10 on other projects. A score can prompt examination, but the finding should explain the actual burden and consequence.

Make focused improvements within the related scope. If the needed correction exceeds the task, explain the concrete boundary and tradeoff rather than silently expanding the work.

## Verify the promised behavior

Inspect implementations and authoritative API semantics when needed to establish that a contract is real. Local reasoning depends on trustworthy boundaries; it is not a reason to avoid checking uncertain guarantees.

Choose checks for the changed risk: legal state transitions, composition assumptions, failure and partial effects, concurrent interleavings, ownership, or equivalent backend behavior. Exercise the actual mechanism when a substitute would remove the property being tested. After reorganization, retrace the selected change against the resulting structure and consumers; preserved behavior alone does not establish improved change locality.

Report the resulting behavior and useful verification with their limits. Do not turn tests into a claim that the design can never fail, or add mandatory paperwork to a simple change. Leave callers and maintainers with a clearer model and less unnecessary knowledge to reconstruct.
