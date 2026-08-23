> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/expressions/language-ref/inline-lists.adoc`  
> Upstream Git blob: `5bcea13768faf8edc9cbb4463503e599f7c253f7`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[expressions-inline-lists]]
# Inline Lists

You can directly express lists in an expression by using `{}` notation.

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	// evaluates to a Java list containing the four numbers
	List numbers = (List) parser.parseExpression("{1,2,3,4}").getValue(context);

	List listOfLists = (List) parser.parseExpression("{{'a','b'},{'x','y'}}").getValue(context);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	// evaluates to a Java list containing the four numbers
	val numbers = parser.parseExpression("{1,2,3,4}").getValue(context) as List<*>

	val listOfLists = parser.parseExpression("{{'a','b'},{'x','y'}}").getValue(context) as List<*>
```
======

`{}` by itself means an empty list. For performance reasons, if the list is itself
entirely composed of fixed literals, a constant list is created to represent the
expression (rather than building a new list on each evaluation).
