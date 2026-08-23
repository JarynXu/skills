> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc/mvc-servlet/logging.adoc`  
> Upstream Git blob: `1c3523c5f958897e92055283ac4b4f8a82aedf95`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-logging]]
# Logging

[.small]#[See equivalent in the Reactive stack](web/webflux/reactive-spring.adoc#webflux-logging)#

DEBUG-level logging in Spring MVC is designed to be compact, minimal, and
human-friendly. It focuses on high-value bits of information that are useful over and
over again versus others that are useful only when debugging a specific issue.

TRACE-level logging generally follows the same principles as DEBUG (and, for example, also
should not be a fire hose) but can be used for debugging any issue. In addition, some log
messages may show a different level of detail at TRACE versus DEBUG.

Good logging comes from the experience of using the logs. If you spot anything that does
not meet the stated goals, please let us know.


[[mvc-logging-sensitive-data]]
## Sensitive Data
[.small]#[See equivalent in the Reactive stack](web/webflux/reactive-spring.adoc#webflux-logging-sensitive-data)#

DEBUG and TRACE logging may log sensitive information. This is why request parameters and
headers are masked by default and their logging in full must be enabled explicitly
through the `enableLoggingRequestDetails` property on `DispatcherServlet`.

The following example shows how to do so by using Java configuration:

include-code::./MyInitializer[tag=snippet,indent=0]
