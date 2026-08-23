> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc-view/mvc-xml-marshalling.adoc`  
> Upstream Git blob: `db74ad83e4b3a50a2ee4de1929919ef9c58023ab`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-view-xml-marshalling]]
# XML Marshalling

The `MarshallingView` uses an XML `Marshaller` (defined in the `org.springframework.oxm`
package) to render the response content as XML. You can explicitly set the object to be
marshalled by using a `MarshallingView` instance's `modelKey` bean property. Alternatively,
the view iterates over all model properties and marshals the first type that is supported
by the `Marshaller`. For more information on the functionality in the
`org.springframework.oxm` package, see [Marshalling XML using O/X Mappers](data-access/oxm.adoc).
