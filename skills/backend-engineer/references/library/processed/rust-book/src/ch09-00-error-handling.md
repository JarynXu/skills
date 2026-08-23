> **Offline teaching derivative**  
> Source: `rust-lang/book@917544888a55e4da7109bdba8c88c893c0da70f4`  
> Upstream path: `src/ch09-00-error-handling.md`  
> Upstream Git blob: `f32061c4ff6a2750b2b68ea768ea142f9e289663`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Error Handling

Errors are a fact of life in software, so Rust has a number of features for
handling situations in which something goes wrong. In many cases, Rust requires
you to acknowledge the possibility of an error and take some action before your
code will compile. This requirement makes your program more robust by ensuring
that you’ll discover errors and handle them appropriately before deploying your
code to production!

Rust groups errors into two major categories: recoverable and unrecoverable
errors. For a _recoverable error_, such as a _file not found_ error, we most
likely just want to report the problem to the user and retry the operation.
_Unrecoverable errors_ are always symptoms of bugs, such as trying to access a
location beyond the end of an array, and so we want to immediately stop the
program.

Most languages don’t distinguish between these two kinds of errors and handle
both in the same way, using mechanisms such as exceptions. Rust doesn’t have
exceptions. Instead, it has the type `Result<T, E>` for recoverable errors and
the `panic!` macro that stops execution when the program encounters an
unrecoverable error. This chapter covers calling `panic!` first and then talks
about returning `Result<T, E>` values. Additionally, we’ll explore
considerations when deciding whether to try to recover from an error or to stop
execution.
