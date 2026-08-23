> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/serverConfiguration/threadPools/virtualThreads.adoc`  
> Upstream Git blob: `28ee22fe685ef18128f418fd1ba1d381a4c2a69a`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

Since Java 19, the JVM includes experimental support for https://openjdk.org/jeps/425[virtual threads ("project loom")]. As it is a preview feature, you need to pass `--enable-preview` as a JVM parameter to enable it.

The Micronaut framework will detect virtual thread support and use it for the executor named `blocking` if available. If virtual threads are not supported, this executor will be aliased to the `io` thread pool.

To use the `blocking` executor, simply mark e.g. a controller with `ExecuteOn`:

snippet::io.micronaut.docs.taskexecutors.HelloWorldController[tags="clazz", indent=0, title="Configuring the Server I/O Thread Pool"]

### Event loop carrier

Micronaut HTTP Server Netty 4.9 introduces an *experimental* mode to run virtual threads on the Netty event loop. This
can improve performance of virtual threads, since it avoids a context switch between the Netty event loop and the JDK
ForkJoinPool.

This mode requires access to internal JDK APIs. Please run your application with
`--add-opens=java.base/java.lang=ALL-UNNAMED`. Then, enable the `loom-carrier` flag for the event loop, e.g. `micronaut.netty.event-loops.loom-carrier=true`

.Enabling the event loop carrier
[configuration]
```
micronaut:
  netty:
    event-loops:
      default:
        loom-carrier: true
```
