> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/annotations/integration-spring/annotation-beforetransaction.adoc`  
> Upstream Git blob: `b1cf61f886f6e2da76d998fb35b20a341f9628f2`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[spring-testing-annotation-beforetransaction]]
# `@BeforeTransaction`

`@BeforeTransaction` indicates that the annotated `void` method should be run before a
transaction is started, for test methods that have been configured to run within a
transaction by using Spring's `@Transactional` annotation. `@BeforeTransaction` methods
are not required to be `public` and may be declared on interface default methods.

The following example shows how to use the `@BeforeTransaction` annotation:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@BeforeTransaction // <1>
	void beforeTransaction() {
		// logic to be run before a transaction is started
	}
```
<1> Run this method before a transaction.

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@BeforeTransaction // <1>
	fun beforeTransaction() {
		// logic to be run before a transaction is started
	}
```
<1> Run this method before a transaction.
======
