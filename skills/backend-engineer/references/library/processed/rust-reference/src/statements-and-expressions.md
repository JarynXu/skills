> **Offline teaching derivative**  
> Source: `rust-lang/reference@3b38834b39f732c64686f7c64aa29dcf3cd83ba5`  
> Upstream path: `src/statements-and-expressions.md`  
> Upstream Git blob: `fdd1522af31a7fcc3ccb03999ce6d4cb3f7e9cc3`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

r[stmt-expr]
# Statements and expressions

Rust is _primarily_ an expression language. This means that most forms of value-producing or effect-causing evaluation are directed by the uniform syntax category of _expressions_. Each kind of expression can typically _nest_ within each other kind of expression, and rules for evaluation of expressions involve specifying both the value produced by the expression and the order in which its sub-expressions are themselves evaluated.

In contrast, statements serve _mostly_ to contain and explicitly sequence expression evaluation.
