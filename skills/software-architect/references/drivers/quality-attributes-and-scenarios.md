# Quality attributes and scenarios

System qualities drive architecture only when they are concrete enough to influence a decision and be evaluated. Replace slogans with prioritized scenarios.

## Discover relevant qualities

Consider qualities raised by stakeholder concerns and system context, including performance efficiency, availability, reliability, recoverability, security, privacy, safety, modifiability, testability, interoperability, portability, usability, accessibility, operability, observability, deployability, cost, and resource or energy efficiency.

This is an open checklist, not a requirement to optimize every quality. Select qualities because failure would matter, decisions create tradeoffs, or uncertainty creates risk.

## Write measurable scenarios

Describe each significant scenario with:

```text
Source: who or what produces the stimulus
Stimulus: the event, demand, failure, or change
Environment: the relevant normal, degraded, peak, attack, deployment, or recovery condition
Affected artifact: the system or element being exercised
Response: the behavior the architecture must provide
Measure: the observable threshold, distribution, bound, or verification method
```

Examples must remain project-specific. Do not convert "fast" into an arbitrary latency target, "highly available" into an invented percentage, or "secure" into a generic control list.

Keep one acceptance result per scenario. State one primary response predicate and measure over a scalar or universally quantified scope. Split independent response predicates that can pass separately, require different authorities, or need different evidence, even when they share a workload. Conditions needed to make a measurement valid are test preconditions, not additional coequal claims. When the concern is compatibility between two constraints, write and test one relational predicate such as “the selected protection mode supports the required query behavior” instead of joining two independent guarantees with `and`.

## Prioritize with stakeholders

Prioritize scenarios using:

- Business or mission impact.
- Likelihood and exposure.
- Architectural difficulty or novelty.
- Cost of learning late.
- Conflict with other qualities.
- Irreversibility of the affected decisions.

When many scenarios exist, use a ranked scenario set or utility tree to expose priorities and tradeoffs. Do not let an unranked catalogue imply that every quality has equal weight.

## Connect qualities to design

For every high-priority scenario:

1. Identify the decisions and mechanisms intended to satisfy it.
2. State assumptions and environmental dependencies.
3. Identify other qualities helped or harmed.
4. Define the evidence needed before and after implementation.
5. Record residual risk when the response cannot be guaranteed.

A technology name or architecture pattern is not a quality argument. Explain the mechanism by which it changes the expected response.

## Select evaluation evidence

Use evidence suited to the claim:

- Scenario walkthrough or model analysis for early design.
- Prototype or focused experiment for technical uncertainty.
- Benchmark, load, fault, penetration, accessibility, or recovery test for measurable behavior.
- Static analysis or dependency checks for structural qualities.
- Runtime metrics, traces, incidents, and operational exercises for deployed qualities.
- Expert review when evidence cannot yet be automated, with assumptions and limitations stated.

Do not claim a quality from architecture documentation alone. A design can support a quality; evidence determines whether the realized system achieves it.
