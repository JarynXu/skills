> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/annotations/integration-meta.adoc`  
> Upstream Git blob: `7c30b5b6f11e72f1e8ed41edb8e113a397850c67`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[integration-testing-annotations-meta]]
# Meta-Annotation Support for Testing

You can use most test-related annotations as
[meta-annotations](core/beans/classpath-scanning.adoc#beans-meta-annotations) to
create custom composed annotations and reduce configuration duplication across a test
suite.

For example, you can use each of the following as a meta-annotation in conjunction with
the [TestContext framework](testing/testcontext-framework.adoc).

* `@BootstrapWith`
* `@ContextConfiguration`
* `@ContextHierarchy`
* `@ContextCustomizerFactories`
* `@ActiveProfiles`
* `@TestPropertySource`
* `@DirtiesContext`
* `@WebAppConfiguration`
* `@TestExecutionListeners`
* `@Transactional`
* `@BeforeTransaction`
* `@AfterTransaction`
* `@Commit`
* `@Rollback`
* `@Sql`
* `@SqlConfig`
* `@SqlMergeMode`
* `@SqlGroup`
* `@Repeat` _(only supported on JUnit 4)_
* `@Timed` _(only supported on JUnit 4)_
* `@IfProfileValue` _(only supported on JUnit 4)_
* `@ProfileValueSourceConfiguration` _(only supported on JUnit 4)_
* `@SpringJUnitConfig` _(only supported on JUnit Jupiter)_
* `@SpringJUnitWebConfig` _(only supported on JUnit Jupiter)_
* `@TestConstructor` _(only supported on JUnit Jupiter)_
* `@NestedTestConfiguration` _(only supported on JUnit Jupiter)_
* `@EnabledIf` _(only supported on JUnit Jupiter)_
* `@DisabledIf` _(only supported on JUnit Jupiter)_

Consider the following test classes that use the `SpringExtension` with JUnit Jupiter:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@ExtendWith(SpringExtension.class)
	@ContextConfiguration(classes = {AppConfig.class, TestDataAccessConfig.class})
	@ActiveProfiles("dev")
	@Transactional
	class OrderRepositoryTests { }

	@ExtendWith(SpringExtension.class)
	@ContextConfiguration(classes = {AppConfig.class, TestDataAccessConfig.class})
	@ActiveProfiles("dev")
	@Transactional
	class UserRepositoryTests { }
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@ExtendWith(SpringExtension::class)
	@ContextConfiguration(classes = [AppConfig::class, TestDataAccessConfig::class])
	@ActiveProfiles("dev")
	@Transactional
	class OrderRepositoryTests { }

	@ExtendWith(SpringExtension::class)
	@ContextConfiguration(classes = [AppConfig::class, TestDataAccessConfig::class])
	@ActiveProfiles("dev")
	@Transactional
	class UserRepositoryTests { }
```
======

If we discover that we are repeating the preceding configuration across our test suite,
we can reduce the duplication by introducing a custom composed annotation that
centralizes the common test configuration for Spring and JUnit Jupiter, as follows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@Target(ElementType.TYPE)
	@Retention(RetentionPolicy.RUNTIME)
	@ExtendWith(SpringExtension.class)
	@ContextConfiguration(classes = {AppConfig.class, TestDataAccessConfig.class})
	@ActiveProfiles("dev")
	@Transactional
	public @interface TransactionalDevTestConfig { }
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@Target(AnnotationTarget.TYPE)
	@Retention(AnnotationRetention.RUNTIME)
	@ExtendWith(SpringExtension::class)
	@ContextConfiguration(classes = [AppConfig::class, TestDataAccessConfig::class])
	@ActiveProfiles("dev")
	@Transactional
	annotation class TransactionalDevTestConfig { }
```
======

Then we can use our custom `@TransactionalDevTestConfig` annotation to simplify the
configuration of individual JUnit Jupiter based test classes, as follows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@TransactionalDevTestConfig
	class OrderRepositoryTests { }

	@TransactionalDevTestConfig
	class UserRepositoryTests { }
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@TransactionalDevTestConfig
	class OrderRepositoryTests { }

	@TransactionalDevTestConfig
	class UserRepositoryTests { }
```
======

Since JUnit Jupiter supports the use of `@Test`, `@RepeatedTest`, `ParameterizedTest`,
and others as meta-annotations, you can also create custom composed annotations at the
test method level. For example, if we wish to create a composed annotation that combines
the `@Test` and `@Tag` annotations from JUnit Jupiter with the `@Transactional`
annotation from Spring, we could create an `@TransactionalIntegrationTest` annotation, as
follows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@Target(ElementType.METHOD)
	@Retention(RetentionPolicy.RUNTIME)
	@Transactional
	@Tag("integration-test") // org.junit.jupiter.api.Tag
	@Test // org.junit.jupiter.api.Test
	public @interface TransactionalIntegrationTest { }
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@Target(AnnotationTarget.TYPE)
	@Retention(AnnotationRetention.RUNTIME)
	@Transactional
	@Tag("integration-test") // org.junit.jupiter.api.Tag
	@Test // org.junit.jupiter.api.Test
	annotation class TransactionalIntegrationTest { }
```
======

Then we can use our custom `@TransactionalIntegrationTest` annotation to simplify the
configuration of individual JUnit Jupiter based test methods, as follows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@TransactionalIntegrationTest
	void saveOrder() { }

	@TransactionalIntegrationTest
	void deleteOrder() { }
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@TransactionalIntegrationTest
	fun saveOrder() { }

	@TransactionalIntegrationTest
	fun deleteOrder() { }
```
======

For further details, see the
{spring-framework-wiki}/Spring-Annotation-Programming-Model[Spring Annotation Programming Model]
wiki page.
