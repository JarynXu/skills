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

## Review component health

Investigate when a component:

- Requires callers to know its DOM or execution order.
- Accepts many boolean combinations with unclear validity.
- Fetches unrelated data or mutates global state unexpectedly.
- Mixes route orchestration, business rules, primitive mechanics, and styling policy.
- Cannot express loading, error, forbidden, or partial states without caller hacks.
- Is reused across domains only through conditionals for each consumer.

Repair the smallest ownership boundary that removes the false coupling. Avoid replacing one large component with many fragments that still share the same tangled responsibility.
