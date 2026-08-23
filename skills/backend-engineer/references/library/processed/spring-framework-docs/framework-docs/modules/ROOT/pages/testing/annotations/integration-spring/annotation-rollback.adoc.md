> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/annotations/integration-spring/annotation-rollback.adoc`  
> Upstream Git blob: `bf4ef2a8a45d8db46cd327e42a7a1bdb50c5f496`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[spring-testing-annotation-rollback]]
# `@Rollback`

`@Rollback` indicates whether the transaction for a transactional test method should be
rolled back after the test method has completed. If `true`, the transaction is rolled
back. Otherwise, the transaction is committed (see also
[`@Commit`](testing/annotations/integration-spring/annotation-commit.adoc)). Rollback for integration tests in the Spring
TestContext Framework defaults to `true` even if `@Rollback` is not explicitly declared.

When declared as a class-level annotation, `@Rollback` defines the default rollback
semantics for all test methods within the test class hierarchy. When declared as a
method-level annotation, `@Rollback` defines rollback semantics for the specific test
method, potentially overriding class-level `@Rollback` or `@Commit` semantics.

The following example causes a test method's result to not be rolled back (that is, the
result is committed to the database):

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@Rollback(false) // <1>
	@Test
	void testProcessWithoutRollback() {
		// ...
	}
```
<1> Do not roll back the result.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@Rollback(false) // <1>
	@Test
	fun testProcessWithoutRollback() {
		// ...
	}
```
<1> Do not roll back the result.
======
