> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/expressions/language-ref/operator-ternary.adoc`  
> Upstream Git blob: `09defa169927019dea79ee753f4b73e22003a013`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[expressions-operator-ternary]]
# Ternary Operator (If-Then-Else)

You can use the ternary operator for performing if-then-else conditional logic inside
the expression. The following listing shows a minimal example:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	String falseString = parser.parseExpression(
			"false ? 'trueExp' : 'falseExp'").getValue(String.class);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	val falseString = parser.parseExpression(
			"false ? 'trueExp' : 'falseExp'").getValue(String::class.java)
```
======

In this case, the boolean `false` results in returning the string value `'falseExp'`. A more
realistic example follows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	parser.parseExpression("name").setValue(societyContext, "IEEE");
	societyContext.setVariable("queryName", "Nikola Tesla");

	expression = "isMember(#queryName)? #queryName + ' is a member of the ' " +
			"+ Name + ' Society' : #queryName + ' is not a member of the ' + Name + ' Society'";

	String queryResultString = parser.parseExpression(expression)
			.getValue(societyContext, String.class);
	// queryResultString = "Nikola Tesla is a member of the IEEE Society"
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	parser.parseExpression("name").setValue(societyContext, "IEEE")
	societyContext.setVariable("queryName", "Nikola Tesla")

	expression = "isMember(#queryName)? #queryName + ' is a member of the ' " + "+ Name + ' Society' : #queryName + ' is not a member of the ' + Name + ' Society'"

	val queryResultString = parser.parseExpression(expression)
			.getValue(societyContext, String::class.java)
	// queryResultString = "Nikola Tesla is a member of the IEEE Society"
```
======

See the next section on the Elvis operator for an even shorter syntax for the
ternary operator.
