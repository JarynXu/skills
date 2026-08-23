> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux/controller/ann-advice.adoc`  
> Upstream Git blob: `9308584d40263e3dac8a291926519c6975324ed1`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-ann-controller-advice]]
# Controller Advice

[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-advice.adoc)#

Typically, the `@ExceptionHandler`, `@InitBinder`, and `@ModelAttribute` methods apply
within the `@Controller` class (or class hierarchy) in which they are declared. If you
want such methods to apply more globally (across controllers), you can declare them in a
class annotated with `@ControllerAdvice` or `@RestControllerAdvice`.

`@ControllerAdvice` is annotated with `@Component`, which means that such classes can be
registered as Spring beans through [component scanning](core/beans/java/instantiating-container.adoc#beans-java-instantiating-container-scan)
. `@RestControllerAdvice` is a composed annotation that is annotated
with both `@ControllerAdvice` and `@ResponseBody`, which essentially means
`@ExceptionHandler` methods are rendered to the response body through message conversion
(versus view resolution or template rendering).

On startup, the infrastructure classes for `@RequestMapping` and `@ExceptionHandler`
methods detect Spring beans annotated with `@ControllerAdvice` and then apply their
methods at runtime. Global `@ExceptionHandler` methods (from a `@ControllerAdvice`) are
applied _after_ local ones (from the `@Controller`). By contrast, global `@ModelAttribute`
and `@InitBinder` methods are applied _before_ local ones.

By default, `@ControllerAdvice` methods apply to every request (that is, all controllers),
but you can narrow that down to a subset of controllers by using attributes on the
annotation, as the following example shows:

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
	public class ExampleAdvice1 {}

	// Target all Controllers within specific packages
	@ControllerAdvice("org.example.controllers")
	public class ExampleAdvice2 {}

	// Target all Controllers assignable to specific classes
	@ControllerAdvice(assignableTypes = [ControllerInterface::class, AbstractController::class])
	public class ExampleAdvice3 {}
```
======

The selectors in the preceding example are evaluated at runtime and may negatively impact
performance if used extensively. See the
{spring-framework-api}/web/bind/annotation/ControllerAdvice.html[`@ControllerAdvice`]
javadoc for more details.
