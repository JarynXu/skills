> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/aop-api/advisor.adoc`  
> Upstream Git blob: `b65dbb2aa68962189feae6dc2075ad16fe861f2b`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[aop-api-advisor]]
# The Advisor API in Spring

In Spring, an Advisor is an aspect that contains only a single advice object associated
with a pointcut expression.

Apart from the special case of introductions, any advisor can be used with any advice.
`org.springframework.aop.support.DefaultPointcutAdvisor` is the most commonly used
advisor class. It can be used with a `MethodInterceptor`, `BeforeAdvice`, or
`ThrowsAdvice`.

It is possible to mix advisor and advice types in Spring in the same AOP proxy. For
example, you could use an interception around advice, throws advice, and before advice in
one proxy configuration. Spring automatically creates the necessary interceptor
chain.
