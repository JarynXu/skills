> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/producesAnnotation.adoc`  
> Upstream Git blob: `bac33a7751f24e66eabdcf076c92fadad78ced26`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

A Micronaut controller action produces `application/json` by default. However, you can change the `Content-Type` of the response with the `@Produces` annotation or the `produces` member of the HTTP method annotations.

snippet::io.micronaut.docs.server.response.ProducesController[tags="imports,clazz", indent=0]

<1> The default content type is JSON
<2> Annotate a controller action with `@Produces` to change the response content type.
<3> Setting the `produces` member of the method annotation also changes the content type.
