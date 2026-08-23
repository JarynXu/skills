> **Offline teaching derivative**  
> Source: `spring-projects/spring-boot@c329ffa25dc160a90ebe5e4b006ad4cdf89d8683`  
> Upstream path: `documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/features/aop.adoc`  
> Upstream Git blob: `cc26b17f57914380521bd8138e6bf36ded0f40b6`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[features.aop]]
# Aspect-Oriented Programming

Spring Boot provides auto-configuration for aspect-oriented programming (AOP).
You can learn more about AOP with Spring in the {url-spring-framework-docs}/core/aop-api.html[Spring Framework reference documentation].

By default, Spring Boot's auto-configuration configures Spring AOP to use CGLib proxies.
To use JDK proxies instead, set configprop:spring.aop.proxy-target-class[] to `false`.

If AspectJ is on the classpath, Spring Boot's auto-configuration will automatically enable AspectJ auto proxy such that javadoc:org.springframework.context.annotation.EnableAspectJAutoProxy[format=annotation] is not required.
