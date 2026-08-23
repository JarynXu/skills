> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/annotations/integration-spring/annotation-contexthierarchy.adoc`  
> Upstream Git blob: `552520d81002bc98be76016c25b123158e8aac6e`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[spring-testing-annotation-contexthierarchy]]
# `@ContextHierarchy`

`@ContextHierarchy` is an annotation that can be applied to a test class to define a
hierarchy of `ApplicationContext` instances for integration tests. `@ContextHierarchy`
should be declared with a list of one or more `@ContextConfiguration` instances, each of
which defines a level in the context hierarchy. The following examples demonstrate the
use of `@ContextHierarchy` within a single test class (`@ContextHierarchy` can also be
used within a test class hierarchy):

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@ContextHierarchy({
		@ContextConfiguration("/parent-config.xml"),
		@ContextConfiguration("/child-config.xml")
	})
	class ContextHierarchyTests {
		// class body...
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@ContextHierarchy(
		ContextConfiguration("/parent-config.xml"),
		ContextConfiguration("/child-config.xml"))
	class ContextHierarchyTests {
		// class body...
	}
```
======

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@WebAppConfiguration
	@ContextHierarchy({
		@ContextConfiguration(classes = AppConfig.class),
		@ContextConfiguration(classes = WebConfig.class)
	})
	class WebIntegrationTests {
		// class body...
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@WebAppConfiguration
	@ContextHierarchy(
			ContextConfiguration(classes = [AppConfig::class]),
			ContextConfiguration(classes = [WebConfig::class]))
	class WebIntegrationTests {
		// class body...
	}
```
======

If you need to merge or override the configuration for a given level of the context
hierarchy within a test class hierarchy, you must explicitly name that level by supplying
the same value to the `name` attribute in `@ContextConfiguration` at each corresponding
level in the class hierarchy. See [Context Hierarchies](testing/testcontext-framework/ctx-management/hierarchies.adoc)
and the {spring-framework-api}/test/context/ContextHierarchy.html[`@ContextHierarchy`] javadoc
for further examples.
