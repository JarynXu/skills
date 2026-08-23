> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/websocket.adoc`  
> Upstream Git blob: `927240b0baad3b85362b5ca86732a549d5981a5d`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

The Micronaut framework features dedicated support for creating WebSocket clients and servers. The pkg:websocket.annotation[] package includes annotations for defining both clients and servers.

WARNING: Since Micronaut Framework 4.0. `io.micronaut:micronaut-http-server` no longer exposes `micronaut-websocket` transitively. To use annotations such as ann:websocket.annotation.ServerWebSocket[], add the `micronaut-websocket` dependency to your application classpath:

dependency::micronaut-websocket[]
