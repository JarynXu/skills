> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/testcontext-framework/ctx-management/failure-threshold.adoc`  
> Upstream Git blob: `b4cda24501180da3943a2816426b2ad2d1f1086a`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[testcontext-ctx-management-failure-threshold]]
# Context Failure Threshold

As of Spring Framework 6.1, a context _failure threshold_ policy is in place which helps
avoid repeated attempts to load a failing `ApplicationContext`. By default, the failure
threshold is set to `1` which means that only one attempt will be made to load an
`ApplicationContext` for a given context cache key (see
[Context Caching](testing/testcontext-framework/ctx-management/caching.adoc)). Any
subsequent attempt to load the `ApplicationContext` for the same context cache key will
result in an immediate `IllegalStateException` with an error message which explains that
the attempt was preemptively skipped. This behavior allows individual test classes and
test suites to fail faster by avoiding repeated attempts to load an `ApplicationContext`
that will never successfully load -- for example, due to a configuration error or a missing
external resource that prevents the context from loading in the current environment.

You can configure the context failure threshold from the command line or a build script
by setting a JVM system property named `spring.test.context.failure.threshold` with a
positive integer value. As an alternative, you can set the same property via the
[`SpringProperties`](appendix.adoc#appendix-spring-properties) mechanism.

NOTE: If you wish to effectively disable the context failure threshold, you can set the
property to a very large value. For example, from the command line you could set the
system property via `-Dspring.test.context.failure.threshold=1000000`.
