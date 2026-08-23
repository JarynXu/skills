> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/testcontext-framework.adoc`  
> Upstream Git blob: `b7eae8ed92218497070a1a334a70a33954192611`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[testcontext-framework]]
# Spring TestContext Framework

The Spring TestContext Framework (located in the `org.springframework.test.context`
package) provides generic, annotation-driven unit and integration testing support that is
agnostic of the testing framework in use. The TestContext framework also places a great
deal of importance on convention over configuration, with reasonable defaults that you
can override through annotation-based configuration.

In addition to generic testing infrastructure, the TestContext framework provides
explicit support for JUnit Jupiter, JUnit 4, and TestNG. For JUnit 4 and TestNG, Spring
provides `abstract` support classes. Furthermore, Spring provides a custom JUnit `Runner`
and custom JUnit `Rules` for JUnit 4 and a custom `Extension` for JUnit Jupiter that let
you write so-called POJO test classes. POJO test classes are not required to extend a
particular class hierarchy, such as the `abstract` support classes.

The following section provides an overview of the internals of the TestContext framework.
If you are interested only in using the framework and are not interested in extending it
with your own custom listeners or custom loaders, feel free to go directly to the
configuration ([context management](testing/testcontext-framework/ctx-management.adoc),
[dependency injection](testing/testcontext-framework/fixture-di.adoc),
[transaction management](testing/testcontext-framework/tx.adoc)),
[support classes](testing/testcontext-framework/support-classes.adoc), and
[annotation support](testing/annotations.adoc) sections.
