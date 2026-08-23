> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/core/expressions/language-ref.adoc`  
> Upstream Git blob: `5cee5eac42bf8b22f300e42462e4996d12d2dfaf`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[expressions-language-ref]]
# Language Reference

Spring Expression Language (SpEL) expressions are composed of a sequence of tokens such
as literals, operators, method invocations, and so forth.

Whitespace can be used freely between tokens to format and improve the readability of
expressions. Specifically, the `\s` (space), `\t` (tab), `\r` (carriage return), and `\n`
(newline) characters are all valid separators between tokens. However, whitespace is
ignored by the expression parser unless it is part of a string literal.

The following sections describe the features and syntax of SpEL.
