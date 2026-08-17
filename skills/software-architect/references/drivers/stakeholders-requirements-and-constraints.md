# Stakeholders, requirements, and constraints

Architecture begins with the concerns that make structural and conceptual decisions necessary. Establish those concerns without turning the architect into the product owner or treating every requirement as architecturally significant.

## Identify the entity and stakeholders

State the entity of interest, its environment, lifecycle stage, and decision scope. Identify stakeholders who build, use, fund, operate, secure, test, integrate with, audit, maintain, or are materially affected by the system.

For each relevant stakeholder, capture:

- The concern or outcome they need addressed.
- The decisions or views they need from architecture.
- Their authority and responsibility.
- The evidence by which they will judge the result.
- Conflicts with other concerns or constraints.

Names and job titles alone are not stakeholder analysis. Concerns drive architecture; attendance lists do not.

Stakeholder discovery does not establish project authority. A role suggested by a concern is not proof that the role exists or owns a decision. Apply the skill's general evidence, status, and ownership rules, and request confirmation when an assignment changes a decision or governance path.

## Extract architecturally significant requirements

A requirement is architecturally significant when satisfying or changing it is likely to affect system structure, interfaces, data authority, deployment, cross-cutting mechanisms, multiple teams, difficult-to-reverse commitments, or important quality attributes.

Inspect at least:

- Business-critical capabilities and end-to-end scenarios.
- External commitments, protocols, partners, and compatibility obligations.
- Data classification, ownership, retention, residency, and audit needs.
- Scale, latency, availability, recovery, security, safety, and operational expectations.
- Variability, portability, localization, accessibility, and lifecycle expectations when relevant.

Leave ordinary product details in their authoritative product definition. Reference them rather than restating them as architecture facts.

Normalize bundled source prose before assigning stable driver IDs. Model an atomic driver as one predicate over one explicit scalar or universally quantified scope, with one authority, state, violation condition, evidence method, and closure rule. A set of subjects is scope—not several drivers—when the same predicate applies uniformly and any violating member fails the whole claim; keep the enumerated subjects in that record or its evidence boundary. Split independent predicates or clauses that can be accepted, violated, owned, tested, or changed independently even when the source joins them with `and`. Sharing a user, component, deadline, or fixture does not merge separate capabilities or quality dimensions. Do not create one row per scoped subject, and do not create a driver merely to restate an exclusion, inventory item, or externally owned detail that does not affect an architecture decision or fitness claim.

## Classify constraints honestly

Distinguish:

- **Product constraint:** a confirmed limit on user-visible behavior, business rules, scope, or acceptance.
- **Technical constraint:** an environment, protocol, platform, installed asset, or compatibility condition that cannot currently be ignored.
- **Organizational constraint:** team topology, skills, ownership, budget, schedule, procurement, or operating model.
- **Regulatory or contractual constraint:** law, standard, certification, privacy, liability, or external agreement.
- **Preference:** a favored direction that remains open to alternatives.
- **Proposal:** a candidate architecture decision, not an input fact.
- **Assumption:** a condition relied upon but not confirmed.

Record the source, owner, negotiability, affected scope, and consequence of violation. Challenge constraints that are merely inherited preferences, but do not silently discard real ones.

## Resolve input quality

When requirements are missing or contradictory:

1. State which architecture decision cannot be made safely.
2. Ask for the smallest missing fact or decision that would unblock it.
3. If progress is still useful, preserve alternatives or choose a reversible probe under an explicit assumption.
4. Feed technical feasibility and consequence back to the product or owning stakeholder.
5. Keep product impact separate from the detailed technical response.

Architecture and requirements may evolve together. Do not demand a complete specification before all work, but do not use iterative delivery as permission to hide material assumptions.

## Maintain traceability

For consequential decisions, preserve this chain:

```text
Stakeholder concern
-> architecturally significant requirement or constraint
-> quality scenario or design problem
-> evaluated options
-> architecture decision
-> affected elements, interfaces, or concepts
-> validation evidence
```

Missing links are either open work or unsupported architecture claims. Mark them explicitly.
