> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux/controller/ann-methods/responsebody.adoc`  
> Upstream Git blob: `8df9620441d05d239aede601648d74bc4da1f1bf`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-ann-responsebody]]
# `@ResponseBody`

[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-methods/responsebody.adoc)#

You can use the `@ResponseBody` annotation on a method to have the return serialized
to the response body through an [HttpMessageWriter](web/webflux/reactive-spring.adoc#webflux-codecs). The following
example shows how to do so:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@GetMapping("/accounts/{id}")
	@ResponseBody
	public Account handle() {
		// ...
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@GetMapping("/accounts/{id}")
	@ResponseBody
	fun handle(): Account {
		// ...
	}
```
======

`@ResponseBody` is also supported at the class level, in which case it is inherited by
all controller methods. This is the effect of `@RestController`, which is nothing more
than a meta-annotation marked with `@Controller` and `@ResponseBody`.

`@ResponseBody` supports reactive types, which means you can return Reactor or RxJava
types and have the asynchronous values they produce rendered to the response.
For additional details, see [Streaming](web/webflux/reactive-spring.adoc#webflux-codecs-streaming)
and [JSON rendering](web/webflux/reactive-spring.adoc#webflux-codecs-jackson).

You can combine `@ResponseBody` methods with JSON serialization views.
See [Jackson JSON](web/webflux/controller/ann-methods/jackson.adoc) for details.

You can use the [HTTP message codecs](web/webflux/config.adoc#webflux-config-message-codecs)
option of the [WebFlux Config](web/webflux/dispatcher-handler.adoc#webflux-framework-config)
to configure or customize message writing.
