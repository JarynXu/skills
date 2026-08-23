> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/mockmvc/hamcrest/vs-streaming-response.adoc`  
> Upstream Git blob: `e44695650cb8666e25f52a59d59894917840858f`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mockmvc-vs-streaming-response]]
# Streaming Responses

You can use `WebTestClient` to test [streaming responses](testing/webtestclient.adoc#webtestclient-stream)
such as Server-Sent Events. However, `MockMvcWebTestClient` doesn't support infinite
streams because there is no way to cancel the server stream from the client side.
To test infinite streams, you'll need to
[bind to](testing/webtestclient.adoc#webtestclient-server-config) a running server,
or when using Spring Boot,
{spring-boot-docs-ref}/testing/spring-boot-applications.html#testing.spring-boot-applications.with-running-server[test with a running server].

`MockMvcWebTestClient` does support asynchronous responses, and even streaming responses.
The limitation is that it can't influence the server to stop, and therefore the server
must finish writing the response on its own.
