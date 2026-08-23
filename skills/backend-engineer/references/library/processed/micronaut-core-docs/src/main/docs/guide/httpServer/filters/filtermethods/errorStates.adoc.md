> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/filters/filtermethods/errorStates.adoc`  
> Upstream Git blob: `1556a163c539d45ed65cc0cc346afbf9780178c6`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

In principle, downstream filters and controllers can produce exceptions, and response filters should be prepared to handle them. For a response filter to be called when there is an exception, it must declare the exception type as a parameter.

.@Filter Response filter declaration
|===
|Declaration|Called when?

|`void responseFilter(HttpResponse<?> response)`
|Only called on non-exception response

|`void responseFilter(Throwable failure)`
|Only called on exception response

|`void responseFilter(IOException failure)`
|Only called on exception response, if the exception is an `IOException`

|`void responseFilter(HttpResponse<?> response, @Nullable Throwable failure)`
|Always called. `failure` will be `null` if there was no error. If there was an error, `response` will be `null`.
|===

Whether errors appear as exceptions depends on the context of the filter. For the Micronaut HTTP server, any exception is mapped to a non-exceptional api:http.HttpResponse[] with an error status code. This mapping happens before each filter, so a server filter will never actually see an exception. If you still want to access the original cause of the response, it is stored as the attribute api:http.HttpAttributes#EXCEPTION[].
