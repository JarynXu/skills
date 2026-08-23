> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux-webclient.adoc`  
> Upstream Git blob: `a8b3b595ed3e1d9f561aa91727aab007109608c7`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-client]]
# WebClient

Spring WebFlux includes a client to perform HTTP requests. `WebClient` has a
functional, fluent API based on Reactor (see [Reactive Libraries](web/webflux-reactive-libraries.adoc))
which enables declarative composition of asynchronous logic without the need to deal with
threads or concurrency. It is fully non-blocking, supports streaming, and relies on
the same [codecs](web/webflux/reactive-spring.adoc#webflux-codecs) that are also used to encode and
decode request and response content on the server side.

`WebClient` needs an HTTP client library to perform requests. There is built-in
support for the following:

* {reactor-github-org}/reactor-netty[Reactor Netty]
* {java-api}/java.net.http/java/net/http/HttpClient.html[JDK HttpClient]
* https://github.com/jetty-project/jetty-reactive-httpclient[Jetty Reactive HttpClient]
* https://hc.apache.org/index.html[Apache HttpComponents]
* Others can be plugged in via `ClientHttpConnector`.
