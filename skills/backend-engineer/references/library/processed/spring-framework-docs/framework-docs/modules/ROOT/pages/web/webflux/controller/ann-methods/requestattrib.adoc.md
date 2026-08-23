> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux/controller/ann-methods/requestattrib.adoc`  
> Upstream Git blob: `5d473629fd67c8d41a504f94577af5ed6c8f06da`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-ann-requestattrib]]
# `@RequestAttribute`

[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-methods/requestattrib.adoc)#

Similarly to `@SessionAttribute`, you can use the `@RequestAttribute` annotation to
access pre-existing request attributes created earlier (for example, by a `WebFilter`),
as the following example shows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@GetMapping("/")
	public String handle(@RequestAttribute Client client) { <1>
		// ...
	}
```
<1> Using `@RequestAttribute`.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@GetMapping("/")
	fun handle(@RequestAttribute client: Client): String { // <1>
		// ...
	}
```
<1> Using `@RequestAttribute`.
======
