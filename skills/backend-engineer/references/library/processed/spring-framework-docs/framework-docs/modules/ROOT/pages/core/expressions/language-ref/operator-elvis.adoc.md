> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/expressions/language-ref/operator-elvis.adoc`  
> Upstream Git blob: `e4c2ff636d3fcfdb1c4391a10a95f75af34768f1`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[expressions-operator-elvis]]
# The Elvis Operator

The Elvis operator (`?:`) is a shortening of the ternary operator syntax and is used in
the https://www.groovy-lang.org/operators.html#_elvis_operator[Groovy] language. With the
ternary operator syntax, you often have to repeat a variable twice, as the following Java
example shows:

```java,indent=0,subs="verbatim,quotes"
	String name = "Elvis Presley";
	String displayName = (name != null ? name : "Unknown");
```

Instead, you can use the Elvis operator (named for the resemblance to Elvis' hair style).
The following example shows how to use the Elvis operator in a SpEL expression:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	ExpressionParser parser = new SpelExpressionParser();

	String name = parser.parseExpression("name ?: 'Unknown'").getValue(new Inventor(), String.class);
	System.out.println(name);  // 'Unknown'
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	val parser = SpelExpressionParser()

	val name = parser.parseExpression("name ?: 'Unknown'").getValue(Inventor(), String::class.java)
	println(name)  // 'Unknown'
```
======

[NOTE]
====
The SpEL Elvis operator also treats an _empty_ String like a `null` object. Thus, the
original Java example is only close to emulating the semantics of the operator: it would
need to use `name != null && !name.isEmpty()` as the predicate to be compatible with the
semantics of the SpEL Elvis operator.
====

[TIP]
====
As of Spring Framework 7.0, the SpEL Elvis operator supports `java.util.Optional` with
transparent unwrapping semantics.

For example, given the expression `A ?: B`, if `A` is `null` or an _empty_ `Optional`,
the expression evaluates to `B`. However, if `A` is a non-empty `Optional` the expression
evaluates to the object contained in the `Optional`, thereby effectively unwrapping the
`Optional` which correlates to `A.get()`.
====

The following listing shows a more complex example:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	ExpressionParser parser = new SpelExpressionParser();
	EvaluationContext context = SimpleEvaluationContext.forReadOnlyDataBinding().build();

	Inventor tesla = new Inventor("Nikola Tesla", "Serbian");
	String name = parser.parseExpression("name ?: 'Elvis Presley'").getValue(context, tesla, String.class);
	System.out.println(name);  // Nikola Tesla

	tesla.setName("");
	name = parser.parseExpression("name ?: 'Elvis Presley'").getValue(context, tesla, String.class);
	System.out.println(name);  // Elvis Presley
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	val parser = SpelExpressionParser()
	val context = SimpleEvaluationContext.forReadOnlyDataBinding().build()

	val tesla = Inventor("Nikola Tesla", "Serbian")
	var name = parser.parseExpression("name ?: 'Elvis Presley'").getValue(context, tesla, String::class.java)
	println(name)  // Nikola Tesla

	tesla.setName("")
	name = parser.parseExpression("name ?: 'Elvis Presley'").getValue(context, tesla, String::class.java)
	println(name)  // Elvis Presley
```
======

[TIP]
=====
You can use the Elvis operator to apply default values in expressions. The following
example shows how to use the Elvis operator in a `@Value` expression:

```java,indent=0,subs="verbatim,quotes"
	@Value("#{systemProperties['pop3.port'] ?: 25}")
```

This will inject the value of the system property named `pop3.port` if it is defined or
`25` if the property is not defined.
=====
