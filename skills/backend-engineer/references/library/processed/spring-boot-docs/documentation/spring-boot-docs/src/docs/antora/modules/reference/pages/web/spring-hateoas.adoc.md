> **Offline teaching derivative**  
> Source: `spring-projects/spring-boot@c329ffa25dc160a90ebe5e4b006ad4cdf89d8683`  
> Upstream path: `documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/web/spring-hateoas.adoc`  
> Upstream Git blob: `21f2b89753dfe6fa0b48ae2b54c34a17abdfb0cf`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[web.spring-hateoas]]
# Spring HATEOAS

If you develop a RESTful API that makes use of hypermedia, Spring Boot provides auto-configuration for Spring HATEOAS that works well with most applications.
The auto-configuration replaces the need to use javadoc:org.springframework.hateoas.config.EnableHypermediaSupport[format=annotation] and registers a number of beans to ease building hypermedia-based applications, including a javadoc:org.springframework.hateoas.client.LinkDiscoverers[] (for client side support) and an javadoc:tools.jackson.databind.json.JsonMapper[] configured to correctly marshal responses into the desired representation.
The javadoc:tools.jackson.databind.json.JsonMapper[] is customized by setting the various `spring.jackson.*` properties or, if any exist, the javadoc:org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer[] beans.

You can take control of Spring HATEOAS's configuration by using javadoc:org.springframework.hateoas.config.EnableHypermediaSupport[format=annotation].
Note that doing so disables the javadoc:tools.jackson.databind.json.JsonMapper[] customization described earlier.

WARNING: `spring-boot-starter-hateoas` is specific to Spring MVC and should not be combined with Spring WebFlux.
In order to use Spring HATEOAS with Spring WebFlux, you can add a direct dependency on `org.springframework.hateoas:spring-hateoas` along with `spring-boot-starter-webflux`.

By default, requests that accept `application/json` will receive an `application/hal+json` response.
To disable this behavior set configprop:spring.hateoas.use-hal-as-default-json-media-type[] to `false` and define a javadoc:org.springframework.hateoas.config.HypermediaMappingInformation[] or javadoc:org.springframework.hateoas.mediatype.hal.HalConfiguration[] to configure Spring HATEOAS to meet the needs of your application and its clients.
