> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/serverConfiguration/cors/corsMultipleHeaderValues.adoc`  
> Upstream Git blob: `81d929a8e18b541379799eee6639b3009db4ad00`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

By default, when a header has multiple values, multiple headers are sent, each with a single value. It is possible to change the behavior to send a single header with a comma-separated list of values by setting a configuration option.

[configuration]
```
micronaut:
  server:
    cors:
      single-header: true
```
