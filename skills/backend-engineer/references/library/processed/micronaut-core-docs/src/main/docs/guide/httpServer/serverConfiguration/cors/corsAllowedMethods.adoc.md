> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/serverConfiguration/cors/corsAllowedMethods.adoc`  
> Upstream Git blob: `c34bc16f788f3fed6351db4fc11da971b60e5996`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

To allow any request method for a given configuration, don't include the `allowed-methods` key in your configuration.

For multiple allowed methods, set the `allowed-methods` key of the configuration to a list of strings.

.Example CORS Configuration
[configuration]
```
micronaut:
  server:
    cors:
      enabled: true
      configurations:
        web:
          allowed-methods:
            - POST
            - PUT
```
