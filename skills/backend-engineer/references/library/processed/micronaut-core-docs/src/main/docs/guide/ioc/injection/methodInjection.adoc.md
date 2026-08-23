> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/ioc/injection/methodInjection.adoc`  
> Upstream Git blob: `03fcffffe0369499d0c5dc0f05d367dd0e678744`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

You can inject methods by annotating the method with `jakarta.inject.Inject`. For each argument of the method Micronaut will attempt to resolve the method argument as a bean. If any of the methods are not resolvable a api:context.exceptions.NoSuchBeanException[] will be thrown.

.Example of Method Injection
snippet::io.micronaut.docs.ioc.injection.method.Vehicle[indent="0"]

<1> The method is annotated with `jakarta.inject.Inject` and will therefore be injected

[.lang-kotlin.lang-java.lang-groovy]
--
WARNING: If the method is `private` scope or inaccessible then the method will be injected using the Java reflection API which is not recommended.
--

Method injection can be useful if you need post construction initializers, however in general should be avoided in favour of constructor injection where possible.
