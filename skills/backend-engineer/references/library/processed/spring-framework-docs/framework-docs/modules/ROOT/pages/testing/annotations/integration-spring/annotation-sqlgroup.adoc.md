> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/annotations/integration-spring/annotation-sqlgroup.adoc`  
> Upstream Git blob: `7755169e01b6d2b5285ced38ac14ee36fb8118dc`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[spring-testing-annotation-sqlgroup]]
# `@SqlGroup`

`@SqlGroup` is a container annotation that aggregates several `@Sql` annotations. You can
use `@SqlGroup` natively to declare several nested `@Sql` annotations, or you can use it
in conjunction with Java's support for repeatable annotations, where `@Sql` can be
declared several times on the same class or method, implicitly generating this container
annotation. The following example shows how to declare an SQL group:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@Test
	@SqlGroup({ // <1>
		@Sql(scripts = "/test-schema.sql", config = @SqlConfig(commentPrefix = "`")),
		@Sql("/test-user-data.sql")
	})
	void userTest() {
		// run code that uses the test schema and test data
	}
```
<1> Declare a group of SQL scripts.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@Test
	@SqlGroup( // <1>
		Sql("/test-schema.sql", config = SqlConfig(commentPrefix = "`")),
		Sql("/test-user-data.sql"))
	fun userTest() {
		// run code that uses the test schema and test data
	}
```
<1> Declare a group of SQL scripts.
======
