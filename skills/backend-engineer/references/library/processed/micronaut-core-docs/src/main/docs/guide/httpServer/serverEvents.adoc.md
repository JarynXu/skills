> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/serverEvents.adoc`  
> Upstream Git blob: `145c9ac993eb311c9c811ae3dacb524306ad8118`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

The HTTP server emits a number of <<events, Bean Events>>, defined in the pkg:io.micronaut.runtime.server.event[] package, that you can write listeners for. The following table summarizes these:

.Server Events
|===
|Event|Description

|api:runtime.server.event.ServerStartupEvent[]
|Emitted when the server completes startup

|api:runtime.server.event.ServerShutdownEvent[]
|Emitted when the server shuts down

|api:discovery.event.ServiceReadyEvent[]
|Emitted after all api:runtime.server.event.ServerStartupEvent[] listeners have been invoked and exposes the api:discovery.EmbeddedServerInstance[]

|api:discovery.event.ServiceStoppedEvent[]
|Emitted after all api:runtime.server.event.ServerShutdownEvent[] listeners have been invoked and exposes the api:discovery.EmbeddedServerInstance[]

|===

WARNING: Doing significant work within a listener for a api:runtime.server.event.ServerStartupEvent[] will increase startup time.

The following example defines a api:context.event.ApplicationEventListener[] that listens for api:runtime.server.event.ServerStartupEvent[]:

.Listening for Server Startup Events
```java
import io.micronaut.context.event.ApplicationEventListener;
...
@Singleton
public class StartupListener implements ApplicationEventListener<ServerStartupEvent> {
    @Override
    public void onApplicationEvent(ServerStartupEvent event) {
        // logic here
        ...
    }
}
```

Alternatively, you can also use the ann:runtime.event.annotation.EventListener[] annotation on a method of any bean that accepts `ServerStartupEvent`:

.Using `@EventListener` with `ServerStartupEvent`
```java
import io.micronaut.runtime.event.annotation.EventListener;
import io.micronaut.runtime.server.event.ServerStartupEvent;
import jakarta.inject.Singleton;
...
@Singleton
public class MyBean {

    @EventListener
    public void onStartup(ServerStartupEvent event) {
        // logic here
        ...
    }
}
```
