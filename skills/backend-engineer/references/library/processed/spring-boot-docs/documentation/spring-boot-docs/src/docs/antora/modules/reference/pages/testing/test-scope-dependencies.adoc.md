> **Offline teaching derivative**  
> Source: `spring-projects/spring-boot@c329ffa25dc160a90ebe5e4b006ad4cdf89d8683`  
> Upstream path: `documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/testing/test-scope-dependencies.adoc`  
> Upstream Git blob: `69a8c6d5d85f089e15066ce77e5e4f91ed709c44`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[testing.test-scope-dependencies]]
# Test Scope Dependencies

The `spring-boot-starter-test` starter (in the `test` `scope`) contains the following provided libraries:

* https://junit.org[JUnit]: The de-facto standard for unit testing Java applications.
* {url-spring-framework-docs}/testing/integration.html[Spring Test] & Spring Boot Test: Utilities and integration test support for Spring Boot applications.
* https://assertj.github.io/doc/[AssertJ]: A fluent assertion library.
* https://github.com/hamcrest/JavaHamcrest[Hamcrest]: A library of matcher objects (also known as constraints or predicates).
* https://site.mockito.org/[Mockito]: A Java mocking framework.
* https://github.com/skyscreamer/JSONassert[JSONassert]: An assertion library for JSON.
* https://github.com/jayway/JsonPath[JsonPath]: XPath for JSON.
* https://github.com/awaitility/awaitility[Awaitility]: A library for testing asynchronous systems.

We generally find these common libraries to be useful when writing tests.
If these libraries do not suit your needs, you can add additional test dependencies of your own.
