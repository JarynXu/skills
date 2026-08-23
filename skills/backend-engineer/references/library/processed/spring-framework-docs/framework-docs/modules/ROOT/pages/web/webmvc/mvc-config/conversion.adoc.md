> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-config/conversion.adoc`  
> Upstream Git blob: `91e7cef26c2188c4cd5a6e59ad8c2f4f699670e5`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-config-conversion]]
# Type Conversion

[.small]#[See equivalent in the Reactive stack](web/webflux/config.adoc#webflux-config-conversion)#

By default, formatters for various number and date types are installed, along with support
for customization via `@NumberFormat`, `@DurationFormat`, and `@DateTimeFormat` on fields
and parameters.

To register custom formatters and converters, use the following:

include-code::./WebConfiguration[tag=snippet,indent=0]

By default Spring MVC considers the request Locale when parsing and formatting date
values. This works for forms where dates are represented as Strings with "input" form
fields. For "date" and "time" form fields, however, browsers use a fixed format defined
in the HTML spec. For such cases date and time formatting can be customized as follows:

include-code::./DateTimeWebConfiguration[tag=snippet,indent=0]

NOTE: See [the `FormatterRegistrar` SPI](core/validation/format.adoc#format-FormatterRegistrar-SPI)
and the `FormattingConversionServiceFactoryBean` for more information on when to use
FormatterRegistrar implementations.
