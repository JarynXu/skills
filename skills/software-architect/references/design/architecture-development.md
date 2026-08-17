# Architecture development

Develop architecture iteratively from drivers and evidence. Use top-down responsibility design together with bottom-up constraints discovered in existing assets, technology, prototypes, and implementation feedback.

## Delimit architecture decisions

Treat a decision as architectural when it materially affects one or more of:

- System decomposition, ownership, or dependency direction.
- Public interfaces, external integrations, or data authority.
- Deployment, trust, fault, consistency, or transaction boundaries.
- Cross-cutting mechanisms used by multiple parts of the system.
- Important quality attributes or lifecycle cost.
- Multiple teams or a difficult-to-reverse commitment.

Private naming, local algorithms, and reversible implementation details normally remain engineering decisions. Escalate only when their accumulated effect changes a system-level property.

## Use an iterative design loop

For each scope under design:

1. Confirm that the significant functional requirements, quality scenarios, constraints, and current evidence are sufficient for the next decision.
2. Select the system or building block whose responsibilities need definition or decomposition.
3. Rank the drivers that govern this design step.
4. Form credible candidate strategies, tactics, or patterns.
5. Compare their mechanisms, tradeoffs, risks, and reversibility.
6. Choose or defer the decision with an explicit rationale.
7. Instantiate responsibilities, relationships, interfaces, data ownership, runtime behavior, and deployment implications.
8. Reapply resulting requirements and constraints to child elements.
9. Update views, decisions, risks, and validation plans.
10. Seek implementation or stakeholder feedback before refining further.

Do not complete the full hierarchy speculatively. Decompose important, risky, complex, volatile, or externally visible elements to the level needed for decisions and implementation; leave ordinary internal detail to its owner.

## Compare alternatives fairly

For consequential choices, evaluate at least one credible alternative and normally two or three directions. Compare them against the same driver set:

- Required behavior and quality scenarios.
- Failure and recovery behavior.
- Operational and security burden.
- Team capability and ownership.
- Delivery, migration, and coexistence.
- Cost, licensing, vendor dependence, and exit options.
- Evidence quality and remaining uncertainty.

Do not create ornamental alternatives after a preferred answer has already been assumed. If only one viable direction remains because of a hard constraint, document that constraint and the rejected possibilities briefly.

## Preserve conceptual integrity without centralizing every choice

Define stable system-level principles, boundaries, and contracts. Let implementation teams make local decisions inside them and return evidence when a boundary is impractical. Repeated exceptions are feedback that the architecture or its communication may be wrong.

Avoid architecture by slogan. "Microservices," "event-driven," "clean architecture," or "cloud-native" does not define responsibilities, relationships, data authority, behavior, or quality mechanisms.

## Stop at useful sufficiency

Architecture is sufficiently developed for the next increment when:

- The implementing team can identify its responsibilities and dependencies.
- Significant interfaces and quality obligations are clear.
- High-risk assumptions have a validation path.
- Consequential choices and consequences are recorded.
- Remaining uncertainty is explicit and can be resolved before it becomes expensive.

Continue refining only when a stakeholder concern, risk, or implementation dependency requires it.

Professional-duty anchor: the current [iSAQB CPSA Foundation curriculum](https://public.isaqb.org/curriculum-foundation/curriculum-foundation-en.html) groups core software-architecture work around clarifying requirements and constraints, designing and developing architecture, documenting and communicating it, and analyzing and evaluating it. The SEI's [Attribute-Driven Design collection](https://www.sei.cmu.edu/library/attribute-driven-design-method-collection/) provides one iterative design method; use it as a method, not a compulsory document structure.
