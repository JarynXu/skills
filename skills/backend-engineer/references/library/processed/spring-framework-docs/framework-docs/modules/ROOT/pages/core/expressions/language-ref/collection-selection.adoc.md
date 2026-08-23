> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/expressions/language-ref/collection-selection.adoc`  
> Upstream Git blob: `5f66882d608ff8ae6654363c253dbea16f57d39b`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[expressions-collection-selection]]
# Collection Selection

Selection is a powerful expression language feature that lets you transform a
source collection into another collection by selecting from its entries.

Selection uses a syntax of `.?[selectionExpression]`. It filters the collection and
returns a new collection that contains a subset of the original elements. For example,
selection lets us easily get a list of Serbian inventors, as the following example shows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	List<Inventor> list = (List<Inventor>) parser.parseExpression(
			"members.?[nationality == 'Serbian']").getValue(societyContext);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	val list = parser.parseExpression(
			"members.?[nationality == 'Serbian']").getValue(societyContext) as List<Inventor>
```
======

Selection is supported for arrays and anything that implements `java.lang.Iterable` or
`java.util.Map`. For an array or `Iterable`, the selection expression is evaluated
against each individual element. Against a map, the selection expression is evaluated
against each map entry (objects of the Java type `Map.Entry`). Each map entry has its
`key` and `value` accessible as properties for use in the selection.

Given a `Map` stored in a variable named `#map`, the following expression returns a new
map that consists of those elements of the original map where the entry's value is less
than 27:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	Map newMap = parser.parseExpression("#map.?[value < 27]").getValue(Map.class);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	val newMap = parser.parseExpression("#map.?[value < 27]").getValue() as Map
```
======

In addition to returning all the selected elements, you can retrieve only the first or
the last element. To obtain the first element matching the selection expression, the
syntax is `.^[selectionExpression]`. To obtain the last element matching the selection
expression, the syntax is `.$[selectionExpression]`.

[NOTE]
====
The Spring Expression Language also supports safe navigation for collection selection.

See
[Safe Collection Selection and Projection](core/expressions/language-ref/operator-safe-navigation.adoc#expressions-operator-safe-navigation-selection-and-projection)
for details.
====
