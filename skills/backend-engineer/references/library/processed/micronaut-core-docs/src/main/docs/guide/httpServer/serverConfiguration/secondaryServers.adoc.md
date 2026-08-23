> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/serverConfiguration/secondaryServers.adoc`  
> Upstream Git blob: `15624a78719d6a69f47f3e17298fc3336957bb33`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

The Micronaut framework supports the programmatic creation of additional Netty servers through the api:http.server.netty.NettyEmbeddedServerFactory[] interface.

This is useful in cases where you, for example, need to expose distinct servers over different ports with potentially differing configurations (HTTPS, thread resources etc).

The following example demonstrates how to define a <<factories, Factory Bean>> that starts an additional server using a programmatically created configuration:

snippet::io.micronaut.docs.http.server.secondary.SecondaryNettyServer[tags="imports,class", indent=0, title="Programmatically creating Secondary servers"]

<1> Define a unique name for the server
<2> Define a ann:context.annotation.Context[] scoped bean using the server name and including `preDestroy="close"` to ensure the server is shutdown when the context is closed
<3> Inject the api:http.server.netty.NettyEmbeddedServerFactory[] into a <<factories, Factory Bean>>
<4> Programmatically create the api:http.server.netty.configuration.NettyHttpServerConfiguration[]
<5> Optionally create the api:http.ssl.ServerSslConfiguration[]
<6> Use the `build` method to build the server instance
<7> Start the server with the `start` method
<8> Return the server instance as a managed bean
<9> Optionally define an instance of api:discovery.ServiceInstanceList[] if you wish to inject <<httpClient, HTTP Clients>> by the server name

With this class in place when the api:context.ApplicationContext[] starts the server will also be started with the appropriate configuration.

Thanks to the definition of the api:discovery.ServiceInstanceList[] in step 8, you can then inject a client into your tests to test the secondary server:

snippet::io.micronaut.docs.http.server.secondary.SecondaryServerTest[tags="inject", indent="0", title="Injecting the server or client"]

<1> Use the server name to inject a client by ID
<2> Use the `@Named` annotation as a qualifier to inject the embedded server instance
