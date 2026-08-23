> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/jsonBinding/serializeUsingMicronautSerialization.adoc`  
> Upstream Git blob: `4cd0f4dfbf267d210a1cd99e5d92c165b23f16e5`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

https://micronaut-projects.github.io/micronaut-serialization/latest/guide/index.html#quickStart[Micronaut Serialization] offers reflection-free serialization using build-time <<introspection, Bean Introspections>>. It supports alternative formats such as https://micronaut-projects.github.io/micronaut-serialization/latest/guide/index.html#jsonpQuick[JSON-P or JSON-B]. You need to add the following dependencies:

dependency:micronaut-serde-processor[groupId=io.micronaut.serde,scope=annotationProcessor]
dependency:micronaut-serde-jackson[groupId=io.micronaut.serde]
