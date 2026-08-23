> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webflux-reactive-libraries.adoc`  
> Upstream Git blob: `0e7253dae5267484e337c16ad3832146168cb8a6`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[webflux-reactive-libraries]]
# Reactive Libraries

`spring-webflux` depends on `reactor-core` and uses it internally to compose asynchronous
logic and to provide Reactive Streams support. Generally, WebFlux APIs return `Flux` or
`Mono` (since those are used internally) and leniently accept any Reactive Streams
`Publisher` implementation as input.
When a `Publisher` is provided, it can be treated only as a stream with unknown semantics (0..N).
If, however, the semantics are known, you should wrap it with `Flux` or `Mono.from(Publisher)` instead
of passing the raw `Publisher`.
The use of `Flux` versus `Mono` is important, because it helps to express cardinality --
for example, whether a single or multiple asynchronous values are expected,
and that can be essential for making decisions (for example, when encoding or decoding HTTP messages).

For annotated controllers, WebFlux transparently adapts to the reactive library chosen by
the application. This is done with the help of the
{spring-framework-api}/core/ReactiveAdapterRegistry.html[`ReactiveAdapterRegistry`], which
provides pluggable support for reactive library and other asynchronous types. The registry
has built-in support for RxJava 3, Kotlin coroutines and SmallRye Mutiny, but you can
register others, too.
