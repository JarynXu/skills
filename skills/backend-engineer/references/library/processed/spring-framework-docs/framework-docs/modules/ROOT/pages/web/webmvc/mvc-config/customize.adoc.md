> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-config/customize.adoc`  
> Upstream Git blob: `596295044b58c25200f06e98c0de997facb3fc2b`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-config-customize]]
# MVC Config API

[.small]#[See equivalent in the Reactive stack](web/webflux/config.adoc#webflux-config-customize)#

In Java configuration, you can implement the `WebMvcConfigurer` interface, as the
following example shows:

include-code::./WebConfiguration[tag=snippet,indent=0]

In XML, you can check attributes and sub-elements of `<mvc:annotation-driven/>`. You can
view the https://schema.spring.io/mvc/spring-mvc.xsd[Spring MVC XML schema] or use
the code completion feature of your IDE to discover what attributes and
sub-elements are available.
