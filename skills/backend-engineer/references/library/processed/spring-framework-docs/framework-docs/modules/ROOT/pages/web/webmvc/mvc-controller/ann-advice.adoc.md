> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-controller/ann-advice.adoc`  
> Upstream Git blob: `2e3ec0fd0864e109e74a788de306796a3f9e70fd`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-ann-controller-advice]]
# Controller Advice

[.small]#[See equivalent in the Reactive stack](web/webflux/controller/ann-advice.adoc)#

`@ExceptionHandler`, `@InitBinder`, and `@ModelAttribute` methods apply only to the
`@Controller` class, or class hierarchy, in which they are declared. If, instead, they
are declared in an `@ControllerAdvice` or `@RestControllerAdvice` class, then they apply
to any controller. Moreover, as of 5.3, `@ExceptionHandler` methods in `@ControllerAdvice`
can be used to handle exceptions from any `@Controller` or any other handler.

`@ControllerAdvice` is meta-annotated with `@Component` and therefore can be registered as
a Spring bean through [component scanning](core/beans/java/instantiating-container.adoc#beans-java-instantiating-container-scan).

`@RestControllerAdvice` is a shortcut annotation that combines `@ControllerAdvice`
with `@ResponseBody`, in effect simply an `@ControllerAdvice` whose exception handler
methods render to the response body.

On startup, `RequestMappingHandlerMapping` and `ExceptionHandlerExceptionResolver` detect
controller advice beans and apply them at runtime. Global `@ExceptionHandler` methods,
from an `@ControllerAdvice`, are applied _after_ local ones, from the `@Controller`.
By contrast, global `@ModelAttribute` and `@InitBinder` methods are applied _before_ local ones.

By default, both `@ControllerAdvice` and `@RestControllerAdvice` apply to any controller,
including `@Controller` and `@RestController`. Use attributes of the annotation to narrow
the set of controllers and handlers that they apply to. For example:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	// Target all Controllers annotated with @RestController
	@ControllerAdvice(annotations = RestController.class)
	public class ExampleAdvice1 {}

	// Target all Controllers within specific packages
	@ControllerAdvice("org.example.controllers")
	public class ExampleAdvice2 {}

	// Target all Controllers assignable to specific classes
	@ControllerAdvice(assignableTypes = {ControllerInterface.class, AbstractController.class})
	public class ExampleAdvice3 {}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	// Target all Controllers annotated with @RestController
	@ControllerAdvice(annotations = [RestController::class])
	class ExampleAdvice1

	// Target all Controllers within specific packages
	@ControllerAdvice("org.example.controllers")
	class ExampleAdvice2

	// Target all Controllers assignable to specific classes
	@ControllerAdvice(assignableTypes = [ControllerInterface::class, AbstractController::class])
	class ExampleAdvice3
```
======

The selectors in the preceding example are evaluated at runtime and may negatively impact
performance if used extensively. See the
{spring-framework-api}/web/bind/annotation/ControllerAdvice.html[`@ControllerAdvice`]
javadoc for more details.
