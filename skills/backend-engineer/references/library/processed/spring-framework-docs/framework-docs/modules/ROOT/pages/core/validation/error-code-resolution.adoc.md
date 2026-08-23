> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/validation/error-code-resolution.adoc`  
> Upstream Git blob: `5bf1765474f37e567a5078c714746f59e4d409b3`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[validation-error-code-resolution]]
# Resolving Error Codes to Error Messages

We covered data binding and validation. This section covers outputting messages that correspond
to validation errors. In the example shown in the [preceding section](core/validation/validator.adoc),
we rejected the `name` and `age` fields. If we want to output the error messages by using a
`MessageSource`, we can do so using the error code we provide when rejecting the field
('name' and 'age' in this case). When you call (either directly, or indirectly, by using,
for example, the `ValidationUtils` class) `rejectValue` or one of the other `reject` methods
from the `Errors` interface, the underlying implementation not only registers the code you
passed in but also registers a number of additional error codes. The `MessageCodesResolver`
determines which error codes the `Errors` interface registers. By default, the
`DefaultMessageCodesResolver` is used, which (for example) not only registers a message
with the code you gave but also registers messages that include the field name you passed
to the reject method. So, if you reject a field by using `rejectValue("age", "too.darn.old")`,
apart from the `too.darn.old` code, Spring also registers `too.darn.old.age` and
`too.darn.old.age.int` (the first includes the field name and the second includes the type
of the field). This is done as a convenience to aid developers when targeting error messages.

More information on the `MessageCodesResolver` and the default strategy can be found
in the javadoc of
{spring-framework-api}/validation/MessageCodesResolver.html[`MessageCodesResolver`] and
{spring-framework-api}/validation/DefaultMessageCodesResolver.html[`DefaultMessageCodesResolver`],
respectively.
