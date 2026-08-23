> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/http3Server.adoc`  
> Upstream Git blob: `663b617ca54ea38c1e1f3e4eff0b28f2e7072be1`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

Since Micronaut framework 4.x, Micronaut's Netty-based HTTP server can be configured to support HTTP/3.

#### Configuring the Server for HTTP/3

Instead of the TCP used for HTTP/1.1 and HTTP/2, HTTP/3 runs on UDP. To expose an HTTP/3 server, you need to define a <<listener, listener>> with the special `QUIC` protocol family:

.Enabling HTTP/3 Support
```yaml
micronaut:
  server:
    netty:
      listeners:
        http3Listener:
          family: QUIC
          port: 8443
```

NOTE: that defining this listener will disable the implicit TCP listeners. You can add them manually as described in the <<listener, listener section>>.

Additionally, the netty HTTP/3 codec needs to be present on the classpath:

dependency:micronaut-http-netty-http3[]
