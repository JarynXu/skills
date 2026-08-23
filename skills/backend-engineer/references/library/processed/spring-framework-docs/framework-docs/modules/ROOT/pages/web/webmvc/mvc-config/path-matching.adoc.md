> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-config/path-matching.adoc`  
> Upstream Git blob: `a0f33fee3ec1f385ecd21a4edc104ba05230fa03`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-config-path-matching]]
# Path Matching

[.small]#[See equivalent in the Reactive stack](web/webflux/config.adoc#webflux-config-path-matching)#

You can customize options related to path matching and treatment of the URL.
For details on the individual options, see the
{spring-framework-api}/web/servlet/config/annotation/PathMatchConfigurer.html[`PathMatchConfigurer`] javadoc.

The following example shows how to customize path matching:

include-code::./WebConfiguration[tag=snippet,indent=0]
