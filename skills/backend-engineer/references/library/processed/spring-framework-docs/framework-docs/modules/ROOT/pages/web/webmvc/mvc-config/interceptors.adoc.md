> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-config/interceptors.adoc`  
> Upstream Git blob: `d5354b4b297d339f71adfe6dcba648236780f833`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-config-interceptors]]
# Interceptors

You can register interceptors to apply to incoming requests, as the following example shows:

include-code::./WebConfiguration[tag=snippet,indent=0]

WARNING: Interceptors are not ideally suited as a security layer due to the potential for
a mismatch with annotated controller path matching. Generally, we recommend using Spring
Security, or alternatively a similar approach integrated with the Servlet filter chain,
and applied as early as possible.

NOTE: The XML config declares interceptors as `MappedInterceptor` beans, and those are in
turn detected by any `HandlerMapping` bean, including those from other frameworks.
By contrast, the Java config passes interceptors only to the  `HandlerMapping` beans it manages.
To re-use the same interceptors across Spring MVC and other framework `HandlerMapping`
beans with the MVC Java config, either declare `MappedInterceptor` beans (and don't
manually add them in the Java config), or configure the same interceptors in both
the Java config and in other `HandlerMapping` beans.
