> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/config/environments.adoc`  
> Upstream Git blob: `4c2d7a7792c4c680aa30004fba0afe2a20f2f3d6`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

The application environment is modelled by the api:context.env.Environment[] interface, which allows specifying one or many unique environment names when creating an api:context.ApplicationContext[].

snippet::io.micronaut.docs.context.env.EnvironmentSpec[tags="env",indent=0,title="Initializing the Environment"]

The active environment names allow loading different configuration files depending on the environment, and also using the ann:context.annotation.Requires[] annotation to conditionally load beans or bean ann:context.annotation.Configuration[] packages.

In addition, the Micronaut framework attempts to detect the current environments. For example within a Spock or JUnit test the api:context.env.Environment#TEST[] environment is automatically active.

Additional active environments can be specified using the `micronaut.environments` system property or the `MICRONAUT_ENVIRONMENTS` environment variable. These are specified as a comma-separated list. For example:

.Specifying environments
```bash
$ java -Dmicronaut.environments=foo,bar -jar myapp.jar
```

The above activates environments called `foo` and `bar`.

It is also possible to enable the detection of the Cloud environment the application is deployed to (this feature is disabled by default since Micronaut framework 4). See the section on <<cloudConfiguration,Cloud Configuration>> for more information.
