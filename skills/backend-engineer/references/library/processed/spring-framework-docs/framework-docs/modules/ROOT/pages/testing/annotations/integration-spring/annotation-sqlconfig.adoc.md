> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/annotations/integration-spring/annotation-sqlconfig.adoc`  
> Upstream Git blob: `114aa7e6dbaa023054f4eed0a4f31dc44682d00c`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[spring-testing-annotation-sqlconfig]]
# `@SqlConfig`

`@SqlConfig` defines metadata that is used to determine how to parse and run SQL scripts
configured with the `@Sql` annotation. The following example shows how to use it:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@Test
	@Sql(
		scripts = "/test-user-data.sql",
		config = @SqlConfig(commentPrefix = "`", separator = "@@") // <1>
	)
	void userTest() {
		// run code that relies on the test data
	}
```
<1> Set the comment prefix and the separator in SQL scripts.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@Test
	@Sql("/test-user-data.sql", config = SqlConfig(commentPrefix = "`", separator = "@@")) // <1>
	fun userTest() {
		// run code that relies on the test data
	}
```
<1> Set the comment prefix and the separator in SQL scripts.
======
