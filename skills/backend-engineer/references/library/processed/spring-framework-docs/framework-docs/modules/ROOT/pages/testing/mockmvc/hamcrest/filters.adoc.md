> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/mockmvc/hamcrest/filters.adoc`  
> Upstream Git blob: `ea625acabc565111ec7c293c4f7baa1787d4c9ee`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mockmvc-server-filters]]
# Filter Registrations

When setting up a `MockMvc` instance, you can register one or more Servlet `Filter`
instances, as the following example shows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	mockMvc = standaloneSetup(new PersonController()).addFilters(new CharacterEncodingFilter()).build();
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	mockMvc = standaloneSetup(PersonController()).addFilters<StandaloneMockMvcBuilder>(CharacterEncodingFilter()).build()
```
======

Registered filters are invoked through the `MockFilterChain` from `spring-test`, and the
last filter delegates to the `DispatcherServlet`.
