> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/ioc/scopes/builtInScopes/eagerInit.adoc`  
> Upstream Git blob: `183ea26e38a51c31d0bf5eb769b49ca45e0df2ed`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

Eager initialization of `@Singleton` beans maybe desirable in certain scenarios, such as on AWS Lambda where more CPU resources are assigned to Lambda construction than execution.

You can specify whether to eagerly initialize `@Singleton`-scoped beans using the [ApplicationContextBuilder]({api}/io/micronaut/context/ApplicationContextBuilder.html) interface:

.Enabling Eager Initialization of Singletons
```java
public class Application {

    public static void main(String[] args) {
        Micronaut.build(args)
            .eagerInitSingletons(true) // <1>
            .mainClass(Application.class)
            .start();
    }
}
```

<1> Setting eager init to `true` initializes all singletons

When you use Micronaut framework in environments such as <<serverlessFunctions, Serverless Functions>>, you will not have an Application class, and instead you extend a Micronaut-provided class. In those cases, Micronaut provides methods which you can override to enhance the api:context.ApplicationContextBuilder[]

.Override of newApplicationContextBuilder()
```java
public class MyFunctionHandler extends MicronautRequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
...
    @Nonnull
    @Override
    protected ApplicationContextBuilder newApplicationContextBuilder() {
        ApplicationContextBuilder builder = super.newApplicationContextBuilder();
        builder.eagerInitSingletons(true);
        return builder;
    }
    ...
}
```

ann:context.annotation.ConfigurationReader[] beans such as ann:context.annotation.EachProperty[]  or ann:context.annotation.ConfigurationProperties[] are singleton beans. To eagerly init configuration but keep other `@Singleton`-scoped bean creation lazy, use `eagerInitConfiguration`:

.Enabling Eager Initialization of Configuration
```java
public class Application {

    public static void main(String[] args) {
        Micronaut.build(args)
            .eagerInitConfiguration(true) // <1>
            .mainClass(Application.class)
            .start();
    }
}
```

<1> Setting eager init to true initializes all configuration reader beans.
