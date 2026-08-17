# Product and UX modeling

Use product and UX evidence to determine what the design must make possible. Do not turn source reading into a document-production ritual; extract only the relationships that govern the requested decision and make each one affect a surface, state, flow, rule, or explicit open boundary.

## Establish source authority

Inspect the current sources that actually govern the scope, which may include product definitions, acceptance criteria, UX flows, existing designs, research, content rules, analytics, technical constraints, implementation behavior, and confirmed change decisions.

Keep consequential claims distinct:

- **Product fact or rule:** confirmed outcome, business object, permission, state, constraint, or acceptance boundary.
- **UX decision:** confirmed task structure, information organization, interaction, feedback, or recovery behavior.
- **Design-system rule:** approved reusable visual or interaction contract.
- **Technical constraint:** observed limitation or obligation that can change feasible realization.
- **Design assumption:** reversible condition adopted to continue.
- **Proposal:** candidate design choice awaiting the appropriate authority.
- **Conflict or unknown:** incompatible or missing information that cannot be safely collapsed.

An existing screen proves current appearance, not necessarily approved intent. A technical implementation proves feasibility and current behavior, not product authority. Resolve conflicts from evidence and responsible ownership.

## Build only the model the decision needs

Depending on scope, determine the relevant subset of:

- user goal, context, role, permission, and decision;
- business objects, important fields, relationships, lifecycle, and states;
- entry, progress, cancellation, return, success, failure, conflict, and recovery paths;
- information priority, content terminology, validation, disclosure, and irreversible consequences;
- loading, empty, no-result, unavailable, partial, stale, forbidden, offline, pending, and completed behavior;
- supported viewports, inputs, locales, hosts, and accessibility obligations;
- acceptance evidence and unresolved decisions.

Do not create a role matrix, flow, inventory, or trace table unless the number of relationships, risk, or handoff need makes that representation useful. Keep compact reasoning internal when no consumer needs the artifact.

## Infer hidden design work from behavior

Commands, conditions, permissions, async work, and failures usually imply more than a visible control. For every consequential action, ask:

```text
entry and discoverability
-> eligibility and preconditions
-> editable or selectable state
-> confirmation or validation
-> pending and cancellation
-> success and downstream consequence
-> failure, conflict, and recovery
```

Add only states that can occur or are needed to communicate a real boundary. Do not generate an exhaustive state catalog disconnected from the product model.

## Turn evidence into design decisions

Every retained input must have a downstream use:

- goals and priorities govern information hierarchy and primary actions;
- rules and permissions govern visibility, availability, validation, and feedback;
- object states govern surface variants and allowed commands;
- flow branches govern navigation, overlays, continuation, and recovery;
- content and data constraints govern labels, formatting, density, truncation, and pressure cases;
- technical constraints govern feasible realization and decisions that must be reopened.

If a source detail changes no design decision, does not support an audit claim, and is not required for handoff, do not materialize it merely to demonstrate that it was read.

## Manage traceability proportionately

Use stable source or requirement identifiers when several sources overlap, changes must propagate, a high-risk requirement needs proof, or another role must review exact coverage. Otherwise maintain a lightweight relationship between the governing source and affected design object.

When traceability is needed:

- each consequential requirement reaches a surface, state, reusable pattern, interaction rule, or justified `Not Applicable` result;
- each design object has a product, UX, system, or explicit proposal basis;
- partial coverage remains partial;
- changes trigger inspection of direct and necessary indirect consumers;
- unknowns do not become approved decisions to fill a table.

## Stop when the design can proceed honestly

Proceed when the current increment has enough evidence to determine its user goal, behavior, information, states, authority, constraints, and verification path. Continue investigation only when an unresolved point could materially change those decisions.

If the missing information is reversible and low risk, proceed with a visible assumption. If it changes product behavior, permission, irreversible consequence, accessibility, or a difficult-to-reverse direction, preserve the branch and obtain the smallest responsible decision.
