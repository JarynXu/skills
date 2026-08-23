> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/annotations/integration-spring/annotation-aftertransaction.adoc`  
> Upstream Git blob: `def7d93b425d71a377a665eff06a597bd4436fed`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[spring-testing-annotation-aftertransaction]]
# `@AfterTransaction`

`@AfterTransaction` indicates that the annotated `void` method should be run after a
transaction is ended, for test methods that have been configured to run within a
transaction by using Spring's `@Transactional` annotation. `@AfterTransaction` methods
are not required to be `public` and may be declared on interface default methods.

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@AfterTransaction // <1>
	void afterTransaction() {
		// logic to be run after a transaction has ended
	}
```
<1> Run this method after a transaction.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@AfterTransaction // <1>
	fun afterTransaction() {
		// logic to be run after a transaction has ended
	}
```
<1> Run this method after a transaction.
======
