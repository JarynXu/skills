> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/filters/httpServerFilter/httpServerFilterErrorStates.adoc`  
> Upstream Git blob: `b9b2aedc00f2b82c2d322f8eff3b3bded4804919`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

The publisher returned from `chain.proceed` should never emit an error. In the cases where an upstream filter emitted an error or the route itself threw an exception, the error response should be emitted instead of the exception. In some cases it may be desirable to know the cause of the error response and for this purpose an attribute exists on the response if it was created as a result of an exception being emitted or thrown. The original cause is stored as the attribute api:http.HttpAttributes#EXCEPTION[].
