> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux/controller/ann-methods/typeconversion.adoc`  
> Upstream Git blob: `d81513a425bfc7e1a232bf22e537e24f22e933ba`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-ann-typeconversion]]
# Type Conversion

[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-methods/typeconversion.adoc)#

Some annotated controller method arguments that represent String-based request input (for example,
`@RequestParam`, `@RequestHeader`, `@PathVariable`, `@MatrixVariable`, and `@CookieValue`)
can require type conversion if the argument is declared as something other than `String`.

For such cases, type conversion is automatically applied based on the configured converters.
By default, simple types (such as `int`, `long`, `Date`, and others) are supported. Type conversion
can be customized through a `WebDataBinder` (see [`DataBinder`](web/webflux/controller/ann-initbinder.adoc))
or by registering `Formatters` with the `FormattingConversionService` (see
[Spring Field Formatting](core/validation/format.adoc)).

A practical issue in type conversion is the treatment of an empty String source value.
Such a value is treated as missing if it becomes `null` as a result of type conversion.
This can be the case for `Long`, `UUID`, and other target types. If you want to allow `null`
to be injected, either use the `required` flag on the argument annotation, or declare the
argument as `@Nullable`.
