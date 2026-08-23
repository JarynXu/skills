> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/annotations/integration-spring/annotation-commit.adoc`  
> Upstream Git blob: `d1e956677c810d1e96a1611df740734f8d538fba`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[spring-testing-annotation-commit]]
# `@Commit`

`@Commit` indicates that the transaction for a transactional test method should be
committed after the test method has completed. You can use `@Commit` as a direct
replacement for `@Rollback(false)` to more explicitly convey the intent of the code.
Analogous to `@Rollback`, `@Commit` can also be declared as a class-level or method-level
annotation.

The following example shows how to use the `@Commit` annotation:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@Commit // <1>
	@Test
	void testProcessWithoutRollback() {
		// ...
	}
```
<1> Commit the result of the test to the database.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@Commit // <1>
	@Test
	fun testProcessWithoutRollback() {
		// ...
	}
```
<1> Commit the result of the test to the database.
======
