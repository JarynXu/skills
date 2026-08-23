> **Offline teaching derivative**  
> Source: `rust-lang/reference@3b38834b39f732c64686f7c64aa29dcf3cd83ba5`  
> Upstream path: `src/whitespace.md`  
> Upstream Git blob: `9034b7fa7969bba50a2118e4d90926d72b7b3d5d`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

r[lex.whitespace]
# Whitespace

r[whitespace.syntax]
```grammar,lexer
WHITESPACE ->
      U+0009 // Horizontal tab, `'\t'`
    | U+000A // Line feed, `'\n'`
    | U+000B // Vertical tab
    | U+000C // Form feed
    | U+000D // Carriage return, `'\r'`
    | U+0020 // Space, `' '`
    | U+0085 // Next line
    | U+200E // Left-to-right mark
    | U+200F // Right-to-left mark
    | U+2028 // Line separator
    | U+2029 // Paragraph separator

TAB -> U+0009 // Horizontal tab, `'\t'`

LF -> U+000A  // Line feed, `'\n'`

CR -> U+000D  // Carriage return, `'\r'`

SP -> U+0020  // Space, `' '`
```

r[lex.whitespace.intro]
Whitespace is any non-empty string containing only characters that have the [`Pattern_White_Space`] Unicode property.

r[lex.whitespace.token-sep]
Rust is a "free-form" language, meaning that all forms of whitespace serve only to separate _tokens_ in the grammar, and have no semantic significance.

r[lex.whitespace.replacement]
A Rust program has identical meaning if each whitespace element is replaced with any other legal whitespace element, such as a single space character.

[`Pattern_White_Space`]: https://www.unicode.org/reports/tr31/
