> **Offline teaching derivative**  
> Source: `rust-lang/book@917544888a55e4da7109bdba8c88c893c0da70f4`  
> Upstream path: `src/ch05-00-structs.md`  
> Upstream Git blob: `4c0f7d35b9ffd406cf16fcc52542c49ad1991d22`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Using Structs to Structure Related Data

A _struct_, or _structure_, is a custom data type that lets you package
together and name multiple related values that make up a meaningful group. If
you’re familiar with an object-oriented language, a struct is like an object’s
data attributes. In this chapter, we’ll compare and contrast tuples with
structs to build on what you already know and demonstrate when structs are a
better way to group data.

We’ll demonstrate how to define and instantiate structs. We’ll discuss how to
define associated functions, especially the kind of associated functions called
_methods_, to specify behavior associated with a struct type. Structs and enums
(discussed in Chapter 6) are the building blocks for creating new types in your
program’s domain to take full advantage of Rust’s compile-time type checking.
