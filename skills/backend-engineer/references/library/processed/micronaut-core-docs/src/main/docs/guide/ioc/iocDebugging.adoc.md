> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/ioc/iocDebugging.adoc`  
> Upstream Git blob: `01f819a26d948ef64bf477d7e2dfad9a788b2ccd`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

To help you easily understand what Micronaut is doing at startup and when a particular bean is created Micronaut includes a dependency injection tracing feature which can be activated in a number of different ways including via the api:context.ApplicationContextBuilder[] API.

The simplest way to activate injection trace mode is using an environment variable. For example if you are running your application locally you can do:

.Activating Injection Trace Mode
```bash
MICRONAUT_INJECT_TRACE=.+ ./gradlew run
```

Or for Maven:

.Activating Injection Trace Mode
```bash
MICRONAUT_INJECT_TRACE=.+ ./mvnw mn:run
```

Trace mode will output useful information such as:

* The Configuration profile of the application
* The applicable configuration and where it came from
* The beans that are created, where they were created and how long was taken to create the bean.
