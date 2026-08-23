# Risk, issues, decisions, stakeholders, and communication

Use this reference when uncertainty, blockers, decisions, dependencies, stakeholder behavior, escalation or project communication can change outcomes.

## Keep RAID categories precise

```text
RISK       uncertain future event/condition
ISSUE      current condition requiring action or disposition
ASSUMPTION proposition treated as true for planning until validated
DEPENDENCY condition outside the immediate work that must occur
DECISION   authorized choice with consequences
```

Do not use one generic “risk log” for all five. Misclassification hides the action required.

## Risk management loop

1. identify risk from objectives, assumptions, dependencies, technical/commercial context and evidence;
2. describe cause/event/effect clearly;
3. assess probability, impact and urgency/proximity using the project’s method;
4. quantify exposure when decision-useful;
5. select response and owner;
6. define trigger/early warning and contingency/fallback where appropriate;
7. execute response actions;
8. monitor residual/secondary risk;
9. close or convert to an issue when the event occurs.

Typical threat responses: avoid, mitigate, transfer/share contractually, accept/escalate. Opportunity responses: exploit, enhance, share, accept/escalate. Labels are less important than a concrete action and owner.

## Quantitative risk

Use quantitative methods where consequence justifies the input effort:

- expected monetary value for decision exposure;
- sensitivity analysis;
- scenario analysis;
- decision trees;
- Monte Carlo schedule/cost simulation;
- confidence levels and contingency analysis.

Do not imply quantitative precision when distributions, correlations and model assumptions are weak. Preserve assumptions and use ranges rather than one magical percentile.

## Issues

An issue needs:

```text
observed condition
+ impact
+ owner
+ next action
+ target/needed-by date
+ escalation threshold
+ linked decision/dependency/risk
```

Separate symptom from root cause. For critical issues, stabilize first, preserve evidence, then solve the causal layer. A closed issue can leave a residual risk or follow-up action.

## Assumptions

Material assumptions should have:

- why the plan depends on them;
- owner/source;
- validation method/date;
- consequence if false;
- fallback or risk linkage.

An assumption that remains unvalidated near its decision point is risk, not harmless documentation.

## Dependencies

Describe the required condition and responsible party. Track dependency aging and decision latency. A dependency “owner” coordinates it; they may not control the external party.

## Decision log

For consequential decisions record:

```text
question
options
recommendation/evidence
authority
decision/date
rationale
consequences
follow-up/revisit trigger
```

Track “decision needed by” before the decision is made. Decision latency can be a schedule risk in its own right.

## Stakeholder analysis

Identify:

- influence/authority;
- impact from project outcome/change;
- interest and concerns;
- current versus desired engagement;
- information/decision needs;
- relationship/communication owner;
- resistance/support drivers;
- cultural/organizational constraints.

Power-interest grids and similar models are aids, not permanent labels. Stakeholder position can change during the project.

## Communication design

A communication should answer a decision need. Tailor by audience:

- sponsor/steering: outcomes, forecast, variance, risk, trade-offs, decisions/help;
- product/business: user/value evidence, scope options, acceptance;
- delivery teams: near-term priorities, dependencies, decisions, impediments;
- finance/procurement: commitments, actuals, forecast, vendor/commercial actions;
- operations/security/compliance: readiness, evidence, unresolved risks, cutover/support;
- customers/vendors: agreed commitments, dependencies, decisions, acceptance/change mechanisms.

Avoid broadcasting every detail to everyone.

## Status reporting

A useful status says:

```text
outcome and current phase
what changed since last report
milestones/deliverables and current forecast
scope/cost/resource variance where applicable
quality/acceptance evidence
material RAID and trend
key decisions/actions, owner, needed-by date
confidence/uncertainty
```

A RAG color needs explicit criteria and underlying evidence. Do not turn “green” into a political promise. Escalate early enough for an authority to retain options.

## Meetings

Every recurring meeting should have a distinct control purpose. Prepare evidence and decisions, not status theater. Record decisions/actions/owners/dates. Cancel or shorten meetings when asynchronous evidence answers the need.

Conflict resolution belongs first at the lowest level with the authority and context to solve it. Escalate unresolved trade-offs, not interpersonal discomfort alone.
