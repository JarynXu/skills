> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/beans/annotation-config/generics-as-qualifiers.adoc`  
> Upstream Git blob: `2fdf6c6d9ee374f4b3e5a85defe407c7b46182c5`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[beans-generics-as-qualifiers]]
# Using Generics as Autowiring Qualifiers

In addition to the `@Qualifier` annotation, you can use Java generic types
as an implicit form of qualification. For example, suppose you have the following
configuration:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@Configuration
	public class MyConfiguration {

		@Bean
		public StringStore stringStore() {
			return new StringStore();
		}

		@Bean
		public IntegerStore integerStore() {
			return new IntegerStore();
		}
	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@Configuration
	class MyConfiguration {

		@Bean
		fun stringStore() = StringStore()

		@Bean
		fun integerStore() = IntegerStore()
	}
```
======

Assuming that the preceding beans implement a generic interface, (that is, `Store<String>` and
`Store<Integer>`), you can `@Autowire` the `Store` interface and the generic is
used as a qualifier, as the following example shows:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@Autowired
	private Store<String> s1; // <String> qualifier, injects the stringStore bean

	@Autowired
	private Store<Integer> s2; // <Integer> qualifier, injects the integerStore bean
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@Autowired
	private lateinit var s1: Store<String> // <String> qualifier, injects the stringStore bean

	@Autowired
	private lateinit var s2: Store<Integer> // <Integer> qualifier, injects the integerStore bean
```
======

Generic qualifiers also apply when autowiring lists, `Map` instances and arrays. The
following example autowires a generic `List`:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	// Inject all Store beans as long as they have an <Integer> generic
	// Store<String> beans will not appear in this list
	@Autowired
	private List<Store<Integer>> s;
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	// Inject all Store beans as long as they have an <Integer> generic
	// Store<String> beans will not appear in this list
	@Autowired
	private lateinit var s: List<Store<Integer>>
```
======
