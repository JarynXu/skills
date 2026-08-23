> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/websocket/stomp/server-config.adoc`  
> Upstream Git blob: `5903c07051bb720da2ab6f8e73797c6e073ded3a`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[websocket-stomp-server-config]]
# WebSocket Transport

This section explains how to configure the underlying WebSocket server transport.

For Jakarta WebSocket servers, add a `ServletServerContainerFactoryBean` to your
configuration. For examples, see
[Configuring the Server](web/websocket/server.adoc#websocket-server-runtime-configuration)
under the WebSocket section.

For Jetty WebSocket servers, customize the `JettyRequestUpgradeStrategy` as follows:

include-code::./JettyWebSocketConfiguration[tag=snippet,indent=0]

In addition to WebSocket server properties, there are also STOMP WebSocket transport properties
to customize as follows:

include-code::./WebSocketConfiguration[tag=snippet,indent=0]
