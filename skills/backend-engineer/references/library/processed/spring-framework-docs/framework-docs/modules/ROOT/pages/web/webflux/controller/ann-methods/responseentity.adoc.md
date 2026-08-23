> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux/controller/ann-methods/responseentity.adoc`  
> Upstream Git blob: `f7159a0754c8d4bc69a4d576992f05876aae471c`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-ann-responseentity]]
# `ResponseEntity`

[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-methods/responseentity.adoc)#

`ResponseEntity` is like [`@ResponseBody`](web/webflux/controller/ann-methods/responsebody.adoc)
but with status and headers. For example:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@GetMapping("/something")
	public ResponseEntity<String> handle() {
		String body = ... ;
		String etag = ... ;
		return ResponseEntity.ok().eTag(etag).body(body);
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@GetMapping("/something")
	fun handle(): ResponseEntity<String> {
		val body: String = ...
		val etag: String = ...
		return ResponseEntity.ok().eTag(etag).build(body)
	}
```
======

WebFlux supports using a single value [reactive type](web/webflux-reactive-libraries.adoc) to
produce the `ResponseEntity` asynchronously, and/or single and multi-value reactive types
for the body. This allows a variety of async responses with `ResponseEntity` as follows:

* `ResponseEntity<Mono<T>>` or `ResponseEntity<Flux<T>>` make the response status and
  headers known immediately while the body is provided asynchronously at a later point.
  Use `Mono` if the body consists of 0..1 values or `Flux` if it can produce multiple values.
* `Mono<ResponseEntity<T>>` provides all three -- response status, headers, and body,
  asynchronously at a later point. This allows the response status and headers to vary
  depending on the outcome of asynchronous request handling.
* `Mono<ResponseEntity<Mono<T>>>` or `Mono<ResponseEntity<Flux<T>>>` are yet another
  possible, albeit less common alternative. They provide the response status and headers
  asynchronously first and then the response body, also asynchronously, second.
