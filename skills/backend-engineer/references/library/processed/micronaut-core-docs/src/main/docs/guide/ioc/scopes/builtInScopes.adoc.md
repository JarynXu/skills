> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/ioc/scopes/builtInScopes.adoc`  
> Upstream Git blob: `e49e7b5571e3419491f615c256fa8d4ff3a1631d`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

.Micronaut Built-in Scopes
|===
|Type |Description

|[@Singleton]({jakartaapi}/jakarta/inject/Singleton.html)
|Singleton scope indicates only one instance of the bean will exist
|[@Context]({api}/io/micronaut/context/annotation/Context.html)
|Context scope indicates that the bean will be created at the same time as the `ApplicationContext` (eager initialization)
|[@Prototype]({api}/io/micronaut/context/annotation/Prototype.html)
|Prototype scope indicates that a new instance of the bean is created each time it is injected
|[@Infrastructure]({api}/io/micronaut/context/annotation/Infrastructure.html)
|Infrastructure scope represents a bean that cannot be overridden or replaced using ann:context.annotation.Replaces[] because it is critical to the functioning of the system.
|[@ThreadLocal]({api}/io/micronaut/runtime/context/scope/ThreadLocal.html)
|`@ThreadLocal` scope is a custom scope that associates a bean per thread via a ThreadLocal
|[@Refreshable]({api}/io/micronaut/runtime/context/scope/Refreshable.html)
|`@Refreshable` scope is a custom scope that allows a bean's state to be refreshed via the `/refresh` endpoint.
|[@RequestScope]({api}/io/micronaut/runtime/http/scope/RequestScope.html)
|`@RequestScope` scope is a custom scope that indicates a new instance of the bean is created and associated with each HTTP request
|===

NOTE: The [@Prototype]({api}/io/micronaut/context/annotation/Prototype.html) annotation is a synonym for [@Bean]({api}/io/micronaut/context/annotation/Bean.html) because the default scope is prototype.

Additional scopes can be added by defining a `@Singleton` bean that implements the [CustomScope]({api}/io/micronaut/context/scope/CustomScope.html) interface.

Note that when starting an api:context.ApplicationContext[], by default `@Singleton`-scoped beans are created lazily and on-demand. This is by design to optimize startup time.

If this presents a problem for your use case you have the option of using the ann:context.annotation.Context[] annotation which binds the lifecycle of your object to the lifecycle of the api:context.ApplicationContext[]. In other words when the api:context.ApplicationContext[] is started your bean will be created.

Alternatively, annotate any `@Singleton`-scoped bean with ann:context.annotation.Parallel[] which allows parallel initialization of your bean without impacting overall startup time.

NOTE: If your bean fails to initialize in parallel, the application will be automatically shut down.
