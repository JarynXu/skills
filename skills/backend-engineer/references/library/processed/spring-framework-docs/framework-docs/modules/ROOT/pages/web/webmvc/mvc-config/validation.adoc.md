> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-config/validation.adoc`  
> Upstream Git blob: `5597e5c38f48625a3f80c5c1c0a1e5770e0ebc2e`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-config-validation]]
# Validation

[.small]#[See equivalent in the Reactive stack](web/webflux/config.adoc#webflux-config-validation)#

By default, if [Bean Validation](core/validation/beanvalidation.adoc#validation-beanvalidation-overview) is present
on the classpath (for example, Hibernate Validator), the `LocalValidatorFactoryBean` is
registered as a global [Validator](core/validation/validator.adoc) for use with `@Valid` and
`@Validated` on controller method arguments.

You can customize the global `Validator` instance, as the
following example shows:

include-code::./WebConfiguration[tag=snippet,indent=0]

Note that you can also register `Validator` implementations locally, as the following
example shows:

include-code::./MyController[tag=snippet,indent=0]

TIP: If you need to have a `LocalValidatorFactoryBean` injected somewhere, create a bean and
mark it with `@Primary`, or mark the one declared in the MVC configuration with
`@Fallback`, in order to avoid conflict.
