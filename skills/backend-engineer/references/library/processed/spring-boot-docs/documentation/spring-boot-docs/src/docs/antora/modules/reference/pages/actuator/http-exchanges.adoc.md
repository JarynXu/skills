> **Offline teaching derivative**  
> Source: `spring-projects/spring-boot@c329ffa25dc160a90ebe5e4b006ad4cdf89d8683`  
> Upstream path: `documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/http-exchanges.adoc`  
> Upstream Git blob: `6fc12027434e051b2f87238153e086c2bb109a38`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[actuator.http-exchanges]]
# Recording HTTP Exchanges

You can enable recording of HTTP exchanges by providing a bean of type javadoc:org.springframework.boot.actuate.web.exchanges.HttpExchangeRepository[] in your application's configuration.
For convenience, Spring Boot offers javadoc:org.springframework.boot.actuate.web.exchanges.InMemoryHttpExchangeRepository[], which, by default, stores the last 100 request-response exchanges.
javadoc:org.springframework.boot.actuate.web.exchanges.InMemoryHttpExchangeRepository[] is limited compared to tracing solutions, and we recommend using it only for development environments.
For production environments, we recommend using a production-ready tracing or observability solution, such as Zipkin or OpenTelemetry.
Alternatively, you can create your own javadoc:org.springframework.boot.actuate.web.exchanges.HttpExchangeRepository[].

You can use the `httpexchanges` endpoint to obtain information about the request-response exchanges that are stored in the javadoc:org.springframework.boot.actuate.web.exchanges.HttpExchangeRepository[].


[[actuator.http-exchanges.custom]]
## Custom HTTP Exchange Recording

To customize the items that are included in each recorded exchange, use the configprop:management.httpexchanges.recording.include[] configuration property.

To disable recording entirely, set configprop:management.httpexchanges.recording.enabled[] to `false`.
