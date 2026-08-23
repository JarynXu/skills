> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/ioc/injection/constructorInjection.adoc`  
> Upstream Git blob: `54b70e12218db349ce553559be60d5d48d33a6cf`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

Constructor injection is when dependencies are injected into the constructor for a type.

Constructor injection is the preferred and recommended injection type because Constructor injection:

* Allows immutable types
* Doesn't require an additional annotation
* Is less likely to result in a `NullPointerException`
* More clearly expresses the dependencies of a particular type in one place.

The example in the next section uses constructor injection. Note that if you have multiple constructors you can disambiguate which constructor to invoke with the `jakarta.inject.Inject` annotation or the ann:core.annotation.Creator[] annotation:

.Example of Constructor Injection
snippet::io.micronaut.docs.ioc.injection.ctor.Vehicle[indent="0"]

<1> Multiple constructors are defined so `@Inject` is used to select the correct constructor.
<2> The ann:core.annotation.Creator[] annotation can also be used to select a `static` factory method to use as a constructor.

In the above example retrieving the `Vehicle` type from the [BeanContext]({api}/io/micronaut/context/BeanContext.html) will result in calling the `Vehicle(Engine engine)` constructor which will in turn resolve the `Engine` using the `getDefault()` method since it is annotated with `@Creator`.

NOTE: If no `@Inject` or `@Creator` is specified Micronaut will try to locate the first `public` constructor in the class otherwise a compilation error will occur.

If there are multiple possible candidates for a particular constructor argument a qualifier can be specified (such as `jakarta.inject.Named`) to disambiguate the injection. If it is not possible to disambiguate then the result will be a api:context.exceptions.NonUniqueBeanException[]. See the <<qualifiers, Qualifiers>> section for more information.

WARNING: If you use `@Inject` on a `private` constructor then the type will be instantiated via the Java reflection API which is not recommended.
