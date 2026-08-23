> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/beans/annotation-config/custom-autowire-configurer.adoc`  
> Upstream Git blob: `1a2e5410bb48e06221ab06fadaf5fd70b2f873fb`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[beans-custom-autowire-configurer]]
# Using `CustomAutowireConfigurer`

{spring-framework-api}/beans/factory/annotation/CustomAutowireConfigurer.html[`CustomAutowireConfigurer`]
is a `BeanFactoryPostProcessor` that lets you register your own custom qualifier
annotation types, even if they are not annotated with Spring's `@Qualifier` annotation.
The following example shows how to use `CustomAutowireConfigurer`:

```xml,indent=0,subs="verbatim,quotes"
	<bean id="customAutowireConfigurer"
			class="org.springframework.beans.factory.annotation.CustomAutowireConfigurer">
		<property name="customQualifierTypes">
			<set>
				<value>example.CustomQualifier</value>
			</set>
		</property>
	</bean>
```

The `AutowireCandidateResolver` determines autowire candidates by:

* The `autowire-candidate` value of each bean definition
* Any `default-autowire-candidates` patterns available on the `<beans/>` element
* The presence of `@Qualifier` annotations and any custom annotations registered
with the `CustomAutowireConfigurer`

When multiple beans qualify as autowire candidates, the determination of a "`primary`" is
as follows: If exactly one bean definition among the candidates has a `primary`
attribute set to `true`, it is selected. For annotation-based configuration, see
[Fine-tuning with `@Primary` or `@Fallback`](core/beans/annotation-config/autowired-primary.adoc).
