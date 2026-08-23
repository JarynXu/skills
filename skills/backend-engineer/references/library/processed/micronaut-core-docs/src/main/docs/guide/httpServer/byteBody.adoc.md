> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/byteBody.adoc`  
> Upstream Git blob: `0f35af7cba94cf31d0f49ce9f5659e9cfe444a86`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

Micronaut HTTP server version 4.5.0 introduced a new, more advanced API to access the bytes of an incoming request.
When an api:io.micronaut.http.HttpRequest[] implements api:io.micronaut.http.ServerHttpRequest[], the new `byteBody()`
method returns a api:io.micronaut.http.body.ByteBody[] with buffered, reactive and blocking APIs.

When an HTTP request comes in, it starts out with an unparsed and unclaimed stream of bytes as its `byteBody()`. After
all request filters have run, typically an argument binder matching the `@Body` parameter of the controller will
"claim" the `byteBody()` and e.g. parse the JSON. Finally, the body is closed at the end of the request lifecycle,
discarding any data if it has not been claimed by the argument binder.

NOTE: The api:http.filter.FilterBodyParser[] API allows you to get a Map representation of a request's body whose content type is either application/x-www-form-urlencoded or application/json.
