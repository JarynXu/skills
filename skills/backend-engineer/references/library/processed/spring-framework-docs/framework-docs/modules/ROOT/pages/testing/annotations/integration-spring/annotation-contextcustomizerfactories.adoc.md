> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/annotations/integration-spring/annotation-contextcustomizerfactories.adoc`  
> Upstream Git blob: `758b36f7809c125729dd9de51c2d58d3e3394424`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[spring-testing-annotation-contextcustomizerfactories]]
# `@ContextCustomizerFactories`

`@ContextCustomizerFactories` is an annotation that can be applied to a test class to
register `ContextCustomizerFactory` implementations for the particular test class, its
subclasses, and its nested classes. If you wish to register a factory globally, you
should register it via the automatic discovery mechanism described in
[`ContextCustomizerFactory` Configuration](testing/testcontext-framework/ctx-management/context-customizers.adoc).

The following example shows how to register two `ContextCustomizerFactory` implementations:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	@ContextCustomizerFactories({CustomContextCustomizerFactory.class, AnotherContextCustomizerFactory.class}) // <1>
	class CustomContextCustomizerFactoryTests {
		// class body...
	}
```
<1> Register two `ContextCustomizerFactory` implementations.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	@ContextCustomizerFactories([CustomContextCustomizerFactory::class, AnotherContextCustomizerFactory::class]) // <1>
	class CustomContextCustomizerFactoryTests {
		// class body...
	}
```
<1> Register two `ContextCustomizerFactory` implementations.
======


By default, `@ContextCustomizerFactories` provides support for inheriting factories from
superclasses or enclosing classes. See
[`@Nested` test class configuration](testing/testcontext-framework/support-classes.adoc#testcontext-junit-jupiter-nested-test-configuration)
and the {spring-framework-api}/test/context/ContextCustomizerFactories.html[`@ContextCustomizerFactories` javadoc]
for an example and further details.
