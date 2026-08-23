> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/aop/ataspectj/example.adoc`  
> Upstream Git blob: `aca99711d3521472feeb04acb29145a66dba3ef6`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[aop-ataspectj-example]]
# An AOP Example

Now that you have seen how all the constituent parts work, we can put them together to do
something useful.

The execution of business services can sometimes fail due to concurrency issues (for
example, a deadlock loser). If the operation is retried, it is likely to succeed
on the next try. For business services where it is appropriate to retry in such
conditions (idempotent operations that do not need to go back to the user for conflict
resolution), we want to transparently retry the operation to avoid the client seeing a
`PessimisticLockingFailureException`. This is a requirement that clearly cuts across
multiple services in the service layer and, hence, is ideal for implementing through an
aspect.

Because we want to retry the operation, we need to use around advice so that we can
call `proceed` multiple times. The following listing shows the basic aspect implementation:

include-code::./ConcurrentOperationExecutor[tag=snippet,indent=0]

`@Around("com.xyz.CommonPointcuts.businessService()")` references the `businessService` named pointcut defined in
[Sharing Named Pointcut Definitions](core/aop/ataspectj/pointcuts.adoc#aop-common-pointcuts).

Note that the aspect implements the `Ordered` interface so that we can set the precedence of
the aspect higher than the transaction advice (we want a fresh transaction each time we
retry). The `maxRetries` and `order` properties are both configured by Spring. The
main action happens in the `doConcurrentOperation` around advice. Notice that, for the
moment, we apply the retry logic to each `businessService`. We try to proceed,
and if we fail with a `PessimisticLockingFailureException`, we try again, unless
we have exhausted all of our retry attempts.

The corresponding Spring configuration follows:

include-code::./ApplicationConfiguration[tag=snippet,indent=0]

To refine the aspect so that it retries only idempotent operations, we might define the following
`Idempotent` annotation:

include-code::./service/Idempotent[tag=snippet,indent=0]

We can then use the annotation to annotate the implementation of service operations. The change
to the aspect to retry only idempotent operations involves refining the pointcut
expression so that only `@Idempotent` operations match, as follows:

include-code::./service/SampleService[tag=snippet,indent=0]
