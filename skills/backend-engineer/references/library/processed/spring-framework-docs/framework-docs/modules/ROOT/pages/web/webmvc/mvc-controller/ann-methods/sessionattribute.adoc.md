> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-controller/ann-methods/sessionattribute.adoc`  
> Upstream Git blob: `3e32bee6e541f49ec82d109f5bc916f532f788f0`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-ann-sessionattribute]]
# `@SessionAttribute`

[.small]#[See equivalent in the Reactive stack](web/webflux/controller/ann-methods/sessionattribute.adoc)#

If you need access to pre-existing session attributes that are managed globally
(that is, outside the controller -- for example, by a filter) and may or may not be present,
you can use the `@SessionAttribute` annotation on a method parameter,
as the following example shows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@RequestMapping("/")
	public String handle(@SessionAttribute User user) { <1>
		// ...
	}
```
<1> Using a `@SessionAttribute` annotation.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@RequestMapping("/")
	fun handle(@SessionAttribute user: User): String { // <1>
		// ...
	}
```
<1> Using a `@SessionAttribute` annotation.======
======

For use cases that require adding or removing session attributes, consider injecting
`org.springframework.web.context.request.WebRequest` or
`jakarta.servlet.http.HttpSession` into the controller method.

For temporary storage of model attributes in the session as part of a controller
workflow, consider using `@SessionAttributes` as described in
[`@SessionAttributes`](web/webmvc/mvc-controller/ann-methods/sessionattributes.adoc).
