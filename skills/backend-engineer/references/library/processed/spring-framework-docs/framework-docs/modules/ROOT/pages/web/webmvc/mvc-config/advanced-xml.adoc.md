> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-config/advanced-xml.adoc`  
> Upstream Git blob: `cc5a1130bc9f65523364b76f5604252284aa1a1c`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-config-advanced-xml]]
# Advanced XML Config

The MVC namespace does not have an advanced mode. If you need to customize a property on
a bean that you cannot change otherwise, you can use the `BeanPostProcessor` lifecycle
hook of the Spring `ApplicationContext`, as the following example shows:

include-code::./MyPostProcessor[tag=snippet,indent=0]

Note that you need to declare `MyPostProcessor` as a bean, either explicitly in XML or
by letting it be detected through a `<component-scan/>` declaration.
