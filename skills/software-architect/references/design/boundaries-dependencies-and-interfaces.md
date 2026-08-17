# Boundaries, dependencies, and interfaces

Design boundaries around coherent responsibilities, authority, change, and operational consequences. A boundary is valuable when it constrains knowledge and change; a folder, process, or network hop alone is not an architecture boundary.

## Define building blocks as black boxes first

For every significant system, service, module, component, or library, state:

- Purpose and responsibilities.
- Owned decisions and authoritative data.
- Provided and required interfaces.
- Allowed dependencies and callers.
- Quality obligations and failure expectations.
- Owner and lifecycle.
- Known risks or unresolved boundaries.

Refine a black box into internal structure only when its complexity, risk, volatility, reuse, or implementation ownership requires it.

## Choose boundary drivers deliberately

Consider:

- Domain responsibility and invariants.
- Independent reasons to change.
- Data and policy authority.
- Security, privacy, safety, or fault isolation.
- Scaling, availability, deployment, or release needs.
- Team ownership and coordination cost.
- Technology or regulatory constraints.

Do not decompose directly from database tables, request chronology, organization charts, or nouns in a requirements document. Organizational boundaries affect architecture, but current reporting lines do not automatically represent the problem domain.

## Manage dependencies

Record both static and dynamic dependencies. For each consequential dependency, identify:

- Direction and purpose.
- Contract and authority.
- Temporal, data, behavioral, deployment, or release coupling.
- Failure propagation and recovery.
- Versioning and compatibility expectations.
- Whether a cycle or shared dependency is intentional.

Replacing a direct call with a message does not automatically reduce coupling. Shared schemas, ordering assumptions, coordinated releases, shared databases, and hidden temporal dependencies can preserve or increase it.

Keep stable policy and product behavior independent from volatile transport, framework, storage, and vendor details where the separation has a real change or testing benefit.

## Specify significant interfaces

For an internal or external interface, define only the detail needed for safe independent work:

- Purpose, consumers, provider, and owner.
- Operations, commands, queries, events, or data products.
- Semantic inputs, outputs, invariants, and authority.
- Preconditions, authorization, idempotency, ordering, and concurrency behavior.
- Success, validation, conflict, unavailable, and unexpected failure semantics.
- Compatibility, versioning, deprecation, and change process.
- Performance, availability, security, privacy, and observability obligations.

Keep interface and implementation distinct. Do not copy a transport schema into several documents; link to its authoritative contract and document architecture-level semantics and constraints once.

## Review boundary health

Investigate when:

- Multiple owners can change the same authoritative fact.
- A consumer must know another block's internals or database layout.
- Cycles force coordinated change or initialization.
- Cross-boundary commands bypass policy or validation.
- A shared library contains domain policy from unrelated owners.
- One component orchestrates unrelated domains or failures.
- Exceptions to dependency direction become routine.

Repair the smallest false boundary that restores clear responsibility. Do not split a cohesive system into distributed units merely to make a diagram look modular.
