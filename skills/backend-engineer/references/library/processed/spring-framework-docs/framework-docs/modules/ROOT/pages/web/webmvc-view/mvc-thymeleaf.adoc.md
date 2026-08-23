> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc-view/mvc-thymeleaf.adoc`  
> Upstream Git blob: `749530ee17985a9bd4c7b3e66bd4e74c8434a5e6`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-view-thymeleaf]]
# Thymeleaf

[.small]#[See equivalent in the Reactive stack](web/webflux-view.adoc#webflux-view-thymeleaf)#

Thymeleaf is a modern server-side Java template engine that emphasizes natural HTML
templates that can be previewed in a browser by double-clicking, which is very helpful
for independent work on UI templates (for example, by a designer) without the need for
a running server. If you want to replace JSPs, Thymeleaf offers one of the most
extensive sets of features to make such a transition easier. Thymeleaf is actively
developed and maintained. For a more complete introduction, see the
https://www.thymeleaf.org/[Thymeleaf] project home page.

The Thymeleaf integration with Spring MVC is managed by the Thymeleaf project.
The configuration involves a few bean declarations, such as
`ServletContextTemplateResolver`, `SpringTemplateEngine`, and `ThymeleafViewResolver`.
See https://www.thymeleaf.org/documentation.html[Thymeleaf+Spring] for more details.
