> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/errorHandling/exceptionHandler.adoc`  
> Upstream Git blob: `c6dfa0bfe8ae6f417d050e3bd642edfb9d76c6d9`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

Alternatively, you can implement an api:http.server.exceptions.ExceptionHandler[], a generic hook for handling exceptions that occur during execution of an HTTP request.

IMPORTANT: An `@Error` annotation capturing an exception has precedence over an implementation of `ExceptionHandler` capturing the same exception.
