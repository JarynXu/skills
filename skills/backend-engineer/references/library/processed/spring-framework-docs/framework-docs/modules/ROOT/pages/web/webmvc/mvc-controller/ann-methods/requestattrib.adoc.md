> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-controller/ann-methods/requestattrib.adoc`  
> Upstream Git blob: `3e1edf25f15f72009ee755a5ef8f6eab544e04db`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-ann-requestattrib]]
# `@RequestAttribute`

[.small]#[See equivalent in the Reactive stack](web/webflux/controller/ann-methods/requestattrib.adoc)#

Similar to `@SessionAttribute`, you can use the `@RequestAttribute` annotations to
access pre-existing request attributes created earlier (for example, by a Servlet `Filter`
or `HandlerInterceptor`):

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@GetMapping("/")
	public String handle(@RequestAttribute Client client) { // <1>
		// ...
	}
```
<1> Using the `@RequestAttribute` annotation.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@GetMapping("/")
	fun handle(@RequestAttribute client: Client): String { // <1>
		// ...
	}
```
<1> Using the `@RequestAttribute` annotation.
======
