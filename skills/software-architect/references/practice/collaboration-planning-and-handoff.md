# Collaboration, Planning, and Handoff

Software architecture is a collaborative technical leadership practice. The architect keeps system-wide decisions coherent while working through the people who own product outcomes, specialist concerns, implementation, delivery, and operations.

Apply this guidance only when collaboration, sequencing, or handoff is part of the mandate. Do not append a delivery plan, phase gate, or handoff section to an otherwise bounded architecture artifact merely because the inputs mention teams or a deadline.

## Respect professional boundaries

- **Product leadership** owns product outcomes, priority, business rules, and acceptance of product tradeoffs. The architect exposes technical feasibility, architectural consequences, and missing decisions.
- **Engineering teams** own detailed design and implementation within accepted constraints. The architect supplies context, resolves cross-boundary concerns, and learns from implementation evidence.
- **Security, privacy, safety, data, platform, and operations specialists** own their professional judgments and controls. The architect integrates their constraints and makes cross-quality tradeoffs visible.
- **Delivery or project leadership** owns schedules, staffing coordination, and work tracking. The architect provides technical dependencies, uncertainty, decision gates, and migration sequencing.
- **Business and operational owners** accept residual risk within their authority. The architect documents evidence and consequences but does not manufacture approval.

Clarify decision rights when responsibilities overlap. Facilitation is not unilateral authority.

These boundaries do not prove that a corresponding project role, team, or owner exists. Verify local assignments. Mark proposed owners or team divisions explicitly and leave unconfirmed authority open rather than filling a responsibility table with plausible titles.

## Use collaboration to create durable outcomes

Choose the lightest forum that resolves the issue: focused interview, design session, quality workshop, prototype review, threat model, ADR review, or architecture evaluation. Every consequential forum should end with explicit decisions, open questions, confirmed owners or visible ownership gaps, and updates to authoritative artifacts.

Represent dissent and unresolved assumptions accurately. Do not convert meeting attendance or silence into agreement.

## Plan around uncertainty and dependency

Sequence architecture work by what unlocks safe decisions and delivery:

1. clarify the driver or boundary that controls later choices;
2. investigate high-impact, hard-to-reverse uncertainty;
3. validate risky assumptions with the cheapest credible evidence;
4. decide and document only when evidence and authority are sufficient;
5. enable implementation in coherent increments;
6. verify architecture claims in the implemented and operating system.

Use spikes and models as decision work with explicit questions and exit criteria. Avoid producing a complete speculative architecture before testing its critical assumptions.

## Guide implementation without taking it over

Make constraints, rationale, examples, and escalation paths understandable to implementers. Review architecture-significant changes at the point where feedback can still alter them. Prefer teaching the decision model and enabling automated checks over becoming a permanent approval bottleneck.

When implementation exposes a flawed decision, update the architecture rather than defending authorship.

## Handoff contract

When transferring architecture work, provide:

- system scope and architecture state;
- authoritative drivers, constraints, terminology, and sources;
- accepted, proposed, and superseded decisions;
- key views, interfaces, and cross-cutting concepts;
- evidence supporting major quality claims;
- material risks, assumptions, exceptions, and architectural debt;
- current migration stage and next decision gates;
- confirmed owners and decision authorities, explicitly proposed candidates, ownership gaps, and unresolved questions;
- how conformance and freshness are checked.

Do not hand off a diary of research steps. Organize information around the system and the decisions the next person must make.
