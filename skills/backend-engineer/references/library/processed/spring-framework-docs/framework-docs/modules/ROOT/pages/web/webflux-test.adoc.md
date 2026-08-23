> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux-test.adoc`  
> Upstream Git blob: `39bd3906e872cd1ba8142f366e19706b173c7c03`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-test]]
# Testing
[.small]#[Same in Spring MVC](web/webmvc-test.adoc)#

The `spring-test` module provides mock implementations of `ServerHttpRequest`,
`ServerHttpResponse`, and `ServerWebExchange`.
See [Spring Web Reactive](testing/unit.adoc#mock-objects-web-reactive) for a
discussion of mock objects.

[`WebTestClient`](testing/webtestclient.adoc) builds on these mock request and
response objects to provide support for testing WebFlux applications without an HTTP
server. You can use the `WebTestClient` for end-to-end integration tests, too.
