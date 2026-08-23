> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/config/environments/environmentPriority.adoc`  
> Upstream Git blob: `bd1cca10c3a06a56fb4b94b3efcfd9c347d9afec`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

The Micronaut framework loads property sources based on the environments specified, and if the same property key exists in multiple property sources specific to an environment, the environment order determines which value to use.

The Micronaut framework uses the following hierarchy for environment processing (lowest to highest priority):

* Deduced environments
* Environments from the `micronaut.environments` system property
* Environments from the `MICRONAUT_ENVIRONMENTS` environment variable
* Environments specified explicitly through the application context builder
+
NOTE: This also applies to `@MicronautTest(environments = ...)`
+
