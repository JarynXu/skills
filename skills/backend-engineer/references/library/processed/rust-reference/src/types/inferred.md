> **Offline teaching derivative**  
> Source: `rust-lang/reference@3b38834b39f732c64686f7c64aa29dcf3cd83ba5`  
> Upstream path: `src/types/inferred.md`  
> Upstream Git blob: `fcbb149e7828becc9d7d2fc973d9ad612fee2954`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

r[type.inferred]
# Inferred type

r[type.inferred.syntax]
```grammar,types
InferredType -> `_`
```

r[type.inferred.intro]
The inferred type asks the compiler to infer the type if possible based on the surrounding information available.

> [!EXAMPLE]
> The inferred type is often used in generic arguments:
>
> ```rust
> let x: Vec<_> = (0..10).collect();
> ```

r[type.inferred.constraint]
The inferred type cannot be used in item signatures.

<!--
  What else should be said here?
  The only documentation I am aware of is https://rustc-dev-guide.rust-lang.org/type-inference.html
  There should be a broader discussion of type inference somewhere.
-->
