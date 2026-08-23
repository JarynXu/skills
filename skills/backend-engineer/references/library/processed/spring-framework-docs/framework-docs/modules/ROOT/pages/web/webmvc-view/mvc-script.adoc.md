> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc-view/mvc-script.adoc`  
> Upstream Git blob: `01657f79b55810029961fd20a01f3041b331eb1e`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-view-script]]
# Script Views

[.small]#[See equivalent in the Reactive stack](web/webflux-view.adoc#webflux-view-script)#

The Spring Framework has a built-in integration for using Spring MVC with any
templating library that can run on top of the
{JSR}223[JSR-223] Java scripting engine. We have tested the following
templating libraries on different script engines:

[%header]
|===
|Scripting Library |Scripting Engine
|https://docs.ruby-lang.org/en/master/ERB.html[ERB] |https://www.jruby.org[JRuby]
|https://docs.python.org/2/library/string.html#template-strings[String templates] |https://www.jython.org/[Jython]
|===

TIP: The basic rule for integrating any other script engine is that it must implement the
`ScriptEngine` and `Invocable` interfaces.


[[mvc-view-script-dependencies]]
## Requirements
[.small]#[See equivalent in the Reactive stack](web/webflux-view.adoc#webflux-view-script-dependencies)#

You need to have the script engine on your classpath, the details of which vary by script engine:

* https://www.jruby.org[JRuby] should be added as a dependency for Ruby support.
* https://www.jython.org[Jython] should be added as a dependency for Python support.

[[mvc-view-script-integrate]]
## Script Templates
[.small]#[See equivalent in the Reactive stack](web/webflux-view.adoc#webflux-view-script-integrate)#

You can declare a `ScriptTemplateConfigurer` bean to specify the script engine to use,
the script files to load, what function to call to render templates, and so on.
The following example uses the Jython Python engine:

include-code::./WebConfiguration[tag=snippet,indent=0]

The render function is called with the following parameters:

* `String template`: The template content
* `Map model`: The view model
* `RenderingContext renderingContext`: The
{spring-framework-api}/web/servlet/view/script/RenderingContext.html[`RenderingContext`]
that gives access to the application context, the locale, the template loader, and the
URL

The controller is used to populate the model attributes and specify the view name, as the following example shows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@Controller
	public class SampleController {

		@GetMapping("/sample")
		public String test(Model model) {
			model.addAttribute("title", "Sample title");
			model.addAttribute("body", "Sample body");
			return "template";
		}
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@Controller
	class SampleController {

		@GetMapping("/sample")
		fun test(model: Model): String {
			model["title"] = "Sample title"
			model["body"] = "Sample body"
			return "template"
		}
	}
```
======

Check out the Spring Framework unit tests,
{spring-framework-code}/spring-webmvc/src/test/java/org/springframework/web/servlet/view/script[Java], and
{spring-framework-code}/spring-webmvc/src/test/resources/org/springframework/web/servlet/view/script[resources],
for more configuration examples.
