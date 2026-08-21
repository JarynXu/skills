# Native XML model

Use this when the structure of a `.drawio` file is material to the task.

## Source hierarchy

A normal file is `mxfile → diagram → mxGraphModel → root`. Each page has its own graph model. Root cell `0` is the graph root; cell `1` is the default layer. Additional layers are cells with `parent="0"`. Vertices and edges belong to a layer or container through `parent`.

```xml
<mxfile compressed="false">
  <diagram id="page-1" name="Overview">
    <mxGraphModel page="1" pageWidth="1200" pageHeight="800">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

## Cells

A vertex uses `vertex="1"` and an `mxGeometry` with x/y/width/height. An edge uses `edge="1"`, usually `source` and `target`, and always an edge geometry with `relative="1"`. IDs are unique within each page.

`object` or `UserObject` can wrap a cell and carry `id`, `label`, tags, links, tooltips, placeholders, and custom metadata. The nested `mxCell` then owns the visual definition.

## Coordinates

Top-left is `(0,0)`, x grows rightward and y downward. Children of containers use coordinates relative to the parent. Reparenting therefore changes the coordinate system. Ports and edge labels may use relative geometry.

## Compression

Uncompressed pages contain `mxGraphModel` directly. Compressed pages store URL-encoded Base64 of raw-DEFLATE-compressed model XML. Prefer uncompressed XML for new AI-generated source; when editing, preserve the existing mode unless normalization is requested.

The bundled `pack`/`unpack` commands handle the codec. Never hand-edit encoded text.

## Unknown structures

Real files may contain attributes, wrapper metadata, stencil styles, alternate bounds, or extension elements not modeled by the helper. Preserve them. Direct native XML is the escape hatch and remains authoritative.

For uncommon schema details consult `library/xml-reference.md`, `library/style-reference.md`, and `library/mxfile.xsd`.