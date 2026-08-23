> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/jsonBinding/bindingUsingCompletableFuture.adoc`  
> Upstream Git blob: `5577ea5e934a4612640f5a6d6a041f4ba524c0e0`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

The same method as the previous example can also be written with the [CompletableFuture]({jdkapi}/java.base/java/util/concurrent/CompletableFuture.html) API instead:

snippet::io.micronaut.docs.server.json.PersonController[tags="class,future,endclass", indent=0, title="Using CompletableFuture to Read the JSON"]

The above example uses the `thenApply` method to achieve the same as the previous example.
