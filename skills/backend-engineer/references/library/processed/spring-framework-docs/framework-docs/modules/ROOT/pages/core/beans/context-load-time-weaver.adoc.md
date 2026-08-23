> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/beans/context-load-time-weaver.adoc`  
> Upstream Git blob: `ea25df7e9ea0ff8d59e8eb4f2877d2f17934cf3a`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[context-load-time-weaver]]
# Registering a `LoadTimeWeaver`

The `LoadTimeWeaver` is used by Spring to dynamically transform classes as they are
loaded into the Java virtual machine (JVM).

To enable load-time weaving, you can add the `@EnableLoadTimeWeaving` to one of your
`@Configuration` classes, as the following example shows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@Configuration
	@EnableLoadTimeWeaving
	public class AppConfig {
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@Configuration
	@EnableLoadTimeWeaving
	class AppConfig
```
======

Alternatively, for XML configuration, you can use the `context:load-time-weaver` element:

```xml,indent=0,subs="verbatim,quotes"
	<beans>
		<context:load-time-weaver/>
	</beans>
```

Once configured for the `ApplicationContext`, any bean within that `ApplicationContext`
may implement `LoadTimeWeaverAware`, thereby receiving a reference to the load-time
weaver instance. This is particularly useful in combination with
[Spring's JPA support](data-access/orm/jpa.adoc) where load-time weaving may be
necessary for JPA class transformation.
Consult the
{spring-framework-api}/orm/jpa/LocalContainerEntityManagerFactoryBean.html[`LocalContainerEntityManagerFactoryBean`]
javadoc for more detail. For more on AspectJ load-time weaving, see
[Load-time Weaving with AspectJ in the Spring Framework](core/aop/using-aspectj.adoc#aop-aj-ltw).
