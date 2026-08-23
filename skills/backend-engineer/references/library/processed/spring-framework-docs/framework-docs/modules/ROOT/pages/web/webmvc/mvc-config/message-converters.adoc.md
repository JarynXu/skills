> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-config/message-converters.adoc`  
> Upstream Git blob: `1535f411714b1396ed4866b883c090f57e92b132`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-config-message-converters]]
# Message Converters

[.small]#[See equivalent in the Reactive stack](web/webflux/config.adoc#webflux-config-message-codecs)#

You can configure the `HttpMessageConverter` instances to use by overriding
{spring-framework-api}/web/servlet/config/annotation/WebMvcConfigurer.html#configureMessageConverters(org.springframework.http.converter.HttpMessageConverters.Builder)[`configureMessageConverters()`].

The following example configures custom Jackson JSON and XML converters with customized mappers instead of the default
ones:

include-code::./WebConfiguration[tag=snippet,indent=0]
