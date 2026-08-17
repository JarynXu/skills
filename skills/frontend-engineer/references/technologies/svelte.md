# Svelte

Inspect the installed Svelte and SvelteKit versions before choosing syntax. Svelte's component and reactivity APIs have evolved; follow the mode and migration state already established by the project.

## Use the project's reactivity model

- Identify which declarations represent reactive state, derived values, effects, props, and ordinary JavaScript in the configured version.
- Keep derivations pure and represent external synchronization as an effect or lifecycle responsibility.
- Understand which reads establish dependencies and when updates are scheduled.
- Preserve ownership when passing values or bindable state across component boundaries.
- Do not mix legacy and current reactivity styles unless the repository has an explicit migration boundary.

When behavior is surprising, trace the compiler mode, dependency reads, ownership, assignment or mutation path, and component lifecycle before adding manual synchronization.

## Keep components declarative

- Express UI from current inputs and state rather than imperatively maintaining duplicate DOM state.
- Keep props, events or callbacks, bindings, snippets or slots, and context aligned with the project's version and conventions.
- Use bindings when ownership is intentionally shared, not simply to shorten event handling.
- Keep imperative element access narrow and lifecycle-safe.
- Preserve native semantics and approved accessible primitives.

## Choose shared state deliberately

- Keep transient state local to the component or feature that owns it.
- Use stores, context, or the project's current shared-state mechanism only when multiple boundaries genuinely coordinate the value.
- Avoid module-level mutable state for request-specific server rendering or independently mounted application instances.
- Keep server data and invalidation in SvelteKit or the project's data layer rather than creating a parallel client cache without a contract.

## Respect SvelteKit boundaries

When SvelteKit is present, determine which code runs during build, server load, form or action handling, client navigation, and hydration. Follow framework conventions for routing, data loading, invalidation, errors, redirects, progressive enhancement, environment values, and server-only modules. Do not import secrets or server dependencies into client-reachable modules.

## Effects and resources

Use effects and lifecycle hooks for subscriptions, observers, timers, browser APIs, and imperative libraries. Make cleanup symmetrical, handle remount and navigation, and prevent obsolete asynchronous work from overwriting current state.

## Verify Svelte behavior

Test user-observable state transitions, enhanced and non-enhanced command paths where supported, server and client execution, navigation, hydration, cleanup, and failure recovery. Consult current official Svelte and SvelteKit documentation for exact syntax, migration behavior, compiler guarantees, and deprecated APIs.
