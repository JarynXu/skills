> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux-webclient/client-synchronous.adoc`  
> Upstream Git blob: `b0174ed26c446cc170469fd2b0aea8417ea8c784`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-client-synchronous]]
# Synchronous Use

`WebClient` can be used in synchronous style by blocking at the end for the result:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	Person person = client.get().uri("/person/{id}", i).retrieve()
		.bodyToMono(Person.class)
		.block();

	List<Person> persons = client.get().uri("/persons").retrieve()
		.bodyToFlux(Person.class)
		.collectList()
		.block();
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	val person = runBlocking {
		client.get().uri("/person/{id}", i).retrieve()
				.awaitBody<Person>()
	}

	val persons = runBlocking {
		client.get().uri("/persons").retrieve()
				.bodyToFlow<Person>()
				.toList()
	}
```
======

However if multiple calls need to be made, it's more efficient to avoid blocking on each
response individually, and instead wait for the combined result:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	Mono<Person> personMono = client.get().uri("/person/{id}", personId)
			.retrieve().bodyToMono(Person.class);

	Mono<List<Hobby>> hobbiesMono = client.get().uri("/person/{id}/hobbies", personId)
			.retrieve().bodyToFlux(Hobby.class).collectList();

	Map<String, Object> data = Mono.zip(personMono, hobbiesMono, (person, hobbies) -> {
				Map<String, String> map = new LinkedHashMap<>();
				map.put("person", person);
				map.put("hobbies", hobbies);
				return map;
			})
			.block();
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	val data = runBlocking {
			val personDeferred = async {
				client.get().uri("/person/{id}", personId)
						.retrieve().awaitBody<Person>()
			}

			val hobbiesDeferred = async {
				client.get().uri("/person/{id}/hobbies", personId)
						.retrieve().bodyToFlow<Hobby>().toList()
			}

			mapOf("person" to personDeferred.await(), "hobbies" to hobbiesDeferred.await())
		}
```
======

The above is merely one example. There are lots of other patterns and operators for putting
together a reactive pipeline that makes many remote calls, potentially some nested,
interdependent, without ever blocking until the end.

[NOTE]
====
With `Flux` or `Mono`, you should never have to block in a Spring MVC or Spring WebFlux controller.
Simply return the resulting reactive type from the controller method. The same principle apply to
Kotlin Coroutines and Spring WebFlux, just use suspending function or return `Flow` in your
controller method .
====
