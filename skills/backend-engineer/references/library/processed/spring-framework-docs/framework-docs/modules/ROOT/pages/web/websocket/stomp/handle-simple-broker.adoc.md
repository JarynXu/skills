> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/websocket/stomp/handle-simple-broker.adoc`  
> Upstream Git blob: `15efa72b1015fd768a6705f0284083aba49a2e1c`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[websocket-stomp-handle-simple-broker]]
# Simple Broker

The built-in simple message broker handles subscription requests from clients,
stores them in memory, and broadcasts messages to connected clients that have matching
destinations. The broker supports path-like destinations, including subscriptions
to Ant-style destination patterns.

NOTE: Applications can also use dot-separated (rather than slash-separated) destinations.
See [Dots as Separators](web/websocket/stomp/destination-separator.adoc).

If configured with a task scheduler, the simple broker supports
https://stomp.github.io/stomp-specification-1.2.html#Heart-beating[STOMP heartbeats].
To configure a scheduler, you can declare your own `TaskScheduler` bean and set it through
the `MessageBrokerRegistry`. Alternatively, you can use the one that is automatically
declared in the built-in WebSocket configuration, however, you'll need `@Lazy` to avoid
a cycle between the built-in WebSocket configuration and your
`WebSocketMessageBrokerConfigurer`. For example:

include-code::./WebSocketConfiguration[tag=snippet,indent=0]
