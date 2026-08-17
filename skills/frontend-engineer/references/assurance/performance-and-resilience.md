# Performance and resilience

Optimize for supported user outcomes under realistic conditions. Measure before and after consequential changes; do not trade correctness, accessibility, or maintainability for an unobserved micro-optimization.

## Define the performance contract

Identify which experience is at risk:

- Startup, navigation, or route readiness.
- Visual stability and progressive rendering.
- Input response and long-running work.
- Data freshness and network completion.
- Memory growth during sustained use.
- Bundle, asset, or host-package size.
- Low-end device, slow network, offline, or constrained-host behavior.

Use project targets and current platform guidance when they exist. Select measurements that represent the real journey and environment rather than a convenient synthetic number.

## Find the dominant cost

Trace the critical path before changing code:

- **Delivery:** unnecessary dependencies, duplicate code, uncompressed assets, blocking resources, poor cache boundaries.
- **Rendering:** avoidable rerenders, expensive computation, excessive DOM, layout thrashing, hydration or reconciliation work.
- **Data:** request waterfalls, overfetching, duplicate queries, ineffective caching, large serialization, missing cancellation.
- **Interaction:** synchronous work on the main thread, uncontrolled event frequency, expensive validation, animation layout work.
- **Lifecycle:** leaked listeners, timers, subscriptions, observers, retained caches, or host resources.

Profile representative behavior. A large module is not automatically the user-visible bottleneck, and memoization is not automatically a win.

## Improve without hiding state

- Split work at meaningful route or feature boundaries when it shortens the actual critical path.
- Preload only when intent and cache value justify the network cost.
- Virtualize large collections only when rendering volume is measured as a problem and accessibility remains sound.
- Cache deterministic expensive work at the narrowest valid lifetime.
- Keep stale data visible during refresh only when users can understand its age and act safely.
- Use optimistic behavior only when rollback and reconciliation preserve truth.
- Reserve layout space for predictable content and avoid replacing meaningful content with unnecessary spinners.

Do not convert failed or slow data into empty success merely to improve perceived speed.

## Design for failure

- Distinguish retryable transport failures, authorization, validation, conflict, unavailable dependencies, offline state, and unexpected faults.
- Time out, cancel, or supersede obsolete work according to project conventions.
- Contain failures at boundaries that preserve unaffected journeys.
- Preserve input and last safe context where recovery is possible.
- Prevent retry storms, duplicate commands, and repeated side effects.
- Degrade optional capabilities explicitly; do not silently degrade product guarantees.
- Keep observability useful without exposing diagnostic internals to ordinary product surfaces.

For third-party scripts and integrations, define loading, denial, timeout, failure, privacy, and removal behavior rather than assuming success.

## Verify the result

Compare the same representative journey, data shape, build mode, device class, and network conditions before and after. Check correctness and accessibility again after optimization. Record tradeoffs, remaining bottlenecks, and measurement limitations; do not generalize a local benchmark into a product-wide claim.
