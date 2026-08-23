> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/serverConfiguration/cors/corsExposedHeaders.adoc`  
> Upstream Git blob: `77bbf99c22609292dbd4efe679562df9e4b3f410`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

To configure the headers that are sent in the response to a CORS request through the `Access-Control-Expose-Headers` header, include a list of strings for the `exposed-headers` key in your configuration. None are exposed by default.

.Example CORS Configuration
[configuration]
```
micronaut:
  server:
    cors:
      enabled: true
      configurations:
        web:
          exposed-headers:
            - Content-Type
            - Authorization
```
