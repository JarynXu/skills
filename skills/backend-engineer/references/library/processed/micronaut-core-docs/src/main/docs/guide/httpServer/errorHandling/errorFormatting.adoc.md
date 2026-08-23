> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/errorHandling/errorFormatting.adoc`  
> Upstream Git blob: `b8b99362d1736589bd585240f53ab885a6d7583d`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

The Micronaut framework produces error responses via a bean of type api:http.server.exceptions.response.ErrorResponseProcessor[].

JSON error responses are provided with a bean of type api:http.server.exceptions.response.JsonErrorResponseBodyProvider[].
The default implementation outputs [vnd.error](https://github.com/blongden/vnd.error) responses.

HTML error responses are provided via a bean of type api:http.server.exceptions.response.HtmlErrorResponseBodyProvider[].
The default implementation outputs HTML which <<i18n, can be localized>> with codes such as:
`<status>.error.bold`, `<status>.error.title`, `<status>.error`. For example, you could localize the default 404 error page into Spanish:

```properties
404.error.bold=La página que buscabas no existe
404.error.title=No encontrado
404.error=Es posible que haya escrito mal la dirección o que la página se haya movido.
```

If customization of the response other than items related to the errors is desired, the <<exceptionHandler, exception handler>> that is handling the exception needs to be overridden.
