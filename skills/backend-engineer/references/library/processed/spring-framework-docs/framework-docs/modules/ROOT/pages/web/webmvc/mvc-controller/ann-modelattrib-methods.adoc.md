> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-controller/ann-modelattrib-methods.adoc`  
> Upstream Git blob: `0529708ea4fc8cf41c863dcb276c897a146ab6c8`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-ann-modelattrib-methods]]
# Model

[.small]#[See equivalent in the Reactive stack](web/webflux/controller/ann-modelattrib-methods.adoc)#

You can use the `@ModelAttribute` annotation:

* On a [method argument](web/webmvc/mvc-controller/ann-methods/modelattrib-method-args.adoc) in `@RequestMapping` methods
to create or access an `Object` from the model and to bind it to the request through a
`WebDataBinder`.
* As a method-level annotation in `@Controller` or `@ControllerAdvice` classes that help
to initialize the model prior to any `@RequestMapping` method invocation.
* On a `@RequestMapping` method to mark its return value is a model attribute.

This section discusses `@ModelAttribute` methods -- the second item in the preceding list.
A controller can have any number of `@ModelAttribute` methods. All such methods are
invoked before `@RequestMapping` methods in the same controller. A `@ModelAttribute`
method can also be shared across controllers through `@ControllerAdvice`. See the section on
[Controller Advice](web/webmvc/mvc-controller/ann-advice.adoc) for more details.

`@ModelAttribute` methods have flexible method signatures. They support many of the same
arguments as `@RequestMapping` methods, except for `@ModelAttribute` itself or anything
related to the request body.

The following example shows a `@ModelAttribute` method:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@ModelAttribute
	public void populateModel(@RequestParam String number, Model model) {
		model.addAttribute(accountRepository.findAccount(number));
		// add more ...
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@ModelAttribute
	fun populateModel(@RequestParam number: String, model: Model) {
		model.addAttribute(accountRepository.findAccount(number))
		// add more ...
	}
```
======

The following example adds only one attribute:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@ModelAttribute
	public Account addAccount(@RequestParam String number) {
		return accountRepository.findAccount(number);
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@ModelAttribute
	fun addAccount(@RequestParam number: String): Account {
		return accountRepository.findAccount(number)
	}
```
======


NOTE: When a name is not explicitly specified, a default name is chosen based on the `Object`
type, as explained in the javadoc for {spring-framework-api}/core/Conventions.html[`Conventions`].
You can always assign an explicit name by using the overloaded `addAttribute` method or
through the `name` attribute on `@ModelAttribute` (for a return value).

You can also use `@ModelAttribute` as a method-level annotation on `@RequestMapping` methods,
in which case the return value of the `@RequestMapping` method is interpreted as a model
attribute. This is typically not required, as it is the default behavior in HTML controllers,
unless the return value is a `String` that would otherwise be interpreted as a view name.
`@ModelAttribute` can also customize the model attribute name, as the following example shows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@GetMapping("/accounts/{id}")
	@ModelAttribute("myAccount")
	public Account handle() {
		// ...
		return account;
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@GetMapping("/accounts/{id}")
	@ModelAttribute("myAccount")
	fun handle(): Account {
		// ...
		return account
	}
```
======
