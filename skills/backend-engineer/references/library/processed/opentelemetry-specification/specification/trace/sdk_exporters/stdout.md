> **Offline teaching derivative**  
> Source: `open-telemetry/opentelemetry-specification@1377f53b2bc0683c45169b8f20fd973eb4d59419`  
> Upstream path: `specification/trace/sdk_exporters/stdout.md`  
> Upstream Git blob: `ed488b2fe20961efc0a3f326e9073f7b7fa99552`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

<!--- Hugo front matter used to generate the website version of this page:
linkTitle: Stdout
--->

# Span Exporter - Standard output

**Status**: [Stable](../../document-status.md)

"Standard output" Span Exporter is a [Span
Exporter](../sdk.md#span-exporter) which outputs the spans to
stdout/console.

The exporter's output format is unspecified and can vary between
implementations. Documentation SHOULD warn users about this. The following
wording is recommended (modify as needed):

> This exporter is intended for debugging and learning purposes. It is not
> recommended for production use. The output format is not standardized and can
> change at any time.
>
> If a standardized format for exporting traces to stdout is desired, consider
> using the [File Exporter](../../protocol/file-exporter.md), if available.
> However, please review the status of the File Exporter and verify if it is
> stable and production-ready.

[OpenTelemetry SDK](../../overview.md#sdk) authors MAY choose the best idiomatic
name for their language. For example, ConsoleExporter, StdoutExporter,
StreamExporter, LoggingExporter etc.

If a language provides a mechanism to automatically configure a
[Span processor](../sdk.md#span-processor) to pair with the associated
exporter (e.g., using the [`OTEL_TRACES_EXPORTER` environment
variable](../../configuration/sdk-environment-variables.md#exporter-selection)), by
default the standard output exporter SHOULD be paired with a [simple
processor](../sdk.md#simple-processor).
