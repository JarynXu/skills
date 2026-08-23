> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/config/environments/disablingEnvironmentDetection.adoc`  
> Upstream Git blob: `21fd83295b23480c5e7a8e98b0cef20d1ad2bbbd`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

Automatic detection of environments can be disabled by setting the `micronaut.env.deduction` system property or the `MICRONAUT_ENV_DEDUCTION` environment variable to `false`. This prevents the Micronaut framework from detecting current environments, while still using any environments that are specifically provided as shown above.

.Disabling environment detection via system property
```bash
$  java -Dmicronaut.env.deduction=false -jar myapp.jar
```

Alternatively, you can disable environment deduction using the api:context.ApplicationContextBuilder[] `deduceEnvironment` method when setting up your application.

snippet::io.micronaut.docs.context.env.DefaultEnvironmentSpec[tags="disableEnvDeduction",indent=0,title="Using ApplicationContextBuilder to disable environment deduction"]
