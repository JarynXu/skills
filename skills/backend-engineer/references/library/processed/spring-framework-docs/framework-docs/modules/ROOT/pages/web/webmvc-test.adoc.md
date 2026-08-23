> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc-test.adoc`  
> Upstream Git blob: `404d87d31d95c58fcb216bdab31b40a1d9881fe4`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[test]]
# Testing
[.small]#[See equivalent in the Reactive stack](web/webflux-test.adoc)#

This section summarizes the options available in `spring-test` for Spring MVC applications.

* Servlet API Mocks: Mock implementations of Servlet API contracts for unit testing controllers,
filters, and other web components. See [Servlet API](testing/unit.adoc#mock-objects-servlet)
mock objects for more details.

* TestContext Framework: Support for loading Spring configuration in JUnit and TestNG tests,
including efficient caching of the loaded configuration across test methods and support for
loading a `WebApplicationContext` with a `MockServletContext`.
See [TestContext Framework](testing/testcontext-framework.adoc) for more details.

* Spring MVC Test: A framework, also known as `MockMvc`, for testing annotated controllers
through the `DispatcherServlet` (that is, supporting annotations), complete with the
Spring MVC infrastructure but without an HTTP server.
See [Spring MVC Test](testing/mockmvc.adoc) for more details.

* Client-side REST: `spring-test` provides a `MockRestServiceServer` that you can use as
a mock server for testing client-side code that internally uses the `RestTemplate`.
See [Client REST Tests](testing/spring-mvc-test-client.adoc) for more details.

* `WebTestClient`: Built for testing WebFlux applications, but it can also be used for
end-to-end integration testing, to any server, over an HTTP connection. It is a
non-blocking, reactive client and is well suited for testing asynchronous and streaming
scenarios. See [`WebTestClient`](testing/webtestclient.adoc) for more details.
