> **Offline teaching derivative**  
> Source: `spring-projects/spring-boot@c329ffa25dc160a90ebe5e4b006ad4cdf89d8683`  
> Upstream path: `documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/messaging/websockets.adoc`  
> Upstream Git blob: `21b631611a51b5af9c41546e423dc9e1d117ad46`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[messaging.websockets]]
# WebSockets

Spring Boot provides WebSockets auto-configuration for embedded Tomcat and Jetty.
If you deploy a war file to a standalone container, Spring Boot assumes that the container is responsible for the configuration of its WebSocket support.

Spring Framework provides {url-spring-framework-docs}/web/websocket.html[rich WebSocket support] for MVC web applications that can be easily accessed through the `spring-boot-starter-websocket` module.

WebSocket support is also available for {url-spring-framework-docs}/web/webflux-websocket.html[reactive web applications] and requires to include the WebSocket API alongside `spring-boot-starter-webflux`:

```xml
<dependency>
	<groupId>jakarta.websocket</groupId>
	<artifactId>jakarta.websocket-api</artifactId>
</dependency>
```
