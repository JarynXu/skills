> **Offline teaching derivative**  
> Source: `quarkusio/quarkus@1d5c7d7b1d3c8692a101092b927cb74a5bd2e46b`  
> Upstream path: `docs/src/main/asciidoc/observability.adoc`  
> Upstream Git blob: `0e9314c1d8442e9f3c38d9c62ed05756d970b48b`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

////
This guide is maintained in the main Quarkus repository
and pull requests should be submitted there:
https://github.com/quarkusio/quarkus/tree/main/docs/src/main/asciidoc
////
# Observability in Quarkus
include::_attributes.adoc[]

Observability can be defined as the capability to allow a human to ask and answer questions about a system.

Over the time, many extensions have been developed to provide observability capabilities to Quarkus applications. This guide will provide an overview of the observability extensions available in Quarkus and which can be used to provide observability according to the needs of your Quarkus application.

## Telemetry

Telemetry contains data about the internal state of the system and can be split into categories or *signals*:

* *Logging*, classical local or centralised logs
* *Metrics*, metrics calculated in each Quarkus application instance
* *Tracing*, distributed tracing across applications
* *Profiling*, to analyze and monitor the application's performance, resource usage, and runtime behavior
* *Events*, the most generic signal. It's a representation of something significant happening during the execution of a program.

## Guidelines

There is only one important guideline in Quarkus observability:

* The https://opentelemetry.io/docs/specs/otel/protocol/[OpenTelemetry OTLP protocol] is the recommended way to send telemetry out of a Quarkus application. This provides a unified output for the application's telemetry.

## Overview

Some extensions have overlapping functionality and there are recommended extensions for each type of signal.


The following table provides an overview of the observability extensions available in Quarkus, the signals they provide and which is the recommended extension for each signal.

|===
|Extension |Logging |Metrics |Tracing |Profiling |Health Check|Events

|[quarkus-opentelemetry](opentelemetry.adoc)
|O, R
|O, R
|R
|
|
|X

|[quarkus-micrometer](telemetry-micrometer.adoc)
|
|R
|
|
|
|

|[quarkus-micrometer-opentelemetry](telemetry-micrometer-to-opentelemetry.adoc)
|X
|R
|R
|
|
|X

|[quarkus-jfr](jfr.adoc)
|
|
|
|R
|
|X

|[Logging in Quarkus](logging.adoc)
|X
|
|
|
|
|

|[quarkus-logging-json](logging.adoc#json-logging)
|X
|
|
|
|
|


|[quarkus-logging-gelf](centralized-log-management.adoc)
|D
|
|
|
|
|
|===

- *R* - recommended
- *X* - supports
- *D* - deprecated
- *O* - off by default

## The signals

### Logging and events

We can say a log line is a type of event that includes a severity classification. The OpenTelemetry project recognizes this approach, resulting in an OpenTelemetry API for logs and events that is pretty much the same.

Log is a much older concept and is still widely used in the industry, that's why the overview table from above has different columns for logs and events.

In the future we'll see a convergence of these two concepts, as people start adopting OpenTelemetry Logs.

#### Quarkus logging extensions

Quarkus uses the *JBoss Log Manager* logging backend to publish application and framework logs either in the console or files. These logs can also be forwarded to a centralized logging system, either by using the legacy [`quarkus-logging-gelf`](centralized-log-management.adoc) extension or the recommended [`quarkus-opentelemetry`](opentelemetry.adoc) or [`quarkus-micrometer-opentelemetry`](telemetry-micrometer-to-opentelemetry.adoc) extensions.

OpenTelemetry logs are disabled by default in the `quarkus-opentelemetry` extension, but enabled by default in the `quarkus-micrometer-opentelemetry` extension.

#### Other events

There is no recommended way to generate observability events in Quarkus because the OpenTelemetry Events API is still under development and its use is not recommended, yet.

The [`quarkus-jfr`](jfr.adoc) extension can generate observability related events.

### Metrics

Quarkus has been using Micrometer to collect metrics from the application for a long time. Almost all the out-of-the-box metrics instrumentation in Quarkus are implemented with the [Micrometer](telemetry-micrometer.adoc) extension.

More recently, OpenTelemetry Metrics has become available in the [`quarkus-opentelemetry`](opentelemetry.adoc) extension, but it's disabled by default because metrics semantic conventions are not stable yet.

The solution is to use the [`quarkus-micrometer-opentelemetry`](telemetry-micrometer-to-opentelemetry.adoc) extension to allow using *Micrometer metrics* and *OpenTelemetry logs and traces* at the same time with a unified output using the OTLP protocol. Manual OpenTelemetry metrics can also be created with this extension and all signals are enabled by default, for convenience.

### Tracing

Quarkus uses OpenTelemetry Tracing to provide tracing capabilities to the application. The [`quarkus-opentelemetry`](opentelemetry.adoc) and the [`quarkus-micrometer-opentelemetry`](telemetry-micrometer-to-opentelemetry.adoc) extensions are the recommended way to use for tracing.

### Profiling

Quarkus uses the Java Flight Recorder (JFR) to provide profiling capabilities to the application. The [`quarkus-jfr`](jfr.adoc) extension is the recommended way to generate the events necessary to profile the application.

The OpenTelemetry profiling signal, still under development, might be available in the future.

## See telemetry

The [Grafana LGTM Dev Service](observability-devservices-lgtm.adoc) extension is available to visualize the telemetry data for logs, metrics and traces in Grafana.
