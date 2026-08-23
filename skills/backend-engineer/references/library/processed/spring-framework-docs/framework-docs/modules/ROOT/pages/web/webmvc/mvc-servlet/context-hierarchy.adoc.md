> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-servlet/context-hierarchy.adoc`  
> Upstream Git blob: `e1aabb0d111133cb408af1c70d7a48c8ff5e6f6e`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-servlet-context-hierarchy]]
# Context Hierarchy

`DispatcherServlet` expects a `WebApplicationContext` (an extension of a plain
`ApplicationContext`) for its own configuration. `WebApplicationContext` has a link to the
`ServletContext` and the `Servlet` with which it is associated. It is also bound to the `ServletContext`
such that applications can use static methods on `RequestContextUtils` to look up the
`WebApplicationContext` if they need access to it.

For many applications, having a single `WebApplicationContext` is simple and suffices.
It is also possible to have a context hierarchy where one root `WebApplicationContext`
is shared across multiple `DispatcherServlet` (or other `Servlet`) instances, each with
its own child `WebApplicationContext` configuration.
See [Additional Capabilities of the `ApplicationContext`](core/beans/context-introduction.adoc)
for more on the context hierarchy feature.

The root `WebApplicationContext` typically contains infrastructure beans, such as data repositories and
business services that need to be shared across multiple `Servlet` instances. Those beans
are effectively inherited and can be overridden (that is, re-declared) in the Servlet-specific
child `WebApplicationContext`, which typically contains beans local to the given `Servlet`.
The following image shows this relationship:

image::mvc-context-hierarchy.png[width=60%,align="center"]

The following example configures a `WebApplicationContext` hierarchy, and the equivalent `web.xml`:

include-code::./MyWebAppInitializer[tag=snippet,indent=0]

TIP: If an application context hierarchy is not required, applications can return all
configuration through `getRootConfigClasses()` and `null` from `getServletConfigClasses()`.


TIP: If an application context hierarchy is not required, applications may configure a
"`root`" context only and leave the `contextConfigLocation` Servlet parameter empty.
