> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/mockmvc/hamcrest/setup-steps.adoc`  
> Upstream Git blob: `9d895e9de9b12b5639c9d01d5adb6db066c04dcb`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mockmvc-server-setup-steps]]
# Setup Features

No matter which MockMvc builder you use, all `MockMvcBuilder` implementations provide
some common and very useful features. For example, you can declare an `Accept` header for
all requests and expect a status of 200 as well as a `Content-Type` header in all
responses, as follows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	// static import of MockMvcBuilders.standaloneSetup

	MockMvc mockMvc = standaloneSetup(new MusicController())
		.defaultRequest(get("/").accept(MediaType.APPLICATION_JSON))
		.alwaysExpect(status().isOk())
		.alwaysExpect(content().contentType("application/json;charset=UTF-8"))
		.build();
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	// static import of MockMvcBuilders.standaloneSetup

	val mockMvc = standaloneSetup(MusicController())
		.defaultRequest<StandaloneMockMvcBuilder>(get("/").accept(MediaType.APPLICATION_JSON))
		.alwaysExpect<StandaloneMockMvcBuilder>(status().isOk())
		.alwaysExpect<StandaloneMockMvcBuilder>(content().contentType("application/json;charset=UTF-8"))
		.build()
```
======

In addition, third-party frameworks (and applications) can pre-package setup
instructions, such as those in a `MockMvcConfigurer`. The Spring Framework has one such
built-in implementation that helps to save and re-use the HTTP session across requests.
You can use it as follows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	// static import of SharedHttpSessionConfigurer.sharedHttpSession

	MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new TestController())
			.apply(sharedHttpSession())
			.build();

	// Use mockMvc to perform requests...
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	// static import of SharedHttpSessionConfigurer.sharedHttpSession

	val mockMvc = MockMvcBuilders.standaloneSetup(TestController())
			.apply<StandaloneMockMvcBuilder>(sharedHttpSession())
			.build()

	// Use mockMvc to perform requests...
```
======

See the javadoc for
{spring-framework-api}/test/web/servlet/setup/ConfigurableMockMvcBuilder.html[`ConfigurableMockMvcBuilder`]
for a list of all MockMvc builder features or use the IDE to explore the available options.
