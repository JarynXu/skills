> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-config/advanced-java.adoc`  
> Upstream Git blob: `4a79db746df15d9f3b66a1cd453e8ad798e53a61`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-config-advanced-java]]
# Advanced Java Config

[.small]#[See equivalent in the Reactive stack](web/webflux/config.adoc#webflux-config-advanced-java)#

`@EnableWebMvc` imports `DelegatingWebMvcConfiguration`, which:

* Provides default Spring configuration for Spring MVC applications
* Detects and delegates to `WebMvcConfigurer` implementations to customize that configuration.

For advanced mode, you can remove `@EnableWebMvc` and extend directly from
`DelegatingWebMvcConfiguration` instead of implementing `WebMvcConfigurer`,
as the following example shows:

include-code::./WebConfiguration[tag=snippet,indent=0]

You can keep existing methods in `WebConfig`, but you can now also override bean declarations
from the base class, and you can still have any number of other `WebMvcConfigurer` implementations on
the classpath.
