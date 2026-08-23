> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/ioc/gracefulShutdown.adoc`  
> Upstream Git blob: `590c9d1bea599b438a1cb27e35a2ef6c4982044f`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

In some deployments, it is desirable to "gracefully" shut down an application, that is, to stop accepting new work but
to finish in-progress tasks. In the Micronaut framework, a graceful shutdown means the following:

* No new HTTP connections will be accepted
* Existing connections will serve no new requests, but in-progress requests will still be served
* Scheduled tasks will stop running, but in-progress tasks will finish uninterrupted

If the `micronaut.lifecycle.graceful-shutdown.enabled` config property is set to `true`, a graceful shutdown is
triggered automatically when the context stops (`ApplicationContext.stop()`). There is also a programmatic
api:runtime.graceful.GracefulShutdownManager[] API if you want more control over the shutdown process.

Graceful shutdown status can be read using the health management endpoint. This also returns the number of still-active
tasks (e.g. connections or running scheduled tasks).

If you want to add graceful shutdown support to your own beans, implement
api:runtime.graceful.GracefulShutdownCapable[]. You will implement a `shutdownGracefully` method that triggers shutdown
and returns a future that should complete once the graceful shutdown is complete (e.g. all clients have closed their
connection). You can also optionally implement `reportActiveTasks` to give a number of active tasks for the health
endpoint.
