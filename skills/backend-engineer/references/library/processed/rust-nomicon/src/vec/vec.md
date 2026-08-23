> **Offline teaching derivative**  
> Source: `rust-lang/nomicon@5791ca9f5d671328af7a8fe87b42ca90c7211d28`  
> Upstream path: `src/vec/vec.md`  
> Upstream Git blob: `b033863313ff242d489cb06e432541454d667ef9`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Example: Implementing Vec

To bring everything together, we're going to write `std::Vec` from scratch.
We will limit ourselves to stable Rust. In particular we won't use any
intrinsics that could make our code a little bit nicer or efficient because
intrinsics are permanently unstable. Although many intrinsics *do* become
stabilized elsewhere (`std::ptr` and `std::mem` consist of many intrinsics).

Ultimately this means our implementation may not take advantage of all
possible optimizations, though it will be by no means *naive*. We will
definitely get into the weeds over nitty-gritty details, even
when the problem doesn't *really* merit it.

You wanted advanced. We're gonna go advanced.
