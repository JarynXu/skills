# Verification

Use independent evidence layers.

1. **Structural:** XML parses; pages decode; required root/layer cells exist; IDs and parent/source/target references resolve; vertices and edges have valid geometry.
2. **Layout heuristic:** obvious overlap, excessive density, near-edge placement, long labels, and suspicious routing are risks, not proof of visual failure.
3. **Render:** a compatible draw.io renderer produces a stable nonempty derivative.
4. **Visual:** inspect the rendered pixels for text fit, clipping, glyphs, hierarchy, alignment, edge/node collisions, arrows, contrast, and unwanted marks.
5. **Edit scope:** semantic diff shows only authorized changes.

Run structural validation before delivery:

```bash
python scripts/drawio.py validate output.drawio --strict
```

When visual evidence is necessary, render at a resolution sufficient for the property under inspection. If text or fine routes cannot be judged, increase resolution or focus the page/region. Do not count a low-resolution glance as verification.

If draw.io Desktop is unavailable, structural and edit-scope evidence may still pass, but render and visual evidence remain `NOT VERIFIED`. Do not rewrite valid XML to compensate for an environment limitation.