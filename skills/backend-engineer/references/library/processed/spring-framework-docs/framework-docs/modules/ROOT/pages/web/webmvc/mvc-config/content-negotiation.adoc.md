> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-config/content-negotiation.adoc`  
> Upstream Git blob: `9f5b2f8212dade38041fb501242353b0c4522efe`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-config-content-negotiation]]
# Content Types

[.small]#[See equivalent in the Reactive stack](web/webflux/config.adoc#webflux-config-content-negotiation)#

You can configure how Spring MVC determines the requested media types from the request
(for example, `Accept` header, URL path extension, query parameter, and others).

By default, only the `Accept` header is checked.

If you must use URL-based content type resolution, consider using the query parameter
strategy over path extensions. See
[Suffix Match and RFD](web/webmvc/mvc-controller/ann-requestmapping.adoc#mvc-ann-requestmapping-rfd) for
more details.

You can customize requested content type resolution, as the following example shows:

include-code::./WebConfiguration[tag=snippet,indent=0]
