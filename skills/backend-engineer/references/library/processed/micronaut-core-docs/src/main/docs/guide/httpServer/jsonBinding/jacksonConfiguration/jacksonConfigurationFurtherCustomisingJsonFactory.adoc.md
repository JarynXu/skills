> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/jsonBinding/jacksonConfiguration/jacksonConfigurationFurtherCustomisingJsonFactory.adoc`  
> Upstream Git blob: `21282d2c02974aef017616ed2a4acd7e60ac33e3`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

If you use <<jsonBinding, `micronaut-jackson-databind`>>, there may be situations where you wish to customise the `JsonFactory` used by the `ObjectMapper` beyond the configuration of features (for example to allow custom character escaping).
This can be achieved by providing your own `JsonFactory` bean, or by providing a `BeanCreatedEventListener<JsonFactory>` which configures the default bean on startup.
