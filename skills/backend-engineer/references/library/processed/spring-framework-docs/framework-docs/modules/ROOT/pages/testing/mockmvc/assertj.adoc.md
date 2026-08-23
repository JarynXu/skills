> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/mockmvc/assertj.adoc`  
> Upstream Git blob: `932a8fd73ae12071eff535990ab42d31c0c7b141`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mockmvc-tester]]
# AssertJ Integration

The AssertJ integration builds on top of plain `MockMvc` with several differences:

* There is no need to use static imports as both the requests and assertions can be
crafted using a fluent API.
* Unresolved exceptions are handled consistently so that your tests do not need to
throw (or catch) `Exception`.
* By default, the result to assert is complete whether the processing is asynchronous
or not. In other words, there is no need for special handling for Async requests.

`MockMvcTester` is the entry point for the AssertJ support. It allows to craft the
request and return a result that is AssertJ compatible so that it can be wrapped in
a standard `assertThat()` method.
