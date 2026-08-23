> **Offline teaching derivative**  
> Source: `rust-lang/book@917544888a55e4da7109bdba8c88c893c0da70f4`  
> Upstream path: `src/ch06-00-enums.md`  
> Upstream Git blob: `982e62c2b4bc689d22535cdf4780fa21cc16d309`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Enums and Pattern Matching

In this chapter, we’ll look at enumerations, also referred to as _enums_.
Enums allow you to define a type by enumerating its possible variants. First
we’ll define and use an enum to show how an enum can encode meaning along with
data. Next, we’ll explore a particularly useful enum, called `Option`, which
expresses that a value can be either something or nothing. Then, we’ll look at
how pattern matching in the `match` expression makes it easy to run different
code for different values of an enum. Finally, we’ll cover how the `if let`
construct is another convenient and concise idiom available to handle enums in
your code.
