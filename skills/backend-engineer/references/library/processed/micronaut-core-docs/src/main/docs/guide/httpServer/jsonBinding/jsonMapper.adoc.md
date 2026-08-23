> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/jsonBinding/jsonMapper.adoc`  
> Upstream Git blob: `602c3ad0f8569a9b7029bd9c05628feb6881bc65`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

You may be familiar with https://fasterxml.github.io/jackson-databind/javadoc/2.7/com/fasterxml/jackson/databind/ObjectMapper.html[Jackson's `ObjectMapper`]. For implementation-agnostic application code, we recommend depending on api:json.JsonMapper[], which is Micronaut's JSON abstraction for common mapping operations. <<jsonBinding, Micronaut Serialization and Micronaut Jackson Databind>> both provide implementations of api:json.JsonMapper[], and Micronaut Serialization also defines its own `ObjectMapper` interface that extends api:json.JsonMapper[].

If you are intentionally writing implementation-specific code, you can still use the corresponding implementation API such as Jackson's `ObjectMapper` or Micronaut Serialization's `ObjectMapper`.

You can inject a bean of type `JsonMapper` or manually instantiate one via `JsonMapper.createDefault()`.
