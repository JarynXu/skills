> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/expressions/language-ref/array-construction.adoc`  
> Upstream Git blob: `aad70436210d9e66f7bb29af2eb5dbf309183300`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[expressions-array-construction]]
# Array Construction

You can build arrays by using the familiar Java syntax, optionally supplying an initializer
to have the array populated at construction time. The following example shows how to do so:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	int[] numbers1 = (int[]) parser.parseExpression("new int[4]").getValue(context);

	// Array with initializer
	int[] numbers2 = (int[]) parser.parseExpression("new int[] {1, 2, 3}").getValue(context);

	// Multi dimensional array
	int[][] numbers3 = (int[][]) parser.parseExpression("new int[4][5]").getValue(context);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	val numbers1 = parser.parseExpression("new int[4]").getValue(context) as IntArray

	// Array with initializer
	val numbers2 = parser.parseExpression("new int[] {1, 2, 3}").getValue(context) as IntArray

	// Multi dimensional array
	val numbers3 = parser.parseExpression("new int[4][5]").getValue(context) as Array<IntArray>
```
======

[NOTE]
====
You cannot currently supply an initializer when you construct a multi-dimensional array.
====

[CAUTION]
====
Any expression that constructs an array – for example, via `new int[4]` or
`new int[] {1, 2, 3}` – cannot be compiled. See
[Compiler Limitations](core/expressions/evaluation.adoc#expressions-compiler-limitations)
for details.
====
