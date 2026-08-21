---
name: drawio
description: Create, edit, repair, inspect, validate, lay out, route, and export native editable diagrams.net/draw.io `.drawio` files. Use for architecture diagrams, flowcharts, swimlanes, state machines, UML, ERDs, network or cloud topology, dependency graphs, wireframes, product flows, multi-page diagrams, or any task that requires editable draw.io nodes, containers, layers, labels, metadata, and connectors rather than a flattened image.
---

# draw.io

Treat `.drawio` as the source artifact. PNG, SVG, PDF, JPG, HTML, and browser URLs are optional derivatives or viewing mechanisms; never replace or delete the native source merely because an export succeeds.

## Preserve the native artifact contract

- Author real `mxfile` / `mxGraphModel` XML with native vertices, edges, layers, containers, labels, and geometry. A full-page raster image inside one image cell is not an editable diagram.
- Use native XML as the primary representation. Write XML directly when that is clear and efficient; use the bundled Python library for repeated structures, deterministic generation, compression, inspection, safe patches, semantic diff, simple layout, or export wrapping. The helper library wraps native concepts and must not become a second source format.
- Use unique stable IDs. Keep new files uncompressed by default so humans and Git can inspect them. When editing, preserve the existing page order, compression mode, unknown attributes, unknown elements, custom shapes, and unrelated content unless the requested change requires otherwise.
- Keep labels in the user's language. Escape XML correctly; use real line breaks or escaped HTML with `html=1`, not literal `\n`.
- Keep connectors attached through `source` and `target`. Every edge requires `<mxGeometry relative="1" as="geometry"/>`. Use waypoints or connection-point overrides only for a geometric reason.
- Do not use image generation to imitate a draw.io result. Do not claim an exported image is editable merely because it depicts the same content.

## Select the operation before changing the file

- **Create:** derive the semantic graph, diagram pattern, reading direction, hierarchy, containers, nodes, relationships, and visual semantics before assigning geometry.
- **Edit:** inspect the existing file, identify the exact page/layer/cell owner, apply the smallest coherent change, and use semantic diff to prove unrelated content stayed stable.
- **Repair:** distinguish container/codec, XML, reference, geometry, resource, renderer-environment, and visual-composition failures; repair the nearest causal layer.
- **Validate:** separate structural, layout-heuristic, render, visual, and edit-scope evidence. One layer never proves the others.
- **Export:** use the same conversion engine as preview rendering, choose parameters from the requested delivery contract, and retain the `.drawio` source.

## Execute the core workflow

1. Inspect the request and any existing artifact. Record intended audience, required content, diagram type, language, reading direction, editability, pages/layers, visual conventions, and requested derivatives.
2. Load only the relevant guidance below. Do not read the whole library for a routine task.
3. Model the semantic structure first. Prefer meaningful system boundaries, actors, states, entities, phases, or responsibility lanes over decorative grouping. Reduce crossing relationships with hubs, interfaces, or multiple pages when that better communicates the truth.
4. Select a visual style independently from the diagram pattern. Preserve an existing file or project style during edits; follow an explicit user or brand system; otherwise use `technical-clean`. Read [styles/style-system.md](references/styles/style-system.md) and only the selected profile. Visual style may not alter diagram semantics.
5. Author or patch native XML. Use direct XML for precise work and the bundled helper for repetitive structures. Use raw XML as the escape hatch for features the helper does not model explicitly.
6. Run structural validation before rendering:

   ```bash
   python scripts/drawio.py validate output.drawio --strict
   ```

7. Evaluate obvious layout risks from the source and semantic structure; treat static geometry as evidence only for what it can prove.
8. When pixels are needed to judge text fit, clipping, glyphs, routing, hierarchy, or composition, render a preview through the shared exporter. Select resolution, page, and scale according to the detail being inspected; a small preview is only a cost-saving suggestion, never a fixed ceiling.
9. Open and inspect the rendered result. Increase resolution or narrow the inspected scope whenever the current pixels cannot support a reliable judgment. Re-run all affected evidence layers after each source edit.
10. For edits, compare before and after semantically. A translation-only task should not silently rebuild IDs, geometry, styles, pages, or layers:

   ```bash
   python scripts/drawio.py diff before.drawio after.drawio
   ```

11. Deliver the `.drawio` source and only the derivatives the user requested. State `NOT VERIFIED` for any unavailable render or visual evidence; do not infer it from XML parsing.

## Load task-specific guidance

