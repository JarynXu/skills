> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/config/environments/defaultEnvironment.adoc`  
> Upstream Git blob: `f4366a90fd03daf48189301bacbdc6c0b55e1ab8`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

The Micronaut framework supports the concept of one or many default environments.
A default environment is one that is only applied if no other environments are explicitly specified or deduced.
Environments can be explicitly specified either through the application context builder `Micronaut.build().environments(...)`, through the `micronaut.environments` system property, or the `MICRONAUT_ENVIRONMENTS` environment variable.
Environments can be deduced to automatically apply the environment appropriate for cloud deployments.
If an environment is found through any of the above means, the default environment will *not* be applied.

To set the default environments, include a public static class that implements api:context.ApplicationContextConfigurer[] and is annotated with api:context.annotation.ContextConfigurer[]:

```java
public class Application {

    @ContextConfigurer
    public static class DefaultEnvironmentConfigurer implements ApplicationContextConfigurer {
        @Override
        public void configure(@NonNull ApplicationContextBuilder builder) {
            builder.defaultEnvironments(defaultEnvironment);
        }
    }

    public static void main(String[] args) {
        Micronaut.run(Application.class, args);
    }
}
```

NOTE: Previously, we recommended using `Micronaut.defaultEnvironments("dev")` however this does not allow the Ahead of Time (AOT) compiler to detect the default environments.
