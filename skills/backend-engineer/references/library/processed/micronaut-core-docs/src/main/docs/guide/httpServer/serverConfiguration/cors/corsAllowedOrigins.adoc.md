> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/serverConfiguration/cors/corsAllowedOrigins.adoc`  
> Upstream Git blob: `f9cb137d8e486dd015e528067716bae9438c1ffa`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

Don't define `allowed-origins` or `allowed-origins-regex` to allow any origin for a given configuration.

For multiple valid origins, set the `allowed-origins` key of the configuration to a list of strings.

You can also define via `allowed-origins-regex` a regular expression (`^http(|s)://www\.google\.com$`). The Regular expression is passed to [Pattern#compile]({jdkapi}/java.base/java/util/regex/Pattern.html#compile-java.lang.String-) and compared to the request origin with [Matcher#matches]({jdkapi}/java.base/java/util/regex/Matcher.html#matches--).

.Example CORS Configuration
[configuration]
```
micronaut:
  server:
    cors:
      enabled: true
      configurations:
        web:
          allowed-origins-regex: '^http(|s):\/\/www\.google\.com$'
          allowed-origins:
            - http://foo.com
```

WARNING: Use the `allowed-origins-regex` configuration judiciously. You may accidentally make an insecure configuration which could be targeted by an attacker registering domains targeting the regular expression.

NOTE: `allowed-origins-regex` and `allowed-origins` can be combined. However, if using the former and the latter is not set explicitly then `allowed-origins` defaults to _none_ rather than _any_ to avoid unexpected allowed origins.
