> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/websocket/stomp/benefits.adoc`  
> Upstream Git blob: `3550cc14337568884c5e2dd28af6075365f6db1e`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[websocket-stomp-benefits]]
# Benefits

Using STOMP as a sub-protocol lets the Spring Framework and Spring Security
provide a richer programming model versus using raw WebSockets. The same point can be
made about HTTP versus raw TCP and how it lets Spring MVC and other web frameworks
provide rich functionality. The following is a list of benefits:

* No need to invent a custom messaging protocol and message format.
* STOMP clients, including a [Java client](web/websocket/stomp/client.adoc)
in the Spring Framework, are available.
* You can (optionally) use message brokers (such as RabbitMQ, ActiveMQ, and others) to
manage subscriptions and broadcast messages.
* Application logic can be organized in any number of `@Controller` instances and messages can be
routed to them based on the STOMP destination header versus handling raw WebSocket messages
with a single `WebSocketHandler` for a given connection.
* You can use Spring Security to secure messages based on STOMP destinations and message types.
