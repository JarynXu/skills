> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/filters/filtermethods/order.adoc`  
> Upstream Git blob: `0721bc3cf34683ad8a27b9402e31581d6f18f6f9`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

Filters can be ordered by annotating the filter method or filter class with api:order.Order[] or [jakarta.annotation.Priority]({jakartaapi}/jakarta/annotation/Priority.html), or by implementing api:order.Ordered[] in the filter class.

. An api:order.Order[] or [@Priority]({jakartaapi}/jakarta/annotation/Priority.html) annotation on the filter method
. An api:order.Order[] or [@Priority]({jakartaapi}/jakarta/annotation/Priority.html) annotation on the filter class
. Implementing api:order.Ordered[] in the filter class

Request filters are executed in order from the highest precedence (the smallest integer value, as defined by `Ordered.HIGHEST_PRECEDENCE`) to the lowest precedence (the biggest integer value, as defined by `Ordered.LOWEST_PRECEDENCE`). Response filters are executed in reverse order.

Micronaut applies the same numeric precedence rule to [jakarta.annotation.Priority]({jakartaapi}/jakarta/annotation/Priority.html) because [@Priority]({jakartaapi}/jakarta/annotation/Priority.html) is mapped to ann:core.annotation.Order[] during annotation processing.

image::filter-order.svg[]

Request filter A is executed first, because it has the higher precedence (-100), followed by request filter B with the lower precedence (100). Then the controller is executed. Response filter C is executed first, because it has the lower precedence (100), and finally response filter D with the higher precedence (-100) is executed last.
