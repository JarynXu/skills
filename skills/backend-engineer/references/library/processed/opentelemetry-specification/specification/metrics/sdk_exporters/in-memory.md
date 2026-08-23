> **Offline teaching derivative**  
> Source: `open-telemetry/opentelemetry-specification@1377f53b2bc0683c45169b8f20fd973eb4d59419`  
> Upstream path: `specification/metrics/sdk_exporters/in-memory.md`  
> Upstream Git blob: `6a17ea7a1cf0f59abfebd9c8816b2977b2196e91`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

<!--- Hugo front matter used to generate the website version of this page:
linkTitle: In-memory
--->

# Metrics Exporter - In-memory

**Status**: [Stable](../../document-status.md)

In-memory Metrics Exporter is a [Push Metric
Exporter](../sdk.md#push-metric-exporter) which accumulates metrics data in the
local memory and allows to inspect it (useful for e.g. unit tests).

In-memory Metrics Exporter MUST provide configuration to set
the [MetricReader](../sdk.md#metricreader) output `temporality` as a function of
instrument kind. This option MAY be named `temporality`, and MUST set
temporality to Cumulative for all instrument kinds by default.

In-memory Metrics Exporter MAY provide configuration to set
the [MetricReader](../sdk.md#metricreader) default `aggregation` as a function
of instrument kind. This option MAY be named `default_aggregation`, and MUST use
the [default aggregation](../sdk.md#default-aggregation) by default.

If a language provides a mechanism to automatically configure a
[MetricReader](../sdk.md#metricreader) to pair with the associated
exporter (e.g., using the [`OTEL_METRICS_EXPORTER` environment
variable](../../configuration/sdk-environment-variables.md#exporter-selection)), by
default the exporter MUST be paired with a [periodic exporting
MetricReader](../sdk.md#periodic-exporting-metricreader).
