# Architecture Decision-Making and ADRs

Architecture is shaped by consequential decisions, not by diagrams alone. Treat a decision as architecture-significant when it materially affects system qualities, boundaries, externally visible contracts, operational characteristics, delivery constraints, or the cost of future change.

## Use precise decision states

Keep these concepts distinct:

- **Fact:** verified information about the current system or environment.
- **Constraint:** a condition the solution must satisfy.
- **Assumption:** an unverified condition currently used for reasoning.
- **Option:** a viable candidate course of action.
- **Proposal:** an option recommended but not yet accepted.
- **Decision:** an option accepted by the accountable decision authority.
- **Exception:** an explicitly approved deviation with scope and expiry or review conditions.

Do not present a proposal as a decision or invent rationale for a historical choice. Mark uncertainty, identify who can resolve it, and apply the skill's general evidence, status, and ownership rules rather than inferring authority from a plausible role.

## Make consequential decisions collaboratively

1. Name the decision question and why it matters now.
2. Identify the accountable decision owner and affected stakeholders.
3. Derive evaluation criteria from architecture drivers and constraints.
4. Develop genuinely viable alternatives, including retaining the status quo when relevant.
5. Compare consequences, risks, reversibility, and evidence quality.
6. Validate the riskiest assumptions before commitment when practical.
7. Record the accepted decision and communicate it to affected teams.
8. Revisit it only when its stated assumptions, constraints, or evidence materially change.

The architect is accountable for coherence and informed tradeoffs, but does not silently take product, security, operations, or team ownership away from the people responsible for those concerns.

## ADR contract

Use an Architecture Decision Record for a durable, architecture-significant decision. Adapt the format to the repository, but preserve this semantic content:

- stable identifier and decision-focused title;
- status such as proposed, accepted, rejected, superseded, or deprecated;
- date, scope, accountable owner, and participating stakeholders;
- context, problem, drivers, constraints, and relevant assumptions;
- options considered and a fair account of their consequences;
- decision and rationale tied to evidence;
- positive, negative, and uncertain consequences;
- validation evidence and remaining risks;
- implementation or migration implications;
- conditions that should trigger reassessment;
- links to related requirements, views, interfaces, evaluations, and superseding decisions.

Keep superseded ADRs. Change their status and link the replacement instead of rewriting history. Correct factual errors transparently.

## Exercise judgment about what to record

Record choices whose rationale would otherwise be lost or repeatedly debated. Do not create ADRs for every local coding choice, obvious application of an existing standard, or reversible implementation detail. If several small choices express one cross-cutting architectural policy, document the policy once and link its applications.

## Quality check

An independent reader should be able to determine:

- what was decided and what remains open;
- which drivers made the decision consequential;
- which alternatives were seriously considered;
- what evidence supports the choice;
- what the choice costs or makes harder;
- when the decision should be challenged again.

Every linked driver, evidence item, risk, and related decision must materially affect that record. Validate semantic relevance as well as identifier existence; shared vocabulary alone is not traceability.

Apply a counterfactual link test: if removing a driver would not change the decision question, viable alternatives, choice, rationale, consequences, or revisit condition, omit that link. A driver does not become relevant merely because it names a data class, service, stakeholder, or quality touched by the implementation. Conversely, when a decision claims to satisfy or trade off a driver and the counterfactual passes, include it exactly once in the canonical direction.

Method anchor: Michael Nygard's original [Architecture Decision Record proposal](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).
