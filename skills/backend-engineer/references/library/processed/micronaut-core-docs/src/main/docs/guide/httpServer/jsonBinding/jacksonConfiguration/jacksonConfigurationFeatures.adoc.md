> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/jsonBinding/jacksonConfiguration/jacksonConfigurationFeatures.adoc`  
> Upstream Git blob: `092ad71578024d70591d886da7d351be60184cfb`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

If you use <<jsonBinding, `micronaut-jackson-databind`>>, all Jackson's features can be configured with their name as the key and a boolean to indicate enabled or disabled. Please check the configuration reference for the property names.

Example:

[configuration]
```
jackson:
  serialization-features:
    indentOutput: true
    writeDatesAsTimestamps: false
  deserialization-features:
    useBigIntegerForInts: true
    failOnUnknownProperties: false
```
