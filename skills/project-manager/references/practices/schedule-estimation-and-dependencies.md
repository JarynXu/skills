# Schedule, estimation, and dependency control

Use this reference for dates, milestones, WBS/network logic, estimates, critical path, rolling forecasts, iteration/flow forecasts, buffers and schedule recovery.

## Build a schedule from causality

A credible schedule connects:

```text
work/deliverables
+ dependency conditions
+ resource calendars/capacity
+ estimates and uncertainty
+ external approvals/procurements/environments
+ milestones/commitments
```

Dates copied from a target slide are not a schedule. Start from the work and constraints that can cause the finish date.

## Dependency semantics

Record the real condition, not just an arrow:

- predecessor/owner;
- successor/consumer;
- required artifact/state;
- dependency type if useful (finish-start, start-start, etc.);
- lead/lag or waiting time;
- required-by date;
- confidence and validation evidence;
- escalation/alternative path.

External approvals, vendor deliveries, environments, data, security reviews and decisions often control dates as strongly as implementation tasks.

## Estimation discipline

Preserve the estimate basis:

- scope and assumptions;
- method and data source;
- people/capability and calendar assumptions;
- best/likely/worst range or confidence when uncertainty is material;
- excluded work;
- dependencies and risks;
- date/version of the estimate.

Do not convert an estimate into a commitment without authority and risk consideration.

### Three-point / PERT-style estimation

When a three-point model is useful:

```text
expected ≈ (optimistic + 4×most_likely + pessimistic) / 6
standard_deviation ≈ (pessimistic - optimistic) / 6
variance ≈ standard_deviation²
```

This formula is a modeling convention, not objective truth. Inputs must reflect meaningful scenarios and can still be biased/correlated.

## Critical-path reasoning

For predictive dependency networks:

1. establish activity/deliverable dependencies;
2. calculate earliest/latest dates or use a capable scheduling tool;
3. identify total/free float;
4. identify the longest controlling path(s);
5. monitor near-critical paths and resource constraints;
6. re-evaluate when durations/dependencies change.

“Critical” means schedule-controlling under the current network, not merely important. Critical paths can shift. Resource leveling can create a different effective constraint than a pure logic network.

## Milestones

A milestone is a zero-duration event/decision such as:

- contract signed;
- architecture approved;
- environment ready;
- release candidate accepted;
- production go-live;
- business acceptance completed.

Do not rename a multi-week work package as a milestone. Define evidence and authority for milestone completion.

## Rolling-wave planning

Plan near-term work in execution detail and future work at increasing abstraction. Refine when information arrives. Preserve major interfaces and commitments even when downstream task detail is intentionally unresolved.

## Agile/throughput forecasting

For iterative or flow work, use historical evidence when representative:

- throughput per period;
- cycle-time distribution;
- work-item size/class consistency;
- WIP and blocked time;
- team capacity and known change;
- backlog churn and arrival rate.

Forecast with ranges/probabilities rather than treating average velocity as a deterministic promise. Do not compare velocity between teams as productivity.

## Compression and recovery

When a target date is threatened, options may include:

- remove/defer/split scope;
- resolve or bypass dependencies;
- sequence differently or parallelize safe work;
- add capability where ramp-up and communication cost still permit benefit;
- reduce queue/wait/approval latency;
- automate validation/release work;
- change acceptance/release strategy with authority;
- negotiate date or contractual commitment.

**Crashing** increases resources/cost on selected schedule-controlling work; **fast tracking** overlaps work that was sequential. Both create risks. Do not “compress” a schedule by simply shortening estimates in the plan.

## Baseline and forecast

Keep at least these separate:

```text
approved baseline
current actuals
current forecast
management target
external commitment
```

Report variance against the applicable reference, but lead decisions with the current forecast and uncertainty. A baseline remains useful history even when no longer achievable.

## Schedule health questions

- Is the current dependency network still true?
- Which milestones are evidence-backed versus target-only?
- Which work is aging or blocked?
- What changed since the last forecast?
- Are critical/near-critical paths shifting?
- Are resource calendars realistic?
- Do procurement/approval lead times fit?
- Does the remaining forecast include integration, test, acceptance and transition—not just coding?
- Which decision is needed now to preserve options?
