> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/annotations/integration-spring/annotation-sqlmergemode.adoc`  
> Upstream Git blob: `36c5bb8c28e7f0620e3af40fa859d76d25e0f33a`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[spring-testing-annotation-sqlmergemode]]
# `@SqlMergeMode`

`@SqlMergeMode` is used to annotate a test class or test method to configure whether
method-level `@Sql` declarations are merged with class-level `@Sql` declarations. If
`@SqlMergeMode` is not declared on a test class or test method, the `OVERRIDE` merge mode
will be used by default. With the `OVERRIDE` mode, method-level `@Sql` declarations will
effectively override class-level `@Sql` declarations.

Note that a method-level `@SqlMergeMode` declaration overrides a class-level declaration.

The following example shows how to use `@SqlMergeMode` at the class level.

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@SpringJUnitConfig(TestConfig.class)
	@Sql("/test-schema.sql")
	@SqlMergeMode(MERGE) // <1>
	class UserTests {

		@Test
		@Sql("/user-test-data-001.sql")
		void standardUserProfile() {
			// run code that relies on test data set 001
		}
	}
```
<1> Set the `@Sql` merge mode to `MERGE` for all test methods in the class.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@SpringJUnitConfig(TestConfig::class)
	@Sql("/test-schema.sql")
	@SqlMergeMode(MERGE) // <1>
	class UserTests {

		@Test
		@Sql("/user-test-data-001.sql")
		fun standardUserProfile() {
			// run code that relies on test data set 001
		}
	}
```
<1> Set the `@Sql` merge mode to `MERGE` for all test methods in the class.
======

The following example shows how to use `@SqlMergeMode` at the method level.

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@SpringJUnitConfig(TestConfig.class)
	@Sql("/test-schema.sql")
	class UserTests {

		@Test
		@Sql("/user-test-data-001.sql")
		@SqlMergeMode(MERGE) // <1>
		void standardUserProfile() {
			// run code that relies on test data set 001
		}
	}
```
<1> Set the `@Sql` merge mode to `MERGE` for a specific test method.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@SpringJUnitConfig(TestConfig::class)
	@Sql("/test-schema.sql")
	class UserTests {

		@Test
		@Sql("/user-test-data-001.sql")
		@SqlMergeMode(MERGE) // <1>
		fun standardUserProfile() {
			// run code that relies on test data set 001
		}
	}
```
<1> Set the `@Sql` merge mode to `MERGE` for a specific test method.
======
