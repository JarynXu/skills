> **Offline teaching derivative**  
> Source: `spring-projects/spring-boot@c329ffa25dc160a90ebe5e4b006ad4cdf89d8683`  
> Upstream path: `documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/testing/spring-applications.adoc`  
> Upstream Git blob: `4dcea8e3251b4d5c4cf7c7f48062d0c8c557c8ae`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[testing.spring-applications]]
# Testing Spring Applications

One of the major advantages of dependency injection is that it should make your code easier to unit test.
You can instantiate objects by using the `new` operator without even involving Spring.
You can also use _mock objects_ instead of real dependencies.

Often, you need to move beyond unit testing and start integration testing (with a Spring javadoc:org.springframework.context.ApplicationContext[]).
It is useful to be able to perform integration testing without requiring deployment of your application or needing to connect to other infrastructure.

The Spring Framework includes a dedicated test module for such integration testing.
You can declare a dependency directly to `org.springframework:spring-test` or use the `spring-boot-starter-test` starter to pull it in transitively.

If you have not used the `spring-test` module before, you should start by reading the {url-spring-framework-docs}/testing.html[relevant section] of the Spring Framework reference documentation.
