# React

Inspect the installed React version and application framework before choosing APIs. Rendering, data loading, server and client boundaries, and supported compiler behavior may be controlled by the framework rather than React alone.

## Use the rendering model

- A render describes a UI snapshot for current inputs and state.
- Components should be pure with respect to rendering; external effects do not belong in render.
- State is associated with component identity and tree position. Keys participate in identity; they are not merely warning suppressors.
- Event handlers act on a particular render's values. Account for queued updates and stale closures according to the current API contract.
- Refs hold mutable values outside rendering. Changing a ref does not by itself request a render.

When behavior is surprising, trace identity, render timing, captured values, and the source that schedules updates before adding synchronization.

## Place state by ownership

- Keep state at the nearest stable owner that coordinates all consumers.
- Derive values during render when possible instead of storing synchronized copies.
- Use reducers or explicit state machines when transitions, not individual fields, are the core complexity.
- Use context for a true shared dependency or ownership boundary, not as a default escape from explicit inputs.
- Keep server data in the project's server-state or framework data layer rather than duplicating it into component state.

## Use effects for external synchronization

An effect synchronizes React state with something outside React, such as a subscription, imperative widget, timer, browser API, or network lifecycle not owned by the framework's data layer.

- Do not use effects to derive renderable values from other state.
- Make setup and cleanup symmetrical and safe across remounts or changed dependencies.
- Include every reactive dependency required by the effect's logic; redesign ownership instead of suppressing dependency evidence.
- Cancel, ignore, or supersede obsolete asynchronous work where races can occur.
- Keep user commands in event or action boundaries rather than effects triggered indirectly by state.

## Design components and hooks around contracts

- Keep component inputs focused on user or domain intent.
- Keep custom hooks focused on reusable stateful behavior with explicit inputs, outputs, and lifecycle.
- Do not hide unrelated network requests, global mutation, or command side effects behind an innocent naming surface.
- Preserve accessible native semantics and approved primitives.
- Review every consumer when changing context values, hook contracts, component identity, or shared state.

## Account for framework boundaries

Determine which modules run on the server, client, build system, edge, or native host. Keep environment-specific dependencies and secrets on the correct side. Follow framework-owned patterns for routing, data loading, metadata, errors, streaming, mutations, hydration, and caching rather than rebuilding them with generic component effects.

## Verify React behavior

Test user-observable transitions rather than component implementation details. Cover remount or key changes, pending and failure states, cleanup, repeated commands, navigation, and concurrency where relevant. Use current official React and framework documentation for APIs, compiler behavior, server features, and deprecated patterns; remembered version-specific guidance is not authoritative.
