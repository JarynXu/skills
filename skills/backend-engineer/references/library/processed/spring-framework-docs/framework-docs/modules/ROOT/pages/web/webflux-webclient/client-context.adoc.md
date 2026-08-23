> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux-webclient/client-context.adoc`  
> Upstream Git blob: `c2b64314b2b18901a5af631cb55b7c86bfce0661`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-client-context]]
# Context

[Attributes](web/webflux-webclient/client-attributes.adoc) provide a convenient way to pass information to the filter
chain but they only influence the current request. If you want to pass information that
propagates to additional requests that are nested, for example, via `flatMap`, or executed after,
for example, via `concatMap`, then you'll need to use the Reactor `Context`.

The Reactor `Context` needs to be populated at the end of a reactive chain in order to
apply to all operations. For example:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	WebClient client = WebClient.builder()
			.filter((request, next) ->
					Mono.deferContextual(contextView -> {
						String value = contextView.get("foo");
						// ...
					}))
			.build();

	client.get().uri("https://example.org/")
			.retrieve()
			.bodyToMono(String.class)
			.flatMap(body -> {
					// perform nested request (context propagates automatically)...
			})
			.contextWrite(context -> context.put("foo", ...));
```
======
