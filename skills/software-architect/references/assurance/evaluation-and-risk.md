# Architecture Evaluation and Risk

Architecture evaluation asks whether consequential decisions can satisfy the system's drivers with acceptable risk. Evaluate early enough to change direction and repeat when assumptions, scale, threats, or architecture change materially.

## Frame the evaluation

State:

- the architecture state and scope being evaluated;
- the decisions or quality claims under question;
- participating stakeholders and subject-matter experts;
- prioritized scenarios, constraints, and acceptance measures;
- available evidence and known evidence gaps;
- the method, timebox, and expected decision output.

Use independent challenge for high-impact or hard-to-reverse decisions. Evaluation is not a vote on diagram aesthetics.

## Select evidence by uncertainty

Use one or more methods suited to the claim:

- scenario walkthroughs for behavior and stakeholder consequences;
- structured tradeoff analysis for interacting quality attributes;
- dependency, capacity, reliability, consistency, cost, or timing models;
- prototypes and spikes for uncertain technology behavior;
- representative benchmarks, load, resilience, recovery, and compatibility tests;
- threat modeling and specialist security review;
- deployment experiments and operational readiness exercises;
- runtime telemetry, incidents, and postmortems for an existing system;
- implementation and configuration inspection for conformance.

Document test conditions and limitations. Evidence from an unrepresentative workload or topology cannot support a broader claim without argument.

Keep one falsifiable predicate and one acceptance result per fitness or evidence record. Its scope may quantify over several subjects when the same predicate, authority, evidence method, and closure rule apply uniformly and any violating member fails the whole claim; do not expand that scope into one row per subject. Split independently variable predicates even when one fixture exercises them. Rewrite a genuine compatibility or exactly-once concern as one relational predicate instead of conjoining separate guarantees. Give each fitness record one primary driver and link affected decisions in one canonical downstream record rather than mirroring the relationship in each decision.

## Classify findings precisely

Distinguish:

- **risk:** a decision may cause unacceptable consequences under stated conditions;
- **non-risk:** evidence supports the claim within stated bounds;
- **sensitivity point:** a property where small changes strongly affect a quality outcome;
- **tradeoff point:** a decision improves one important quality while degrading another;
- **evidence gap:** confidence is limited because a material claim is untested or unverified;
- **defect or conformance issue:** implementation contradicts an accepted architectural constraint.

Do not turn every observation into a risk. Explain the causal path from condition to consequence.

## Maintain actionable risk records

For each material risk, record:

- affected driver, stakeholder, and system scope;
- triggering condition and credible consequence;
- likelihood or uncertainty rationale and impact rationale;
- supporting evidence and confidence;
- mitigation, avoidance, transfer, acceptance, or monitoring response;
- owner, decision deadline, and validation evidence required for closure;
- residual risk and links to decisions or migration work.

Classify the risk condition and consequence as `[RISK]` even when likelihood, owner, or closure is unresolved. Track lifecycle state separately, such as `[OPEN]`; label a candidate mitigation `[PROPOSAL]` without reclassifying the risk itself.

Escalate unresolved risks to the actual decision authority. The architect informs and traces acceptance; do not imply acceptance merely because work continues.

When the actual owner or deadline is unknown, preserve that gap under the skill's general evidence, status, and ownership rules; escalation need does not establish an assignment.

## Distinguish architecture debt

Treat architecture debt as a deliberate or accidental architecture gap that creates future cost, risk, or loss of options. Record its cause, affected qualities, compounding exposure, owner, mitigation, and trigger for repayment. Do not relabel every local code-quality issue as architecture debt.

## Produce a decision-ready outcome

Summarize what was evaluated, evidence used, findings, disputed assumptions, recommended actions, and decisions required. Update affected ADRs, views, quality claims, and risk records after resolution.

Method anchors: the SEI's [ATAM](https://www.sei.cmu.edu/library/atam-method-for-architecture-evaluation/) for scenario-based tradeoff evaluation and [Quality Attribute Workshop](https://www.sei.cmu.edu/library/quality-attribute-workshop-collection/) for eliciting and prioritizing quality scenarios.
