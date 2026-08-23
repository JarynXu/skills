> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux/data-binding.adoc`  
> Upstream Git blob: `d41968aff165f747048651101a96317380dd84ee`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-data-binding]]
# Data Binding

[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-data-binding.adoc)#

Data binding is a mechanism that binds string parameters onto an object graph with type conversion.
It is a core mechanism of the Spring Framework that helps with application configuration.
In web applications it makes it easy to access query parameters and form data through richly typed objects rather than through maps of string values.

To learn more about the data binding mechanism, including constructor and setter binding, property name syntax, type conversion,
and more, see [Data binding](core/validation/data-binding.adoc) in the Core Technologies section.

For annotated controllers, data binding applies to a
[@ModelAttribute](web/webflux/controller/ann-methods/modelattrib-method-args.adoc) method argument.
For functional endpoints, use the `bind` method of [ServerRequest](web/webflux-functional.adoc#webflux-fn-request).

TIP: For browser applications with annotated controllers, you can use
[@ModelAttribute methods](web/webflux/controller/ann-modelattrib-methods.adoc)
to initialize additional model attributes for use in rendered views.

Each request uses a separate `WebDataBinder` instance.
For annotated controllers, this instance can be customized through
[@InitBinder methods](web/webflux/controller/ann-initbinder.adoc) within a controller, or
across controllers through [Controller Advice](web/webmvc/mvc-controller/ann-advice.adoc).
For functional endpoints, use overloaded `ServerRequest.bind` methods.


[[webflux-data-binding-design]]
## Model Design
[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-data-binding.adoc#mvc-data-binding-design)#

include::partial$web/web-data-binding-model-design.adoc[]
