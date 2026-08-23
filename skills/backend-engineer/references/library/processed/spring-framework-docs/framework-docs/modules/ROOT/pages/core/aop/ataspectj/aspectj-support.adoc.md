> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/aop/ataspectj/aspectj-support.adoc`  
> Upstream Git blob: `f3dae9e6d17f79c87b3829b4b30f0eccbd0d4dcb`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[aop-aspectj-support]]
# Enabling @AspectJ Support

To use @AspectJ aspects in a Spring configuration, you need to enable Spring support for
configuring Spring AOP based on @AspectJ aspects and auto-proxying beans based on
whether or not they are advised by those aspects. By auto-proxying, we mean that, if Spring
determines that a bean is advised by one or more aspects, it automatically generates
a proxy for that bean to intercept method invocations and ensures that advice is run
as needed.

The @AspectJ support can be enabled with programmatic or XML configuration. In either
case, you also need to ensure that AspectJ's `org.aspectj:aspectjweaver` library is on the
classpath of your application (version 1.9 or later).

include-code::./ApplicationConfiguration[tag=snippet,indent=0]
