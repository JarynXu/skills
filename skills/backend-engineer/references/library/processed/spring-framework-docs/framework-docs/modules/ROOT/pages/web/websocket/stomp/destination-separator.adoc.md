> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/websocket/stomp/destination-separator.adoc`  
> Upstream Git blob: `51de770cf82cbd359b47d1180a07c3005cf40b0b`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[websocket-stomp-destination-separator]]
# Dots as Separators

When messages are routed to `@MessageMapping` methods, they are matched with
`AntPathMatcher`. By default, patterns are expected to use slash (`/`) as the separator.
This is a good convention in web applications and similar to HTTP URLs. However, if
you are more used to messaging conventions, you can switch to using dot (`.`) as the separator.

The following example shows how to do so:

include-code::./WebSocketConfiguration[tag=snippet,indent=0]

After that, a controller can use a dot (`.`) as the separator in `@MessageMapping` methods,
as the following example shows:

include-code::./RedController[tag=snippet,indent=0]

The client can now send a message to `/app/red.blue.green123`.

In the preceding example, we did not change the prefixes on the "`broker relay`", because those
depend entirely on the external message broker. See the STOMP documentation pages for
the broker you use to see what conventions it supports for the destination header.

The "`simple broker`", on the other hand, does rely on the configured `PathMatcher`, so, if
you switch the separator, that change also applies to the broker and the way the broker matches
destinations from a message to patterns in subscriptions.
