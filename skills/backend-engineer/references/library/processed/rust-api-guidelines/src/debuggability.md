> **Offline teaching derivative**  
> Source: `rust-lang/api-guidelines@97a0969cb07fe4cabb0eed8a56234053f47d83dc`  
> Upstream path: `src/debuggability.md`  
> Upstream Git blob: `96d271914a4a28ed634e2caf4744e553fb38a5be`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Debuggability


<a id="c-debug"></a>
## All public types implement `Debug` (C-DEBUG)

If there are exceptions, they are rare.


<a id="c-debug-nonempty"></a>
## `Debug` representation is never empty (C-DEBUG-NONEMPTY)

Even for conceptually empty values, the `Debug` representation should never be
empty.

```rust
let empty_str = "";
assert_eq!(format!("{:?}", empty_str), "\"\"");

let empty_vec = Vec::<bool>::new();
assert_eq!(format!("{:?}", empty_vec), "[]");
```
