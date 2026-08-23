> **Offline teaching derivative**  
> Source: `rust-lang/nomicon@5791ca9f5d671328af7a8fe87b42ca90c7211d28`  
> Upstream path: `src/obrm.md`  
> Upstream Git blob: `19e5ec382595c212c09e5a3485ae8bac6c0505e1`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# The Perils Of Ownership Based Resource Management (OBRM)

OBRM (AKA RAII: Resource Acquisition Is Initialization) is something you'll
interact with a lot in Rust. Especially if you use the standard library.

Roughly speaking the pattern is as follows: to acquire a resource, you create an
object that manages it. To release the resource, you simply destroy the object,
and it cleans up the resource for you. The most common "resource" this pattern
manages is simply *memory*. `Box`, `Rc`, and basically everything in
`std::collections` is a convenience to enable correctly managing memory. This is
particularly important in Rust because we have no pervasive GC to rely on for
memory management. Which is the point, really: Rust is about control. However we
are not limited to just memory. Pretty much every other system resource like a
thread, file, or socket is exposed through this kind of API.
