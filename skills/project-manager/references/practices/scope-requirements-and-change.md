# Scope, requirements, and change control

Use this reference when project/product boundaries, deliverables, requirements, backlog content, acceptance, scope creep, or material change decisions affect commitments.

## Separate product scope from project scope

**Product scope** describes capabilities, behavior, quality and constraints of the result. **Project scope** describes work required to create, validate, transition and close the result. The two interact but are not identical.

A software capability may be small product scope but require substantial project work for migration, security approval, procurement, training, data conversion or operational transition. Conversely, refactoring may be project work that preserves product behavior.

## Establish a scope model

For consequential work, identify:

- intended outcomes and users;
- major product capabilities/deliverables;
- explicit exclusions;
- non-functional/compliance constraints;
- required migrations/integrations/data work;
- environments and operational transition;
- documentation/training/support obligations;
- acceptance criteria and authorities;
- contractual deliverables where applicable.

Trace major project deliverables to outcomes and acceptance. Avoid a scope list that cannot tell when a deliverable is accepted.

## Choose decomposition by control need

A predictive project may use a WBS to decompose deliverables/work until ownership, estimating, dependencies and control become manageable. A product team may use epics/features/stories or another backlog hierarchy. A hybrid project may use both at different layers.

Good decomposition:

- preserves deliverable/outcome relationships;
- exposes integration and external dependencies;
- gives a clear owner;
- supports estimating/forecasting;
- avoids mixing status and structure;
- stops before administrative detail exceeds decision value.

A WBS is not a schedule. A backlog is not automatically a project baseline.

## Requirements and acceptance

For material requirements record enough to understand:

```text
source/stakeholder
+ user/business need
+ behavior/constraint
+ priority or contractual status
+ acceptance evidence
+ owner/authority
+ dependencies/assumptions
```

Distinguish requirement discovery/refinement from formal scope change. In adaptive product work, backlog refinement may alter detailed scope continuously while project-level outcome, funding or milestone commitments remain governed separately.

## Classify change before controlling it

A changed item may be:

- clarification of existing intent;
- defect correction;
- newly discovered necessary work to meet an existing requirement;
- reprioritization inside an adaptive scope envelope;
- substitution/trade within delegated tolerance;
- true addition/removal/change to an approved commitment;
- external/regulatory/contractual change.

Do not create formal change bureaucracy for every refinement. Do not hide a real commitment change inside “backlog grooming.”

## Impact analysis

For a material change, analyze at least:

```text
value/outcome
scope and acceptance
schedule/dependencies
cost/funding
resources/capacity
quality/security/compliance
technical/operational risk
contracts/procurement
transition/support
benefits and opportunity cost
```

Include “do nothing” and defer/reduce/substitute options where useful. State uncertainty and assumptions rather than presenting false precision.

## Change authority

The project manager prepares evidence and recommendation. The right authority approves or rejects according to governance. Once approved:

1. update authoritative requirements/scope;
2. update schedule/cost/resource forecasts and baselines if required;
3. update contracts/procurement where applicable;
4. update RAID and decisions;
5. communicate changed commitments to affected stakeholders;
6. trace implementation and acceptance;
7. preserve the superseded baseline/decision history.

Do not backdate a baseline to make variance disappear.

## Scope validation and acceptance

Validate deliverables progressively where possible rather than waiting for project end. Keep these distinct:

- technical verification;
- QA/testing evidence;
- compliance/security approval;
- operational readiness;
- customer/business acceptance;
- contractual acceptance;
- project closure.

A passed test suite cannot substitute for a named business acceptance decision. Conversely, business acceptance should not erase unresolved technical or operational risks; record the disposition and authority that accepted them.
