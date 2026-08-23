> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/beans/annotation-config.adoc`  
> Upstream Git blob: `2ae12e0360c0bb7565566705adc65d60c337453c`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[beans-annotation-config]]
# Annotation-based Container Configuration

Spring provides comprehensive support for annotation-based configuration, operating on
metadata in the component class itself by using annotations on the relevant class,
method, or field declaration. As mentioned in
[Example: The `AutowiredAnnotationBeanPostProcessor`](core/beans/factory-extension.adoc#beans-factory-extension-bpp-examples-aabpp),
Spring uses `BeanPostProcessors` in conjunction with annotations to make the core IOC
container aware of specific annotations.

For example, the [`@Autowired`](core/beans/annotation-config/autowired.adoc)
annotation provides the same capabilities as described in
[Autowiring Collaborators](core/beans/dependencies/factory-autowire.adoc) but
with more fine-grained control and wider applicability. In addition, Spring provides
support for JSR-250 annotations, such as `@PostConstruct` and `@PreDestroy`, as well as
support for JSR-330 (Dependency Injection for Java) annotations contained in the
`jakarta.inject` package such as `@Inject` and `@Named`. Details about those annotations
can be found in the [relevant section](core/beans/standard-annotations.adoc).

[NOTE]
====
Annotation injection is performed before external property injection. Thus, external
configuration (for example, XML-specified bean properties) effectively overrides the annotations
for properties when wired through mixed approaches.
====

Technically, you can register the post-processors as individual bean definitions, but they
are implicitly registered in an `AnnotationConfigApplicationContext` already.

In an XML-based Spring setup, you may include the following configuration tag to enable
mixing and matching with annotation-based configuration:

```xml,indent=0,subs="verbatim,quotes"
	<?xml version="1.0" encoding="UTF-8"?>
	<beans xmlns="http://www.springframework.org/schema/beans"
		xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
		xmlns:context="http://www.springframework.org/schema/context"
		xsi:schemaLocation="http://www.springframework.org/schema/beans
			https://www.springframework.org/schema/beans/spring-beans.xsd
			http://www.springframework.org/schema/context
			https://www.springframework.org/schema/context/spring-context.xsd">

		<context:annotation-config/>

	</beans>
```

The `<context:annotation-config/>` element implicitly registers the following post-processors:

* {spring-framework-api}/context/annotation/ConfigurationClassPostProcessor.html[`ConfigurationClassPostProcessor`]
* {spring-framework-api}/beans/factory/annotation/AutowiredAnnotationBeanPostProcessor.html[`AutowiredAnnotationBeanPostProcessor`]
* {spring-framework-api}/context/annotation/CommonAnnotationBeanPostProcessor.html[`CommonAnnotationBeanPostProcessor`]
* {spring-framework-api}/orm/jpa/support/PersistenceAnnotationBeanPostProcessor.html[`PersistenceAnnotationBeanPostProcessor`]
* {spring-framework-api}/context/event/EventListenerMethodProcessor.html[`EventListenerMethodProcessor`]

[NOTE]
====
`<context:annotation-config/>` only looks for annotations on beans in the same
application context in which it is defined. This means that, if you put
`<context:annotation-config/>` in a `WebApplicationContext` for a `DispatcherServlet`,
it only checks for `@Autowired` beans in your controllers, and not your services. See
[The DispatcherServlet](web/webmvc/mvc-servlet.adoc) for more information.
====
