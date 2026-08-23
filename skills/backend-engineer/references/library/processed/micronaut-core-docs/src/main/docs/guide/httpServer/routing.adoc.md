> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/routing.adoc`  
> Upstream Git blob: `8b18e7e6edbadc494ecd0381acf4fcda2918190f`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

The [@Controller]({api}/io/micronaut/http/annotation/Controller.html) annotation used in the previous section is one of [several annotations]({api}/io/micronaut/http/annotation/package-summary.html) that allow you to control the construction of HTTP routes.

## URI Paths

The value of the `@Controller` annotation is an https://tools.ietf.org/html/rfc6570[RFC-6570 URI template], so you can embed URI variables within the path using the syntax defined by the URI template specification.

NOTE: Many other frameworks, including Spring, implement the URI template specification

The actual implementation is handled by the api:http.uri.UriMatchTemplate[] class, which extends api:http.uri.UriTemplate[].

You can use this class in your applications to build URIs, for example:

snippet::io.micronaut.docs.server.uris.UriTemplateTest[tags="match", title="Using a UriTemplate",indent=0]

<1> Use the `match` method to match a path
<2> Use the `expand` method to expand a template into a URI

You can use api:http.uri.UriTemplate[] to build paths to include in your responses.

## URI Path Variables

URI variables can be referenced via method arguments. When the path variable matches the method argument name, they are bound together automatically. If you want to use different names or specify a default value for a missing URI Variable, the [PathVariable]({api}/io/micronaut/http/annotation/PathVariable.html) annotation can be used. The following example illustrates these options:

snippet::io.micronaut.docs.server.routes.IssuesController[tags="imports,startclass,normal,endclass", title="URI Variables Example"]

<1> The `@Controller` annotation is specified with a base URI of `/issues`
<2> The [Get]({api}/io/micronaut/http/annotation/Get.html) annotation maps the method to an HTTP [GET]({api}/io/micronaut/http/HttpMethod.html#GET) with a URI variable embedded in the URI named `number`
<3> The method argument `number` is bound automatically to the path variable `{number}` because the names match
<4> The value of the URI variable is referenced in the implementation
<5> The method argument requires the [PathVariable]({api}/io/micronaut/http/annotation/PathVariable.html) annotation when method argument and path variable names don't match

The Micronaut framework maps the URI `/issues/{number}` for the above controller. We can assert this is the case by writing unit tests:

snippet::io.micronaut.docs.server.routes.IssuesControllerTest[tags="imports,startclass,normal,endclass", title="Testing URI Variables"]

<1> The embedded server and HTTP client are started
<2> The server and client are cleaned up after the tests finish
<3> The tests send a request to the URI `/issues/12`
<4> And then asserts the response is "Issue # 12"
<5> Another test using the end point defined with `@PathVariable` asserts the response is "Issue # 13"
<6> Another test asserts a 400 response is returned when an invalid number is sent in the URL
<7> Another test asserts a 404 response is returned when no number is provided in the URL. The variable being present is required for the route to be executed.

Note that the URI template in the previous example requires that the `number` variable is specified. You can specify optional URI templates with the syntax: `/issues{/number}` and by annotating the `number` parameter with `@Nullable`. Alternatively, you can use the `defaultValue` element of the [PathVariable]({api}/io/micronaut/http/annotation/PathVariable.html) annotation to specify a default value when the URI variable is missing. For example:

snippet::io.micronaut.docs.server.routes.IssuesController[tags="defaultvalue", indent=0 title="Default Value Example"]

<1> The forward slash inside the braces designates `number` as an optional URI variable
<2> The `defaultValue` attribute specifies the default value for `number` when the URI variable is missing

snippet::io.micronaut.docs.server.routes.IssuesControllerTest[tags="defaultvalue", indent=0 title="Testing Default Value"]

<1> This test illustrates the substitution of a default `PathVariable' value when the URI variable is missing
<2> And another test to illustrate when the optional URI variable is provided

