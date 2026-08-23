> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux/controller/ann-methods/return-types.adoc`  
> Upstream Git blob: `daab2a64679e30b2abedf5811f22394b4cf9fca5`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-ann-return-types]]
# Return Values

[.small]#[See equivalent in the Servlet stack](web/webmvc/mvc-controller/ann-methods/return-types.adoc)#

The following table shows the supported controller method return values. Note that reactive
types from libraries such as Reactor, RxJava, [or other](web/webflux-reactive-libraries.adoc) are
generally supported for all return values.

For return types like `Flux`, when multiple values are expected, elements are streamed as they come
and are not buffered. This is the default behavior, as keeping a potentially large amount of elements in memory
is not efficient. If the media type implies an infinite stream (for example,
`application/json+stream`), values are written and flushed individually. Otherwise,
values are written individually and the flushing happens separately.

NOTE: If an error happens while an element is encoded to JSON, the response might have been written to
and committed already and it is impossible at that point to render a proper error response.
In some cases, applications can choose to trade memory efficiency for better handling such errors by
buffering elements and encoding them all at once. Controllers can then return a `Flux<List<B>>`;
Reactor provides a dedicated operator for that, `Flux#collectList()`.

[cols="1,2", options="header"]
|===
| Controller method return value | Description

| `@ResponseBody`
| The return value is encoded through `HttpMessageWriter` instances and written to the response.
  See [`@ResponseBody`](web/webflux/controller/ann-methods/responsebody.adoc).

| `HttpEntity<B>`, `ResponseEntity<B>`
| The return value specifies the full response, including HTTP headers, and the body is encoded
  through `HttpMessageWriter` instances and written to the response.
  See [`ResponseEntity`](web/webflux/controller/ann-methods/responseentity.adoc).

| `HttpHeaders`
| For returning a response with headers and no body.

| `ErrorResponse`, `ProblemDetail`
| To render an RFC 9457 error response with details in the body,
  see [Error Responses](web/webflux/ann-rest-exceptions.adoc)

| `String`
| A view name to be resolved with `ViewResolver` instances and used together with the implicit
  model -- determined through command objects and `@ModelAttribute` methods. The handler
  method can also programmatically enrich the model by declaring a `Model` argument
  (described [earlier](web/webflux/dispatcher-handler.adoc#webflux-viewresolution-handling)).

| `View`
| A `View` instance to use for rendering together with the implicit model -- determined
  through command objects and `@ModelAttribute` methods. The handler method can also
  programmatically enrich the model by declaring a `Model` argument
  (described [earlier](web/webflux/dispatcher-handler.adoc#webflux-viewresolution-handling)).

| `java.util.Map`, `org.springframework.ui.Model`
| Attributes to be added to the implicit model, with the view name implicitly determined
  based on the request path.

| `@ModelAttribute`
| An attribute to be added to the model, with the view name implicitly determined based
  on the request path.

  Note that `@ModelAttribute` is optional. See "`Any other return value`" later in
  this table.

| `Rendering`
| An API for model and view rendering scenarios.

| `FragmentsRendering`, `Flux<Fragment>`, `Collection<Fragment>`
| For rendering one or more fragments each with its own view and model.
  See [HTML Fragments](web/webflux-view.adoc#webflux-view-fragments) for more details.

| `void`
| A method with a `void`, possibly asynchronous (for example, `Mono<Void>`), return type (or a `null` return
  value) is considered to have fully handled the response if it also has a `ServerHttpResponse`,
  a `ServerWebExchange` argument, or an `@ResponseStatus` annotation. The same is also true
  if the controller has made a positive ETag or `lastModified` timestamp check.
  See [Controllers](web/webflux/caching.adoc#webflux-caching-etag-lastmodified) for details.

  If none of the above is true, a `void` return type can also indicate "`no response body`" for
  REST controllers or default view name selection for HTML controllers.

| `Flux<ServerSentEvent>`, `Observable<ServerSentEvent>`, or other reactive type
| Emit server-sent events. The `ServerSentEvent` wrapper can be omitted when only data needs
  to be written (however, `text/event-stream` must be requested or declared in the mapping
  through the `produces` attribute).

| Other return values
| If a return value remains unresolved in any other way, it is treated as a model
  attribute, unless it is a simple type as determined by
  {spring-framework-api}/beans/BeanUtils.html#isSimpleProperty(java.lang.Class)[BeanUtils#isSimpleProperty],
  in which case it remains unresolved.
|===
