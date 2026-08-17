# Handoff and assurance

Use assurance to prove that the requested design can be understood, implemented, and maintained. A report does not close a defect; a handoff does not prove that the recipient can act; a visually polished frame does not prove product or interaction correctness.

## Challenge feasibility while decisions are cheap

Bring engineering evidence into design before a realization hardens. Check as applicable:

- available data, authority, precision, freshness, permissions, and failure semantics;
- required commands, concurrency, cancellation, recovery, and irreversible effects;
- browser, host, input, assistive-technology, localization, and content constraints;
- existing architecture, frontend component system, dependencies, performance, resilience, security, and deployment boundaries.

Classify a mismatch before changing the design:

- **fundamental constraint:** the platform or authoritative system cannot provide the claimed guarantee;
- **missing capability:** the experience requires new API, component, infrastructure, or migration work;
- **cost or risk mismatch:** feasible realization has material cost, fragility, or operational consequences;
- **design gap:** a consequential state, rule, interaction, or content behavior is undefined;
- **implementation preference:** the current approach is merely inconvenient or unfamiliar;
- **design-system conflict:** approved intent and the current reusable language cannot both be preserved without a decision.

Preserve the user goal, show viable adaptations and tradeoffs, and route the decision to the owner with authority. Technical inconvenience does not authorize silent redesign; design intent does not make an impossible guarantee real.

## Freeze and review a definite candidate

For broad, high-risk, or handoff-critical work:

```text
complete candidate
-> freeze the reviewed revision
-> inspect structure and behavior
-> inspect visual and interaction quality
-> record evidence-backed findings
-> repair into a new candidate
-> repeat affected and global checks
```

Use lighter review for small, reversible changes. Do not add ceremony when local inspection can prove the result.

Evaluate the applicable dimensions:

- **product and UX coverage:** promised goals, flows, rules, roles, states, and exceptions reach design objects;
- **flow closure:** entry, continuation, cancellation, success, failure, recovery, and return are understandable;
- **interface-system adoption:** foundations are bound, reusable sources have real consumers, instances are current, and parallel copies are explained;
- **visual quality:** hierarchy, alignment, spacing, consistency, content, and pressure cases remain coherent;
- **interaction and accessibility:** commands, feedback, focus, input methods, semantics, motion, and recovery are defined;
- **responsive and host behavior:** supported constraints and adaptations are explicit and tested proportionately;
- **feasibility:** data, platform, architecture, assets, and implementation dependencies support the design;
- **handoff usability:** the recipient can make implementation decisions without guessing design-owned behavior.

Classify issues by consequence rather than cosmetic discomfort:

- **P0:** blocks the core task, creates unsafe or false behavior, or makes implementation indeterminate;
- **P1:** serious usability, accessibility, system-consistency, state, responsive, or feasibility defect;
- **P2:** material visual, content, or local consistency defect;
- **P3:** optional refinement that does not block safe use.

Do not convert `NOT VERIFIED` into a pass. A score cannot override a blocking defect.

## Close findings through changed design

A finding closes only when:

- the responsible design object or reusable source changed;
- affected consumers and related states were inspected;
- the repair was verified through the evidence appropriate to the claim;
- any product, technical, or authority dependency remains explicitly open rather than hidden;
- the new candidate no longer relies on the old finding's pass status.

Descriptions, comments, and issue rows can preserve risk but do not substitute for an implemented design change.

## Prepare a recipient-specific handoff

Create handoff material only when a real recipient needs it beyond what the maintained design source already communicates. Select the minimum information required for implementation, which may include:

- governed surface and flow scope;
- authoritative product and UX decisions plus unresolved assumptions;
- component, pattern, variable, style, and asset sources;
- interaction, validation, focus, loading, failure, recovery, and state transitions;
- responsive, content, data-format, localization, accessibility, and motion rules;
- fixed constraints versus implementation design space;
- technical dependencies, accepted adaptations, and decisions still requiring feedback;
- changed object identifiers, source revision, and verification evidence.

Do not restate every visible property that inspectable design metadata already provides. Annotate relationships and behavior that would otherwise be ambiguous.

The handoff must explain what evidence should return from implementation when feasibility, browser behavior, runtime data, accessibility, or performance can challenge the design. Update the authoritative design and interface-system sources after a cross-role decision; do not leave the outcome only in chat or code.

## Decide readiness honestly

Claim the requested scope ready only when:

- its blocking product, flow, state, accessibility, and feasibility relationships are resolved or visibly accepted by the correct authority;
- the actual design objects exist at identifiable locations;
- intended reusable sources are adopted by the affected surfaces rather than merely documented;
- responsive and content pressure relevant to the support contract have been checked;
- assets are available and valid;
- no P0 remains, and unresolved P1 conditions have explicit authority and consequence;
- unavailable verification, deferred migration, and out-of-scope consumers are named accurately.

Readiness applies to the stated revision and scope. Do not use one ready section, screen, or component to imply that the entire product or design system is ready.
