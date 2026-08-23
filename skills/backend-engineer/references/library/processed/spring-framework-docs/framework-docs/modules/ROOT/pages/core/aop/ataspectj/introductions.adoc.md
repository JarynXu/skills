> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/aop/ataspectj/introductions.adoc`  
> Upstream Git blob: `ecb8589c867477a3bd08fef78b66fc8c0c7cb274`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[aop-introductions]]
# Introductions

Introductions (known as inter-type declarations in AspectJ) enable an aspect to declare
that advised objects implement a given interface, and to provide an implementation of
that interface on behalf of those objects.

You can make an introduction by using the `@DeclareParents` annotation. This annotation
is used to declare that matching types have a new parent (hence the name). For example,
given an interface named `UsageTracked` and an implementation of that interface named
`DefaultUsageTracked`, the following aspect declares that all implementors of service
interfaces also implement the `UsageTracked` interface (for example, for statistics via JMX):

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim"
	@Aspect
	public class UsageTracking {

		@DeclareParents(value="com.xyz.service.*+", defaultImpl=DefaultUsageTracked.class)
		public static UsageTracked mixin;

		@Before("execution(* com.xyz..service.*.*(..)) && this(usageTracked)")
		public void recordUsage(UsageTracked usageTracked) {
			usageTracked.incrementUseCount();
		}

	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim"
	@Aspect
	class UsageTracking {

		companion object {
			@DeclareParents(value = "com.xyz.service.*+",
				defaultImpl = DefaultUsageTracked::class)
			lateinit var mixin: UsageTracked
		}

		@Before("execution(* com.xyz..service.*.*(..)) && this(usageTracked)")
		fun recordUsage(usageTracked: UsageTracked) {
			usageTracked.incrementUseCount()
		}
	}
```
======

The interface to be implemented is determined by the type of the annotated field. The
`value` attribute of the `@DeclareParents` annotation is an AspectJ type pattern. Any
bean of a matching type implements the `UsageTracked` interface. Note that, in the
before advice of the preceding example, service beans can be directly used as
implementations of the `UsageTracked` interface. If accessing a bean programmatically,
you would write the following:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim"
	UsageTracked usageTracked = context.getBean("myService", UsageTracked.class);
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim"
	val usageTracked = context.getBean<UsageTracked>("myService")
```
======
