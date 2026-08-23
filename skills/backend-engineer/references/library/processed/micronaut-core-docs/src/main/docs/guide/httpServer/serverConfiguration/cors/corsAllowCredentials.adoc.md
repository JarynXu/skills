> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/serverConfiguration/cors/corsAllowCredentials.adoc`  
> Upstream Git blob: `ee01952771ebb4b101318582659ed9f704ad0452`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

Credentials are disabled by default for CORS requests. To allow credentials, set the `allow-credentials` option to `true`.

.Example CORS Configuration
[configuration]
```
micronaut:
  server:
    cors:
      enabled: true
      configurations:
        web:
          allow-credentials: true
```
