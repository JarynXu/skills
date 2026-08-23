> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/localeResolution.adoc`  
> Upstream Git blob: `8e5c2a7bfa8051833a359c4a1ab9302fe6126279`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

The Micronaut framework supports several strategies for resolving locales for a given request. The api:http.HttpRequest#getLocale--[] method is available on the request, however it only supports parsing the `Accept-Language` header. For other use cases where the locale can be in a cookie, the user's session, or should be set to a fixed value, api:http.server.util.locale.HttpLocaleResolver[] can be used to determine the current locale.

The api:core.util.LocaleResolver[] API does not need to be used directly. Simply define a parameter to a controller method of type `java.util.Locale` and the locale will be resolved and injected automatically.

There are several configuration options to control how to resolve the locale:

include::{includedir}configurationProperties/io.micronaut.http.server.HttpServerConfiguration$HttpLocaleResolutionConfigurationProperties.adoc[]

Locales can be configured in the "en_GB" format, or in the BCP 47 (Language tag) format. If multiple methods are configured, the fixed locale takes precedence, followed by session/cookie, then header.

If any of the built-in methods do not meet your use case, create a bean of type api:http.server.util.locale.HttpLocaleResolver[] and set its order (through the `getOrder` method) relative to the existing resolvers.
