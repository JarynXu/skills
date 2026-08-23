> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/aop/introduction-proxies.adoc`  
> Upstream Git blob: `59eedb42b16b7a3f88a7f97b468438a15b402b65`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[aop-introduction-proxies]]
# AOP Proxies

Spring AOP defaults to using standard JDK dynamic proxies for AOP proxies. This
enables any interface (or set of interfaces) to be proxied.

Spring AOP can also use CGLIB proxies. This is necessary to proxy classes rather than
interfaces. By default, CGLIB is used if a business object does not implement an
interface. As it is good practice to program to interfaces rather than classes, business
classes normally implement one or more business interfaces. It is possible to
[force the use of CGLIB](core/aop/proxying.adoc), in those (hopefully rare) cases where you
need to advise a method that is not declared on an interface or where you need to
pass a proxied object to a method as a concrete type.

It is important to grasp the fact that Spring AOP is proxy-based. See
[Understanding AOP Proxies](core/aop/proxying.adoc#aop-understanding-aop-proxies)
for a thorough examination of exactly what this implementation detail actually means.
