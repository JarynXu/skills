> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/annotations/integration-spring/annotation-dynamicpropertysource.adoc`  
> Upstream Git blob: `ed0705d21dade24574ac29c52593e5181c7f67a3`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[spring-testing-annotation-dynamicpropertysource]]
# `@DynamicPropertySource`

`@DynamicPropertySource` is an annotation that can be applied to methods in integration
test classes that need to register _dynamic_ properties to be added to the set of
`PropertySources` in the `Environment` for an `ApplicationContext` loaded for an
integration test. Dynamic properties are useful when you do not know the value of the
properties upfront – for example, if the properties are managed by an external resource
such as for a container managed by the {testcontainers-site}[Testcontainers] project.

The following example demonstrates how to register a dynamic property:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	class MyIntegrationTests {

		static MyExternalServer server = // ...

		@DynamicPropertySource // <1>
		static void dynamicProperties(DynamicPropertyRegistry registry) { // <2>
			registry.add("server.port", server::getPort); // <3>
		}

		// tests ...
	}
```
<1> Annotate a `static` method with `@DynamicPropertySource`.
<2> Accept a `DynamicPropertyRegistry` as an argument.
<3> Register a dynamic `server.port` property to be retrieved lazily from the server.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	class MyIntegrationTests {

		companion object {

			@JvmStatic
			val server: MyExternalServer = // ...

			@DynamicPropertySource // <1>
			@JvmStatic
			fun dynamicProperties(registry: DynamicPropertyRegistry) { // <2>
				registry.add("server.port", server::getPort) // <3>
			}
		}

		// tests ...
	}
```
<1> Annotate a `static` method with `@DynamicPropertySource`.
<2> Accept a `DynamicPropertyRegistry` as an argument.
<3> Register a dynamic `server.port` property to be retrieved lazily from the server.
======

See [Context Configuration with Dynamic Property Sources](testing/testcontext-framework/ctx-management/dynamic-property-sources.adoc)
for further details.
