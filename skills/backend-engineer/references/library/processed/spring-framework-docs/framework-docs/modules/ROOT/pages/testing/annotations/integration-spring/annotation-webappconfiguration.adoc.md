> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/annotations/integration-spring/annotation-webappconfiguration.adoc`  
> Upstream Git blob: `fa697e62f9ccb56cf20759aebf951b4255d35afb`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[spring-testing-annotation-webappconfiguration]]
# `@WebAppConfiguration`

`@WebAppConfiguration` is an annotation that can be applied to a test class to declare
that the `ApplicationContext` loaded for an integration test should be a
`WebApplicationContext`. The mere presence of `@WebAppConfiguration` on a test class
ensures that a `WebApplicationContext` is loaded for the test, using the default value of
`"file:src/main/webapp"` for the path to the root of the web application (that is, the
resource base path). The resource base path is used behind the scenes to create a
`MockServletContext`, which serves as the `ServletContext` for the test's
`WebApplicationContext`.

The following example shows how to use the `@WebAppConfiguration` annotation:

--
[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	@WebAppConfiguration // <1>
	class WebAppTests {
		// class body...
	}
```
<1> The `@WebAppConfiguration` annotation.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	@WebAppConfiguration // <1>
	class WebAppTests {
		// class body...
	}
```
<1> The `@WebAppConfiguration` annotation.
======
--

To override the default, you can specify a different base resource path by using the
implicit `value` attribute. Both `classpath:` and `file:` resource prefixes are
supported. If no resource prefix is supplied, the path is assumed to be a file system
resource. The following example shows how to specify a classpath resource:

--
[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	@WebAppConfiguration("classpath:test-web-resources") // <1>
	class WebAppTests {
		// class body...
	}
```
<1> Specifying a classpath resource.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@ContextConfiguration
	@WebAppConfiguration("classpath:test-web-resources") // <1>
	class WebAppTests {
		// class body...
	}
```
<1> Specifying a classpath resource.
======
--


Note that `@WebAppConfiguration` must be used in conjunction with
`@ContextConfiguration`, either within a single test class or within a test class
hierarchy. See the
{spring-framework-api}/test/context/web/WebAppConfiguration.html[`@WebAppConfiguration`]
javadoc for further details.
