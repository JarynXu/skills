> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/serverConfiguration/threadPools/atBlocking.adoc`  
> Upstream Git blob: `027f1686e353c8dfb7573334d97a052655b37925`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

You can use the ann:core.annotation.Blocking[] annotation to mark methods as blocking.

If you set `micronaut.server.thread-selection` to `AUTO`, the Micronaut framework offloads the execution of methods annotated with `@Blocking` to the IO thread pool (See: api:io.micronaut.scheduling.TaskExecutors[]).

NOTE: `@Blocking` only works if you are using `AUTO` thread selection. Micronaut framework defaults to `MANUAL` thread selection since Micronaut 2.0. We recommend the usage of ann:scheduling.annotation.ExecuteOn[] annotation to execute the blocking operations on a different thread pool. `@ExecutesOn` works for both `MANUAL` and `AUTO` thread selection.

There are some places where the Micronaut framework uses ann:core.annotation.Blocking[] internally:

|===
|Blocking Type|Description

|[BlockingHttpClient]({micronautapi}http/client/BlockingHttpClient.html)
| Intended for testing, provides blocking versions for a subset of api:http.client.HttpClient[] operations.
|[IOUtils]({micronautapi}core/io/IOUtils.html)
| Reads the contents of a `BufferedReader` in a blocking manner, and returns that as a `String`.
|[BootstrapPropertySourceLocator]({micronautapi}context/env/BootstrapPropertySourceLocator.html)
| Resolves either remote or local api:context.env.PropertySource[] instances for the current `Environment`.

|===

TIP: https://micronaut-projects.github.io/micronaut-data/latest/guide/[Micronaut Data] also utilizes `@Blocking` internally for some transaction operations, CRUD interceptors, and repositories.
