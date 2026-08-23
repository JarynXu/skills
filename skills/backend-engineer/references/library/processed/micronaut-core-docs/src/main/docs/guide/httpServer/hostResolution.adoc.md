> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/hostResolution.adoc`  
> Upstream Git blob: `db6c021659803c086e82c30c42ff58db779d6247`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

You may need to resolve the host name of the current server. The Micronaut framework includes an implementation of the api:http.server.util.HttpHostResolver[] interface.

The default implementation looks for host information in the following places in order:

. The supplied configuration
. The `Forwarded` header
. `X-Forwarded-` headers. If the `X-Forwarded-Host` header is not present, the other `X-Forwarded` headers are ignored.
. The `Host` header
. The properties on the request URI
. The properties on the embedded server URI

The behavior of which headers to pull the relevant data can be changed with the following configuration:

include::{includedir}configurationProperties/io.micronaut.http.server.HttpServerConfiguration$HostResolutionConfiguration.adoc[]

The above configuration also supports an allowed host list. Configuring this list ensures any resolved host matches one of the supplied regular expression patterns. That is useful to prevent host cache poisoning attacks and is recommended to be configured.
