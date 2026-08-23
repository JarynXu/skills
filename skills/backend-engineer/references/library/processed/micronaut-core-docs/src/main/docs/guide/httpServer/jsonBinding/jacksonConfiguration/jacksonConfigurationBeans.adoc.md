> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/jsonBinding/jacksonConfiguration/jacksonConfigurationBeans.adoc`  
> Upstream Git blob: `5f128cb12ecf69043ab34f4c0e6434e7518d083d`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

If you use <<jsonBinding, `micronaut-jackson-databind`>>, in addition to configuration, beans can be registered to customize Jackson. All beans that extend any of the following classes are registered with the object mapper:

* [Module]({jackson-databind}com/fasterxml/jackson/databind/Module.html)
* [JsonDeserializer]({jackson-databind}com/fasterxml/jackson/databind/JsonDeserializer.html)
* [JsonSerializer]({jackson-databind}com/fasterxml/jackson/databind/JsonSerializer.html)
* [KeyDeserializer]({jackson-databind}com/fasterxml/jackson/databind/KeyDeserializer.html)
* [BeanDeserializerModifier]({jackson-databind}com/fasterxml/jackson/databind/deser/BeanDeserializerModifier.html)
* [BeanSerializerModifier]({jackson-databind}com/fasterxml/jackson/databind/ser/BeanSerializerModifier.html)
