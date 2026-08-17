# Component design

Design components around stable user, interaction, and domain responsibilities. A component is a boundary for behavior and change, not merely a way to shorten a file.

## Use the project's component layers

Map the repository's actual layers before adding one. Common responsibilities include:

- **Primitives:** accessible mechanics, tokens, and low-level interaction contracts.
- **Shared presentation:** product-agnostic composition with no hidden domain decisions.
- **Domain components:** reusable domain language, projections, and commands.
- **Feature composition:** workflow state, data coordination, and feature-specific behavior.
- **Routes or pages:** routing, top-level acquisition, state branches, and layout.

These labels are illustrative. Preserve a coherent existing system rather than forcing this vocabulary into the repository.

## Discover before creating

Before adding a component, style abstraction, or interaction pattern, inspect the approved design-system sources and their actual consumers. Search for semantic equivalents, wrappers, variants, feature-owned components, representative pages, stories, tests, deprecations, and extension rules. Do not conclude that a capability is missing from one filename or one component directory.

Map the current need to one of:

- adopt an existing contract;
- extend the same stable responsibility;
- create a new shared capability;
- keep the solution local because the responsibility is specific or still exploratory;
- reopen a design or architecture decision because the current system cannot express it honestly.

The mapping is an implementation decision, not a mandatory user-facing report. Surface it when uncertainty, migration scope, or authority requires a decision.

## Define APIs by intent

- Name inputs after what callers mean, not the order in which internals render.
- Keep required inputs truly required and make unsupported combinations unrepresentable where practical.
- Prefer composition or explicit variants over a growing set of interacting booleans.
- Expose events at the user's command boundary, not every internal DOM event.
- Keep transport objects and raw server envelopes out of reusable presentation APIs.
- Do not hide network calls, permissions, or irreversible commands inside apparently presentational components.
- Preserve accessible semantics when wrapping native elements or design-system primitives.

A good interface remains understandable if internal markup, styling, state libraries, or data transport changes.

## Place ownership deliberately

The owner of a value should be the nearest stable boundary that must coordinate it:

- Keep temporary interaction state local until multiple siblings or routes genuinely coordinate it.
- Let forms own in-progress user input; reconcile successful results through the server-state boundary.
- Derive values instead of storing synchronized copies.
- Put reusable domain decisions in the feature or domain layer, not in primitives.
- Use context or global state for true shared ownership, not to avoid passing a few explicit inputs.

Moving state upward increases the number of consumers coupled to its lifecycle. Do it only when coordination requires it.

## Extract at the right time

Extract when at least one stable benefit exists:

- The same behavior or visual contract has multiple real consumers.
- A complex responsibility can be named, tested, and changed independently.
- A feature boundary needs to hide volatile implementation details.
- Accessibility or interaction mechanics must be implemented consistently.

Do not extract solely because markup is long, two fragments look similar, or reuse might occur someday. Similar appearance can conceal different domain responsibilities; different appearance can share the same interaction primitive.

## Integrate with the design system

- Discover the approved primitives, tokens, variants, and extension policy.
- Compose existing primitives before creating page-local imitations.
- Extend the system at the narrowest reusable layer when a real capability is missing.
- Keep business statuses out of primitive variant names unless they are a stable cross-product semantic.
- Verify focus, disabled, invalid, pending, destructive, selected, expanded, and reduced-motion behavior where applicable.

Do not require a preferred library when the project already has a coherent accessible system.

## Carry the abstraction into consumers

Use this loop when creating or extending reusable capability:

```text
real consumer need
-> discover existing contracts and consumers
-> choose the narrowest stable owner
-> define the smallest sufficient API
-> connect the current consumer
-> inspect semantically eligible consumers
-> migrate within authorized scope or preserve an explicit adoption boundary
-> verify the shared source and affected consumers
```

Placement under `components/`, `shared/`, `ui/`, or another global-looking directory makes a component available; it does not prove reuse. A shared component must either have real consumers or own a stable foundational responsibility such as accessibility mechanics or a cross-surface semantic contract that justifies canonical placement before broader adoption.

Do not invent speculative props to serve imagined consumers. Do not keep a page-specific API in a global layer merely because the first implementation was extracted. Conversely, do not leave a stable shared behavior copied into pages after its common contract is known.

Always inspect related call sites before declaring a shared capability complete. Replace consumers only when they share the same semantic, interaction, state, and change contract. Similar markup or appearance alone is insufficient. When a safe migration would materially expand the authorized task, keep the boundary visible and do not claim project-wide adoption.

## Review component health

Investigate when a component:

- Requires callers to know its DOM or execution order.
- Accepts many boolean combinations with unclear validity.
- Fetches unrelated data or mutates global state unexpectedly.
- Mixes route orchestration, business rules, primitive mechanics, and styling policy.
- Cannot express loading, error, forbidden, or partial states without caller hacks.
- Is reused across domains only through conditionals for each consumer.

Repair the smallest ownership boundary that removes the false coupling. Avoid replacing one large component with many fragments that still share the same tangled responsibility.

## Complete the component change

Before claiming the affected scope complete, verify that:

- the current surface uses the selected existing or new contract;
- intended consumers in scope import, instantiate, or compose the canonical source rather than parallel imitations;
- the component API reflects shared intent rather than one page's internal layout order;
- excluded lookalikes have a real contract difference;
- changed consumers preserve behavior, content, accessibility, responsive layout, state handling, and tests;
- obsolete copies or compatibility layers are removed only after no supported consumer depends on them;
- deferred eligible consumers and migration risks are reported without calling the whole project consistent.
