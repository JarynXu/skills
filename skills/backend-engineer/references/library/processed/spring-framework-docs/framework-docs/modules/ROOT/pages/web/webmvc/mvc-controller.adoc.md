> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-controller.adoc`  
> Upstream Git blob: `4e7163ea6306b13722009cfe9ea5ba92d76c705f`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-controller]]
# Annotated Controllers

[.small]#[See equivalent in the Reactive stack](web/webflux/controller.adoc)#

Spring MVC provides an annotation-based programming model where `@Controller` and
`@RestController` components use annotations to express request mappings, request input,
exception handling, and more. Annotated controllers have flexible method signatures and
do not have to extend base classes nor implement specific interfaces.
The following example shows a controller defined by annotations:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@Controller
	public class HelloController {

		@GetMapping("/hello")
		public String handle(Model model) {
			model.addAttribute("message", "Hello World!");
			return "index";
		}
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	import org.springframework.ui.set

	@Controller
	class HelloController {

		@GetMapping("/hello")
		fun handle(model: Model): String {
			model["message"] = "Hello World!"
			return "index"
		}
	}
```
======

In the preceding example, the method accepts a `Model` and returns a view name as a `String`,
but many other options exist and are explained later in this chapter.

TIP: Guides and tutorials on {spring-site-guides}[spring.io] use the annotation-based
programming model described in this section.
