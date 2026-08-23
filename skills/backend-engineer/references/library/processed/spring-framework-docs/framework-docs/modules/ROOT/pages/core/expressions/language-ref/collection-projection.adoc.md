> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/expressions/language-ref/collection-projection.adoc`  
> Upstream Git blob: `2f4ad28fa10f5598a9eb7e80b199a4db3a1be5f4`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[expressions-collection-projection]]
# Collection Projection

Projection lets a collection drive the evaluation of a sub-expression, and the result is
a new collection. The syntax for projection is `.![projectionExpression]`. For example,
suppose we have a list of inventors but want the list of cities where they were born.
Effectively, we want to evaluate `placeOfBirth.city` for every entry in the inventor
list. The following example uses projection to do so:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	// evaluates to ["Smiljan", "Idvor"]
	List placesOfBirth = parser.parseExpression("members.![placeOfBirth.city]")
			.getValue(societyContext, List.class);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	// evaluates to ["Smiljan", "Idvor"]
	val placesOfBirth = parser.parseExpression("members.![placeOfBirth.city]")
	 		.getValue(societyContext) as List<*>
```
======

Projection is supported for arrays and anything that implements `java.lang.Iterable` or
`java.util.Map`. When using a map to drive projection, the projection expression is
evaluated against each entry in the map (represented as a Java `Map.Entry`). The result
of a projection across a map is a list that consists of the evaluation of the projection
expression against each map entry.

[NOTE]
====
The Spring Expression Language also supports safe navigation for collection projection.

See
[Safe Collection Selection and Projection](core/expressions/language-ref/operator-safe-navigation.adoc#expressions-operator-safe-navigation-selection-and-projection)
for details.
====