The following table provides examples of URI templates and what they match:

.URI Template Matching
|===
|Template |Description|Matching URI

|`/books/{id}`
| Simple match
| `/books/1`

|`/books/{id:2}`
| A variable of two characters max
| `/books/10`

|`/books{/id}`
| An optional URI variable
| `/books/10` or `/books`

| `/book{/id:[a-zA-Z]+}`
| An optional URI variable with regex
| `/books/foo`

| `/books{?max,offset}`
| Optional query parameters
| `/books?max=10&offset=10`

| `/books{/path:.*}{.ext}`
| Regex path match with extension
| `/books/foo/bar.xml`

|===

## URI Reserved Character Matching

By default, URI variables as defined by the https://tools.ietf.org/html/rfc6570[RFC-6570 URI template] spec cannot include reserved characters such as `/`, `?` etc.

This can be problematic if you wish to match or expand entire paths. As per https://tools.ietf.org/html/rfc6570#section-3.2.3[section 3.2.3 of the specification], you can use reserved expansion or matching using the `+` operator.

For example the URI `/books/{\+path}` matches both `/books/foo` and `/books/foo/bar` since the `+` indicates that the variable `path` should include reserved characters (in this case `/`).

## Routing Annotations

The previous example uses the [@Get]({api}/io/micronaut/http/annotation/Get.html) annotation to add a method that accepts HTTP [GET]({api}/io/micronaut/http/HttpMethod.html#GET) requests. The following table summarizes the available annotations and how they map to HTTP methods:

.HTTP Routing Annotations
|===
|Annotation |HTTP Method

|[@Delete]({api}/io/micronaut/http/annotation/Delete.html)
|[DELETE]({api}/io/micronaut/http/HttpMethod.html#DELETE)

|[@Get]({api}/io/micronaut/http/annotation/Get.html)
|[GET]({api}/io/micronaut/http/HttpMethod.html#GET)

|[@Head]({api}/io/micronaut/http/annotation/Head.html)
|[HEAD]({api}/io/micronaut/http/HttpMethod.html#HEAD)

|[@Options]({api}/io/micronaut/http/annotation/Options.html)
|[OPTIONS]({api}/io/micronaut/http/HttpMethod.html#OPTIONS)

|[@Patch]({api}/io/micronaut/http/annotation/Patch.html)
|[PATCH]({api}/io/micronaut/http/HttpMethod.html#PATCH)

|[@Put]({api}/io/micronaut/http/annotation/Put.html)
|[PUT]({api}/io/micronaut/http/HttpMethod.html#PUT)

|[@Post]({api}/io/micronaut/http/annotation/Post.html)
|[POST]({api}/io/micronaut/http/HttpMethod.html#POST)

|[@Trace]({api}/io/micronaut/http/annotation/Trace.html)
|[TRACE]({api}/io/micronaut/http/HttpMethod.html#TRACE)

|===

NOTE: All the method annotations default to `/`.

## Route Conditions

The api:http.annotation.RouteCondition[] annotation allows you to define a condition that must evaluate to `true` for a route to match a request. The condition is specified as a Micronaut Expression Language (EL) expression and is evaluated at request time.

Within the expression, a `request` variable is available that references the current api:http.HttpRequest[].

This is useful for routing requests based on query parameters, headers, or any other aspect of the request. For example, you can use `@RouteCondition` to route requests to different methods depending on the value of a query parameter:

snippet::io.micronaut.docs.server.routing.RouteConditionController[tags="imports,class", indent=0, title="Route Condition Example"]

<1> The route condition expression evaluates whether the `v` query parameter equals `2`. If it does, the request is routed to `helloV2()`. If not, the route is not matched and the request falls through to `helloV1()`.

NOTE: The api:http.annotation.RouteCondition[] annotation only applies to server-side routes and is ignored when placed on declarative HTTP client routes.

TIP: The `request` variable in the expression is an instance of api:http.HttpRequest[]. You can access headers via `request.headers`, query parameters via `request.parameters`, and other request attributes as needed.

## @Options

<<cors, CORS>> support handles OPTIONS preflight requests. However, if you want to dispatch OPTIONS requests without an Origin HTTP Header, you can enable it via:

[configuration]
```
micronaut:
  server:
    dispatch-options-requests: true
```


## Multiple URIs

Each of the routing annotations supports multiple URI templates. For each template, a route is created. This feature is useful for example to change the path of the API and leave the existing path as is for backwards compatibility. For example:

snippet::io.micronaut.docs.server.routing.BackwardCompatibleController[tags="imports,class", indent=0, title="Multiple URIs"]

<1> Specify multiple templates
<2> Bind to the template arguments as normal

NOTE: Route validation is more complicated with multiple templates. If a variable that would normally be required does not exist in all templates, that variable is considered optional since it may not exist for every execution of the method.

## Building Routes Programmatically

If you prefer to not use annotations and instead declare all routes in code then never fear, the Micronaut framework has a flexible [RouteBuilder]({api}/io/micronaut/web/router/RouteBuilder.html) API that makes it a breeze to define routes programmatically.

To start, subclass [DefaultRouteBuilder]({api}/io/micronaut/web/router/DefaultRouteBuilder.html) and inject the controller to route to into the method, and define your routes:

snippet::io.micronaut.docs.server.routes.MyRoutes[tags="imports,class", indent=0, title="URI Variables Example"]

<1> Route definitions should subclass [DefaultRouteBuilder]({api}/io/micronaut/web/router/DefaultRouteBuilder.html)
<2> Use `@Inject` to inject a method with the controller to route to
<3> Use methods such as [`RouteBuilder::GET(String,Class,String,Class...)`]({api}/io/micronaut/web/router/RouteBuilder.html) to route to controller methods. Note that even though the issues controller is used, the route has no knowledge of its `@Controller` annotation and thus the full path must be specified.

TIP: Unfortunately due to type erasure, a Java method lambda reference cannot be used with the API. For Groovy there is a `GroovyRouteBuilder` class which can be subclassed that allows passing Groovy method references.

## Route Compile-Time Validation

The Micronaut framework supports validating route arguments at compile time with the validation library. To get started, add the `micronaut-http-validation` dependency to your build:

dependency:io.micronaut:micronaut-http-validation[scope='annotationProcessor']

With the correct dependency on your classpath, route arguments will automatically be checked at compile time. Compilation will fail if any of the following conditions are met:

* {blank}
 The URI template contains a variable that is optional, but the method parameter is not annotated with `@Nullable` or is an `java.util.Optional`.

An optional variable is one that allows the route to match a URI even if the value is not present. For example `/foo{/bar}` matches requests to `/foo` and `/foo/abc`. The non-optional variant would be `/foo/{bar}`. See the <<_uri_path_variables, URI Path Variables>> section for more information.

* {blank}
 The URI template contains a variable that is missing from the method arguments.

NOTE: To disable route compile-time validation, set the system property `-Dmicronaut.route.validation=false`. For Java and Kotlin users using Gradle, the same effect can be achieved by removing the `micronaut-http-validation` dependency from the `annotationProcessor`/`kapt` scope.

## Routing non-standard HTTP methods

The `@CustomHttpMethod` annotation supports non-standard HTTP methods for a client or server. Specifications like https://tools.ietf.org/html/rfc4918[RFC-4918 Webdav] require additional methods like REPORT or LOCK for example.

.RoutingExample
```java
@CustomHttpMethod(method = "LOCK", value = "/{name}")
String lock(String name)
```

The annotation can be used anywhere the standard method annotations can be used, including controllers and declarative HTTP clients.

## RouteMatch

The api:web.router.RouteMatch[] API provides information about an executable api:web.router.Route[].

Given a request you can retrieve a RouteMatch with:

snippet::io.micronaut.docs.web.router.routematch.RouteMatchTest[tags="routematch", indent=0]
