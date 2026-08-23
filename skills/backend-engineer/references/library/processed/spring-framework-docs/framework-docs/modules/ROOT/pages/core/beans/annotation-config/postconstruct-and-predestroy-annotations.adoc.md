> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/beans/annotation-config/postconstruct-and-predestroy-annotations.adoc`  
> Upstream Git blob: `75cad92f2082d06658e32917e2f63258c69d7153`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[beans-postconstruct-and-predestroy-annotations]]
# Using `@PostConstruct` and `@PreDestroy`

The `CommonAnnotationBeanPostProcessor` not only recognizes the `@Resource` annotation
but also the JSR-250 lifecycle annotations: `jakarta.annotation.PostConstruct` and
`jakarta.annotation.PreDestroy`. Introduced in Spring 2.5, the support for these
annotations offers an alternative to the lifecycle callback mechanism described in
[initialization callbacks](core/beans/factory-nature.adoc#beans-factory-lifecycle-initializingbean) and
[destruction callbacks](core/beans/factory-nature.adoc#beans-factory-lifecycle-disposablebean). Provided that the
`CommonAnnotationBeanPostProcessor` is registered within the Spring `ApplicationContext`,
a method carrying one of these annotations is invoked at the same point in the lifecycle
as the corresponding Spring lifecycle interface method or explicitly declared callback
method. In the following example, the cache is pre-populated upon initialization and
cleared upon destruction:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	public class CachingMovieLister {

		@PostConstruct
		public void populateMovieCache() {
			// populates the movie cache upon initialization...
		}

		@PreDestroy
		public void clearMovieCache() {
			// clears the movie cache upon destruction...
		}
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	class CachingMovieLister {

		@PostConstruct
		fun populateMovieCache() {
			// populates the movie cache upon initialization...
		}

		@PreDestroy
		fun clearMovieCache() {
			// clears the movie cache upon destruction...
		}
	}
```
======

For details about the effects of combining various lifecycle mechanisms, see
[Combining Lifecycle Mechanisms](core/beans/factory-nature.adoc#beans-factory-lifecycle-combined-effects).

[NOTE]
====
Like `@Resource`, the `@PostConstruct` and `@PreDestroy` annotation types were a part
of the standard Java libraries from JDK 6 to 8. However, the entire `javax.annotation`
package got separated from the core Java modules in JDK 9 and eventually removed in
JDK 11. As of Jakarta EE 9, the package lives in `jakarta.annotation` now. If needed,
the `jakarta.annotation-api` artifact needs to be obtained via Maven Central now,
simply to be added to the application's classpath like any other library.
====
