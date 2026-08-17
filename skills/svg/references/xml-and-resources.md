# XML and resources

## Contents

- [Build a standalone document](#build-a-standalone-document)
- [Encode text safely](#encode-text-safely)
- [Own IDs and references](#own-ids-and-references)
- [Keep resources self-contained](#keep-resources-self-contained)
- [Preserve accessibility](#preserve-accessibility)
- [Optimize without changing meaning](#optimize-without-changing-meaning)

## Build a standalone document

Start with an XML-safe SVG root:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 1200 700"
     width="1200"
     height="700"
     role="img"
     aria-labelledby="svg-title svg-desc">
  <title id="svg-title">图形标题</title>
  <desc id="svg-desc">图形说明</desc>
  <defs>...</defs>
  ...
</svg>
```

Add `xmlns:xlink` only when an existing compatibility target requires `xlink:href`; prefer `href` otherwise. Quote every attribute, close every element, and keep Markdown fences outside the file.

Avoid document types and XML processing instructions that load resources. Keep elements in the SVG namespace. Treat scripts, event attributes, SMIL animation elements, and `foreignObject` as dynamic or HTML execution surfaces rather than ordinary drawing primitives. The strict preflight certifies a static artifact; animation requires a separate delivery and verification contract.

## Encode text safely

XML predefines only these named entities:

```text
&amp;  &lt;  &gt;  &quot;  &apos;
```

Write ordinary symbols directly as UTF-8. Use numeric character references only when they express a character that must be preserved. Do not use `&nbsp;`, `&ensp;`, `&emsp;`, `&copy;`, or other HTML entities.

Escape a literal ampersand such as `R&D` as `R&amp;D`. Do not use tabs, repeated spaces, non-breaking spaces, or numeric spacing characters to position content; use SVG coordinates and text anchors.

## Own IDs and references

Keep each `id` unique and stable within the document. Resolve every local fragment used by `href`, `url(#id)`, paint servers, clips, masks, filters, markers, and ARIA IDREF attributes. Do not use `xml:base`: it can silently rebind a fragment-looking reference to another document.

Define reusable resources once in `<defs>` and reference them locally:

```xml
fill="url(#panel-gradient)"
filter="url(#shadow)"
marker-end="url(#arrow)"
clip-path="url(#card-clip)"
href="#database-icon"
```

Treat CSS declarations in `<style>` and `style` attributes as part of the same reference graph. A missing CSS `url(#id)` is not less important than a missing presentation attribute reference. SVG `<style>` elements remain active even when nested under `<metadata>` and must still be inspected.

## Keep resources self-contained

Classify every URI-bearing value by ownership:

- `#local-id` and `url(#local-id)` are internal references and must resolve.
- `data:...` is embedded content and increases the artifact's size and review surface.
- relative paths, absolute paths, protocol-relative URLs, and scheme URLs are external dependencies.

Reject external dependencies for a standalone artifact, including:

```xml
<image href="asset.png"/>
<image href="https://example.com/image.png"/>
<use href="other.svg#icon"/>
<style>@import url("theme.css");</style>
<rect fill="url(https://example.com/paint.svg#gradient)"/>
```

Do not define `@font-face`, including `src: local(...)`: it makes glyph selection and metrics depend on resources outside the artifact. Use a system-font fallback list and verify the rendered text instead.

Embed a user-provided bitmap as a data URI only when embedding is required. Preserve its media type, avoid silently recompressing it, and disclose the resulting size increase. The strict preflight decodes PNG, JPEG, GIF, WebP, and AVIF payloads up to 5 MB and accepts only a matching, valid, single-frame image within the pixel limit. It rejects nested `image/svg+xml` because that document can contain its own scripts and external dependencies. Do not fetch or embed a remote resource merely to make validation pass.

## Preserve accessibility

For an informative standalone graphic, provide at least a concise `<title>`. Add `<desc>` when the relationships or meaning are not captured by the title. If `aria-labelledby` or `aria-describedby` is present, ensure every referenced ID exists.

For a deliberately decorative artifact, use `aria-hidden="true"` and omit redundant accessible text. Do not mark meaningful content decorative to silence a warning.

Keep visible text as text unless the delivery contract requires paths. If converting text to paths, preserve an accessible title or description and recognize that search, selection, localization, and editability are lost.

## Optimize without changing meaning

Establish a rendered baseline before optimization. Then remove only content whose ownership and effect are understood:

- unused definitions and unreachable IDs;
- editor metadata not required by the delivery target;
- redundant groups or transforms after composing them safely;
- duplicate style declarations that have the same cascade result;
- excessive numeric precision beyond the visual tolerance.

Do not collapse semantic IDs, accessible text, or reusable definitions solely to reduce bytes. Do not rewrite paths or transforms when equivalence has not been rendered and compared. Re-run structural and visual verification after every optimization pass.
