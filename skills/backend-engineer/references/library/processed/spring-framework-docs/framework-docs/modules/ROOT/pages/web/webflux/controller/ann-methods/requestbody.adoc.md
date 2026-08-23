> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux/controller/ann-methods/requestbody.adoc`  
> Upstream Git blob: `d6c38521aa522500833003725e6cb28f1805c127`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-ann-requestbody]]
# `@RequestBody`

[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-methods/requestbody.adoc)#

You can use the `@RequestBody` annotation to have the request body read and deserialized into an
`Object` through an [HttpMessageReader](web/webflux/reactive-spring.adoc#webflux-codecs).
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

Unlike Spring MVC, in WebFlux, the `@RequestBody` method argument supports reactive types
and fully non-blocking reading and (client-to-server) streaming.

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@PostMapping("/accounts")
	public void handle(@RequestBody Mono<Account> account) {
		// ...
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@PostMapping("/accounts")
	fun handle(@RequestBody accounts: Flow<Account>) {
		// ...
	}
```
======

You can use the [HTTP message codecs](web/webflux/config.adoc#webflux-config-message-codecs) option of the [WebFlux Config](web/webflux/dispatcher-handler.adoc#webflux-framework-config) to
configure or customize message readers.

You can use `@RequestBody` in combination with `jakarta.validation.Valid` or Spring's
`@Validated` annotation, which causes Standard Bean Validation to be applied. Validation
errors cause a `WebExchangeBindException`, which results in a 400 (BAD_REQUEST) response.
The exception contains a `BindingResult` with error details and can be handled in the
controller method by declaring the argument with an async wrapper and then using error
related operators:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@PostMapping("/accounts")
	public void handle(@Valid @RequestBody Mono<Account> account) {
		// use one of the onError* operators...
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@PostMapping("/accounts")
	fun handle(@Valid @RequestBody account: Mono<Account>) {
		// ...
	}
```
======

You can also declare an `Errors` parameter for access to validation errors, but in
that case the request body must not be a `Mono`, and will be resolved first:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@PostMapping("/accounts")
	public void handle(@Valid @RequestBody Account account, Errors errors) {
		// use one of the onError* operators...
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@PostMapping("/accounts")
	fun handle(@Valid @RequestBody account: Mono<Account>) {
		// ...
	}
```
======

If method validation applies because other parameters have `@Constraint` annotations,
then `HandlerMethodValidationException` is raised instead. For more details, see the
section on [Validation](web/webflux/controller/ann-validation.adoc).
