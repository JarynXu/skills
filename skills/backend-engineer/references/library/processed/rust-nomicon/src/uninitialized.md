> **Offline teaching derivative**  
> Source: `rust-lang/nomicon@5791ca9f5d671328af7a8fe87b42ca90c7211d28`  
> Upstream path: `src/uninitialized.md`  
> Upstream Git blob: `eafc67907f2af43c57b60f0b91c9664bec42f102`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Working With Uninitialized Memory

All runtime-allocated memory in a Rust program begins its life as
*uninitialized*. In this state the value of the memory is an indeterminate pile
of bits that may or may not even reflect a valid state for the type that is
supposed to inhabit that location of memory. Attempting to interpret this memory
as a value of *any* type will cause Undefined Behavior. Do Not Do This.

Rust provides mechanisms to work with uninitialized memory in checked (safe) and
unchecked (unsafe) ways.
