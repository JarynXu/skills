> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-controller/ann-methods/cookievalue.adoc`  
> Upstream Git blob: `473a697f0cc0354b433fd31e0e96cc194e5064a5`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-ann-cookievalue]]
# `@CookieValue`

[.small]#[See equivalent in the Reactive stack](web/webflux/controller/ann-methods/cookievalue.adoc)#

You can use the `@CookieValue` annotation to bind the value of an HTTP cookie to a method argument
in a controller.

Consider a request with the following cookie:

[literal,subs="verbatim,quotes"]
```
JSESSIONID=415A4AC178C59DACE0B2C9CA727CDD84
```

The following example shows how to get the cookie value:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@GetMapping("/demo")
	public void handle(@CookieValue("JSESSIONID") String cookie) { <1>
		//...
	}
```
<1> Get the value of the `JSESSIONID` cookie.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@GetMapping("/demo")
	fun handle(@CookieValue("JSESSIONID") cookie: String) { // <1>
		//...
	}
```
<1> Get the value of the `JSESSIONID` cookie.
======

If the target method parameter type is not `String`, type conversion is applied automatically.
See [Type Conversion](web/webmvc/mvc-controller/ann-methods/typeconversion.adoc).
