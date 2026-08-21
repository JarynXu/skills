# Interoperability

The canonical editable artifact remains native `.drawio` XML.

## Mermaid and text formats

Mermaid, CSV, Graphviz, or structured data can be useful inputs, but conversion must end in native editable graph objects when the user asks for draw.io. Do not embed one large SVG/image cell and call it equivalent editability.

## Visio and other diagram formats

When importing VSDX or another rich diagram format, preserve semantics and unknown features where possible. Import may not round-trip every proprietary behavior. Validate the resulting native graph rather than assuming format conversion is lossless.

## Browser URL

An app.diagrams.net URL can be a convenient viewing/editing handle but is not a durable source repository. Retain the `.drawio` file. Very large diagrams can exceed URL limits.

## Exported XML

Some tools accept raw `mxGraphModel` while normal source files use `mxfile` with pages. Wrap/unwrap deliberately and preserve page semantics when converting.