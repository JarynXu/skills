> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/errorHandling/globalErrorHandling.adoc`  
> Upstream Git blob: `3c982ec79b456f097003fdb7edb0a191bb7b7546`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

snippet::io.micronaut.docs.server.json.PersonController[tags="globalError", indent=0, title="Global error handler"]

<1> The ann:http.annotation.Error[] declares the method a global error handler
<2> A api:http.hateoas.JsonError[] instance is returned for all errors
<3> An api:http.HttpStatus#INTERNAL_SERVER_ERROR[] response is returned

snippet::io.micronaut.docs.server.json.PersonController[tags="statusError", indent=0, title="Global status handler"]

<1> The ann:http.annotation.Error[] declares which api:http.HttpStatus[] error code to handle (in this case 404)
<2> A api:http.hateoas.JsonError[] instance is returned for all 404 responses
<3> An api:http.HttpStatus#NOT_FOUND[] response is returned

IMPORTANT: A few things to note about the ann:http.annotation.Error[] annotation. You cannot declare identical global `@Error` annotations. Identical non-global `@Error` annotations cannot be declared in the same controller. If an `@Error` annotation with the same parameter exists as global and another as local, the local one takes precedence.
