> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-controller/ann-methods/requestbody.adoc`  
> Upstream Git blob: `781038a3b7517741d2f56374475b90b150a524ef`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-ann-requestbody]]
# `@RequestBody`

[.small]#[See equivalent in the Reactive stack](web/webflux/controller/ann-methods/requestbody.adoc)#

You can use the `@RequestBody` annotation to have the request body read and deserialized into an
`Object` through an [`HttpMessageConverter`](integration/rest-clients.adoc#rest-message-conversion).
The following example uses a `@RequestBody` argument:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@PostMapping("/accounts")
	public void handle(@RequestBody Account account) {
		// ...
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@PostMapping("/accounts")
	fun handle(@RequestBody account: Account) {
		// ...
	}
```
======

You can use the
[Message Converters](web/webmvc/mvc-config/message-converters.adoc) option of the [MVC Config](web/webmvc/mvc-config.adoc)
to configure or customize message conversion.

NOTE: Form data should be read using [`@RequestParam`](web/webmvc/mvc-controller/ann-methods/requestparam.adoc),
not with `@RequestBody` which can't always be used reliably since in the Servlet API, request parameter
access causes the request body to be parsed, and it can't be read again.

You can use `@RequestBody` in combination with `jakarta.validation.Valid` or Spring's
`@Validated` annotation, both of which cause Standard Bean Validation to be applied.
By default, validation errors cause a `MethodArgumentNotValidException`, which is turned
into a 400 (BAD_REQUEST) response. Alternatively, you can handle validation errors locally
within the controller through an `Errors` or `BindingResult` argument,
as the following example shows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@PostMapping("/accounts")
	public void handle(@Valid @RequestBody Account account, Errors errors) {
		// ...
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@PostMapping("/accounts")
	fun handle(@Valid @RequestBody account: Account, errors: Errors) {
		// ...
	}
```
======

If method validation applies because other parameters have `@Constraint` annotations,
then `HandlerMethodValidationException` is raised instead. For more details, see the
section on [Validation](web/webmvc/mvc-controller/ann-validation.adoc).
