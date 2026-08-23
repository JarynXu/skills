> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/mockmvc/assertj/setup.adoc`  
> Upstream Git blob: `5f0317c0411ca2b126ac97779c8a050072e29f07`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mockmvc-tester-setup]]
# Configuring MockMvcTester

`MockMvcTester` can be setup in one of two ways. One is to point directly to the
controllers you want to test and programmatically configure Spring MVC infrastructure.
The second is to point to Spring configuration with Spring MVC and controller
infrastructure in it.

TIP: For a comparison of those two modes, check [Setup Options](testing/mockmvc/setup-options.adoc).

To set up `MockMvcTester` for testing a specific controller, use the following:

include-code::./AccountControllerStandaloneTests[tag=snippet,indent=0]

To set up `MockMvcTester` through Spring configuration, use the following:

include-code::./AccountControllerIntegrationTests[tag=snippet,indent=0]

`MockMvcTester` can convert the JSON response body, or the result of a JSONPath expression,
to one of your domain object as long as the relevant `HttpMessageConverter` is registered.

If you use Jackson to serialize content to JSON, the following example registers the
converter:

include-code::./converter/AccountControllerIntegrationTests[tag=snippet,indent=0]

NOTE: The above assumes the converter has been registered as a Bean.

Finally, if you have a `MockMvc` instance handy, you can create a `MockMvcTester` by
providing the `MockMvc` instance to use using the `create` factory method.
