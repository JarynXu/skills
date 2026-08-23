> **Offline teaching derivative**  
> Source: `rust-lang/reference@3b38834b39f732c64686f7c64aa29dcf3cd83ba5`  
> Upstream path: `src/influences.md`  
> Upstream Git blob: `359c292abbc91428924d64c38d14e50133f2e9fd`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Influences

Rust is not a particularly original language, with design elements coming from a wide range of sources. Some of these are listed below (including elements that have since been removed):

* SML, OCaml: algebraic data types, pattern matching, type inference, semicolon statement separation
* C++: references, RAII, smart pointers, move semantics, monomorphization, memory model
* ML Kit, Cyclone: region based memory management
* Haskell (GHC): typeclasses, type families
* Newsqueak, Alef, Limbo: channels, concurrency
* Erlang: message passing, thread failure, ~~linked thread failure~~, ~~lightweight concurrency~~
* Swift: optional bindings
* Scheme: hygienic macros
* C#: attributes
* Ruby: closure syntax, ~~block syntax~~
* NIL, Hermes: ~~typestate~~
* [Unicode Annex #31](http://www.unicode.org/reports/tr31/): identifier and pattern syntax
