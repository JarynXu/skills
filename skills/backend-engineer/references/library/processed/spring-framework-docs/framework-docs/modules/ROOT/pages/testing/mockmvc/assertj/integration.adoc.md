> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/mockmvc/assertj/integration.adoc`  
> Upstream Git blob: `5d6f04436a850c52662352f8768562fc676766ee`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mockmvc-tester-integration]]
# MockMvc integration

If you want to use the AssertJ support but have invested in the original `MockMvc`
API, `MockMvcTester` offers several ways to integrate with it.

If you have your own `RequestBuilder` implementation, you can trigger the processing
of the request using `perform`. The example below showcases how the query can be
crafted with the original API:

include-code::./HotelControllerTests[tag=perform,indent=0]

Similarly, if you have crafted custom matchers that you use with the `.andExpect` feature
of `MockMvc` you can use them via `.matches`. In the example below, we rewrite the
preceding example to assert the status with  the `ResultMatcher` implementation that
`MockMvc` provides:

include-code::./HotelControllerTests[tag=matches,indent=0]

`MockMvc` also defines a `ResultHandler` contract that lets you execute arbitrary actions
on `MvcResult`. If you have implemented this contract you can invoke it using `.apply`.
