> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-range.adoc`  
> Upstream Git blob: `7ba60ead537979b647fdcc24efc6aec41add7a05`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-range]]
# Range Requests

[.small]#[See equivalent in the Reactive stack](web/webflux/range.adoc)#

Spring MVC supports https://datatracker.ietf.org/doc/html/rfc9110#section-14[RFC 9110]
range requests. For an overview, see the
https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests[Ranger Requests]
Mozilla guide.

The `Range` header is parsed and handled transparently in Spring MVC when an annotated
controller returns a `Resource` or `ResponseEntity<Resource>`, or a functional endpoint
[serves a `Resource`](web/webmvc-functional.adoc#webmvc-fn-resources). `Range` header
support is also transparently handled when serving
[static resources](web/webmvc/mvc-config/static-resources.adoc).

TIP: The `Resource` must not be an `InputStreamResource` and with `ResponseEntity<Resource>`,
the status of the response must be 200.

The underlying support is in the `HttpRange` class, which exposes methods to parse
`Range` headers and split a `Resource` into a `List<ResourceRegion>` that in turn can be
then written to the response via `ResourceRegionHttpMessageConverter`.
