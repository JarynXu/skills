> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/jsonBinding/jacksonConfiguration/jacksonConfigurationSupportForJsonView.adoc`  
> Upstream Git blob: `93cf7bb6fc553405cc984b89b4bcf2a21458c6b1`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

If you use <<jsonBinding, `micronaut-jackson-databind`>>, you can use the `@JsonView` annotation on controller methods if you set `jackson.json-view.enabled` to `true` in your configuration file (e.g `application.yml`).

Jackson's `@JsonView` annotation lets you control which properties are exposed on a per-response basis. See https://www.baeldung.com/jackson-json-view-annotation[Jackson JSON Views] for more information.
