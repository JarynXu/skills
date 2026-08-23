> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/contextPropagation/httpFilterContextPropagation.adoc`  
> Upstream Git blob: `7018b12f8d813911056f71ddc4dd7e591e4f251a`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

Modifying the propagated context is a common scenario. Usually, you want to extend the context to include the request-related values.

To use a non-reactive HTTP filter API, you need to add a method parameter api:core.propagation.MutablePropagatedContext[] and modify the propagated context elements by adding or removing the existing ones:

.Example of adding a new MDC propagated context element
```java
include::{testsuitejava}/propagation/MdcFilter.java[tags="class", indent=0]
```

The next filter in the chain will have the new propagated context available. Any of the thread-local context elements will be set for the next filter or the controller method invocation.

To use the legacy reactive HTTP filters, simply modify and propagate the context bound to the following chain invocation:

.Example of adding a new MDC propagated context element for the reactive filter:
```java
include::{testsuitejava}/propagation/MdcLegacyFilter.java[tags="class", indent=0]
```
