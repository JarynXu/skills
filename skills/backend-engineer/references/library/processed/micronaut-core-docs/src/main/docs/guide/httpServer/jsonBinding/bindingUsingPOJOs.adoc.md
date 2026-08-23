> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/jsonBinding/bindingUsingPOJOs.adoc`  
> Upstream Git blob: `8abd54d69f124877267f0450424bd53ee4341a98`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

Note however you can just as easily write:

snippet::io.micronaut.docs.server.json.PersonController[tags="class,regular,endclass", indent=0, title="Binding JSON POJOs"]

The Micronaut framework only executes your method once the data has been read in a non-blocking manner.

TIP: You can customize the output in various ways, such as using https://github.com/FasterXML/jackson-annotations/wiki/Jackson-Annotations[Jackson annotations].
