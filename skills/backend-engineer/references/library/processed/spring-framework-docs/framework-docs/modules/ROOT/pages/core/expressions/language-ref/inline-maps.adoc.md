> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/expressions/language-ref/inline-maps.adoc`  
> Upstream Git blob: `122b3d651202e041a1f7f983c750f91274e81ce2`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[expressions-inline-maps]]
# Inline Maps

You can also directly express maps in an expression by using `{key:value}` notation. The
following example shows how to do so:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	// evaluates to a Java map containing the two entries
	Map inventorInfo = (Map) parser.parseExpression("{name:'Nikola',dob:'10-July-1856'}").getValue(context);

	Map mapOfMaps = (Map) parser.parseExpression("{name:{first:'Nikola',last:'Tesla'},dob:{day:10,month:'July',year:1856}}").getValue(context);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim"
	// evaluates to a Java map containing the two entries
	val inventorInfo = parser.parseExpression("{name:'Nikola',dob:'10-July-1856'}").getValue(context) as Map<*, *>

	val mapOfMaps = parser.parseExpression("{name:{first:'Nikola',last:'Tesla'},dob:{day:10,month:'July',year:1856}}").getValue(context) as Map<*, *>
```
======

`{:}` by itself means an empty map. For performance reasons, if the map is itself
composed of fixed literals or other nested constant structures (lists or maps), a
constant map is created to represent the expression (rather than building a new map on
each evaluation). Quoting of the map keys is optional (unless the key contains a period
(`.`)). The examples above do not use quoted keys.
