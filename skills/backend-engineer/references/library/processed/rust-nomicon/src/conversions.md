> **Offline teaching derivative**  
> Source: `rust-lang/nomicon@5791ca9f5d671328af7a8fe87b42ca90c7211d28`  
> Upstream path: `src/conversions.md`  
> Upstream Git blob: `4c29fd8b26f294b6f4f3f9ab1e204ad285ceb039`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Type Conversions

At the end of the day, everything is just a pile of bits somewhere, and type
systems are just there to help us use those bits right. There are two common
problems with typing bits: needing to reinterpret those exact bits as a
different type, and needing to change the bits to have equivalent meaning for
a different type. Because Rust encourages encoding important properties in the
type system, these problems are incredibly pervasive. As such, Rust
consequently gives you several ways to solve them.

First we'll look at the ways that Safe Rust gives you to reinterpret values.
The most trivial way to do this is to just destructure a value into its
constituent parts and then build a new type out of them. e.g.

```rust
struct Foo {
    x: u32,
    y: u16,
}

struct Bar {
    a: u32,
    b: u16,
}

fn reinterpret(foo: Foo) -> Bar {
    let Foo { x, y } = foo;
    Bar { a: x, b: y }
}
```

But this is, at best, annoying. For common conversions, Rust provides
more ergonomic alternatives.
