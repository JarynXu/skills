> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux/controller/ann-methods/httpentity.adoc`  
> Upstream Git blob: `d7be35bc122824955820136f2c77f58eefa948e6`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-ann-httpentity]]
# `HttpEntity`

[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-methods/httpentity.adoc)#

`HttpEntity` is more or less identical to using [`@RequestBody`](web/webflux/controller/ann-methods/requestbody.adoc) but is based on a
container object that exposes request headers and the body. The following example uses an
`HttpEntity`:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@PostMapping("/accounts")
	public void handle(HttpEntity<Account> entity) {
		// ...
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@PostMapping("/accounts")
	fun handle(entity: HttpEntity<Account>) {
		// ...
	}
```
======
