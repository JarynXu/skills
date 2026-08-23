> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/expressions/language-ref/templating.adoc`  
> Upstream Git blob: `6961adee6ba78dc5b014d6f6f455ad067e15b1f6`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[expressions-templating]]
# Expression Templating

Expression templates allow mixing literal text with one or more evaluation blocks.
Each evaluation block is delimited with prefix and suffix characters that you can
define. A common choice is to use `+#{ }+` as the delimiters, as the following example
shows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	String randomPhrase = parser.parseExpression(
			"random number is #{T(java.lang.Math).random()}",
			new TemplateParserContext()).getValue(String.class);

	// evaluates to "random number is 0.7038186818312008"
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	val randomPhrase = parser.parseExpression(
			"random number is #{T(java.lang.Math).random()}",
			TemplateParserContext()).getValue(String::class.java)

	// evaluates to "random number is 0.7038186818312008"
```
======

The string is evaluated by concatenating the literal text `'random number is '` with the
result of evaluating the expression inside the `+#{ }+` delimiters (in this case, the
result of calling that `random()` method). The second argument to the `parseExpression()`
method is of the type `ParserContext`. The `ParserContext` interface is used to influence
how the expression is parsed in order to support the expression templating functionality.
The `TemplateParserContext` used in the previous example resides in the
`org.springframework.expression.common` package and is an implementation of the
`ParserContext` which by default configures the prefix and suffix to `#{` and `}`,
respectively.
