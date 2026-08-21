# Native XML authoring

Create semantic structure first, then geometry and styling.

## Vertex

```xml
<mxCell id="api" value="API" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
  <mxGeometry x="100" y="120" width="180" height="70" as="geometry"/>
</mxCell>
```

## Edge

```xml
<mxCell id="api-db" value="reads" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=classic;" edge="1" parent="1" source="api" target="db">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

Never self-close an edge without its geometry. Prefer `source`/`target` attachment to floating lines.

## Labels

Use UTF-8. XML-escape `&`, `<`, `>`, and quotes in attributes. For plain multiline labels, an actual XML character reference such as `&#10;` is reliable. For partial rich formatting, use escaped HTML and `html=1`. Do not emit a literal backslash-n.

## Styles

Styles are semicolon-separated native draw.io tokens. Keep semantic peers consistent. Use the bundled style profiles when they fit, but direct `style=` strings are always allowed. If a non-rectangular shape has a specific perimeter, set it.

## Containers

Use true parent-child containment rather than merely placing a large box behind smaller boxes. Children use parent-relative coordinates. Cross-container edges generally belong to the common layer so they are not clipped.

## Determinism

Use stable semantic IDs, stable ordering, integer or simple decimal geometry, and uncompressed new files. Do not add timestamps or random IDs unless the surrounding file already requires them. Validate before rendering.