> **Offline teaching derivative**  
> Source: `rust-lang/reference@3b38834b39f732c64686f7c64aa29dcf3cd83ba5`  
> Upstream path: `src/types/never.md`  
> Upstream Git blob: `fe30bce74d6ab02eb06b9d6a852f9dc3e523eec2`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

r[type.never]
# Never type

r[type.never.syntax]
```grammar,types
NeverType -> `!`
```

r[type.never.intro]
The never type `!` is a type with no values, representing the result of computations that never complete.

r[type.never.coercion]
Expressions of type `!` can be coerced into any other type.

r[type.never.constraint]
The `!` type can **only** appear in function return types presently, indicating it is a diverging function that never returns.

```rust
fn foo() -> ! {
    panic!("This call never returns.");
}
```

```rust
unsafe extern "C" {
    pub safe fn no_return_extern_func() -> !;
}
```
