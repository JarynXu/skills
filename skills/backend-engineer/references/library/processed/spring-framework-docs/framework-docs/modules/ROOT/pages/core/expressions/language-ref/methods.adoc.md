> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/expressions/language-ref/methods.adoc`  
> Upstream Git blob: `6e6f26e1737b8295aae6c453949ecc83c1963039`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[expressions-methods]]
# Methods

You can invoke methods by using the typical Java programming syntax. You can also invoke
methods directly on literals such as strings or numbers.
[Varargs](core/expressions/language-ref/varargs.adoc) are supported as well.

The following examples show how to invoke methods.

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	// string literal, evaluates to "bc"
	String bc = parser.parseExpression("'abc'.substring(1, 3)").getValue(String.class);

	// evaluates to true
	boolean isMember = parser.parseExpression("isMember('Mihajlo Pupin')").getValue(
			societyContext, Boolean.class);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	// string literal, evaluates to "bc"
	val bc = parser.parseExpression("'abc'.substring(1, 3)").getValue(String::class.java)

	// evaluates to true
	val isMember = parser.parseExpression("isMember('Mihajlo Pupin')").getValue(
			societyContext, Boolean::class.java)
```
======
