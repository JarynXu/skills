# Foundations for local reasoning

Read this when choosing an abstraction or deciding whether a boundary carries enough information for correct use and change.

## Responsibility and information

A useful component owns a coherent decision or invariant. Its representation and mechanisms may change while callers continue to rely on its stated behavior. Grouping code by syntax or giving every operation its own layer does not establish that boundary.

Separate knowledge with different reasons to change. For example, a reservation rule should not need to know a database driver's retry behavior; the transaction boundary must still connect persistence outcomes to the rule's guarantee. Separation succeeds when each side has enough information to fulfill its responsibility, not when information disappears between abstractions.

## Preconditions, guarantees, and invariants

A precondition states what must be true before an operation. A guarantee states what a caller may rely on after the operation's specified outcome. An invariant is a property the owner must preserve across externally observable states or defined synchronization boundaries.

For a synchronous sequential operation, check that a caller establishes the precondition and that the resulting guarantee is strong enough for its next step. For concurrent operations, also establish what interference is allowed, which state belongs to whom, and when an observation is valid. A statement about a value at one instant is not automatically a guarantee for a later operation.

Separate failure classification from effects. A timeout may mean the caller stopped waiting while the effect is still pending or already committed. A usable contract gives the caller a meaningful next action: observe a result, retry idempotently, reconcile an uncertain outcome, or report a terminal failure. Choose mechanisms that make that action dependable.

## Ownership and composition

Ownership includes mutation, publication, lifetime, and cleanup, not merely which object stores a pointer. Returning a container with references may expose the owner's state even when the outer container was copied.

An invariant spanning multiple operations needs one responsible boundary. Locking each method separately does not make a read-then-write sequence atomic. Likewise, independent component tests do not establish the correctness of their composition.

For a replacement implementation, check the behavior callers actually depend on: accepted states, errors and partial effects, identity, ordering, lifetime, and resource limits. A weaker guarantee or stronger hidden precondition breaks substitution even when signatures match.

## Choosing the abstraction

Ask what callers can safely stop knowing because the abstraction exists. A bounded queue should own its admission and retained-work policy; a caller should not reconstruct the queue's internal counters to determine whether an accepted item will complete.

Choose a concrete model when it is cohesive. Introduce an interface, protocol, or configurable strategy when meaningful variation, ownership, or substitution requires it. Preserve domain distinctions that change behavior; collapse accidental distinctions that force callers to track mechanism details.

When complexity grows, compare the information needed before and after the proposed change. A helper extraction that preserves the same intertwined state may improve layout without improving the reasoning boundary. A small explicit state model can be more useful than several thin wrappers and scattered flags.
