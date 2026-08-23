> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/config.adoc`  
> Upstream Git blob: `7999fac82da143e0f16be8d135afb9f02b5abae0`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

Micronaut features a flexible configuration mechanism that allows reading configuration from a variety of sources into a unified model that can be bound to Java types annotated with <<configurationProperties, @ConfigurationProperties>>.

Configuration can by default be provided in Java properties files or https://www.json.org/json-en.html[JSON] with the ability to add support for more formats (such as YAML or Groovy configuration) by adding additional third-party libraries to your classpath. The convention is to search for a file named `application.properties` or `application.json` with support for other formats requiring additional dependencies as described by the following table:

.Supported Configuration Formats
|===
|Format|File|Dependency Required

| https://yaml.org[YAML]
|`application.yml`
|`org.yaml:snakeyaml`

| https://micronaut-projects.github.io/micronaut-groovy/latest/guide/#config[Groovy Config]
|`application.groovy`
|`io.micronaut.groovy:micronaut-runtime-groovy`

|https://github.com/lightbend/config/blob/main/HOCON.md[HOCON]
|`application.conf`
|`io.micronaut.kotlin:micronaut-kotlin-runtime`

|https://toml.io/en/[TOML]
|`application.toml`
|`io.micronaut.toml:micronaut-toml`

|===


In addition, Micronaut framework allows overriding any property via system properties or environment variables.

Each source of configuration is modeled with the [PropertySource]({api}/io/micronaut/context/env/PropertySource.html) interface and the mechanism is extensible, allowing the implementation of additional [PropertySourceLoader]({api}/io/micronaut/context/env/PropertySourceLoader.html) implementations.

Micronaut also supports in-file configuration imports via `micronaut.config.import`, which allows one configuration source to load additional sources recursively.
See <<propertySource,Property Sources>> for protocol-specific syntax (`file`, `classpath`, `env`, `configtree`) and optional import behavior.
