> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-controller/ann.adoc`  
> Upstream Git blob: `d95c9b0fd62bef21f756102a574c532999b86b2a`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-ann-controller]]
# Declaration

[.small]#[See equivalent in the Reactive stack](web/webflux/controller/ann.adoc)#

You can define controller beans by using a standard Spring bean definition in the
Servlet's `WebApplicationContext`. The `@Controller` stereotype allows for auto-detection,
aligned with Spring general support for detecting `@Component` classes in the classpath
and auto-registering bean definitions for them. It also acts as a stereotype for the
annotated class, indicating its role as a web component.

To enable auto-detection of such `@Controller` beans, you can add component scanning to
your Java configuration, as the following example shows:

include-code::./WebConfiguration[tag=snippet,indent=0]

`@RestController` is a [composed annotation](core/beans/classpath-scanning.adoc#beans-meta-annotations) that is
itself meta-annotated with `@Controller` and `@ResponseBody` to indicate a controller whose
every method inherits the type-level `@ResponseBody` annotation and, therefore, writes
directly to the response body versus view resolution and rendering with an HTML template.


[[mvc-ann-requestmapping-proxying]]
## AOP Proxies
[.small]#[See equivalent in the Reactive stack](web/webflux/controller/ann.adoc#webflux-ann-requestmapping-proxying)#

In some cases, you may need to decorate a controller with an AOP proxy at runtime.
One example is if you choose to have `@Transactional` annotations directly on the
controller. When this is the case, for controllers specifically, we recommend
using class-based proxying. This is automatically the case with such annotations
directly on the controller.

If the controller implements an interface, and needs AOP proxying, you may need to
explicitly configure class-based proxying. For example, with `@EnableTransactionManagement`
you can change to `@EnableTransactionManagement(proxyTargetClass = true)`, and with
`<tx:annotation-driven/>` you can change to `<tx:annotation-driven proxy-target-class="true"/>`.

NOTE: Keep in mind that as of 6.0, with interface proxying, Spring MVC no longer detects
controllers based solely on a type-level `@RequestMapping` annotation on the interface.
Please, enable class based proxying, or otherwise the interface must also have an
`@Controller` annotation.
