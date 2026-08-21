# Resources and security

Default to self-contained native shapes and text.

## Images

Use images only when pictorial/brand fidelity is required. Prefer embedded `data:` images for portable artifacts when provenance and size are acceptable. External image URLs create network, privacy, longevity, and rendering dependencies. Never replace the entire diagram with a screenshot or generated image when editability is required.

## Stencils and domain icons

Use draw.io's native stencil libraries for AWS/Azure/GCP, Cisco, Kubernetes, BPMN, electrical, P&ID, and similar standardized domains when the symbols improve recognition. Preserve unfamiliar stencil style strings during edits rather than simplifying them to rectangles.

## Links and metadata

Treat hyperlinks, tooltips, tags, and custom metadata as potentially sensitive. Do not invent URLs or expose internal data. When exporting with embedded diagram XML, remember hidden layers, metadata, and source labels may become recoverable from the derivative.

## Active content

Do not add scripts, event handlers, or remote active content merely to make a static diagram more interactive. HTML export or external embedding is a separate delivery/security decision. Preserve existing active or unknown content during a narrow edit, but flag it when security review is relevant.