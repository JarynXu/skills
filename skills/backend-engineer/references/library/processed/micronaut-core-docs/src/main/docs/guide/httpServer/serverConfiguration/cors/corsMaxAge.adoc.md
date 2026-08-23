> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/serverConfiguration/cors/corsMaxAge.adoc`  
> Upstream Git blob: `34523504b66cd9cfae886488c878b1a72da0ce1b`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

The default maximum age that preflight requests can be cached is 30 minutes. To change that behavior, specify a value in seconds.

.Example CORS Configuration
[configuration]
```
micronaut:
  server:
    cors:
      enabled: true
      configurations:
        web:
          max-age: 3600 # 1 hour
```
