> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc-view.adoc`  
> Upstream Git blob: `b67ed2c961602bff766fb76fa174b06d96c6325e`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-view]]
# View Technologies

[.small]#[See equivalent in the Reactive stack](web/webflux-view.adoc)#

The rendering of views in Spring MVC is pluggable. Whether you decide to use
Thymeleaf, Groovy Markup Templates, JSPs, or other technologies is primarily a matter of
a configuration change. This chapter covers view technologies integrated with Spring MVC.

For more context on view rendering, please see [View Resolution](web/webmvc/mvc-servlet/viewresolver.adoc).

WARNING: The views of a Spring MVC application live within the internal trust boundaries
of that application. Views have access to all the beans of your application context. As
such, it is not recommended to use Spring MVC's template support in applications where
the templates are editable by external sources, since this can have security implications.
