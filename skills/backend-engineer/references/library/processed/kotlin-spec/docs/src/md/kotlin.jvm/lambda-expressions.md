> **Offline teaching derivative**  
> Source: `Kotlin/kotlin-spec@2f7aa0524ec27e788dfacd550f144809f2e0254c`  
> Upstream path: `docs/src/md/kotlin.jvm/lambda-expressions.md`  
> Upstream Git blob: `5a2ea557358bbcf197dc538bb881a0c5ce8d9c1e`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

## Lambda expressions

TODO(Everything)

> Note: creating excessive lambda instances may potentially lead to logical memory leaks.
> To avoid this problem, lambda expressions which do not capture any properties are implemented as singleton classes.
> Thus, all instances of such lambdas actually reference the same singleton object.
> ```kotlin
> fun example() {
>     val lambdaProvider = {
>         { Unit } // stateless lambda
>     }
>     val lambda1 = lambdaProvider()
>     val lambda2 = lambdaProvider()
>
>     // Both references are the same
>     assert(lambda1 === lambda2)
> }
> ```
