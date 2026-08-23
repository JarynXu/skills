> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/aop-api/extensibility.adoc`  
> Upstream Git blob: `6d6f423a6f2e51d6bf60445fd22a929bc404eb81`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[aop-extensibility]]
# Defining New Advice Types

Spring AOP is designed to be extensible. While the interception implementation strategy
is presently used internally, it is possible to support arbitrary advice types in
addition to the interception around advice, before, throws advice, and
after returning advice.

The `org.springframework.aop.framework.adapter` package is an SPI package that lets
support for new custom advice types be added without changing the core framework.
The only constraint on a custom `Advice` type is that it must implement the
`org.aopalliance.aop.Advice` marker interface.

See the {spring-framework-api}/aop/framework/adapter/package-summary.html[`org.springframework.aop.framework.adapter`]
javadoc for further information.
