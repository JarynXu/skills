> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux/controller/ann-methods/sessionattribute.adoc`  
> Upstream Git blob: `a3df7ee634d6fc9a2e18de17dd1edc05e322fdde`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-ann-sessionattribute]]
# `@SessionAttribute`

[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-methods/sessionattribute.adoc)#

If you need access to pre-existing session attributes that are managed globally
(that is, outside the controller -- for example, by a filter) and may or may not be present,
you can use the `@SessionAttribute` annotation on a method parameter, as the following example shows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@GetMapping("/")
	public String handle(@SessionAttribute User user) { // <1>
		// ...
	}
```
<1> Using `@SessionAttribute`.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@GetMapping("/")
	fun handle(@SessionAttribute user: User): String { // <1>
		// ...
	}
```
<1> Using `@SessionAttribute`.
======

For use cases that require adding or removing session attributes, consider injecting
`WebSession` into the controller method.

For temporary storage of model attributes in the session as part of a controller
workflow, consider using `SessionAttributes`, as described in
[`@SessionAttributes`](web/webflux/controller/ann-methods/sessionattributes.adoc).
