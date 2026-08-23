> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/testcontext-framework/ctx-management.adoc`  
> Upstream Git blob: `c56bc8d25232d71087375ba0398be6a0d72ed6d9`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[testcontext-ctx-management]]
# Context Management

Each `TestContext` provides context management and caching support for the test instance
for which it is responsible. Test instances do not automatically receive access to the
configured `ApplicationContext`. However, if a test class implements the
`ApplicationContextAware` interface, a reference to the `ApplicationContext` is supplied
to the test instance. Note that `AbstractJUnit4SpringContextTests` and
`AbstractTestNGSpringContextTests` implement `ApplicationContextAware` and, therefore,
provide access to the `ApplicationContext` automatically.

.@Autowired ApplicationContext
[TIP]
=====
As an alternative to implementing the `ApplicationContextAware` interface, you can inject
the application context for your test class through the `@Autowired` annotation on either
a field or setter method, as the following example shows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@SpringJUnitConfig
	class MyTest {

		@Autowired // <1>
		ApplicationContext applicationContext;

		// class body...
	}
```
<1> Injecting the `ApplicationContext`.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@SpringJUnitConfig
	class MyTest {

		@Autowired // <1>
		lateinit var applicationContext: ApplicationContext

		// class body...
	}
```
<1> Injecting the `ApplicationContext`.
======

Similarly, if your test is configured to load a `WebApplicationContext`, you can inject
the web application context into your test, as follows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@SpringJUnitWebConfig // <1>
	class MyWebAppTest {

		@Autowired // <2>
		WebApplicationContext wac;

		// class body...
	}
```
<1> Configuring the `WebApplicationContext`.
<2> Injecting the `WebApplicationContext`.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@SpringJUnitWebConfig // <1>
	class MyWebAppTest {

		@Autowired // <2>
		lateinit var wac: WebApplicationContext
		// class body...
	}
```
<1> Configuring the `WebApplicationContext`.
<2> Injecting the `WebApplicationContext`.
======

Dependency injection by using `@Autowired` is provided by the
`DependencyInjectionTestExecutionListener`, which is configured by default
(see [Dependency Injection of Test Fixtures](testing/testcontext-framework/fixture-di.adoc)).
=====

Test classes that use the TestContext framework do not need to extend any particular
class or implement a specific interface to configure their application context. Instead,
configuration is achieved by declaring the `@ContextConfiguration` annotation at the
class level. If your test class does not explicitly declare component classes or resource
locations, the configured `ContextLoader` determines how to load a context from _default_
configuration classes or a _default_ location. In addition to component classes and
context resource locations, an application context can also be configured through
[context customizers](testing/testcontext-framework/ctx-management/context-customizers.adoc)
or [context initializers](testing/testcontext-framework/ctx-management/initializers.adoc).

The following sections explain how to use `@ContextConfiguration` and related annotations
to configure a test `ApplicationContext` by using component classes (typically
`@Configuration` classes), XML configuration files, Groovy scripts, context customizers,
or context initializers. Alternatively, you can implement and configure your own custom
`SmartContextLoader` for advanced use cases.

* [Context Configuration with Component Classes](testing/testcontext-framework/ctx-management/javaconfig.adoc)
* [Context Configuration with XML Resources](testing/testcontext-framework/ctx-management/xml.adoc)
* [Context Configuration with Groovy Scripts](testing/testcontext-framework/ctx-management/groovy.adoc)
* [Default Context Configuration](testing/testcontext-framework/ctx-management/default-config.adoc)
* [Mixing Component Classes, XML, and Groovy Scripts](testing/testcontext-framework/ctx-management/mixed-config.adoc)
* [Context Configuration with Context Customizers](testing/testcontext-framework/ctx-management/context-customizers.adoc)
* [Context Configuration with Context Initializers](testing/testcontext-framework/ctx-management/initializers.adoc)
* [Context Configuration Inheritance](testing/testcontext-framework/ctx-management/inheritance.adoc)
* [Context Configuration with Environment Profiles](testing/testcontext-framework/ctx-management/env-profiles.adoc)
* [Context Configuration with Test Property Sources](testing/testcontext-framework/ctx-management/property-sources.adoc)
* [Context Configuration with Dynamic Property Sources](testing/testcontext-framework/ctx-management/dynamic-property-sources.adoc)
* [Loading a `WebApplicationContext`](testing/testcontext-framework/ctx-management/web.adoc)
* [Context Caching](testing/testcontext-framework/ctx-management/caching.adoc)
* [Context Failure Threshold](testing/testcontext-framework/ctx-management/failure-threshold.adoc)
* [Context Hierarchies](testing/testcontext-framework/ctx-management/hierarchies.adoc)
