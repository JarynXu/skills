> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux/controller.adoc`  
> Upstream Git blob: `3fa3597c1b28923b6ff04eab627ef5ccb9a6de73`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-controller]]
# Annotated Controllers

[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller.adoc)#

Spring WebFlux provides an annotation-based programming model, where `@Controller` and
`@RestController` components use annotations to express request mappings, request input,
handle exceptions, and more. Annotated controllers have flexible method signatures and
do not have to extend base classes nor implement specific interfaces.

The following listing shows a basic example:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@RestController
	public class HelloController {

		@GetMapping("/hello")
		public String handle() {
			return "Hello WebFlux";
		}
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@RestController
	class HelloController {

		@GetMapping("/hello")
		fun handle() = "Hello WebFlux"
	}
```
======

In the preceding example, the method returns a `String` to be written to the response body.
