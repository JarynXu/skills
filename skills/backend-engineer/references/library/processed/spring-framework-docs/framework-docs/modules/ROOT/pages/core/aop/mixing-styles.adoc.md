> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/aop/mixing-styles.adoc`  
> Upstream Git blob: `81e3de6d9e4af4e6360d03f3e7895f8f3f89e6a3`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[aop-mixing-styles]]
# Mixing Aspect Types

It is perfectly possible to mix @AspectJ style aspects by using the auto-proxying support,
schema-defined `<aop:aspect>` aspects, `<aop:advisor>` declared advisors, and even proxies
and interceptors in other styles in the same configuration. All of these are implemented
by using the same underlying support mechanism and can co-exist without any difficulty.
