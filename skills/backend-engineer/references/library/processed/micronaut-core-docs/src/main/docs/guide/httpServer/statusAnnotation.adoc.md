> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/statusAnnotation.adoc`  
> Upstream Git blob: `a6d6ce2006b303c6b934f396f884d85eb9404bd9`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

A Micronaut controller action responds with a 200 HTTP status code by default.

If the action returns an `HttpResponse`, configure the status code for the response with the `status` method.

snippet::io.micronaut.docs.server.response.StatusController[tags="httpresponse", indent=0]

You can also use the `@Status` annotation.

snippet::io.micronaut.docs.server.response.StatusController[tags="atstatus", indent=0]

or even respond with an `HttpStatus`

snippet::io.micronaut.docs.server.response.StatusController[tags="httpstatus", indent=0]

### Custom HTTP Status Codes
Micronaut supports arbitrary HTTP status codes not part of the predefined `HttpStatus` enum.
You can use the API method https://docs.micronaut.io/latest/api/io/micronaut/http/HttpResponse.html#status(int,java.lang.String)[`HttpResponse#status(int,java.lang.String)`]
