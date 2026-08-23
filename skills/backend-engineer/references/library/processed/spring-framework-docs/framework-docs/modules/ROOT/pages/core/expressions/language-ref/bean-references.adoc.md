> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/expressions/language-ref/bean-references.adoc`  
> Upstream Git blob: `1102db79deba604aeb87ba23b5da4839c951fcfb`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[expressions-bean-references]]
# Bean References

If the evaluation context has been configured with a bean resolver, you can look up beans
from an expression by using the `@` symbol as a prefix. The following example shows how
to do so:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	ExpressionParser parser = new SpelExpressionParser();
	StandardEvaluationContext context = new StandardEvaluationContext();
	context.setBeanResolver(new MyBeanResolver());

	// This will end up calling resolve(context, "someBean") on MyBeanResolver
	// during evaluation.
	Object bean = parser.parseExpression("@someBean").getValue(context);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	val parser = SpelExpressionParser()
	val context = StandardEvaluationContext()
	context.setBeanResolver(MyBeanResolver())

	// This will end up calling resolve(context, "someBean") on MyBeanResolver
	// during evaluation.
	val bean = parser.parseExpression("@someBean").getValue(context)
```
======

[NOTE]
====
If a bean name contains a dot (`.`) or other special characters, you must provide the
name of the bean as a _string literal_ – for example, `@'order.service'`.
====

To access a factory bean itself, you should instead prefix the bean name with an `&`
symbol. The following example shows how to do so:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	ExpressionParser parser = new SpelExpressionParser();
	StandardEvaluationContext context = new StandardEvaluationContext();
	context.setBeanResolver(new MyBeanResolver());

	// This will end up calling resolve(context, "&someFactoryBean") on
	// MyBeanResolver during evaluation.
	Object factoryBean = parser.parseExpression("&someFactoryBean").getValue(context);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	val parser = SpelExpressionParser()
	val context = StandardEvaluationContext()
	context.setBeanResolver(MyBeanResolver())

	// This will end up calling resolve(context, "&someFactoryBean") on
	// MyBeanResolver during evaluation.
	val factoryBean = parser.parseExpression("&someFactoryBean").getValue(context)
```
======
