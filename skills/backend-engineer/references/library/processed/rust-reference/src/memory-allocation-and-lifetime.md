> **Offline teaching derivative**  
> Source: `rust-lang/reference@3b38834b39f732c64686f7c64aa29dcf3cd83ba5`  
> Upstream path: `src/memory-allocation-and-lifetime.md`  
> Upstream Git blob: `a72577b606faa5dccd7d97bb21a220238461767b`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

r[alloc]
# Memory allocation and lifetime

r[alloc.static]
The _items_ of a program are those functions, modules, and types that have their value calculated at compile-time and stored uniquely in the memory image of the rust process. Items are neither dynamically allocated nor freed.

r[alloc.dynamic]
The _heap_ is a general term that describes boxes.  The lifetime of an allocation in the heap depends on the lifetime of the box values pointing to it. Since box values may themselves be passed in and out of frames, or stored in the heap, heap allocations may outlive the frame they are allocated within. An allocation in the heap is guaranteed to reside at a single location in the heap for the whole lifetime of the allocation - it will never be relocated as a result of moving a box value.
