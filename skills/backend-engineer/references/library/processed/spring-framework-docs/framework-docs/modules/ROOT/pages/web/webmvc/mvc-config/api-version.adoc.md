> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-config/api-version.adoc`  
> Upstream Git blob: `0f221f33a8eebceef43b00d1b5a52f4e0e09f64c`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-config-api-version]]
# API Version

[.small]#[See equivalent in the Reactive stack](web/webflux/config.adoc#webflux-config-api-version)#

To enable API versioning, use the `ApiVersionConfigurer` callback of `WebMvcConfigurer`:

include-code::./WebConfiguration[tag=snippet,indent=0]

You can resolve the version through one of the built-in options listed below, or
alternatively use a custom `ApiVersionResolver`:

- Request header
- Request parameter
- Path segment
- Media type parameter

To resolve from a path segment, you need to specify the index of the path segment expected
to contain the version. The path segment must be declared as a URI variable, e.g.
"/\{version}", "/api/\{version}", etc. where the actual name is not important.
As the version is typically at the start of the path, consider configuring it externally
as a common path prefix for all handlers through the
[Path Matching](web/webmvc/mvc-config/path-matching.adoc) options.

By default, the version is parsed with `SemanticVersionParser`, but you can also configure
a custom [ApiVersionParser](web/webmvc-versioning.adoc#mvc-versioning-parser).

Supported versions are transparently detected from versions declared in request mappings
for convenience, but you can turn that off through a flag in the MVC config, and
consider only the versions configured explicitly in the config as supported.
Requests with a version that is not supported are rejected with
`InvalidApiVersionException` resulting in a 400 response.

You can set an `ApiVersionDeprecationHandler` to send information about deprecated
versions to clients. The built-in standard handler can set "Deprecation", "Sunset", and
"Link" headers based on https://datatracker.ietf.org/doc/html/rfc9745[RFC 9745] and
https://datatracker.ietf.org/doc/html/rfc8594[RFC 8594].

Once API versioning is configured, you can begin to map requests to
[controller methods](web/webmvc/mvc-controller/ann-requestmapping.adoc#mvc-ann-requestmapping-version)
according to the request version.
