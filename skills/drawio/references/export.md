# Preview and export

Preview and delivery export share one conversion engine. They differ only in intent and parameter choice.

Always retain the `.drawio` source. A PNG/SVG/PDF/JPG derivative never replaces it, even when embedded diagram XML allows reopening the derivative in draw.io.

## Preview

Preview obtains visual evidence. Use the least expensive render that still proves the property being checked; low resolution is a suggestion, not a ceiling. Increase width/height/scale when inspecting small labels, fine lines, dense connectors, or detailed icons.

```bash
python scripts/drawio.py preview diagram.drawio --width 4000
```

## Delivery export

Respect the requested format, page, size, transparency, and embedding needs:

```bash
python scripts/drawio.py export diagram.drawio -o diagram.svg --format svg --embed-diagram
python scripts/drawio.py export diagram.drawio -o diagram.png --format png --width 3200 --transparent
```

PNG is preferred to JPG for diagrams. SVG is scalable but can be font/HTML-label sensitive. PDF is page-oriented and appropriate for printing. Embedded source XML may expose metadata and hidden content.

The wrapper requires draw.io Desktop only for rendering/conversion. It verifies a stable nonempty output rather than trusting process exit alone. Set `DRAWIO_CMD` or `--drawio` if the executable is not auto-detected.