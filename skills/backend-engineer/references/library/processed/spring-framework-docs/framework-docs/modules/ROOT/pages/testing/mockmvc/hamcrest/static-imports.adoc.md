> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/mockmvc/hamcrest/static-imports.adoc`  
> Upstream Git blob: `a645efe2807d29ea861f956875fb40c84b86e0cb`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mockmvc-server-static-imports]]
# Static Imports

When using MockMvc directly to perform requests, you'll need static imports for:

- `MockMvcBuilders.{asterisk}`
- `MockMvcRequestBuilders.{asterisk}`
- `MockMvcResultMatchers.{asterisk}`
- `MockMvcResultHandlers.{asterisk}`

An easy way to remember that is search for `MockMvc*`. If using Eclipse be sure to also
add the above as "`favorite static members`" in the Eclipse preferences.

When using MockMvc through the [WebTestClient](testing/webtestclient.adoc) you do not need static imports.
The `WebTestClient` provides a fluent API without static imports.
