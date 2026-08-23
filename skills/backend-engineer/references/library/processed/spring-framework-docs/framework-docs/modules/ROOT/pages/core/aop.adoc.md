> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/aop.adoc`  
> Upstream Git blob: `f037e736cb196f9d4c9a976e9c8dac6fc5f6da13`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[aop]]
# Aspect Oriented Programming with Spring

Aspect-oriented Programming (AOP) complements Object-oriented Programming (OOP) by
providing another way of thinking about program structure. The key unit of modularity
in OOP is the class, whereas in AOP the unit of modularity is the aspect. Aspects
enable the modularization of concerns (such as transaction management) that cut across
multiple types and objects. (Such concerns are often termed "crosscutting" concerns
in AOP literature.)

One of the key components of Spring is the AOP framework. While the Spring IoC
container does not depend on AOP (meaning you do not need to use AOP if you don't want
to), AOP complements Spring IoC to provide a very capable middleware solution.

.Spring AOP with AspectJ pointcuts
****
Spring provides simple and powerful ways of writing custom aspects by using either a
[schema-based approach](core/aop/schema.adoc) or the [@AspectJ annotation style](core/aop/ataspectj.adoc).
Both of these styles offer fully typed advice and use of the AspectJ pointcut language
while still using Spring AOP for weaving.

This chapter discusses the schema- and @AspectJ-based AOP support.
The lower-level AOP support is discussed in [the following chapter](core/aop-api.adoc).
****

AOP is used in the Spring Framework to:

* Provide declarative enterprise services. The most important such service is
  [declarative transaction management](data-access/transaction/declarative.adoc).
* Let users implement custom aspects, complementing their use of OOP with AOP.

NOTE: If you are interested only in generic declarative services or other pre-packaged
declarative middleware services such as pooling, you do not need to work directly with
Spring AOP, and can skip most of this chapter.
