> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux-webclient/client-retrieve.adoc`  
> Upstream Git blob: `da9d991e47c4400be20ba00d6ab8f425aa770188`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-client-retrieve]]
# `retrieve()`

The `retrieve()` method can be used to declare how to extract the response. For example:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	WebClient client = WebClient.create("https://example.org");

	Mono<ResponseEntity<Person>> result = client.get()
			.uri("/persons/{id}", id).accept(MediaType.APPLICATION_JSON)
			.retrieve()
			.toEntity(Person.class);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	val client = WebClient.create("https://example.org")

	val result = client.get()
			.uri("/persons/{id}", id).accept(MediaType.APPLICATION_JSON)
			.retrieve()
			.toEntity<Person>().awaitSingle()
```
======

Or to get only the body:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	WebClient client = WebClient.create("https://example.org");

	Mono<Person> result = client.get()
			.uri("/persons/{id}", id).accept(MediaType.APPLICATION_JSON)
			.retrieve()
			.bodyToMono(Person.class);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	val client = WebClient.create("https://example.org")

	val result = client.get()
			.uri("/persons/{id}", id).accept(MediaType.APPLICATION_JSON)
			.retrieve()
			.awaitBody<Person>()
```
======

To get a stream of decoded objects:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	Flux<Quote> result = client.get()
			.uri("/quotes").accept(MediaType.TEXT_EVENT_STREAM)
			.retrieve()
			.bodyToFlux(Quote.class);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	val result = client.get()
			.uri("/quotes").accept(MediaType.TEXT_EVENT_STREAM)
			.retrieve()
			.bodyToFlow<Quote>()
```
======

By default, 4xx or 5xx responses result in an `WebClientResponseException`, including
sub-classes for specific HTTP status codes. To customize the handling of error
responses, use `onStatus` handlers as follows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	Mono<Person> result = client.get()
			.uri("/persons/{id}", id).accept(MediaType.APPLICATION_JSON)
			.retrieve()
			.onStatus(HttpStatusCode::is4xxClientError, response -> ...)
			.onStatus(HttpStatusCode::is5xxServerError, response -> ...)
			.bodyToMono(Person.class);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	val result = client.get()
			.uri("/persons/{id}", id).accept(MediaType.APPLICATION_JSON)
			.retrieve()
			.onStatus(HttpStatusCode::is4xxClientError) { ... }
			.onStatus(HttpStatusCode::is5xxServerError) { ... }
			.awaitBody<Person>()
```
======
