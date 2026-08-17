# Project orientation

Understand enough of the product and repository to make the requested decision safely. Orientation is breadth-first and task-directed; it is not a requirement to read every file.

## Build the product map

Establish:

- What problem the product solves and for whom.
- The primary user journeys, roles, decisions, and irreversible actions.
- What is implemented, incomplete, deprecated, experimental, or known to be broken.
- Which systems own business rules, persisted facts, identity, permissions, and integrations.
- Which environments and hosts are supported: browser, desktop shell, extension, embedded view, mobile web, or another target.

Prefer durable evidence over names and screenshots. Useful sources include product definitions, architecture decisions, repository instructions, issue history, release notes, tests, runtime behavior, and enforced backend contracts. Resolve conflicts by checking which source still matches the running system.

## Map the repository

Start at the highest-value entry points:

1. Repository instructions and project knowledge directories.
2. Root manifests, workspace configuration, lockfiles, build and test commands.
3. Application entry points, route definitions, layouts, feature directories, shared UI, API clients, stores, localization, tests, and host bridges.
4. Recent decisions and changes near the task boundary when history is available.
5. Representative vertical slices from route to data source and test.

Record a compact map rather than a file inventory:

| Concern | Locate | Why it matters |
|---|---|---|
| Product | definitions, workflows, permissions | establishes intended behavior |
| Runtime | app entries, routes, host entries | establishes execution paths |
| Data | clients, schemas, caches, stores | establishes authority and state |
| Interface | design system, tokens, components | establishes interaction dialect |
| Quality | tests, lint, types, builds, CI | establishes proof and baseline |
| History | decisions, migrations, recent changes | explains intentional constraints |

## Activate the relevant knowledge

Infer the active stack from evidence, not filenames alone:

- Runtime and framework versions from manifests, lockfiles, installed metadata, configuration, and imports.
- Rendering mode from entry points and deployment configuration.
- Styling and component conventions from actual dependencies and representative components.
- State, data, form, validation, localization, testing, and host technologies from their integration boundaries.

Classify each relevant area as:

- **Known and confirmed:** current understanding matches project evidence.
- **Known but version-sensitive:** inspect current official documentation before relying on remembered behavior.
- **Unfamiliar:** learn the mental model and local usage before editing.
- **Unclear or contradictory:** investigate until the ambiguity no longer changes the implementation decision.

Read only the matching technology references. Do not load unrelated framework guidance.

## Learn the project dialect

Inspect several coherent examples, including one with tests and one that handles failure or state transitions. Learn:

- Naming, module boundaries, dependency direction, and export policy.
- Component composition, state ownership, data access, errors, styling, and localization.
- Test granularity, fixtures, assertions, and supported verification commands.
- Which conventions are documented, consistently practiced, or merely historical residue.

Do not infer a convention from one file. Prefer patterns repeated across healthy, recently maintained paths and reinforced by tooling or documentation.

## Go deep along the task path

After the broad map is stable, trace only the relevant vertical slice:

```text
user entry → route or host → feature → state/data boundary → authoritative system
           → interaction states → tests and runtime verification
```

Expand outward when the change touches a shared contract, reused component, cross-route state, locale, role, or host capability.

## Orientation checkpoint

Begin implementation when you can explain:

- The user outcome and the product fact being changed.
- The relevant execution and data path.
- The local architectural and code conventions.
- The stack knowledge that is active and any gaps still requiring research.
- The verification path and the boundaries that cannot currently be tested.

If one of these is unknown but cannot affect the decision, state the assumption and proceed. If it can materially alter behavior or architecture, resolve it first.
