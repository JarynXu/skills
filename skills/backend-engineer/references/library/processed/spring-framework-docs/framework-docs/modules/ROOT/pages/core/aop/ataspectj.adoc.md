> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/aop/ataspectj.adoc`  
> Upstream Git blob: `c2862871a4439ed7e48ea261242cbbeeda6c0b3b`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[aop-ataspectj]]
# @AspectJ support

@AspectJ refers to a style of declaring aspects as regular Java classes annotated with
annotations. The @AspectJ style was introduced by the
{aspectj-site}[AspectJ project] as part of the AspectJ 5 release. Spring
interprets the same annotations as AspectJ 5, using a library supplied by AspectJ
for pointcut parsing and matching. The AOP runtime is still pure Spring AOP, though, and
there is no dependency on the AspectJ compiler or weaver.

NOTE: Using the AspectJ compiler and weaver enables use of the full AspectJ language and
is discussed in [Using AspectJ with Spring Applications](core/aop/using-aspectj.adoc).
