> **Offline teaching derivative**  
> Source: `rust-lang/book@917544888a55e4da7109bdba8c88c893c0da70f4`  
> Upstream path: `src/ch04-00-understanding-ownership.md`  
> Upstream Git blob: `52eda6a12f0a69dbbead2ac2b38818c401e25f88`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Understanding Ownership

Ownership is Rust’s most unique feature and has deep implications for the rest
of the language. It enables Rust to make memory safety guarantees without
needing a garbage collector, so it’s important to understand how ownership
works. In this chapter, we’ll talk about ownership as well as several related
features: borrowing, slices, and how Rust lays data out in memory.
