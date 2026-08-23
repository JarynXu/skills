> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-controller/ann-methods/httpentity.adoc`  
> Upstream Git blob: `2d3d2f3c97835a1f61eaafc6462bb86d83dcb085`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-ann-httpentity]]
# HttpEntity

[.small]#[See equivalent in the Reactive stack](web/webflux/controller/ann-methods/httpentity.adoc)#

`HttpEntity` is more or less identical to using [`@RequestBody`](web/webmvc/mvc-controller/ann-methods/requestbody.adoc) but is based on a
container object that exposes request headers and body. The following listing shows an example:

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
