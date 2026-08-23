> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/webmvc-view/mvc-groovymarkup.adoc`  
> Upstream Git blob: `d02af84b256ede845d10b33b932beba20a788d18`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mvc-view-groovymarkup]]
# Groovy Markup

The https://groovy-lang.org/templating.html#_the_markuptemplateengine[Groovy Markup Template Engine]
is primarily aimed at generating XML-like markup (XML, XHTML, HTML5, and others), but you can
use it to generate any text-based content. The Spring Framework has a built-in
integration for using Spring MVC with Groovy Markup.

NOTE: The Groovy Markup Template engine requires Groovy 2.3.1+.


[[mvc-view-groovymarkup-configuration]]
## Configuration

The following example shows how to configure the Groovy Markup Template Engine:

include-code::./WebConfiguration[tag=snippet,indent=0]

[[mvc-view-groovymarkup-example]]
## Example

Unlike traditional template engines, Groovy Markup relies on a DSL that uses a builder
syntax. The following example shows a sample template for an HTML page:

```groovy,indent=0,subs="verbatim,quotes"
	yieldUnescaped '<!DOCTYPE html>'
	html(lang:'en') {
		head {
			meta('http-equiv':'"Content-Type" content="text/html; charset=utf-8"')
			title('My page')
		}
		body {
			p('This is an example of HTML contents')
		}
	}
```
