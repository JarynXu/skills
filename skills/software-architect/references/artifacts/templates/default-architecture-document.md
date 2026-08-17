# `<System>` Architecture

<!-- Replace placeholders, remove comments, translate heading labels to the artifact language while preserving their number, meaning, and order, keep the five ## sections, and omit unused optional ### blocks. -->

| Item | Value |
|---|---|
| Architecture state | `<current, target, transition, historical, or an explicit combination>` |
| Claim status | `<established, proposed, mixed, or project vocabulary>` |
| Authority | `<authoritative home, non-authoritative projection, or unresolved authority>` |
| Source basis and cutoff | `<source locations, revisions, and cutoff>` |
| Scope | `<covered system and concerns>` |
| Exclusions | `<material exclusions and specialist authorities>` |

## 1. Scope and status

`<Boundary, represented state, authority, source coverage, exclusions, and material limits.>`

## 2. Architecture drivers

| ID | Kind and state | Driver or scenario | Architecture question |
|---|---|---|---|
| `<DR-01>` | `<requirement, constraint, quality scenario, assumption, or open item>` | `<architecture-significant input>` | `<decision or design question it creates>` |

## 3. Proposed architecture

### Outcome and invariants

`<Selected architecture direction and the invariants needed to preserve it.>`

### Context, boundaries, and authority

`<Relevant elements, responsibilities, relationships, dependencies, and authority.>`

### Critical behavior and failure semantics

`<Runtime behavior whose ordering, consistency, concurrency, or failure handling shapes the architecture.>`

### Deployment and cross-cutting constraints

`<Deployment implications and architecture-significant security, resilience, observability, configuration, or operational constraints.>`

## 4. Consequential decisions

### `<D-ID>: <decision title>`

| Field | Content |
|---|---|
| Status | `<decision state>` |
| Decision authority | `<confirmed authority, proposed candidate, or ownership gap>` |
| Drivers | `<materially relevant driver IDs>` |
| Choice | `<selected direction>` |
| Credible alternatives | `<alternatives actually considered>` |
| Rationale | `<why the choice fits the drivers and evidence>` |
| Consequences | `<material benefits, costs, constraints, and residual risks>` |
| Revisit condition | `<evidence or changed condition that would reopen the decision>` |

## 5. Fitness, risks, and open items

| ID | Kind and state | Related drivers and decisions | Claim, risk, or open item | Evidence or closure condition | Ownership |
|---|---|---|---|---|---|
| `<FIT-01, R-01, or O-01>` | `<fitness, risk, or open state>` | `<materially relevant IDs>` | `<bounded item>` | `<evidence or condition that resolves it>` | `<confirmed owner, proposed candidate, or ownership gap>` |
