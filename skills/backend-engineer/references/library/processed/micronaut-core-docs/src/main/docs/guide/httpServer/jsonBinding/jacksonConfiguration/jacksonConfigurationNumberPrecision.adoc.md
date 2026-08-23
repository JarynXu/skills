> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/httpServer/jsonBinding/jacksonConfiguration/jacksonConfigurationNumberPrecision.adoc`  
> Upstream Git blob: `178b83a0c7437a5a185a4d29d1f8210708805f13`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

During JSON parsing, the framework may convert any incoming data to an intermediate object model. By default, this model uses `BigInteger`, `long` and `double` for numeric values. This means some information that could be represented by `BigDecimal` may be lost. For example, numbers with many decimal places that cannot be represented by `double` may be truncated, even if the target type for deserialization uses `BigDecimal`. Metadata on the number of trailing zeroes (`BigDecimal.precision()`), e.g. the difference between `0.12` and `0.120`, is also discarded.

If you need full accuracy for number types, use the following configuration:

[configuration]
```
jackson:
  deserialization:
    useBigIntegerForInts: true
    useBigDecimalForFloats: true
```
