> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux/controller/ann-methods/requestparam.adoc`  
> Upstream Git blob: `adc12950032bec546a8635be919ccf7bd0f4bab7`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-ann-requestparam]]
# `@RequestParam`

[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-methods/requestparam.adoc)#

You can use the `@RequestParam` annotation to bind query parameters to a method argument in a
controller. The following code snippet shows the usage:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@Controller
	@RequestMapping("/pets")
	public class EditPetForm {

		// ...

		@GetMapping
		public String setupForm(@RequestParam("petId") int petId, Model model) { <1>
			Pet pet = this.clinic.loadPet(petId);
			model.addAttribute("pet", pet);
			return "petForm";
		}

		// ...
	}
```
<1> Using `@RequestParam`.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	import org.springframework.ui.set

	@Controller
	@RequestMapping("/pets")
	class EditPetForm {

		// ...

		@GetMapping
		fun setupForm(@RequestParam("petId") petId: Int, model: Model): String { // <1>
			val pet = clinic.loadPet(petId)
			model["pet"] = pet
			return "petForm"
		}

		// ...
	}
```
<1> Using `@RequestParam`.
======

TIP: The Servlet API "`request parameter`" concept conflates query parameters, form
data, and multiparts into one. However, in WebFlux, each is accessed individually through
`ServerWebExchange`. While `@RequestParam` binds to query parameters only, you can use
data binding to apply query parameters, form data, and multiparts to a
[command object](web/webflux/controller/ann-methods/modelattrib-method-args.adoc).

Method parameters that use the `@RequestParam` annotation are required by default, but
you can specify that a method parameter is optional by setting the required flag of a `@RequestParam`
to `false` or by declaring the argument with a `java.util.Optional`
wrapper.

Type conversion is applied automatically if the target method parameter type is not
`String`. See [Type Conversion](web/webflux/controller/ann-methods/typeconversion.adoc).

When a `@RequestParam` annotation is declared on a `Map<String, String>` or
`MultiValueMap<String, String>` argument, the map is populated with all query parameters.

Note that use of `@RequestParam` is optional -- for example, to set its attributes. By
default, any argument that is a simple value type (as determined by
{spring-framework-api}/beans/BeanUtils.html#isSimpleProperty(java.lang.Class)[BeanUtils#isSimpleProperty])
and is not resolved by any other argument resolver is treated as if it were annotated
with `@RequestParam`.
