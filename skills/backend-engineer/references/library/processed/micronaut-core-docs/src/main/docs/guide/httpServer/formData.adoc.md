> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/formData.adoc`  
> Upstream Git blob: `ded2b7467976a89ae344ee97d92e00d3b4da96d4`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

To make data binding model customizations consistent between form data and JSON, the Micronaut framework uses Jackson to implement binding data from form submissions.

The advantage of this approach is that the same Jackson annotations used for customizing JSON binding can be used for form submissions.

IMPORTANT: Form URL encoded content type and Jackson annotations are not supported by the <<httpClient, Micronaut HTTP Client>>.

In practice this means that to bind regular form data, the only change required to the <<bindingUsingPOJOs, previous JSON binding code>> is updating the api:http.MediaType[] consumed:

snippet::io.micronaut.docs.server.form.PersonController[tags="class,formbinding,endclass", title="Binding Form Data to POJOs"]

TIP: To avoid denial-of-service attacks, collection types and arrays created during binding are limited by the setting `jackson.arraySizeThreshold` in your configuration file (e.g `application.yml`)

Alternatively, instead of using a POJO you can bind form data directly to method parameters (which works with JSON too!):

snippet::io.micronaut.docs.server.form.PersonController[tags="class,formsaveWithArgs,endclass", title="Binding Form Data to Parameters"]

As you can see from the example above, this approach lets you use features such as support for `@Nullable` or [Optional]({jdkapi}/java.base/java/util/Optional.html) types and restrict the parameters to be bound. When using POJOs you must be careful to use Jackson annotations to exclude properties that should not be bound.
