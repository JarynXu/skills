# Diagnose backend failures and incidents

Use this workflow for DIAGNOSE work: defects, regressions, incidents, latency, resource exhaustion, deadlocks, leaks, crashes, data anomalies, integration failures, and intermittent behavior.

Diagnosis is evidence work. Do not edit code merely because one explanation feels plausible.

## Define the symptom precisely

Capture the smallest falsifiable problem statement:

```text
expected behavior
vs observed behavior
+ affected workload/tenant/request
+ environment/version
+ time window
+ frequency or trigger
+ impact
```

Separate user-visible symptoms from internal signals. “CPU is high” is not a root cause. “Request latency rose” does not prove the database is slow.

## Establish the baseline and recent change window

Determine:

- whether the issue reproduces now;
- whether it existed before the suspected change;
- deployment/configuration/schema/dependency/traffic changes near onset;
- affected versus unaffected instances, tenants, regions, code paths or versions;
- health, saturation and dependency state.

Prefer a controlled reproduction. If reproduction is unsafe or impossible, preserve production evidence without pretending it is equivalent.

## Build competing hypotheses

Form a small set of mechanisms that could explain all major observations. Examples:

- bad input/state or violated invariant;
- incorrect authorization or routing;
- stale/cache/index/replica behavior;
- transaction/lock/concurrency issue;
- retry/timeout/duplicate side effect;
- dependency or network failure;
- CPU/allocation/GC/event-loop/thread/goroutine saturation;
- query plan/index/data skew;
- configuration/version mismatch;
- deployment or mixed-version incompatibility;
- resource leak or unbounded queue/cardinality.

For each hypothesis choose evidence that would discriminate it from the alternatives. Do not collect every available log or metric.

## Trace one real execution path

Use identifiers, timestamps and correlation context to follow one affected request/job/event across:

```text
entry
-> authorization/validation
-> application/domain state
-> database/cache/message/dependency
-> retry/cancellation
-> response/acknowledgement
-> telemetry
```

Compare with one healthy path when available. Identify the first point where state or timing diverges.

## Select diagnostic tools from the suspected mechanism

Read `../practices/performance-and-diagnostics.md` and the active language/runtime curriculum. Typical evidence includes:

- structured logs and traces;
- metrics and saturation;
- database query plans, waits, locks and transaction state;
- thread/goroutine/task/event-loop dumps;
- CPU/allocation/heap profiles and GC/runtime data;
- core/minidump/heap dump and debugger inspection;
- network/socket/DNS/TLS evidence;
- container/cgroup/host resource state;
- broker offsets/lag/redelivery;
- cache/index freshness and keys;
- configuration and effective-version inspection.

Profiles, dumps, traces and packet captures can contain sensitive data. Collect them only in authorized environments and protect/delete them appropriately.

## Narrow, do not thrash

Change one diagnostic variable at a time when experimenting. Avoid simultaneous config, code and infrastructure changes that destroy causality.

If a temporary diagnostic change is required:

- make it reversible and bounded;
- avoid changing business semantics;
- capture before/after evidence;
- remove it after the question is answered.

Do not “fix” an incident by restarting or scaling away the evidence unless immediate mitigation is the authorized priority. If mitigation is required, distinguish **impact reduction** from **root-cause diagnosis**.

## Decide when the cause is supported

A root cause should explain:

- the observed failure mechanism;
- why it began when/where it did;
- why healthy cases differ;
- the evidence that reproduces or directly observes it;
- how the proposed fix interrupts the causal chain.

If evidence is insufficient, report ranked hypotheses and the next discriminating observation. Do not promote correlation or a plausible code smell to confirmed root cause.

## Transition to repair only with authority

When a fix is requested, transition to `implement-and-refactor.md`. Preserve a regression oracle that reproduces the causal mechanism before changing it when feasible.

For production incidents, a mitigation may precede the permanent fix. Keep separate:

```text
symptom
-> immediate mitigation
-> supported cause
-> permanent correction
-> prevention/detection improvement
-> recovery evidence
```

## Completion

A diagnosis is complete when it either establishes a supported cause or narrows the uncertainty to explicit hypotheses with concrete next evidence. State what was observed, what was ruled out, and which environments were not available.

Do not pad the report with all investigative steps. Lead with the supported conclusion and evidence.
