> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/annotations/integration-spring/annotation-recordapplicationevents.adoc`  
> Upstream Git blob: `5a37f56de508809cb908e26766bb3c56e9075df8`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[spring-testing-annotation-recordapplicationevents]]
# `@RecordApplicationEvents`

`@RecordApplicationEvents` is an annotation that can be applied to a test class to
instruct the _Spring TestContext Framework_ to record all application events that are
published in the `ApplicationContext` during the execution of a single test.

The recorded events can be accessed via the `ApplicationEvents` API within tests.

See [Application Events](testing/testcontext-framework/application-events.adoc) and the
{spring-framework-api}/test/context/event/RecordApplicationEvents.html[`@RecordApplicationEvents`
javadoc] for an example and further details.
