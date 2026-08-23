> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux-webclient/client-testing.adoc`  
> Upstream Git blob: `f7a69c7dbb3d446b8b3c6961700502021559cabe`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-client-testing]]
# Testing

To test code that uses the `WebClient`, you can use a mock web server, such as
https://github.com/square/okhttp#mockwebserver[OkHttp MockWebServer] or
https://wiremock.org/[WireMock]. Mock web servers accept requests over HTTP like a regular
server, and that means you can test with the same HTTP client that is also configured in
the same way as in production, which is important because there are often subtle
differences in the way different clients handle network I/O. Another advantage of mock
web servers is the ability to simulate specific network issues and conditions at the
transport level, in combination with the client used in production.

For example use of MockWebServer, see
{spring-framework-code}/spring-webflux/src/test/java/org/springframework/web/reactive/function/client/WebClientIntegrationTests.java[`WebClientIntegrationTests`]
in the Spring Framework test suite or the
https://github.com/square/okhttp/tree/master/samples/static-server[`static-server`]
sample in the OkHttp repository.
