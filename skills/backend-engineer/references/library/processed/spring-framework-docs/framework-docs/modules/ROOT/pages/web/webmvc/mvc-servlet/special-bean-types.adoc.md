> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-servlet/special-bean-types.adoc`  
> Upstream Git blob: `94148874fcd02bd1af993892cc044b227ce1a9ad`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-servlet-special-bean-types]]
# Special Bean Types

[.small]#[See equivalent in the Reactive stack](web/webflux/dispatcher-handler.adoc#webflux-special-bean-types)#

The `DispatcherServlet` delegates to special beans to process requests and render the
appropriate responses. By "`special beans`" we mean Spring-managed `Object` instances that
implement framework contracts. Those usually come with built-in contracts, but
you can customize their properties and extend or replace them.

The following table lists the special beans detected by the `DispatcherServlet`:

[[mvc-webappctx-special-beans-tbl]]
[cols="1,2", options="header"]
|===
| Bean type| Explanation

| `HandlerMapping`
| Map a request to a handler along with a list of
  [interceptors](web/webmvc/mvc-servlet/handlermapping-interceptor.adoc) for pre- and post-processing.
  The mapping is based on some criteria, the details of which vary by `HandlerMapping`
  implementation.

  The two main `HandlerMapping` implementations are `RequestMappingHandlerMapping`
  (which supports `@RequestMapping` annotated methods) and `SimpleUrlHandlerMapping`
  (which maintains explicit registrations of URI path patterns to handlers).

| `HandlerAdapter`
| Help the `DispatcherServlet` to invoke a handler mapped to a request, regardless of
  how the handler is actually invoked. For example, invoking an annotated controller
  requires resolving annotations. The main purpose of a `HandlerAdapter` is
  to shield the `DispatcherServlet` from such details.

| [`HandlerExceptionResolver`](web/webmvc/mvc-servlet/exceptionhandlers.adoc)
| Strategy to resolve exceptions, possibly mapping them to handlers, to HTML error
  views, or other targets. See [Exceptions](web/webmvc/mvc-servlet/exceptionhandlers.adoc).

| [`ViewResolver`](web/webmvc/mvc-servlet/viewresolver.adoc)
| Resolve logical `String`-based view names returned from a handler to an actual `View`
  with which to render to the response. See [View Resolution](web/webmvc/mvc-servlet/viewresolver.adoc) and [View Technologies](web/webmvc-view.adoc).

| [`LocaleResolver`](web/webmvc/mvc-servlet/localeresolver.adoc), [LocaleContextResolver](web/webmvc/mvc-servlet/localeresolver.adoc#mvc-timezone)
| Resolve the `Locale` a client is using and possibly their time zone, in order to be able
  to offer internationalized views. See [Locale](web/webmvc/mvc-servlet/localeresolver.adoc).

| [`MultipartResolver`](web/webmvc/mvc-servlet/multipart.adoc)
| Abstraction for parsing a multi-part request (for example, browser form file upload) with
  the help of some multipart parsing library. See [Multipart Resolver](web/webmvc/mvc-servlet/multipart.adoc).

| [`FlashMapManager`](web/webmvc/mvc-controller/ann-methods/flash-attributes.adoc)
| Store and retrieve the "`input`" and the "`output`" `FlashMap` that can be used to pass
  attributes from one request to another, usually across a redirect.
  See [Flash Attributes](web/webmvc/mvc-controller/ann-methods/flash-attributes.adoc).
|===
