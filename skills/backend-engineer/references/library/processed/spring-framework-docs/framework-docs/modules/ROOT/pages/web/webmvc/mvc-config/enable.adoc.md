> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-config/enable.adoc`  
> Upstream Git blob: `15892142aafe838e581e0ddcc1a3d2330304aae1`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-config-enable]]
# Enable MVC Configuration

[.small]#[See equivalent in the Reactive stack](web/webflux/config.adoc#webflux-config-enable)#

You can use the `@EnableWebMvc` annotation to enable MVC configuration with programmatic configuration, or `<mvc:annotation-driven>` with XML configuration, as the following example shows:

include-code::./WebConfiguration[tag=snippet,indent=0]

WARNING: As of 7.0, support for the XML configuration namespace for Spring MVC has been deprecated.
There are no plans yet for removing it completely but XML configuration will not be updated to follow
the Java configuration model.

NOTE: When using Spring Boot, you may want to use `@Configuration` classes of type `WebMvcConfigurer` but without `@EnableWebMvc` to keep Spring Boot MVC customizations. See more details in [the MVC Config API section](web/webmvc/mvc-config/customize.adoc) and in {spring-boot-docs-ref}/web/servlet.html#web.servlet.spring-mvc.auto-configuration[the dedicated Spring Boot documentation].

The preceding example registers a number of Spring MVC
[infrastructure beans](web/webmvc/mvc-servlet/special-bean-types.adoc) and adapts to dependencies
available on the classpath (for example, payload converters for JSON, XML, and others).
