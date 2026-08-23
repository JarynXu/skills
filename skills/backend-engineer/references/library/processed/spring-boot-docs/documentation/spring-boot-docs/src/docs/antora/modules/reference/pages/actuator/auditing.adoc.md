> **Offline teaching derivative**  
> Source: `spring-projects/spring-boot@c329ffa25dc160a90ebe5e4b006ad4cdf89d8683`  
> Upstream path: `documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/auditing.adoc`  
> Upstream Git blob: `34926876d7c56a7da8584e779e38eb85ec1262a9`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[actuator.auditing]]
# Auditing

Once Spring Security is in play, Spring Boot Actuator has a flexible audit framework that publishes events (by default, "`authentication success`", "`failure`" and "`access denied`" exceptions).
This feature can be very useful for reporting and for implementing a lock-out policy based on authentication failures.

You can enable auditing by providing a bean of type javadoc:org.springframework.boot.actuate.audit.AuditEventRepository[] in your application's configuration.
For convenience, Spring Boot offers an javadoc:org.springframework.boot.actuate.audit.InMemoryAuditEventRepository[].
javadoc:org.springframework.boot.actuate.audit.InMemoryAuditEventRepository[] has limited capabilities, and we recommend using it only for development environments.
For production environments, consider creating your own alternative javadoc:org.springframework.boot.actuate.audit.AuditEventRepository[] implementation.


[[actuator.auditing.custom]]
## Custom Auditing

To customize published security events, you can provide your own implementations of javadoc:org.springframework.boot.actuate.security.AbstractAuthenticationAuditListener[] and javadoc:org.springframework.boot.actuate.security.AbstractAuthorizationAuditListener[].

You can also use the audit services for your own business events.
To do so, either inject the javadoc:org.springframework.boot.actuate.audit.AuditEventRepository[] bean into your own components and use that directly or publish an javadoc:org.springframework.boot.actuate.audit.listener.AuditApplicationEvent[] with the Spring javadoc:org.springframework.context.ApplicationEventPublisher[] (by implementing javadoc:org.springframework.context.ApplicationEventPublisherAware[]).
