> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux/controller/ann-methods/cookievalue.adoc`  
> Upstream Git blob: `9c4c0aadb0a15b82978fb2f4a1e1fd90eca25e1f`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-ann-cookievalue]]
# `@CookieValue`

[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-methods/cookievalue.adoc)#

You can use the `@CookieValue` annotation to bind the value of an HTTP cookie to a method argument
in a controller.

The following example shows a request with a cookie:

[literal,subs="verbatim,quotes"]
```
JSESSIONID=415A4AC178C59DACE0B2C9CA727CDD84
```

The following code sample demonstrates how to get the cookie value:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@GetMapping("/demo")
	public void handle(@CookieValue("JSESSIONID") String cookie) { // <1>
		//...
	}
```
<1> Get the cookie value.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@GetMapping("/demo")
	fun handle(@CookieValue("JSESSIONID") cookie: String) { // <1>
		//...
	}
```
<1> Get the cookie value.
======


Type conversion is applied automatically if the target method parameter type is not
`String`. See [Type Conversion](web/webflux/controller/ann-methods/typeconversion.adoc).
