> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/serverConfiguration/nettyClientPipeline.adoc`  
> Upstream Git blob: `8b94ac90a4c9018498c7dd9129363c829e290189`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

You can customize the Netty client pipeline by writing a <<events, Bean Event Listener>> that listens for the creation of a api:http.client.netty.NettyClientCustomizer.Registry[].

The api:http.netty.channel.ChannelPipelineCustomizer[] interface defines constants for the names of the various handlers that the Micronaut framework registers.

As an example the following code sample demonstrates registering the https://github.com/zalando/logbook[Logbook] library which includes additional Netty handlers to perform request and response logging:

snippet::io.micronaut.docs.netty.LogbookNettyClientCustomizer[tags="imports,class", indent=0, title="Customizing the Netty server pipeline for Logbook"]

<1> `LogbookNettyClientCustomizer` listens for a api:http.client.netty.NettyClientCustomizer.Registry[] and requires the definition of a `Logbook` bean
<2> The root customizer is initialized without a channel and registered
<3> The actual customizer implements api:http.client.netty.NettyClientCustomizer[]
<4> When a new channel is created, a new, specialized customizer is created for that channel
<5> When the client signals that the stream pipeline has been fully constructed, the logbook handler is registered
