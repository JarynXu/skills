> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-config/view-resolvers.adoc`  
> Upstream Git blob: `5a0de6171d3fdb87660eb01594cc3264d942969e`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-config-view-resolvers]]
# View Resolvers

[.small]#[See equivalent in the Reactive stack](web/webflux/config.adoc#webflux-config-view-resolvers)#

The MVC configuration simplifies the registration of view resolvers.

The following example configures content negotiation view resolution by using JSP and Jackson as a
default `View` for JSON rendering:

include-code::./WebConfiguration[tag=snippet,indent=0]

Note, however, that FreeMarker, Groovy Markup, and script templates also require
configuration of the underlying view technology. The following example works with FreeMarker:

include-code::./FreeMarkerConfiguration[tag=snippet,indent=0]
