# Concurrency and lifecycle contracts

Read this when an operation can outlive a call, several actors share state, or shutdown must account for work and resources.

## Distinguish the observable events

Admission, execution, result publication, cancellation request, termination, and cleanup are different events. Decide which event an API returns or waits for. Do not infer termination from a cancellation request, or full cleanup from the availability of a result.

For every owned activity, identify who starts it, requests stop, observes failure, and joins completion. Keep the ordinary API responsible for the coordination needed to deliver its guarantee. Callers should not need undocumented timing or an internal sequence of waits and closes.

If several callers can wait on one activity, define whether one caller's cancellation only ends its wait or also cancels shared work. One waiter's timeout must not silently change another waiter's result unless the contract explicitly gives it that authority.

## Make state transitions atomic enough

Model the states that affect behavior and the permitted transitions, including failure and shutdown. Establish where each transition becomes observable and which invariant it preserves. Choose synchronization around that invariant rather than around individual fields merely because they can race.

Keep callbacks and dependency calls outside a held lock when their permitted behavior could reenter or wait for the same owner. If a callback may run synchronously, the caller's state must already be ready for it. Do not rely on a scheduler order the contract does not provide.

Decide whether results and buffers are copied, immutable, borrowed, or transferred. State how long a borrowed value remains valid. A shallow copy does not detach referenced mutable objects.

## Bound and release what is actually owned

Define capacity over the resources retained by the component. A limit on workers alone does not bound an unlimited waiting queue; a limit on queued items may exclude expensive in-flight work. Choose the bound callers need and make admission/backpressure enforce it.

Shutdown should establish a clear admission boundary and an outcome for work already accepted. Choose draining, cancellation, or another policy according to the required behavior. Account for the activities using a dependency before releasing that dependency.

Make repeated stop, close, or cancellation calls have deliberate semantics. Preserve one terminal outcome and avoid duplicate release or completion notifications. If callers need a bounded wait, expose that choice without treating timeout as proof that the component has stopped.

## Verify lifecycle properties

Use controlled events, barriers, fake clocks, or suitable fault injection to expose consequential interleavings. Observe the state after the operation that promises the transition; a later helper must not accidentally perform the missing work and make the test pass.

Check the boundary at admission-versus-stop, cancellation-versus-publication, error-after-effect, and release-versus-in-flight-use where those races are relevant. Test substitute backends against the same externally meaningful outcomes while retaining backend-specific mechanisms needed to exercise the property.

Race detection and passing stress runs provide evidence for what they exercised. They do not establish absence of deadlock, correct terminal semantics, or all possible interleavings. State those limits without substituting disclaimers for a useful implementation guarantee.
