> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/validation.adoc`  
> Upstream Git blob: `2f7fe17cc5c1f9fb4800ad650ed95f086c258453`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[validation]]
# Validation, Data Binding, and Type Conversion

There are pros and cons for considering validation as business logic, and Spring offers
a design for validation and data binding that does not exclude either one of them.
Specifically, validation should not be tied to the web tier and should be easy to localize,
and it should be possible to plug in any available validator. Considering these concerns,
Spring provides a `Validator` contract that is both basic and eminently usable
in every layer of an application.

Data binding is useful for letting user input be dynamically bound to the domain
model of an application (or whatever objects you use to process user input). Spring
provides the aptly named `DataBinder` to do exactly that. The `Validator` and the
`DataBinder` make up the `validation` package, which is primarily used in but not
limited to the web layer.

The `BeanWrapper` is a fundamental concept in the Spring Framework and is used in a lot
of places. However, you probably do not need to use the `BeanWrapper` directly. Because
this is reference documentation, however, we feel that some explanation might be in
order. We explain the `BeanWrapper` in this chapter, since, if you are going to use it at
all, you are most likely do so when trying to bind data to objects.

Spring's `DataBinder` and the lower-level `BeanWrapper` both use `PropertyEditorSupport`
implementations to parse and format property values. The `PropertyEditor` and
`PropertyEditorSupport` types are part of the JavaBeans specification and are also
explained in this chapter. Spring's `core.convert` package provides a general type
conversion facility, as well as a higher-level `format` package for formatting UI field
values. You can use these packages as simpler alternatives to `PropertyEditorSupport`
implementations. They are also discussed in this chapter.

Spring supports Java Bean Validation through setup infrastructure and an adaptor to
Spring's own `Validator` contract. Applications can enable Bean Validation once globally,
as described in [Java Bean Validation](core/validation/beanvalidation.adoc), and use
it exclusively for all validation needs. In the web layer, applications can further
register controller-local Spring `Validator` instances per `DataBinder`, as described in
[Configuring a `DataBinder`](core/validation/beanvalidation.adoc#validation-binder),
which can be useful for plugging in custom validation logic.
