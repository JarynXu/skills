> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux-webclient/client-exchange.adoc`  
> Upstream Git blob: `0fe359c64b40e84307837df430d7d89897381d8b`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-client-exchange]]
# Exchange

The `exchangeToMono()` and `exchangeToFlux()` methods (or `awaitExchange { }` and `exchangeToFlow { }` in Kotlin)
are useful for more advanced cases that require more control, such as to decode the response differently
depending on the response status:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	Mono<Person> entityMono = client.get()
			.uri("/persons/1")
			.accept(MediaType.APPLICATION_JSON)
			.exchangeToMono(response -> {
				if (response.statusCode().equals(HttpStatus.OK)) {
					return response.bodyToMono(Person.class);
				}
				else {
					// Turn to error
					return response.createError();
				}
			});
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
val entity = client.get()
  .uri("/persons/1")
  .accept(MediaType.APPLICATION_JSON)
  .awaitExchange {
		if (response.statusCode() == HttpStatus.OK) {
			 return response.awaitBody<Person>()
		}
		else {
			 throw response.createExceptionAndAwait()
		}
  }
```
======

When using the above, after the returned `Mono` or `Flux` completes, the response body
is checked and if not consumed it is released to prevent memory and connection leaks.
Therefore the response cannot be decoded further downstream. It is up to the provided
function to declare how to decode the response if needed.
