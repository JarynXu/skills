> **Offline teaching derivative**  
> Source: `rust-lang/reference@3b38834b39f732c64686f7c64aa29dcf3cd83ba5`  
> Upstream path: `src/types/slice.md`  
> Upstream Git blob: `e8be3a9f1ef48fe07a786238baccebca8f4abd39`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

r[type.slice]
# Slice types

r[type.slice.syntax]
```grammar,types
SliceType -> `[` Type `]`
```

r[type.slice.intro]
A slice is a [dynamically sized type] representing a 'view' into a sequence of elements of type `T`. The slice type is written as `[T]`.

r[type.slice.unsized]
Slice types are generally used through pointer types. For example:

* `&[T]`: a 'shared slice', often just called a 'slice'. It doesn't own the data it points to; it borrows it.
* `&mut [T]`: a 'mutable slice'. It mutably borrows the data it points to.
* `Box<[T]>`: a 'boxed slice'

Examples:

```rust
// A heap-allocated array, coerced to a slice
let boxed_array: Box<[i32]> = Box::new([1, 2, 3]);

// A (shared) slice into an array
let slice: &[i32] = &boxed_array[..];
```

r[type.slice.safe]
All elements of slices are always initialized, and access to a slice is always bounds-checked in safe methods and operators.

[dynamically sized type]: ../dynamically-sized-types.md
