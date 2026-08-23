> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-servlet/config.adoc`  
> Upstream Git blob: `2a8950c073fefe79ca2d64c425e06c0f99c945d6`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-servlet-config]]
# Web MVC Config

[.small]#[See equivalent in the Reactive stack](web/webflux/dispatcher-handler.adoc#webflux-framework-config)#

Applications can declare the infrastructure beans listed in [Special Bean Types](web/webmvc/mvc-servlet/special-bean-types.adoc)
that are required to process requests. The `DispatcherServlet` checks the
`WebApplicationContext` for each special bean. If there are no matching bean types,
it falls back on the default types listed in
{spring-framework-code}/spring-webmvc/src/main/resources/org/springframework/web/servlet/DispatcherServlet.properties[`DispatcherServlet.properties`].

In most cases, the [MVC Config](web/webmvc/mvc-config.adoc) is the best starting point. It declares the required
beans in either Java or XML and provides a higher-level configuration callback API to
customize it.

NOTE: Spring Boot relies on the MVC Java configuration to configure Spring MVC and
provides many extra convenient options.
