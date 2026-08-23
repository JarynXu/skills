> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/annotations/integration-spring/annotation-testpropertysource.adoc`  
> Upstream Git blob: `bfba63c0a753bbbcde0583b1d914ddbd84590c18`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[spring-testing-annotation-testpropertysource]]
# `@TestPropertySource`

`@TestPropertySource` is an annotation that can be applied to a test class to configure
the locations of properties files and inlined properties to be added to the set of
`PropertySources` in the `Environment` for an `ApplicationContext` loaded for an
integration test.

The following example demonstrates how to declare a properties file from the classpath:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	@TestPropertySource("/test.properties") // <1>
	class MyIntegrationTests {
		// class body...
	}
```
<1> Get properties from `test.properties` in the root of the classpath.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	@TestPropertySource("/test.properties") // <1>
	class MyIntegrationTests {
		// class body...
	}
```
<1> Get properties from `test.properties` in the root of the classpath.
======


The following example demonstrates how to declare inlined properties:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	@TestPropertySource(properties = { "timezone = GMT", "port: 4242" }) // <1>
	class MyIntegrationTests {
		// class body...
	}
```
<1> Declare `timezone` and `port` properties.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	@TestPropertySource(properties = ["timezone = GMT", "port: 4242"]) // <1>
	class MyIntegrationTests {
		// class body...
	}
```
<1> Declare `timezone` and `port` properties.
======

See [Context Configuration with Test Property Sources](testing/testcontext-framework/ctx-management/property-sources.adoc)
for examples and further details.
