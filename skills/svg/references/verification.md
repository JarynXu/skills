# Verification

## Separate the evidence

Use three distinct checks:

1. **Structural validation:** prove XML, document, value, reference, and resource invariants that can be determined from source.
2. **Render validation:** prove that an available renderer can produce a nonempty PNG from the artifact.
3. **Visual inspection:** judge text fit, collisions, clipping, routing, hierarchy, contrast, glyphs, and composition from rendered pixels.

Never substitute one category for another.

## Run preflight

From the skill directory, validate without writing output:

```bash
python scripts/svg_preflight.py output.svg --strict
```

Render to an explicit output path:

```bash
python scripts/svg_preflight.py output.svg --render output.png --strict
```

The default `auto` renderer selects the first usable backend in this order: Inkscape, CairoSVG, then a Chromium-family browser. Select one explicitly when reproducing a renderer-specific result:

```bash
python scripts/svg_preflight.py output.svg --render output.png --renderer inkscape --strict
python scripts/svg_preflight.py output.svg --render output.png --renderer cairosvg --strict
python scripts/svg_preflight.py output.svg --render output.png --renderer browser --strict
```

Treat a missing executable, Python package, native library, or browser as an environment failure. Do not rewrite valid SVG merely because the selected renderer is unavailable. The preflight command must report the backend it actually used.

Preflight applies the same canvas safety limit before starting any backend: no side may exceed 16,384 pixels and the canvas may not exceed 32,000,000 pixels. For a larger requested deliverable, choose an explicit scaled preview or split the artifact instead of allocating an unbounded bitmap.

## Inspect the PNG

Open the generated image at its native dimensions and check:

- all required content is present and readable;
- text is complete, aligned, and clear of borders, icons, and paths;
- peer spacing and alignment are consistent;
- connectors use the intended anchors and avoid unrelated nodes and labels;
- arrowheads point correctly and are not clipped;
- strokes, filters, masks, and clips have the intended bounds;
- no visible content is unintentionally cut off or pressed against the canvas edge;
- no glyphs, images, or paint servers are missing;
- contrast and visual hierarchy match the meaning;
- no unexpected black boxes, fallback symbols, or transparent output appears.

Use a second independent renderer for complex filters, masks, text baselines, embedded images, or compatibility-sensitive delivery. Differences between renderers are evidence to investigate, not a reason to choose the more flattering output silently.

## Interpret failures

- Fix XML, document, unsafe-resource, duplicate-ID, missing-reference, invalid-size, and malformed-geometry errors in the SVG.
- Resolve warnings before final delivery or document the intentional exception; `--strict` treats warnings as failures.
- Fix renderer availability in the environment when the command cannot start a backend.
- Fix visual composition after inspecting pixels, even when static validation passes.

After a repair, rerun all affected layers. A source edit invalidates prior render and visual evidence; a renderer change invalidates prior visual evidence for that backend.
