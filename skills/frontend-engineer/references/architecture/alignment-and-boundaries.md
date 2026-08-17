# Architecture alignment and boundaries

Frontend engineers must understand architectural intent well enough to implement it faithfully and recognize when local details create the same class of decision an architect would make. The difference is scope and authority, not rigor.

## Read architectural intent

Locate architecture decisions, diagrams, module rules, public contracts, platform constraints, and migration plans that touch the task. Extract:

- The responsibilities assigned to each layer or subsystem.
- Allowed dependency directions and integration boundaries.
- Sources of truth for data, identity, policy, and configuration.
- Required qualities such as availability, security, accessibility, latency, portability, or offline operation.
- Decisions already made, alternatives rejected, and conditions under which they should be revisited.

Treat architecture artifacts as constraints to understand, not shapes to imitate blindly. Verify that they still match current code and runtime behavior. When they do not, determine whether the code drifted, the document is stale, or a migration is in progress.

## Model responsibilities before folders

Choose boundaries around stable responsibilities and reasons to change. A typical frontend may distinguish:

- Route or host composition.
- Product features and domain projections.
- Commands and server-data access.
- Client-only interaction state.
- Shared product-agnostic UI.
- Accessible primitives and design tokens.
- Platform or native-host integration.

These are responsibility categories, not mandatory directory names. Follow the project's coherent organization. Do not reproduce backend services, database tables, API envelopes, or task chronology as the frontend's conceptual structure.

Keep dependency knowledge narrow:

- High-level product behavior should depend on stable contracts, not transport or framework internals.
- Shared presentation should not import feature-specific rules.
- Feature code should not reach through another feature's private modules.
- Host-specific capability should enter through an explicit boundary rather than scattered environment checks.
- External data should be translated and validated at a boundary before it becomes trusted UI state.

## Match decision authority to blast radius

| Decision | Usually act locally | Usually align or escalate |
|---|---|---|
| Naming and private extraction | reversible and contained | conflicts with enforced conventions |
| Component composition | preserves existing contracts | creates a new public component system |
| Local state placement | one feature, clear ownership | introduces a global store or cross-app protocol |
| Data projection | presentation-only and reversible | changes business meaning or authority |
| Dependency use | already approved and installed | adds a platform dependency or framework |
| Contract change | private implementation detail | affects API, persistence, other teams, or hosts |
| Migration | compatible local step | irreversible, cross-cutting, or multi-release |

Make local, reversible decisions when evidence is sufficient. Record meaningful rationale. Escalate when the decision changes product behavior, public contracts, ownership, security, data authority, deployment, or a difficult-to-reverse architectural direction.

## Handle missing or incomplete architecture

When no formal architecture exists:

1. Infer the current model from repeated healthy paths and runtime boundaries.
2. State the smallest set of invariants needed for the task.
3. Compare at least one alternative for a consequential decision.
4. Prefer a reversible change with explicit dependencies.
5. Record a durable decision only if future work needs the rationale.

Do not invent an enterprise architecture for a local change. Stop once the model no longer lies about current responsibilities and can safely absorb the requested behavior.

## Detect architecture drift during implementation

Pause and reassess when a change requires:

- Repeated imports against the intended dependency direction.
- The same business decision in multiple layers.
- Framework or transport details leaking through stable interfaces.
- New global mutable state for a local workflow.
- Page-level components coordinating unrelated domains.
- Multiple compatibility exceptions with no explicit migration boundary.

One exception may be justified; repeated exceptions usually indicate the boundary is wrong or the task is larger than initially scoped.
