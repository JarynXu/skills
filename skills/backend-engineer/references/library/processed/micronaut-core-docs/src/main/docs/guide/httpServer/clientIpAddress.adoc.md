> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/clientIpAddress.adoc`  
> Upstream Git blob: `781cce43e6f16f826b3258fe3d7b4bb598b8b831`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

You may need to resolve the originating IP address of an HTTP Request. The Micronaut framework includes an implementation of api:http.server.util.HttpClientAddressResolver[].

The default implementation resolves the client address in the following places in order:

. The configured header
. The `Forwarded` header
. The `X-Forwarded-For` header
. The remote address on the request

The first priority header name can be configured with `micronaut.server.client-address-header`.
