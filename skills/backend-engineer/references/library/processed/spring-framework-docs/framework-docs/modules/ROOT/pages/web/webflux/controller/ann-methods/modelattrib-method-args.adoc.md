> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux/controller/ann-methods/modelattrib-method-args.adoc`  
> Upstream Git blob: `1f26694ac54cf376ca9b1ee862cfc197ce7fb0fe`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-ann-modelattrib-method-args]]
# `@ModelAttribute`

[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-methods/modelattrib-method-args.adoc)#

The `@ModelAttribute` method parameter annotation binds form data, query parameters,
URI path variables, and request headers onto a model object. For example:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
	public String processSubmit(@ModelAttribute Pet pet) { } // <1>
```
<1> Bind to an instance of `Pet`.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
	fun processSubmit(@ModelAttribute pet: Pet): String { } // <1>
```
<1> Bind to an instance of `Pet`.
======

Form data and query parameters take precedence over URI variables and headers, which are
included only if they don't override request parameters with the same name. Dashes are
stripped from header names.

The `Pet` instance may be:

* Accessed from the model where it could have been added by a
  [`Model`](web/webflux/controller/ann-modelattrib-methods.adoc).
* Accessed from the HTTP session if the model attribute was listed in
  the class-level [`@SessionAttributes`](web/webflux/controller/ann-methods/sessionattributes.adoc).
* Instantiated through a default constructor.
* Instantiated through a "`primary constructor`" with arguments that match to Servlet
request parameters. Argument names are determined through runtime-retained parameter
names in the bytecode.

By default, both constructor and property
[data binding](core/validation/data-binding.adoc) are applied. However,
model object design requires careful consideration, and for security reasons it is
recommended either to use an object tailored specifically for web binding, or to apply
constructor binding only. If property binding must still be used, then _allowedFields_
patterns should be set to limit which properties can be set. For further details on this
and example configuration, see
[model design](web/webflux/controller/ann-initbinder.adoc#webflux-ann-initbinder-model-design).

When using constructor binding, you can customize request parameter names through an
`@BindParam` annotation. For example:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	class Account {

		private final String firstName;

		public Account(@BindParam("first-name") String firstName) {
			this.firstName = firstName;
		}
	}
```
Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	class Account(@BindParam("first-name") val firstName: String)
```
======

NOTE: The `@BindParam` may also be placed on the fields that correspond to constructor
parameters. While `@BindParam` is supported out of the box, you can also use a
different annotation by setting a `DataBinder.NameResolver` on `DataBinder`

Constructor binding supports `List`, `Map`, and array arguments either converted from
a single string, for example, comma-separated list, or based on indexed keys such as
`accounts[2].name` or `account[KEY].name`.

WebFlux, unlike Spring MVC, supports reactive types in the model, for example, `Mono<Account>`.
You can declare a `@ModelAttribute` argument with or without a reactive type wrapper, and
it will be resolved accordingly to the actual value.

If data binding results in errors, by default a `WebExchangeBindException` is raised,
but you can also add a `BindingResult` argument immediately next to the `@ModelAttribute`
in order to handle such errors in the controller method. For example:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
	public String processSubmit(@ModelAttribute("pet") Pet pet, BindingResult result) { <1>
		if (result.hasErrors()) {
			return "petForm";
		}
		// ...
	}
```
<1> Adding a `BindingResult`.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
	fun processSubmit(@ModelAttribute("pet") pet: Pet, result: BindingResult): String { // <1>
		if (result.hasErrors()) {
			return "petForm"
		}
		// ...
	}
```
<1> Adding a `BindingResult`.
======

To use a `BindingResult` argument, you must declare the `@ModelAttribute` argument before
it without a reactive type wrapper. If you want to use the reactive, you can handle errors
directly through it. For example:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
	public Mono<String> processSubmit(@Valid @ModelAttribute("pet") Mono<Pet> petMono) {
		return petMono
			.flatMap(pet -> {
				// ...
			})
			.onErrorResume(ex -> {
				// ...
			});
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
	fun processSubmit(@Valid @ModelAttribute("pet") petMono: Mono<Pet>): Mono<String> {
		return petMono
				.flatMap { pet ->
					// ...
				}
				.onErrorResume{ ex ->
					// ...
				}
	}
```
======

You can automatically apply validation after data binding by adding the
`jakarta.validation.Valid` annotation or Spring's `@Validated` annotation (see
[Bean Validation](core/validation/beanvalidation.adoc) and
[Spring validation](web/webmvc/mvc-config/validation.adoc)). For example:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
	public String processSubmit(@Valid @ModelAttribute("pet") Pet pet, BindingResult result) { // <1>
		if (result.hasErrors()) {
			return "petForm";
		}
		// ...
	}
```
<1> Using `@Valid` on a model attribute argument.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
	fun processSubmit(@Valid @ModelAttribute("pet") pet: Pet, result: BindingResult): String { // <1>
		if (result.hasErrors()) {
			return "petForm"
		}
		// ...
	}
```
<1> Using `@Valid` on a model attribute argument.
======

If method validation applies because other parameters have `@Constraint` annotations,
then `HandlerMethodValidationException` would be raised instead. See the section on
controller method [Validation](web/webmvc/mvc-controller/ann-validation.adoc).

TIP: Using `@ModelAttribute` is optional. By default, any argument that is not a simple
value type as determined by
{spring-framework-api}/beans/BeanUtils.html#isSimpleProperty(java.lang.Class)[BeanUtils#isSimpleProperty]
_AND_ that is not resolved by any other argument resolver is treated as an implicit `@ModelAttribute`.

WARNING: When compiling to a native image with GraalVM, the implicit `@ModelAttribute`
support described above does not allow proper ahead-of-time inference of related data
binding reflection hints. As a consequence, it is recommended to explicitly annotate
method parameters with `@ModelAttribute` for use in a GraalVM native image.
