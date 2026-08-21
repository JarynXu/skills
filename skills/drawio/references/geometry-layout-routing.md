# Geometry, layout, text, and routing

## Choose a semantic layout

Use spatial arrangement to encode meaning: left-to-right for pipelines and request flows, top-down for hierarchy/state progression, lanes for responsibility, nested containers for boundaries, grids for comparable peers. Do not let an automatic layout destroy meaningful containment or an explicitly requested position.

Start with a spacing scale instead of unrelated numbers. Typical node gaps are 24–48 px inside a group and 60–120 px between major regions. Leave room for labels and connector bends.

## Fit text before shrinking fonts

Estimate whether the label can fit the node. Prefer, in order: widen the node, wrap text, increase height, shorten redundant wording, then reduce font size. CJK characters are approximately one em wide; mixed technical labels often need more width than Latin-only estimates. Render when exact glyph metrics matter.

## Route connectors

Architecture, flowcharts, network, and deployment diagrams usually use `orthogonalEdgeStyle`; UML sequence messages are normally straight; ERDs use entity-relation routing; informal maps may use curves.

The built-in router has limited obstacle awareness. For sparse layouts, simple routing is sufficient. When a path would cross unrelated nodes, adjust placement or use explicit waypoints. Preserve user-positioned geometry rather than applying a global layout merely to clean one edge.

Use connection-point overrides only with specific intent. Prefer perimeter attachment and ports for stable interfaces.

## Dense diagrams

Reduce crossings by grouping related nodes, exposing a hub/gateway, separating logical views into pages/layers, or moving secondary detail into node text. More edges are not more truth if the diagram becomes unreadable.

## Deterministic helper layouts

The bundled CLI provides `horizontal`, `vertical`, and `grid` presets for simple peer sets. They intentionally do not pretend to solve semantic architecture layout. Use them when the graph has no stronger spatial meaning.

## Collision evidence

Static bounding boxes can detect obvious node overlap but cannot prove text fit, marker bounds, curves, shadows, custom icons, or renderer-specific glyphs. Render and inspect pixels before claiming visual correctness.