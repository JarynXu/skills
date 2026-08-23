> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/serverConfiguration/cors/corsAllowedHeaders.adoc`  
> Upstream Git blob: `fb6e540e8a715dccb518110d51df6c08f3083672`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

To allow any request header for a given configuration, don't include the `allowed-headers` key in your configuration.

For multiple allowed headers, set the `allowed-headers` key of the configuration to a list of strings.

.Example CORS Configuration
[configuration]
```
micronaut:
  server:
    cors:
      enabled: true
      configurations:
        web:
          allowed-headers:
            - Content-Type
            - Authorization
```
