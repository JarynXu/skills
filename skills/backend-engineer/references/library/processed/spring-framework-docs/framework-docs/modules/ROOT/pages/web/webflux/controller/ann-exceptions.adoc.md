> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux/controller/ann-exceptions.adoc`  
> Upstream Git blob: `5c20f2b25b61d8c126c7767eeb090f0230a6cd2a`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-ann-controller-exceptions]]
# Exceptions

[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-exceptionhandler.adoc)#

`@Controller` and [@ControllerAdvice](web/webflux/controller/ann-advice.adoc) classes can have
`@ExceptionHandler` methods to handle exceptions from controller methods. The following
example includes such a handler method:

include-code::./SimpleController[indent=0]

The exception can match against a top-level exception being propagated (that is, a direct
`IOException` being thrown) or against the immediate cause within a top-level wrapper
exception (for example, an `IOException` wrapped inside an `IllegalStateException`).

For matching exception types, preferably declare the target exception as a method argument,
as shown in the preceding example. Alternatively, the annotation declaration can narrow the
exception types to match. We generally recommend being as specific as possible in the
argument signature and to declare your primary root exception mappings on a
`@ControllerAdvice` prioritized with a corresponding order.
See [the MVC section](web/webmvc/mvc-controller/ann-exceptionhandler.adoc) for details.

NOTE: An `@ExceptionHandler` method in WebFlux supports the same method arguments and
return values as a `@RequestMapping` method, with the exception of request body-
and `@ModelAttribute`-related method arguments.

Support for `@ExceptionHandler` methods in Spring WebFlux is provided by the
`HandlerAdapter` for `@RequestMapping` methods. See [`DispatcherHandler`](web/webflux/dispatcher-handler.adoc)
for more detail.


[[webflux-ann-exceptionhandler-media]]
## Media Type Mapping
[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-exceptionhandler.adoc#mvc-ann-exceptionhandler-media)#

In addition to exception types, `@ExceptionHandler` methods can also declare producible media types.
This allows to refine error responses depending on the media types requested by HTTP clients, typically in the "Accept" HTTP request header.

Applications can declare producible media types directly on annotations, for the same exception type:

include-code::./MediaTypeController[tag=mediatype,indent=0]

Here, methods handle the same exception type but will not be rejected as duplicates.
Instead, API clients requesting "application/json" will receive a JSON error, and browsers will get an HTML error view.
Each `@ExceptionHandler` annotation can declare several producible media types,
the content negotiation during the error handling phase will decide which content type will be used.


[[webflux-ann-exceptionhandler-args]]
## Method Arguments
[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-exceptionhandler.adoc#mvc-ann-exceptionhandler-args)#

`@ExceptionHandler` methods support the same [method arguments](web/webflux/controller/ann-methods/arguments.adoc)
as `@RequestMapping` methods, except the request body might have been consumed already.


[[webflux-ann-exceptionhandler-return-values]]
## Return Values
[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-exceptionhandler.adoc#mvc-ann-exceptionhandler-return-values)#

`@ExceptionHandler` methods support the same [return values](web/webflux/controller/ann-methods/return-types.adoc)
as `@RequestMapping` methods.
