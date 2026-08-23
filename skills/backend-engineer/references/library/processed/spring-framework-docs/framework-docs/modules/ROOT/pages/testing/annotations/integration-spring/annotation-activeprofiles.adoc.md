> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/annotations/integration-spring/annotation-activeprofiles.adoc`  
> Upstream Git blob: `43da00956a6d85f02dc354be67753794ec4b834c`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[spring-testing-annotation-activeprofiles]]
# `@ActiveProfiles`

`@ActiveProfiles` is an annotation that can be applied to a test class to declare which
bean definition profiles should be active when loading an `ApplicationContext` for an
integration test.

The following example indicates that the `dev` profile should be active:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	@ActiveProfiles("dev") // <1>
	class DeveloperTests {
		// class body...
	}
```
<1> Indicate that the `dev` profile should be active.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	@ActiveProfiles("dev") // <1>
	class DeveloperTests {
		// class body...
	}
```
<1> Indicate that the `dev` profile should be active.
======


The following example indicates that both the `dev` and the `integration` profiles should
be active:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	@ActiveProfiles({"dev", "integration"}) // <1>
	class DeveloperIntegrationTests {
		// class body...
	}
```
<1> Indicate that the `dev` and `integration` profiles should be active.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	@ActiveProfiles(["dev", "integration"]) // <1>
	class DeveloperIntegrationTests {
		// class body...
	}
```
<1> Indicate that the `dev` and `integration` profiles should be active.
======


NOTE: `@ActiveProfiles` provides support for inheriting active bean definition profiles
declared by superclasses and enclosing classes by default. You can also resolve active
bean definition profiles programmatically by implementing a custom
[`ActiveProfilesResolver`](testing/testcontext-framework/ctx-management/env-profiles.adoc#testcontext-ctx-management-env-profiles-ActiveProfilesResolver)
and registering it by using the `resolver` attribute of `@ActiveProfiles`.

NOTE: When `@ActiveProfiles` is declared on a test class, the `spring.profiles.active`
property (whether configured as a JVM system property or environment variable) is not
taken into account by the TestContext Framework when determining active profiles. If
you need to allow `spring.profiles.active` to override the profiles configured via
`@ActiveProfiles`, you can implement a custom `ActiveProfilesResolver` as described in
[Context Configuration with Environment Profiles](testing/testcontext-framework/ctx-management/env-profiles.adoc).

See [Context Configuration with Environment Profiles](testing/testcontext-framework/ctx-management/env-profiles.adoc),
[`@Nested` test class configuration](testing/testcontext-framework/support-classes.adoc#testcontext-junit-jupiter-nested-test-configuration), and the
{spring-framework-api}/test/context/ActiveProfiles.html[`@ActiveProfiles`] javadoc for
examples and further details.
