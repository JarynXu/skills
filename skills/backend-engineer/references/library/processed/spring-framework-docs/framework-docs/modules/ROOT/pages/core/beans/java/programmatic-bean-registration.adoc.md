> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/beans/java/programmatic-bean-registration.adoc`  
> Upstream Git blob: `3663fc13fe770429c6e26bfd7ad13c7c88cba6bf`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[beans-java-programmatic-registration]]
# Programmatic Bean Registration

As of Spring Framework 7, a first-class support for programmatic bean registration is
provided via the {spring-framework-api}/beans/factory/BeanRegistrar.html[`BeanRegistrar`]
interface that can be implemented to register beans programmatically in a flexible and
efficient way.

Those bean registrar implementations are typically imported with an `@Import` annotation
on `@Configuration` classes.

include-code::./MyConfiguration[tag=snippet,indent=0]

NOTE: You can leverage type-level conditional annotations ({spring-framework-api}/context/annotation/Conditional.html[`@Conditional`],
but also other variants) to conditionally import the related bean registrars.

The bean registrar implementation uses {spring-framework-api}/beans/factory/BeanRegistry.html[`BeanRegistry`] and
{spring-framework-api}/core/env/Environment.html[`Environment`] APIs to register beans programmatically in a concise
and flexible way. For example, it allows custom registration through an `if` expression, a
`for` loop, etc.

include-code::./MyBeanRegistrar[tag=snippet,indent=0]

NOTE: Bean registrars are supported with [Ahead of Time Optimizations](core/aot.adoc),
either on the JVM or with GraalVM native images, including when instance suppliers are used.
