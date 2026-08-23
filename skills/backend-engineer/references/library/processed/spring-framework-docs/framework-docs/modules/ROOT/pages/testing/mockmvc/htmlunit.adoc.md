> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/mockmvc/htmlunit.adoc`  
> Upstream Git blob: `652e29da658234c28f3381925f623f17d5311ab6`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mockmvc-server-htmlunit]]
# HtmlUnit Integration

Spring provides integration between [MockMvc](testing/mockmvc/overview.adoc) and
https://htmlunit.sourceforge.io/[HtmlUnit]. This simplifies performing end-to-end testing
when using HTML-based views. This integration lets you:

* Easily test HTML pages by using tools such as
  https://htmlunit.sourceforge.io/[HtmlUnit],
  https://www.seleniumhq.org[WebDriver], and
  https://www.gebish.org/manual/current/#spock-junit-testng[Geb] without the need to
  deploy to a Servlet container.
* Test JavaScript within pages.
* Optionally, test using mock services to speed up testing.
* Share logic between in-container end-to-end tests and out-of-container integration tests.

NOTE: MockMvc works with templating technologies that do not rely on a Servlet Container
(for example, Thymeleaf, FreeMarker, and others), but it does not work with JSPs, since
they rely on the Servlet container.
