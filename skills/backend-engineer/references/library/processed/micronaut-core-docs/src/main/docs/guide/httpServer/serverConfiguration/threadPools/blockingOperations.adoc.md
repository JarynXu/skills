> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/serverConfiguration/threadPools/blockingOperations.adoc`  
> Upstream Git blob: `ff3cbff3c1874605306e78696b65e59cadb48328`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

When dealing with blocking operations, the Micronaut framework shifts the blocking operations to an unbound, caching I/O thread pool by default. You can configure the I/O thread pool using the api:scheduling.executor.ExecutorConfiguration[] named `io`. For example:

.Configuring the Server I/O Thread Pool
[configuration]
```
micronaut:
  executors:
    io:
      type: fixed
      nThreads: 75
```

The above configuration creates a fixed thread pool with 75 threads.
