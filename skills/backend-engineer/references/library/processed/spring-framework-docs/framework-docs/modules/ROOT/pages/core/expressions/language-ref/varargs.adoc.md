> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/expressions/language-ref/varargs.adoc`  
> Upstream Git blob: `8b7240a13e716c82ff1ddc9a3b41c2bde0505cf7`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[expressions-varargs]]
# Varargs Invocations

The Spring Expression Language supports
https://docs.oracle.com/javase/8/docs/technotes/guides/language/varargs.html[varargs]
invocations for [constructors](core/expressions/language-ref/constructors.adoc),
[methods](core/expressions/language-ref/methods.adoc), and user-defined
[functions](core/expressions/language-ref/functions.adoc).

The following example shows how to invoke the `java.lang.String#formatted(Object...)`
_varargs_ method within an expression by supplying the variable argument list as separate
arguments (`'blue', 1`).

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	// evaluates to "blue is color #1"
	String expression = "'%s is color #%d'.formatted('blue', 1)";
	String message = parser.parseExpression(expression).getValue(String.class);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	// evaluates to "blue is color #1"
	val expression = "'%s is color #%d'.formatted('blue', 1)"
	val message = parser.parseExpression(expression).getValue(String::class.java)
```
======

A variable argument list can also be supplied as an array, as demonstrated in the
following example (`new Object[] {'blue', 1}`).

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	// evaluates to "blue is color #1"
	String expression = "'%s is color #%d'.formatted(new Object[] {'blue', 1})";
	String message = parser.parseExpression(expression).getValue(String.class);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	// evaluates to "blue is color #1"
	val expression = "'%s is color #%d'.formatted(new Object[] {'blue', 1})"
	val message = parser.parseExpression(expression).getValue(String::class.java)
```
======

As an alternative, a variable argument list can be supplied as a `java.util.List` – for
example, as an [inline list](core/expressions/language-ref/inline-lists.adoc)
(`{'blue', 1}`). The following example shows how to do that.

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	// evaluates to "blue is color #1"
	String expression = "'%s is color #%d'.formatted({'blue', 1})";
	String message = parser.parseExpression(expression).getValue(String.class);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	// evaluates to "blue is color #1"
	val expression = "'%s is color #%d'.formatted({'blue', 1})"
	val message = parser.parseExpression(expression).getValue(String::class.java)
```
======

[[expressions-varargs-type-conversion]]
## Varargs Type Conversion

In contrast to the standard support for varargs invocations in Java,
[type conversion](core/expressions/evaluation.adoc#expressions-type-conversion) may be
applied to the individual arguments when invoking varargs constructors, methods, or
functions in SpEL.

For example, if we have registered a custom
[function](core/expressions/language-ref/functions.adoc) in the `EvaluationContext`
under the name `#reverseStrings` for a method with the signature
`String reverseStrings(String... strings)`, we can invoke that function within a SpEL
expression with any argument that can be converted to a `String`, as demonstrated in the
following example.

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	// evaluates to "3.0, 2.0, 1, SpEL"
	String expression = "#reverseStrings('SpEL', 1, 10F / 5, 3.0000)";
	String message = parser.parseExpression(expression)
			.getValue(evaluationContext, String.class);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	// evaluates to "3.0, 2.0, 1, SpEL"
	val expression = "#reverseStrings('SpEL', 1, 10F / 5, 3.0000)"
	val message = parser.parseExpression(expression)
			.getValue(evaluationContext, String::class.java)
```
======

Similarly, any array whose component type is a subtype of the required varargs type can
be supplied as the variable argument list for a varargs invocation. For example, a
`String[]` array can be supplied to a varargs invocation that accepts an `Object...`
argument list.

The following listing demonstrates that we can supply a `String[]` array to the
`java.lang.String#formatted(Object...)` _varargs_ method. It also highlights that `1`
will be automatically converted to `"1"`.

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	// evaluates to "blue is color #1"
	String expression = "'%s is color #%s'.formatted(new String[] {'blue', 1})";
	String message = parser.parseExpression(expression).getValue(String.class);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	// evaluates to "blue is color #1"
	val expression = "'%s is color #%s'.formatted(new String[] {'blue', 1})"
	val message = parser.parseExpression(expression).getValue(String::class.java)
```
======
