> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/annotations/integration-spring/annotation-sql.adoc`  
> Upstream Git blob: `17c4ec885a26033df2301e13440902395dc7715b`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[spring-testing-annotation-sql]]
# `@Sql`

`@Sql` is used to annotate a test class or test method to configure SQL scripts to be run
against a given database during integration tests. The following example shows how to use
it:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@Test
	@Sql({"/test-schema.sql", "/test-user-data.sql"}) // <1>
	void userTest() {
		// run code that relies on the test schema and test data
	}
```
<1> Run two scripts for this test.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@Test
	@Sql("/test-schema.sql", "/test-user-data.sql") // <1>
	fun userTest() {
		// run code that relies on the test schema and test data
	}
```
<1> Run two scripts for this test.
======

See [Executing SQL scripts declaratively with @Sql](testing/testcontext-framework/executing-sql.adoc#testcontext-executing-sql-declaratively)
for further details.
