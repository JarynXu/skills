> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/errorHandling/statusHandlers.adoc`  
> Upstream Git blob: `9ebeb1a5c0fb5ea85170b2e0566a30ad3d4f4780`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

The ann:http.annotation.Error[] annotation supports defining either an exception class or an HTTP status. Methods annotated with ann:http.annotation.Error[] must be defined within a class annotated with ann:http.annotation.Controller[]. The annotation also supports the notion of global and local, local being the default.

Local error handlers only respond to exceptions thrown as a result of the route being matched to another method in the same controller. Global error handlers can be invoked as a result of any thrown exception. A local error handler is always searched for first when resolving which handler to execute.

TIP: When defining an error handler for an exception, you can specify the exception instance as an argument to the method and omit the exception property of the annotation.

TIP: See the guide for https://guides.micronaut.io/latest/micronaut-error-handling.html[Error Handling] to learn more.
