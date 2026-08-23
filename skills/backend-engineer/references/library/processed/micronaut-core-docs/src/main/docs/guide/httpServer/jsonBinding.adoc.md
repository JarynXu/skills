> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/jsonBinding.adoc`  
> Upstream Git blob: `b873e7cb501a06a876b33c20cde1db262e0c2091`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

The most common data interchange format nowadays is JSON.

By default, the api:http.annotation.Controller[] annotation specifies that the controllers in Micronaut framework consume and produce JSON by default.

Since Micronaut Framework 4.0, users must choose how they want to serialize (Jackson Databind or Micronaut Serialization). Both approaches allow the usage of https://micronaut-projects.github.io/micronaut-serialization/latest/guide/index.html#jacksonAnnotations[Jackson Annotations].

With either approach, the Micronaut framework reads incoming JSON in a non-blocking manner.
