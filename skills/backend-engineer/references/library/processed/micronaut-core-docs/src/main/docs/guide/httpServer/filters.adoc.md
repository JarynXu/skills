> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/filters.adoc`  
> Upstream Git blob: `e21f056a12dba55b6caecd280efd987907a4854e`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

The Micronaut HTTP server supports applying filters to request/response processing in a similar (but reactive) way to Servlet filters in traditional Java applications.

Filters support the following use cases:

* Decoration of the incoming api:http.HttpRequest[]
* Modification of the outgoing api:http.HttpResponse[]
* Implementation of cross-cutting concerns such as security, tracing, etc.

There are two ways to implement a filter:

- <<httpServerFilter, Annotating class with api:http.annotation.Filter[] and implementing api:http.filter.HttpServerFilter[] or api:http.filter.HttpClientFilter[]>>.
- By using <<filtermethods,Filter methods>>.

NOTE: We recommend Micronaut developers use <<filtermethods,Filter methods>> introduced in Micronaut Framework 4.0 to implement filters.
