> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc-client.adoc`  
> Upstream Git blob: `03b8950d7e4090edee413ec454d79f2dd4e269c1`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webmvc-client]]
# REST Clients

This section describes options for client-side access to REST endpoints.


[[webmvc-restclient]]
## `RestClient`

`RestClient` is a synchronous HTTP client that exposes a modern, fluent API.

See [`RestClient`](integration/rest-clients.adoc#rest-restclient) for more details.


[[webmvc-webclient]]
## `WebClient`

`WebClient` is a reactive client for making HTTP requests with a fluent API.

See [`WebClient`](web/webflux-webclient.adoc) for more details.


[[webmvc-resttemplate]]
## `RestTemplate`

`RestTemplate` is a synchronous client for making HTTP requests. It is the original
Spring REST client and exposes a simple, template-method API over underlying HTTP client
libraries.

See [`RestTemplate`](integration/rest-clients.adoc#rest-resttemplate) for details.


[[webmvc-http-service-client]]
## HTTP Service Client

The Spring Framework lets you define an HTTP service as a Java interface with HTTP
exchange methods. You can then generate a proxy that implements this interface and
performs the exchanges. This helps to simplify HTTP remote access and provides additional
flexibility for choosing an API style such as synchronous or reactive.

See [HTTP Service Client](integration/rest-clients.adoc#rest-http-service-client) for details.
