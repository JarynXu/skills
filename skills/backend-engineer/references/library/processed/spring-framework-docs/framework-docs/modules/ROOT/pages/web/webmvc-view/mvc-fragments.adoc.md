> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc-view/mvc-fragments.adoc`  
> Upstream Git blob: `10a4842bf0a239789e37f09e821d8f2a67cd084c`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-view-fragments]]
# HTML Fragments

[.small]#[See equivalent in the Reactive stack](web/webflux-view.adoc#webflux-view-fragments)#

https://htmx.org/[HTMX] and https://turbo.hotwired.dev/[Hotwire Turbo] emphasize an
HTML-over-the-wire approach where clients receive server updates in HTML rather than in JSON.
This allows the benefits of an SPA (single page app) without having to write much or even
any JavaScript. For a good overview and to learn more, please visit their respective
websites.

In Spring MVC, view rendering typically involves specifying one view and one model.
However, in HTML-over-the-wire a common capability is to send multiple HTML fragments that
the browser can use to update different parts of the page. For this, controller methods
can return `Collection<ModelAndView>`. For example:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@GetMapping
	List<ModelAndView> handle() {
		return List.of(new ModelAndView("posts"), new ModelAndView("comments"));
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@GetMapping
	fun handle(): List<ModelAndView> {
		return listOf(ModelAndView("posts"), ModelAndView("comments"))
	}
```
======

The same can be done also by returning the dedicated type `FragmentsRendering`:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@GetMapping
	FragmentsRendering handle() {
		return FragmentsRendering.fragment("posts").fragment("comments").build();
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@GetMapping
	fun handle(): FragmentsRendering {
		return FragmentsRendering.fragment("posts").fragment("comments").build()
	}
```
======

Each fragment can have an independent model, and that model inherits attributes from the
shared model for the request.

HTMX and Hotwire Turbo support streaming updates over SSE (server-sent events).
A controller can use `SseEmitter` to send `ModelAndView` to render a fragment per event:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@GetMapping
	SseEmitter handle() {
		SseEmitter emitter = new SseEmitter();
		startWorkerThread(() -> {
			try {
				emitter.send(SseEmitter.event().data(new ModelAndView("posts")));
				emitter.send(SseEmitter.event().data(new ModelAndView("comments")));
				// ...
			}
			catch (IOException ex) {
				// Cancel sending
			}
		});
		return emitter;
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@GetMapping
	fun handle(): SseEmitter {
		val emitter = SseEmitter()
		startWorkerThread{
			try {
				emitter.send(SseEmitter.event().data(ModelAndView("posts")))
				emitter.send(SseEmitter.event().data(ModelAndView("comments")))
				// ...
			}
			catch (ex: IOException) {
				// Cancel sending
			}
		}
		return emitter
	}
```
======

The same can also be done by returning `Flux<ModelAndView>`, or any other type adaptable
to a Reactive Streams `Publisher` through the `ReactiveAdapterRegistry`.
