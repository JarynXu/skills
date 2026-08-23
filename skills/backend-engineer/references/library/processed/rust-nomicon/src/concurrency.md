> **Offline teaching derivative**  
> Source: `rust-lang/nomicon@5791ca9f5d671328af7a8fe87b42ca90c7211d28`  
> Upstream path: `src/concurrency.md`  
> Upstream Git blob: `6205199bfcc44fd2ea692d01d59d48bd3b31ed1a`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Concurrency and Parallelism

Rust as a language doesn't *really* have an opinion on how to do concurrency or
parallelism. The standard library exposes OS threads and blocking sys-calls
because everyone has those, and they're uniform enough that you can provide
an abstraction over them in a relatively uncontroversial way. Message passing,
green threads, and async APIs are all diverse enough that any abstraction over
them tends to involve trade-offs that we weren't willing to commit to for 1.0.

However the way Rust models concurrency makes it relatively easy to design your own
concurrency paradigm as a library and have everyone else's code Just Work
with yours. Just require the right lifetimes and Send and Sync where appropriate
and you're off to the races. Or rather, off to the... not... having... races.
