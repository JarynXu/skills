> **Offline teaching derivative**  
> Source: `rust-lang/reference@3b38834b39f732c64686f7c64aa29dcf3cd83ba5`  
> Upstream path: `src/expressions/return-expr.md`  
> Upstream Git blob: `67569d5c5f133d73f3962db61f3953ddf7795c9f`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

r[expr.return]
# `return` expressions

r[expr.return.syntax]
```grammar,expressions
ReturnExpression -> `return` Expression?
```

r[expr.return.intro]
Return expressions are denoted with the keyword `return`.

r[expr.return.behavior]
Evaluating a `return` expression moves its argument into the designated output location for the current function call, destroys the current function activation frame, and transfers control to the caller frame.

r[expr.return.diverging]
A `return` expression is [diverging] and has a type of [`!`].

An example of a `return` expression:

```rust
fn max(a: i32, b: i32) -> i32 {
    if a > b {
        return a;
    }
    return b;
}
```

[`!`]: type.never
[diverging]: divergence