- Read [xml-model.md](references/xml-model.md) when the file model, compressed pages, wrappers, parent-child coordinates, layers, or edge geometry are unfamiliar or material to the task.
- Read [xml-authoring.md](references/xml-authoring.md) when creating native XML directly or using the bundled helper.
- Read [geometry-layout-routing.md](references/geometry-layout-routing.md) for placement, text fit, containers, ports, connector routing, collision repair, dense diagrams, or automatic layout.
- Read [styles/style-system.md](references/styles/style-system.md) when selecting, preserving, extending, or applying a reusable visual style. Read only the chosen profile; use `technical-clean` by default, `monochrome` for print-safe output, and `presentation` for low-density slide communication.
- Read [editing-and-repair.md](references/editing-and-repair.md) before modifying or repairing an existing `.drawio` file.
- Read [advanced-structures.md](references/advanced-structures.md) for multiple pages, layers, groups, nested containers, swimlanes, tables, ports, edge labels, tags, metadata, placeholders, or hyperlinks.
- Read [resources-and-security.md](references/resources-and-security.md) for images, data URIs, external references, custom shapes, stencils, links, or potentially active content.
- Read [verification.md](references/verification.md) before declaring a diagram complete.
- Read [export.md](references/export.md) only when rendering pixels for inspection or creating a requested PNG, SVG, PDF, JPG, XML, or HTML derivative.
- Read [interoperability.md](references/interoperability.md) when importing Mermaid, CSV, VSDX, another diagram format, or generating an app.diagrams.net URL.

Select one or more diagram patterns by observable need:

- [architecture](references/patterns/architecture.md)
- [flowchart and swimlane](references/patterns/flowchart-and-swimlane.md)
- [state machine](references/patterns/state-machine.md)
- [UML](references/patterns/uml.md)
- [ERD and data model](references/patterns/erd-and-data-model.md)
- [network and cloud](references/patterns/network-and-cloud.md)
- [dependency and topology](references/patterns/dependency-and-topology.md)
- [wireframe and product flow](references/patterns/wireframe-and-product-flow.md)

For uncommon native properties, shapes, style keys, XML structures, or schema details not resolved by the working guides, consult the reference books in [references/library/](references/library/) rather than guessing.

## Use the bundled native tooling

Run commands from this skill directory. The core package uses only the Python standard library and is installed with the skill.

```bash
# Inspect bundled native style profiles
python scripts/drawio.py styles --json
python scripts/drawio.py styles --profile technical-clean --token node.service --json

# Minimal native source
python scripts/drawio.py scaffold diagram.drawio --page "Architecture"

# Inspect a file without loading raw XML into the whole context
python scripts/drawio.py inspect diagram.drawio --json
python scripts/drawio.py inspect diagram.drawio --find-label "SIP Core"

# Compression round trip
python scripts/drawio.py unpack input.drawio -o readable.drawio
python scripts/drawio.py pack readable.drawio -o compact.drawio

# Explicit safe editing and semantic review
python scripts/drawio.py patch before.drawio patch.json -o after.drawio
python scripts/drawio.py diff before.drawio after.drawio

# Simple deterministic peer layout; semantic architecture layout remains the agent's responsibility
python scripts/drawio.py layout diagram.drawio -o laid-out.drawio --preset horizontal

# Evidence and derivatives; draw.io Desktop is required only here
python scripts/drawio.py preview diagram.drawio --width 3000
python scripts/drawio.py export diagram.drawio -o diagram.svg --format svg
```

The Python API remains a thin native XML helper:

```python
import sys
sys.path.insert(0, "scripts")
from drawio_lib import new, add_vertex, add_edge, save, style

root, pages = new("System")
model = pages[0][1]
add_vertex(model, "api", "API", 100, 100, 180, 70, style("node.service"))
add_vertex(model, "db", "Database", 420, 100, 140, 80, style("node.data"))
add_edge(model, "api-db", "api", "db", "reads / writes", style("edge.data"))
save(root, pages, "system.drawio", "uncompressed")
```

Use direct XML whenever it is more expressive. Do not convert a working native construct into helper-library abstractions merely for consistency.

## Stop on invalid or insufficient evidence

- Do not deliver a source file with structural validation errors.
- Do not call a diagram visually verified when no renderer was available or the rendered resolution was insufficient to inspect the relevant detail.
- Do not replace a valid file because draw.io Desktop is absent; creation, parsing, editing, compression, inspection, diff, and structural checks do not require Desktop.
- Do not perform an unrelated redesign during a narrow edit.

## Completion standard

The task is complete only when the requested semantics are represented by native editable objects; the source is structurally valid; material layout risks were evaluated; required visual evidence was actually inspected; requested derivatives were verified as nonempty outputs; and an edit changed only the authorized scope. Preserve explicit uncertainty where external fonts, custom libraries, renderer versions, or unavailable applications prevent full verification.
