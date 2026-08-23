> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/websocket/stomp/authorization.adoc`  
> Upstream Git blob: `a8a3bc520a057e548ec97102570cd580f66ac471`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[websocket-stomp-authorization]]
# Authorization

Spring Security provides
{docs-spring-security}/servlet/integrations/websocket.html#websocket-authorization[WebSocket sub-protocol authorization]
that uses a `ChannelInterceptor` to authorize messages based on the user header in them.
Also, Spring Session provides
{docs-spring-session}/web-socket.html[WebSocket integration]
that ensures the user's HTTP session does not expire while the WebSocket session is still active.
