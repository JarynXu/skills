> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/expressions/language-ref/variables.adoc`  
> Upstream Git blob: `9faaee046245c4819ea6470184b798f8ef6ea0ae`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[expressions-ref-variables]]
# Variables

You can reference variables in an expression by using the `#variableName` syntax. Variables
are set by using the `setVariable()` method in `EvaluationContext` implementations.

[NOTE]
====
Variable names must begin with a letter (as defined below), an underscore, or a dollar
sign.

Variable names must be composed of one or more of the following supported types of
characters.

* letter: any character for which `java.lang.Character.isLetter(char)` returns `true`
  - This includes letters such as `A` to `Z`, `a` to `z`, `ü`, `ñ`, and `é` as well as
    letters from other character sets such as Chinese, Japanese, Cyrillic, etc.
* digit: `0` to `9`
* underscore: `_`
* dollar sign: `$`
====

[TIP]
====
When setting a variable or root context object in the `EvaluationContext`, it is advised
that the type of the variable or root context object be `public`.

Otherwise, certain types of SpEL expressions involving a variable or root context object
with a non-public type may fail to evaluate or compile.
====

[WARNING]
====
Since variables share a common namespace with
[functions](core/expressions/language-ref/functions.adoc) in the evaluation context,
care must be taken to ensure that variable names and functions names do not overlap.
====

The following example shows how to use variables.

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	Inventor tesla = new Inventor("Nikola Tesla", "Serbian");

	EvaluationContext context = SimpleEvaluationContext.forReadWriteDataBinding().build();
	context.setVariable("newName", "Mike Tesla");

	parser.parseExpression("name = #newName").getValue(context, tesla);
	System.out.println(tesla.getName());  // "Mike Tesla"
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	val tesla = Inventor("Nikola Tesla", "Serbian")

	val context = SimpleEvaluationContext.forReadWriteDataBinding().build()
	context.setVariable("newName", "Mike Tesla")

	parser.parseExpression("name = #newName").getValue(context, tesla)
	println(tesla.name)  // "Mike Tesla"
```
======


[[expressions-this-root]]
## The `#this` and `#root` Variables

The `#this` variable is always defined and refers to the current evaluation object
(against which unqualified references are resolved). The `#root` variable is always
defined and refers to the root context object. Although `#this` may vary as components of
an expression are evaluated, `#root` always refers to the root.

The following example shows how to use the `#this` variable in conjunction with
[collection selection](core/expressions/language-ref/collection-selection.adoc).

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	// Create a list of prime integers.
	List<Integer> primes = List.of(2, 3, 5, 7, 11, 13, 17);

	// Create parser and set variable 'primes' as the list of integers.
	ExpressionParser parser = new SpelExpressionParser();
	EvaluationContext context = SimpleEvaluationContext.forReadWriteDataBinding().build();
	context.setVariable("primes", primes);

	// Select all prime numbers > 10 from the list (using selection ?{...}).
	String expression = "#primes.?[#this > 10]";

	// Evaluates to a list containing [11, 13, 17].
	List<Integer> primesGreaterThanTen =
			parser.parseExpression(expression).getValue(context, List.class);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	// Create a list of prime integers.
	val primes = listOf(2, 3, 5, 7, 11, 13, 17)

	// Create parser and set variable 'primes' as the list of integers.
	val parser = SpelExpressionParser()
	val context = SimpleEvaluationContext.forReadWriteDataBinding().build()
	context.setVariable("primes", primes)

	// Select all prime numbers > 10 from the list (using selection ?{...}).
	val expression = "#primes.?[#this > 10]"

	// Evaluates to a list containing [11, 13, 17].
	val primesGreaterThanTen = parser.parseExpression(expression)
			.getValue(context) as List<Int>
```
======

The following example shows how to use the `#this` and `#root` variables together in
conjunction with
[collection projection](core/expressions/language-ref/collection-projection.adoc).

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	// Create parser and evaluation context.
	ExpressionParser parser = new SpelExpressionParser();
	EvaluationContext context = SimpleEvaluationContext.forReadWriteDataBinding().build();

	// Create an inventor to use as the root context object.
	Inventor tesla = new Inventor("Nikola Tesla");
	tesla.setInventions("Telephone repeater", "Tesla coil transformer");

	// Iterate over all inventions of the Inventor referenced as the #root
	// object, and generate a list of strings whose contents take the form
	// "<inventor's name> invented the <invention>." (using projection !{...}).
	String expression = "#root.inventions.![#root.name + ' invented the ' + #this + '.']";

	// Evaluates to a list containing:
	// "Nikola Tesla invented the Telephone repeater."
	// "Nikola Tesla invented the Tesla coil transformer."
	List<String> results = parser.parseExpression(expression)
			.getValue(context, tesla, List.class);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	// Create parser and evaluation context.
	val parser = SpelExpressionParser()
	val context = SimpleEvaluationContext.forReadWriteDataBinding().build()

	// Create an inventor to use as the root context object.
	val tesla = Inventor("Nikola Tesla")
	tesla.setInventions("Telephone repeater", "Tesla coil transformer")

	// Iterate over all inventions of the Inventor referenced as the #root
	// object, and generate a list of strings whose contents take the form
	// "<inventor's name> invented the <invention>." (using projection !{...}).
	val expression = "#root.inventions.![#root.name + ' invented the ' + #this + '.']"

	// Evaluates to a list containing:
	// "Nikola Tesla invented the Telephone repeater."
	// "Nikola Tesla invented the Tesla coil transformer."
	val results = parser.parseExpression(expression)
			.getValue(context, tesla, List::class.java)
```
======
