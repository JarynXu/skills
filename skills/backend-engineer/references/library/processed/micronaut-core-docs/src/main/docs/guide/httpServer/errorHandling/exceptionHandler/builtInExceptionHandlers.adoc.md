> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/errorHandling/exceptionHandler/builtInExceptionHandlers.adoc`  
> Upstream Git blob: `d9676a5f062327eb4aa3ee8c8ee11c4df1687771`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

The Micronaut framework ships with several built-in handlers:

|===
|Exception|Handler
| `jakarta.validation.ConstraintViolationException`
| https://micronaut-projects.github.io/micronaut-validation/latest/api/io/micronaut/validation/exceptions/ConstraintExceptionHandler.html[ConstraintExceptionHandler]
| api:http.exceptions.ContentLengthExceededException[]
| api:http.server.exceptions.ContentLengthExceededHandler[]
| api:core.convert.exceptions.ConversionErrorException[]
| api:http.server.exceptions.ConversionErrorHandler[]
| api:web.router.exceptions.DuplicateRouteException[]
| api:http.server.exceptions.DuplicateRouteHandler[]
| api:http.exceptions.HttpStatusException[]
| api:http.server.exceptions.HttpStatusHandler[]
| api:http.server.exceptions.UnsupportedMediaException[]
| api:http.server.exceptions.HttpStatusHandler[]
| api:http.server.exceptions.NotFoundException[]
| api:http.server.exceptions.HttpStatusHandler[]
| api:http.server.exceptions.NotAcceptableException[]
| api:http.server.exceptions.HttpStatusHandler[]
| api:http.server.exceptions.NotAllowedException[]
| api:http.server.exceptions.NotAllowedExceptionHandler[]
| `com.fasterxml.jackson.core.JsonProcessingException`
| api:http.server.exceptions.JsonExceptionHandler[]
| `java.net.URISyntaxException`
| api:http.server.exceptions.URISyntaxHandler[]
| api:core.bind.exceptions.UnsatisfiedArgumentException[]
| api:http.server.exceptions.UnsatisfiedArgumentHandler[]
| api:web.router.exceptions.UnsatisfiedRouteException[]
| api:http.server.exceptions.UnsatisfiedRouteHandler[]
|===
