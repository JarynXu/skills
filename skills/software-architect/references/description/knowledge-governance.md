# Architecture Knowledge Governance

Architecture knowledge stays useful only when readers can find its authority, distinguish status, and update it with the system. Governance should reduce ambiguity and drift without turning documentation into ceremony.

## Build a source-of-truth map

Identify where each kind of information is authoritative and who maintains it. Typical authorities include product definitions, architecture descriptions, ADRs, interface schemas, data catalogs, threat models, infrastructure definitions, operational runbooks, and executable code.

For fragmented or inherited systems, keep a source register containing:

- subject and authoritative location;
- confirmed owner or decision authority, proposed candidate, or ownership gap;
- covered system scope and architecture state;
- evidence status and last verification point;
- known conflicts, gaps, and planned resolution.

Do not silently choose among conflicting sources.

## Prefer semantic ownership over duplication

Store a fact where its responsible discipline can maintain it and link from other artifacts. Architecture should capture architecture-significant implications of an API, security control, product rule, or runbook without becoming a duplicate specification.

Use stable identifiers and shared terminology for systems, components, interfaces, decisions, risks, and requirements when traceability matters. Keep links navigable in the repository's normal review environment.

Treat generated documents, reports, and other bounded artifacts as projections by default. Record the source revision they represent, and update authoritative knowledge before regenerating them when an architecture fact changes. Their refresh instructions must point to source maintenance and regeneration, not direct editing of the projection. If no durable authority exists, disclose that gap and keep new claims task-local until authority is explicitly established. Promote an artifact to an authority only through an explicit governance decision that reconciles competing sources.

## Use an architecture repository only when useful

If no adequate structure exists, a small versioned set might contain an entry point plus concerns such as drivers, views, decisions, concepts, evaluations, and migration state. This is a semantic default, not a required folder tree. Adapt to repository scale and ownership; do not create empty placeholder documents.

Docs-as-code is valuable when architecture changes should share versioning, review, ownership, and automation with implementation. Other media remain valid when they are accessible, governed, and kept consistent.

## Make status visible

Distinguish verified current facts, approved decisions, proposals, assumptions, accepted exceptions, superseded material, and unresolved questions. Include version or date only where it helps readers judge applicability; do not use freshness metadata as a substitute for verification.

Retain important decision history. Archive obsolete navigation and duplicated explanations, but do not erase rationale needed to understand the present system.

## Define update triggers

Update or review architecture knowledge when changes affect:

- system boundaries, responsibilities, dependencies, or ownership;
- architecture-significant interfaces or data authority;
- quality goals, constraints, trust boundaries, or failure behavior;
- technology lifecycle, deployment topology, or operating model;
- accepted decisions, risks, exceptions, or migration stages;
- evidence showing that described behavior no longer matches reality.

Connect these triggers to the lightest effective workflow: change template, ownership rule, review check, automated fitness function, or periodic review for slow-moving external assumptions.

## Maintain knowledge through realization

During implementation and operation:

- review architecture-significant changes and new evidence;
- update decisions, views, interfaces, risks, and migration state;
- retire superseded mechanisms, temporary exceptions, and stale navigation;
- use runtime behavior, incidents, metrics, and team feedback to challenge architecture claims;
- revise governance when repeated exceptions reveal an unclear or impractical rule.

Keep this maintenance connected to ordinary delivery rather than postponing it to a documentation phase.

## Treat disagreement as a finding

When documentation and implementation differ, classify the discrepancy before editing either one. It may be an implementation violation, stale description, active migration, approved exception, or an emergent architecture that requires an explicit decision. Preserve the evidence and route resolution to the accountable owner.
