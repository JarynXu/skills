> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/jsonBinding/jacksonConfiguration.adoc`  
> Upstream Git blob: `03c473812a9d6f11a230403031ba1dc9bc35f8dc`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

If you use <<jsonBinding, `micronaut-jackson-databind`>>, the Jackson `ObjectMapper` can be configured through configuration with the api:io.micronaut.jackson.JacksonConfiguration[] class. This section is specific to the Jackson implementation; for application code that should remain portable across Micronaut JSON implementations, prefer depending on api:json.JsonMapper[].

All Jackson configuration keys start with `jackson`.

|=======
| dateFormat | String | The date format
| locale     | String | Uses [Locale.forLanguageTag]({jdkapi}/java.base/java/util/Locale.html#forLanguageTag-java.lang.String-). Example: `en-US`
| timeZone   | String |Uses [TimeZone.getTimeZone]({jdkapi}/java.base/java/util/TimeZone.html#getTimeZone-java.lang.String-). Example: `PST`
| serializationInclusion | String | One of [JsonInclude.Include]({jackson-annotations}com/fasterxml/jackson/annotation/JsonInclude.Include.html). Example: `ALWAYS`
| propertyNamingStrategy | String | Name of an instance of [PropertyNamingStrategy]({jackson-databind}com/fasterxml/jackson/databind/PropertyNamingStrategy.html). Example: `SNAKE_CASE`
| defaultTyping          | String | The global defaultTyping for polymorphic type handling from enum [ObjectMapper.DefaultTyping]({jackson-databind}com/fasterxml/jackson/databind/ObjectMapper.DefaultTyping.html). Example: `NON_FINAL`
|=======

Example:

[configuration]
```
jackson:
  serializationInclusion: ALWAYS
```
