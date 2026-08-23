> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/filters/filtermethods/continuations.adoc`  
> Upstream Git blob: `02f79919da537d383160c679925d02fa3a6bcc56`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

Request filters can define a special api:http.filter.FilterContinuation[] parameter to get more control of the downstream execution, and to be run further actions after it completes. For example, the above `TraceFilter` can be expressed using a single request filter:

snippet::io.micronaut.docs.server.filters.filtermethods.continuations.TraceFilter[tags="doFilter", indent=0, title="Single request filter"]

<1> The request filter declares a api:http.filter.FilterContinuation[] parameter. The continuation will return a api:http.MutableHttpResponse[]
<2> After the request processing is done, the filter calls the blocking `proceed` to run downstream filters and the controller
<3> When downstream processing completes, the filter adds a `X-Trace-Enabled` header to the response returned by the continuation
<4> The whole filter is executed on a worker thread to avoid blocking the event loop in the `proceed` call

IMPORTANT: The call to `FilterContinuation.proceed` is blocking by default, so it should never be done on the event loop. Such filters should be run on a worker thread as described above. Alternatively, the continuation can also be declared to return a reactive type (`Publisher<HttpResponse<?>>`) to proceed in an asynchronous manner, similar to the old api:http.filter.FilterChain[] API.
