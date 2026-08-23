> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/websocket/stomp.adoc`  
> Upstream Git blob: `aa8c4ac597537011f132c3d9140fbbf0ea9eaa9d`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[websocket-stomp]]
# STOMP

The WebSocket protocol defines two types of messages (text and binary), but their
content is undefined. The protocol defines a mechanism for client and server to negotiate a
sub-protocol (that is, a higher-level messaging protocol) to use on top of WebSocket to
define what kind of messages each can send, what the format is, the content of each
message, and so on. The use of a sub-protocol is optional but, either way, the client and
the server need to agree on some protocol that defines message content.
