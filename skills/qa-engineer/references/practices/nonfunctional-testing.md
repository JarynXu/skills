# Non-functional testing

Use this reference for measurable quality attributes beyond functional correctness.

## Define scenarios before tools

Specify source or actor, stimulus, environment, affected artifact, expected response, and measure. Preserve workload model, data distribution, topology, versions, warm-up, duration, and pass/fail thresholds.

## Performance and capacity

- **Load:** expected and peak workload under defined service objectives.
- **Stress:** behavior beyond intended capacity and degradation/recovery.
- **Spike:** abrupt workload change and control response.
- **Soak/endurance:** sustained operation exposing leaks, accumulation, drift, and scheduled behavior.
- **Capacity/scalability:** maximum safe workload and response to added resources or partitions.

Measure throughput, arrival rate, latency percentiles, errors, saturation, queueing, retries, resource use, dependency behavior, and recovery. Validate the load generator is not the bottleneck. Compare against a controlled baseline and correctness oracle; high throughput with wrong outcomes is failure.

Tools may include k6, JMeter, Gatling, Locust, wrk/hey for narrow HTTP probes, language benchmarks, profilers, and platform telemetry. Select by protocol, workload model, scale, scripting, distribution, and observability—not popularity.

## Reliability, resilience, and chaos

Inject realistic failures: latency, errors, connection loss, dependency unavailability, process restart, node loss, zone loss, packet impairment, clock issues, disk pressure, broker redelivery, stale configuration, and mixed versions. Establish steady-state indicators, blast radius, safeguards, abort conditions, and recovery evidence.

Chaos testing is controlled experimentation, not random destruction. Obtain environment and production authorization. Prefer lower environments until real topology is required.

## Failover and disaster recovery

Verify detection, traffic or leader transition, in-flight behavior, consistency, duplicate effects, degraded capacity, operator visibility, return to normal, and data reconciliation. For backup/restore, test actual artifacts, encryption keys, permissions, point-in-time objectives, restore time, integrity, application compatibility, and runbook execution.

RPO and RTO are business and architecture decisions; QA verifies evidence against them but does not invent the targets.

## Installation, upgrade, and rollback

Test supported starting versions, fresh install, in-place and rolling upgrades, configuration/schema migration, mixed versions, state preservation, restart, cancellation, rollback limits, uninstall or decommission, and operator feedback. Include interrupted and repeated operations.

## Resource and longevity risks

Observe memory, file descriptors, threads, goroutines, processes, connections, queue depth, cache growth, disk, logs, telemetry cardinality, temporary files, and external quota. Use production-like duration or acceleration only when the acceleration preserves the mechanism.

## Report reproducibly

Include system version, environment/topology, workload and data model, tool/version, generator capacity, warm-up/duration, thresholds, raw artifacts, telemetry, anomalies, and limitations. Do not publish a single average or requests-per-second number as a performance conclusion.
