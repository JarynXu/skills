> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux/controller/ann-methods/requestheader.adoc`  
> Upstream Git blob: `fa6304c61c6ae00a16949dd8965b29a8b5bbe561`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-ann-requestheader]]
# `@RequestHeader`

[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-methods/requestheader.adoc)#

You can use the `@RequestHeader` annotation to bind a request header to a method argument in a
controller.

The following example shows a request with headers:

[literal]
[subs="verbatim,quotes"]
```
Host                    localhost:8080
Accept                  text/html,application/xhtml+xml,application/xml;q=0.9
Accept-Language         fr,en-gb;q=0.7,en;q=0.3
Accept-Encoding         gzip,deflate
Accept-Charset          ISO-8859-1,utf-8;q=0.7,*;q=0.7
Keep-Alive              300
```

The following example gets the value of the `Accept-Encoding` and `Keep-Alive` headers:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@GetMapping("/demo")
	public void handle(
			@RequestHeader("Accept-Encoding") String encoding, // <1>
			@RequestHeader("Keep-Alive") long keepAlive) { // <2>
		//...
	}
```
<1> Get the value of the `Accept-Encoding` header.
<2> Get the value of the `Keep-Alive` header.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@GetMapping("/demo")
	fun handle(
			@RequestHeader("Accept-Encoding") encoding: String, // <1>
			@RequestHeader("Keep-Alive") keepAlive: Long) { // <2>
		//...
	}
```
<1> Get the value of the `Accept-Encoding` header.
<2> Get the value of the `Keep-Alive` header.
======

Type conversion is applied automatically if the target method parameter type is not
`String`. See [Type Conversion](web/webflux/controller/ann-methods/typeconversion.adoc).

When a `@RequestHeader` annotation is used on a `Map<String, String>`,
`MultiValueMap<String, String>`, or `HttpHeaders` argument, the map is populated
with all header values.

TIP: Built-in support is available for converting a comma-separated string into an
array or collection of strings or other types known to the type conversion system. For
example, a method parameter annotated with `@RequestHeader("Accept")` may be of type
`String` but also of `String[]` or `List<String>`.
