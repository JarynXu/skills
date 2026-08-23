> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/jsonBinding/serializationUsingJacksonDatabind.adoc`  
> Upstream Git blob: `ee9ee6cad9a2f2c107662a9b7abdc4238cca7e1b`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

To serialize using https://github.com/FasterXML/jackson[Jackson] Databind include the following dependency:

dependency:micronaut-jackson-databind[]

### Kotlin Data Classes Jackson Databind Serialization

WARNING: If you use Kotlin https://kotlinlang.org/docs/data-classes.html[Data Classes] and Jackson Databind. Your data classes will be accessed via reflection for serialization. When you use https://www.graalvm.org/latest/reference-manual/native-image/[native image], you need to annotate those data classes with ann:core.annotation.ReflectiveAccess[]. Learn more about <<graal, Micronaut GraalVM>> integration.

```kotlin
include::test-suite-kotlin-graalvm/src/test/kotlin/example/micronaut/jacksondatabind/Greeting.kt[tags=clazz,indent=0]
```
