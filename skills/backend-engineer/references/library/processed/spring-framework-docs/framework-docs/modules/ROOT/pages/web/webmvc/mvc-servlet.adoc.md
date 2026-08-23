> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-servlet.adoc`  
> Upstream Git blob: `1374c3dd338134a0faaec136da9bc987419ebda2`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-servlet]]
# DispatcherServlet

[.small]#[See equivalent in the Reactive stack](web/webflux/dispatcher-handler.adoc)#

Spring MVC, as many other web frameworks, is designed around the front controller
pattern where a central `Servlet`, the `DispatcherServlet`, provides a shared algorithm
for request processing, while actual work is performed by configurable delegate components.
This model is flexible and supports diverse workflows.

The `DispatcherServlet`, as any `Servlet`, needs to be declared and mapped according
to the Servlet specification by using Java configuration or in `web.xml`.
In turn, the `DispatcherServlet` uses Spring configuration to discover
the delegate components it needs for request mapping, view resolution, exception
handling, [and more](web/webmvc/mvc-servlet/special-bean-types.adoc).

The following example shows the programmatic registration and initialization of
the `DispatcherServlet`, which is auto-detected by the Servlet container
(see [Servlet Config](web/webmvc/mvc-servlet/container-config.adoc)), and the
equivalent `web.xml`:

include-code::./MyWebApplicationInitializer[tag=snippet,indent=0]

NOTE: In addition to using the ServletContext API directly, you can also extend
`AbstractAnnotationConfigDispatcherServletInitializer` and override specific methods
(see the example under [Context Hierarchy](web/webmvc/mvc-servlet/context-hierarchy.adoc)).

NOTE: For programmatic use cases, a `GenericWebApplicationContext` can be used as an
alternative to `AnnotationConfigWebApplicationContext`. See the
{spring-framework-api}/web/context/support/GenericWebApplicationContext.html[`GenericWebApplicationContext`]
javadoc for details.

NOTE: Spring Boot follows a different initialization sequence. Rather than hooking into
the lifecycle of the Servlet container, Spring Boot uses Spring configuration to
bootstrap itself and the embedded Servlet container. `Filter` and `Servlet` declarations
are detected in Spring configuration and registered with the Servlet container.
For more details, see the
{spring-boot-docs-ref}/web/servlet.html#web.servlet.embedded-container[Spring Boot documentation].
