> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/serverConfiguration/cors/corsAllowPrivateNetwork.adoc`  
> Upstream Git blob: `7528e6356bee691775e7b8fea9f4a49d5c5a87fb`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

Access from https://developer.chrome.com/blog/private-network-access-preflight[private network] is allowed by default for CORS requests. To disallow acces from local network, set the `allow-private-network` option to `false`.

.Example CORS Configuration
[configuration]
```
micronaut:
  server:
    cors:
      enabled: true
      configurations:
        web:
          allow-private-network: false
```
