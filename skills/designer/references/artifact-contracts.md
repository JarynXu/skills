# Optional design artifact contracts

Use these structures only when a real design decision, recipient, audit, or maintenance need requires a durable artifact. Do not create them merely because they are available. Adapt labels and fields to the project's existing authority and medium.

## Select an artifact by purpose

| Need | Useful artifact | Completion evidence |
|---|---|---|
| Several sources or versions govern the same scope | Source map | consequential claims can be traced to their current authority |
| High-risk or multi-source requirements need coverage proof | Trace map | every in-scope requirement reaches a design object or justified disposition |
| A large design-tool edit needs spatial coordination | Canvas plan | intended objects have validated destinations and no collisions |
| A shared source or requirement changed | Change-impact record | direct and necessary indirect consumers were inspected and resolved |
| Findings require repair and re-audit | Issue-closure record | changed design locations and revalidation evidence exist |
| A recipient needs implementation decisions | Handoff contract | recipient can act without guessing and knows what evidence must return |
| A formal review needs a durable result | Design audit | scope, evidence, findings, consequence, and readiness are explicit |

If the artifact has no recipient, decision, maintenance role, or downstream use, keep the reasoning task-local.

## Source map

```markdown
| Source | Authority and state | Applicable scope or revision | Consequential design use | Conflict or gap |
|---|---|---|---|---|
```

## Trace map

```markdown
| Requirement or rule | Source and state | Affected user/flow | Design object or reusable contract | Coverage | Evidence or open condition |
|---|---|---|---|---|---|
```

Use the project's coverage vocabulary. Otherwise use `Covered`, `Partially Covered`, `Not Covered`, `Not Applicable`, and `Blocked`. Partial and unverified coverage are not passes.

## Interface-system adoption map

```markdown
| Shared source | Stable responsibility | Intended consumers | Adopted consumers | Excluded lookalikes and reason | Deferred migration | Verification |
|---|---|---|---|---|---|---|
```

Use this only for a material design-system addition, migration, or audit. Do not require it for an ordinary component instance.

## Change-impact record

```markdown
| Changed decision or source | Direct consumers | Necessary indirect consumers | Required updates | Authority or scope boundary | Verification status |
|---|---|---|---|---|---|
```

## Issue-closure record

```markdown
| Finding | Consequence | Owning source or object | Required repair | Changed location or IDs | Reverification | Status |
|---|---|---|---|---|---|---|
```

Do not mark a finding closed because a recommendation was written. The changed design and evidence must exist.

## Canvas plan

```markdown
| Governing area | Logical group | Intended objects | Existing bounds or insertion point | Layout relationship | Status |
|---|---|---|---|---|---|
```

Create a canvas plan only when batch size, existing density, or tool behavior makes accidental overlap or misclassification likely. Prefer the current file's established organization over a universal page or zone list.

## Design audit

```markdown
# Design audit

Scope and reviewed revision:
Evidence used and unavailable:
Readiness:

## Findings

### <Finding>
- Severity:
- Design location:
- Governing requirement or system rule:
- Observed evidence:
- User, implementation, or maintenance consequence:
- Required resolution and authority:
- Verification condition:
- Status:
```

Report only evidence-backed findings. Do not create empty severity sections or a decorative numeric score.

## Handoff contract

```markdown
Recipient and decision to enable:
Governed scope and revision:
Confirmed design decisions:
Reusable sources and actual consumers:
Interaction, state, responsive, content, and accessibility constraints:
Implementation design space:
Dependencies, assumptions, conflicts, and open decisions:
Assets and source locations:
Expected implementation feedback and verification:
```

Materialize only fields needed by the recipient. The design source remains authoritative for design decisions unless the project explicitly establishes another authority.
