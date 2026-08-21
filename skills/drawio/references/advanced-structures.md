# Advanced native structures

Use advanced structures only when they carry meaning.

## Pages and layers

Each `<diagram>` is a page. Use pages for distinct views or levels of detail, not as accidental overflow. Additional layers are `mxCell` elements with `parent="0"`; `visible="0"` hides a layer by default. Layers are useful for annotations, migration overlays, security zones, optional flows, and physical/logical variants.

## Containers and swimlanes

Invisible groups use `group;`. Titled containers commonly use `swimlane;startSize=...;container=1;`. Children reference the container as parent and use relative coordinates. Nested containers can model Region → VPC → Zone → Workload. Cross-container edges generally use the shared layer.

Use flat swimlanes for one responsibility axis. For actor × phase, use draw.io's native table/tableRow structure so the two dimensions remain explicit.

## Ports

Ports are small relative vertices inside a parent. Connect edges to the port ID when interface position/type is semantically important. Avoid ports for ordinary generic boxes.

## Tags, metadata, placeholders, links

Tags and custom metadata live on `object`/`UserObject` wrappers. `placeholders="1"` enables values such as `%owner%` in labels. Use this only when downstream consumers, filtering, navigation, or data-driven diagrams benefit. Do not invent metadata merely because the format permits it.

## Rich labels and tables

HTML labels can contain basic formatting and tables but must be XML-escaped and use `html=1`. Prefer simple labels when possible; rich labels increase renderer sensitivity.

See the library reference books for exact syntax, alternate bounds, stencils, edge labels, and less common properties.