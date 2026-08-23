> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/annotations/integration-spring/annotation-testexecutionlisteners.adoc`  
> Upstream Git blob: `33cb39c5c8fc760213cce1e4ad5887dcf67815f9`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[spring-testing-annotation-testexecutionlisteners]]
# `@TestExecutionListeners`

`@TestExecutionListeners` is used to register listeners for the annotated test class, its
subclasses, and its nested classes. If you wish to register a listener globally, you
should register it via the automatic discovery mechanism described in
[`TestExecutionListener` Configuration](testing/testcontext-framework/tel-config.adoc).

The following example shows how to register two `TestExecutionListener` implementations:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	@TestExecutionListeners({CustomTestExecutionListener.class, AnotherTestExecutionListener.class}) // <1>
	class CustomTestExecutionListenerTests {
		// class body...
	}
```
<1> Register two `TestExecutionListener` implementations.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	@TestExecutionListeners(CustomTestExecutionListener::class, AnotherTestExecutionListener::class) // <1>
	class CustomTestExecutionListenerTests {
		// class body...
	}
```
<1> Register two `TestExecutionListener` implementations.
======


By default, `@TestExecutionListeners` provides support for inheriting listeners from
superclasses or enclosing classes. See
[`@Nested` test class configuration](testing/testcontext-framework/support-classes.adoc#testcontext-junit-jupiter-nested-test-configuration)
and the {spring-framework-api}/test/context/TestExecutionListeners.html[`@TestExecutionListeners` javadoc]
for an example and further details. If you discover that you need to switch
back to using the default `TestExecutionListener` implementations, see the note in
[Registering `TestExecutionListener` Implementations](testing/testcontext-framework/tel-config.adoc#testcontext-tel-config-registering-tels).
