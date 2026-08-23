> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux/controller/ann-methods/sessionattributes.adoc`  
> Upstream Git blob: `5dd729b04fb4dc024f5c8feb9d25fd038e477fbd`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-ann-sessionattributes]]
# `@SessionAttributes`

[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-methods/sessionattributes.adoc)#

`@SessionAttributes` is used to store model attributes in the `WebSession` between
requests. It is a type-level annotation that declares session attributes used by a
specific controller. This typically lists the names of model attributes or types of
model attributes that should be transparently stored in the session for subsequent
requests to access.

Consider the following example:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@Controller
	@SessionAttributes("pet") <1>
	public class EditPetForm {
		// ...
	}
```
<1> Using the `@SessionAttributes` annotation.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@Controller
	@SessionAttributes("pet") // <1>
	class EditPetForm {
		// ...
	}
```
<1> Using the `@SessionAttributes` annotation.
======

On the first request, when a model attribute with the name, `pet`, is added to the model,
it is automatically promoted to and saved in the `WebSession`. It remains there until
another controller method uses a `SessionStatus` method argument to clear the storage,
as the following example shows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@Controller
	@SessionAttributes("pet") // <1>
	public class EditPetForm {

		// ...

		@PostMapping("/pets/{id}")
		public String handle(Pet pet, BindingResult errors, SessionStatus status) { // <2>
			if (errors.hasErrors()) {
				// ...
			}
				status.setComplete();
				// ...
			}
		}
	}
```
<1> Using the `@SessionAttributes` annotation.
<2> Using a `SessionStatus` variable.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@Controller
	@SessionAttributes("pet") // <1>
	class EditPetForm {

		// ...

		@PostMapping("/pets/{id}")
		fun handle(pet: Pet, errors: BindingResult, status: SessionStatus): String { // <2>
			if (errors.hasErrors()) {
				// ...
			}
			status.setComplete()
			// ...
		}
	}
```
<1> Using the `@SessionAttributes` annotation.
<2> Using a `SessionStatus` variable.
======
