# Observability and release verification

Use this reference when delivery decisions depend on logs, metrics, traces, events, dashboards, alerts, synthetic checks, rollout health or telemetry pipeline behavior. Observability is evidence about system behavior; it is not a substitute for defining what successful service behavior means.

## Start from questions

Choose telemetry from the decision:

- Did the new release receive traffic?
- Did error rate or latency regress?
- Are requests reaching the intended version?
- Is a dependency or queue causing saturation?
- Did a migration complete?
- Are Pods restarting or being throttled?
- Is telemetry missing because the app is healthy-but-uninstrumented or because export is broken?

Do not add logs/metrics/traces indiscriminately. Every signal has ingestion, storage, cardinality, privacy and operator-attention cost.

## Correlate release identity

For release verification, telemetry should make it possible to distinguish the relevant artifact/deployment revision. Useful attributes may include service name, version, commit/build/deployment ID, environment, region/cluster and instance where cardinality permits.

Avoid high-cardinality identifiers such as raw user IDs, request payloads or unbounded dynamic values in metric labels. Use traces/logs for high-cardinality correlation where appropriate.

## Logs

Prefer structured, event-oriented logs with stable fields for level, timestamp, service, operation, request/trace correlation, error class and relevant identifiers. Avoid logging credentials, tokens, secret configuration, sensitive payloads or unbounded objects.

A stack trace without request/deployment context is difficult to act on. Conversely, logging every successful event at high volume can hide useful signals and create cost/privacy risk.

During incidents or releases, preserve enough log window around the event and correlate with rollout/controller/platform events.

## Metrics

Use metrics for rates, distributions, saturation and bounded dimensions. Prefer histograms/distributions for latency rather than averages alone. Understand counter resets and scrape/export intervals.

Common release signals include:

- request/error/success rate;
- latency percentiles/distributions;
- saturation: CPU, memory, connections, queues, thread pools, event loops;
- restart/OOM/throttle rate;
- dependency latency/errors;
- job/consumer lag and failure;
- business or synthetic success indicators when defined.

A dashboard showing green averages can hide tail latency, partial region failure or one version-specific regression.

## Traces

Traces are useful for request path, dependency timing, errors and cross-service correlation. Preserve propagation across asynchronous and remote boundaries where the architecture supports it. Sampling policy affects what conclusions are valid.

Do not assume missing spans mean a dependency was not called; instrumentation/export/sampling can be incomplete. Verify telemetry pipeline health independently.

## Platform events

Kubernetes events, controller conditions, cloud activity logs and deployment-controller events explain desired-state reconciliation and platform decisions. They are often short-retention evidence; capture relevant events before cleanup/restart erases context.

## Telemetry pipeline

Map:

```text
instrumented process/platform
-> collector/agent
-> processors/sampling/filtering
-> exporter
-> backend/storage
-> query/dashboard/alert
```

A telemetry outage must not unnecessarily crash business workloads. At the same time, silently dropping all telemetry removes operational evidence. Expose collector/exporter backlog, failures and drops.

For OpenTelemetry, understand resource identity, signal-specific SDK/exporter behavior, collector processors, sampling and semantic conventions actually adopted by the project/version.

## Dashboards

A useful dashboard answers an operational question and indicates scope/time/environment. Avoid decorative metric walls. For releases, provide comparable baseline/new-version views where practical.

Version dashboards and queries when they are operational artifacts. Review query cost and missing-data semantics.

## Alerts

Alert on actionable symptoms and important control failures, not every anomaly. Define owner, severity, threshold/window, deduplication, notification route and runbook. Test alert routing and resolve behavior.

Avoid static thresholds disconnected from workload or SLO when they create chronic noise. Alerts that are always firing train operators to ignore real incidents.

## Release verification sequence

Before rollout, define baseline and success/abort criteria. During rollout:

1. verify controller/deployment progress;
2. verify intended artifact/version receives traffic;
3. compare errors/latency/saturation against baseline and thresholds;
4. check critical dependencies and background processing;
5. run synthetic/user-visible smoke evidence where appropriate;
6. inspect logs/traces/events for new failure modes;
7. pause/abort/rollback according to the defined boundary;
8. continue observation after full rollout for delayed effects.

Do not wait for every metric to become statistically perfect. Choose a window appropriate to traffic volume and failure mechanism.

## Canary and progressive delivery

For canary/blue-green/progressive controllers, know how traffic is split and which metrics drive promotion. Ensure telemetry can distinguish cohorts/versions. Low traffic can make automated comparisons meaningless; define minimum sample or manual evidence where needed.

Automation should fail safe when metrics are unavailable according to the system's risk model. “No data” is not automatically “healthy.”

## Synthetic checks

Synthetic checks prove a defined path from a defined vantage point. Use dedicated accounts/data and bounded mutation. Verify authentication, routing, dependencies and durable side effects only as required by the protected journey.

A synthetic homepage `200` does not prove critical business workflows. Conversely, full destructive end-to-end flows in production can create unnecessary risk.

## Observability changes

Treat telemetry configuration as production code. Validate collectors/config, render deployment changes, estimate cardinality/volume, protect secrets, test pipelines and roll out progressively if high impact.

Changing sampling, label dimensions or retention can invalidate dashboards/alerts and cost expectations even if application code is unchanged.

## Incident support boundary

DevOps may help collect and correlate platform/delivery evidence, but do not invent application root cause. Distinguish:

- pipeline/deployment failure;
- platform/resource failure;
- dependency/network/storage failure;
- observability pipeline failure;
- application behavior;
- unknown.

Preserve evidence that lets the owning engineer discriminate between hypotheses.

## Completion evidence

For a release or observability change report target/environment, source and artifact identity, rollout/controller result, user/synthetic evidence, key telemetry windows, alert state, limitations/missing data and rollback/recovery status. Do not equate “dashboard green” with release correctness without stating what the dashboard measured.
