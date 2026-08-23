> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-servlet/multipart.adoc`  
> Upstream Git blob: `23febfb6ba61759c7be8935a3129dff7f597c16e`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-multipart]]
# Multipart Resolver

[.small]#[See equivalent in the Reactive stack](web/webflux/reactive-spring.adoc#webflux-multipart)#

`MultipartResolver` from the `org.springframework.web.multipart` package is a strategy
for parsing multipart requests including file uploads. There is a container-based
`StandardServletMultipartResolver` implementation for Servlet multipart request parsing.

To enable multipart handling, you need to declare a `MultipartResolver` bean in your
`DispatcherServlet` Spring configuration with a name of `multipartResolver`.
The `DispatcherServlet` detects it and applies it to the incoming request. When a POST
with a content type of `multipart/form-data` is received, the resolver parses the
content wraps the current `HttpServletRequest` as a `MultipartHttpServletRequest` to
provide access to resolved files in addition to exposing parts as request parameters.


[[mvc-multipart-resolver-standard]]
## Servlet Multipart Parsing

Servlet multipart parsing needs to be enabled through Servlet container configuration.
To do so:

* In Java, set a `MultipartConfigElement` on the Servlet registration.
* In `web.xml`, add a `"<multipart-config>"` section to the servlet declaration.

The following example shows how to set a `MultipartConfigElement` on the Servlet registration:

include-code::./AppInitializer[tag=snippet,indent=0]

Once the Servlet multipart configuration is in place, you can add a bean of type
`StandardServletMultipartResolver` with a name of `multipartResolver`.

[NOTE]
====
This resolver variant uses your Servlet container's multipart parser as-is,
potentially exposing the application to container implementation differences.
By default, it will try to parse any `multipart/` content type with any HTTP
method but this may not be supported across all Servlet containers. See the
{spring-framework-api}/web/multipart/support/StandardServletMultipartResolver.html[`StandardServletMultipartResolver`]
javadoc for details and configuration options.
====
