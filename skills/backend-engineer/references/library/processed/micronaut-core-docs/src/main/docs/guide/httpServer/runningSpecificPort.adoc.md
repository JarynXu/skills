> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/runningSpecificPort.adoc`  
> Upstream Git blob: `c5ebb53643f1d76d50c4bdd94f1c965fa98671d2`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

By default, the server runs on port 8080. However, you can set the server to run on a specific port:

[configuration]
```
micronaut:
  server:
    port: 8086
```

TIP: This is also configurable from an environment variable, e.g. `MICRONAUT_SERVER_PORT=8086`

To run on a random port:

[configuration]
```
micronaut:
  server:
    port: -1
```

TIP: Setting an explicit port may cause tests to fail if multiple servers start simultaneously on the same port. To prevent that, specify a random port in the test environment configuration.
