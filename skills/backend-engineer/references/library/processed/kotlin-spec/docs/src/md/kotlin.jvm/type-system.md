> **Offline teaching derivative**  
> Source: `Kotlin/kotlin-spec@2f7aa0524ec27e788dfacd550f144809f2e0254c`  
> Upstream path: `docs/src/md/kotlin.jvm/type-system.md`  
> Upstream Git blob: `5aa6c475a66520c385ae9b7afb284a81c6811dd4`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

## Type system

### Type kinds

#### Type parameters

On the JVM platform, bounded type parameter with regular bounds should satisfy the following set of conditions:

* $F$ is a type parameter of type constructor $T$
* $\forall i \in [1,n]: B_i$ must be concrete, non-type-parameter, well-formed type
* No more than one of $B_i$ may be a class type
* Additionally, $\forall i \in [1,n]: B_i$ is not a parameterized or specialized [array type][Array types]

> Note: the last condition mirrors the JVM platform restriction on array types not allowed in upper bound wildcards.
