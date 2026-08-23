> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/mockmvc/overview.adoc`  
> Upstream Git blob: `84851b2d95f6ca13e0d57e91cdd1d01e1199bec2`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mockmvc-overview]]
# Overview

You can write plain unit tests for Spring MVC by instantiating a controller, injecting it
with dependencies, and calling its methods. However such tests do not verify request
mappings, data binding, message conversion, type conversion, or validation and also do
not involve any of the supporting `@InitBinder`, `@ModelAttribute`, or
`@ExceptionHandler` methods.

`MockMvc` aims to provide more complete testing support for Spring MVC controllers
without a running server. It does that by invoking the `DispatcherServlet` and passing
["mock" implementations of the Servlet API](testing/unit.adoc#mock-objects-servlet)
from the `spring-test` module which replicates the full Spring MVC request handling
without a running server.

MockMvc is a server-side test framework that lets you verify most of the functionality of
a Spring MVC application using lightweight and targeted tests. You can use it on its own
to perform requests and to verify responses using Hamcrest or through `MockMvcTester`
which provides a fluent API using AssertJ. You can also use it through the
[WebTestClient](testing/webtestclient.adoc) API with MockMvc plugged in as the server
to handle requests.
