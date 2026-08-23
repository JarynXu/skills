> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/filters/filtermethods/filtermethodproceed.adoc`  
> Upstream Git blob: `0dfa2eaa95309b0fe38368e1ec754ee03d353719`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

If you need to write a filter, e.g., security-related, which needs to proceed with requests in some scenarios or stop the request execution
and return an HTTP Response directly in the filter; you can use, for example,  a `CompletableFuture` as the filter method's response type.

```java
include::http-server-tck/src/main/java/io/micronaut/http/server/tck/tests/filter/RequestFilterCompletableFutureFutureProceedTest.java[tags=clazz;methods,indent=0]
```
