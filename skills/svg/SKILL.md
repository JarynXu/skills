---
name: svg
description: Create, edit, repair, validate, and optimize standalone SVG files with explicit geometry, safe XML and resource handling, and parse-render-visual verification. Use when Codex must produce or change an `.svg` file; diagnose SVG XML, reference, layout, text, accessibility, or rendering defects; improve SVG portability or size; or create SVG icons, diagrams, flowcharts, architecture graphics, infographics, logos, and illustrations. Do not trigger merely because unrelated source code contains an inline SVG that does not need inspection or modification.
---

# SVG

Produce a portable SVG artifact, not merely XML-shaped text. Keep geometry explicit, resources self-contained, and validation evidence separate from visual judgment.

## Preserve the artifact contract

- Emit one complete `<svg>` document with the SVG namespace, a finite positive `viewBox`, and positive `width` and `height`.
- Use the `viewBox` as the layout coordinate system. Keep the root size consistent with it unless the requested delivery size intentionally differs.
- Keep every `id` unique and every local reference resolvable.
- Use UTF-8 text. Escape bare `&`, `<`, and attribute delimiters; never use HTML-only named entities such as `&nbsp;` or `&ensp;`.
- Reject non-finite geometry, malformed path data, empty required coordinates, and accidental Markdown fences.
- Keep the default artifact static and standalone. Do not add scripts, event handlers, SMIL animation elements, `foreignObject`, external stylesheets, external fonts, or external image and paint-server references. Treat animated, interactive, or host-page-dependent graphics as a different delivery contract.
- Treat embedded `data:` resources as part of the artifact. Under the default contract, embed only required static raster images with known provenance; nested SVG and other active media are not opaque-safe resources.
- Preserve an existing `viewBox`, IDs, semantics, and unaffected content during edits unless the requested change requires otherwise.
- Parse, render, and inspect the result before delivery. Static checks do not prove that the composition is visually correct.

## Select the operation

- **Create:** derive canvas, reading order, bounding boxes, anchors, and text regions before writing elements.
- **Edit:** parse first, identify the smallest stable target, and change only the owning component or definition.
- **Repair:** separate XML, resource, geometry, renderer-environment, and visual-composition failures before changing the file.
- **Validate:** report structural evidence and visual findings separately; do not infer one from the other.
- **Optimize:** preserve rendering and semantics while removing only demonstrably redundant content.

## Load task-specific guidance

- Read [layout-and-text.md](references/layout-and-text.md) for diagrams, text-heavy graphics, connectors, collision handling, or layout repair.
- Read [xml-and-resources.md](references/xml-and-resources.md) for entities, namespaces, IDs, `href`, CSS, embedded resources, accessibility, compatibility, or optimization.
- Read [verification.md](references/verification.md) before validating or delivering any SVG.
- Use [layout-plan.md](examples/layout-plan.md) when a coordinate table will reduce layout ambiguity.
- Use [good-diagram.svg](examples/good-diagram.svg) as a compact standalone diagram example; do not copy its dimensions or style unless they fit the task.

## Execute the work

1. Inspect the request and any existing artifact. Record the intended use, aspect ratio, required content, reading order, style constraints, and renderer targets.
2. Model the canvas and major bounding boxes. Choose one primary layout system and derive anchors from geometry rather than visual guesses.
3. Implement the smallest coherent SVG structure. Draw backgrounds and connectors before foreground nodes and text.
4. Run strict preflight from the skill directory:

```bash
python scripts/svg_preflight.py output.svg --strict
```

5. Render a PNG with an available backend:

```bash
python scripts/svg_preflight.py output.svg --render output.png --strict
```

Use `--renderer inkscape`, `--renderer cairosvg`, or `--renderer browser` only when selecting a backend explicitly. `auto` chooses the first usable backend and reports the one actually used.

6. Open the PNG and inspect text, clipping, overlap, alignment, connector routing, contrast, missing glyphs, and unintended marks. For complex or compatibility-sensitive work, render with a second independent backend.
7. Iterate until structural checks and visual inspection both pass. Deliver the SVG and any requested preview without Markdown fences inside the artifact.

## Stop on invalid evidence

- Do not deliver if preflight reports an error.
- Do not call validation complete when no renderer is available; report the environment limitation and preserve the distinction from an SVG defect.
- Do not claim collision freedom, text fit, or visual balance from source inspection alone.
- Do not suppress a warning merely to make `--strict` pass. Resolve it or explain why the artifact intentionally violates the default contract.
