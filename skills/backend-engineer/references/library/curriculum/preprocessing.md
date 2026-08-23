# Preprocessing and agent-ready material policy

The offline library has two different responsibilities and therefore two explicit layers.

## Evidence layer: `originals/`

`originals/<source-id>/` preserves the selected upstream artifact as evidence. Files downloaded from GitHub are accepted only after their bytes reproduce the upstream Git blob SHA. Licenses, notices, PDFs, HTML, RST, SGML/XML, Markdown and other selected source files remain here in their original form.

An original is not automatically good teaching material. A PDF, documentation-site HTML page, SGML chapter, or image-heavy artifact can be legally and technically present while still being inconvenient for an agent to use.

## Teaching layer: `processed/`

`processed/<source-id>/` is the runtime-facing layer. Documents are converted during synchronization into Markdown before the skill is published.

Current deterministic transforms include:

| Original | Processed form |
|---|---|
| Markdown | normalized Markdown plus provenance header |
| HTML | navigation/script/style removed, then structure converted to Markdown |
| reStructuredText | rendered structurally and converted to Markdown |
| AsciiDoc | headings, source blocks and common links converted to Markdown |
| SGML/XML | titles, paragraphs, lists and program listings converted to Markdown |
| plain text | normalized Markdown text |
| PDF | one Markdown section per page with page numbers preserved |

Every processed file carries the source repository, resolved source commit, upstream path, upstream Git blob SHA, and transform name. It is explicitly labeled as a derivative. Exact quotations or byte-level conformance checks should return to `originals/`.

## PDF and image policy

A PDF is never considered agent-ready merely because the binary is present. The synchronization step extracts page-ordered text into Markdown and keeps page numbers so an agent can cite or return to the original page. Pages with no extractable text are recorded as processing warnings.

If the learning value of such a page depends on a diagram, screenshot, table image, scan, or other visual content that deterministic extraction cannot recover, the source is not silently treated as complete. The curriculum should either:

1. select an equivalent textual source from the same authority;
2. add a reviewed Markdown explanation of the visual while preserving provenance; or
3. mark the material as requiring visual/manual preprocessing before it becomes required curriculum.

Do not make an agent run OCR, PDF extraction, HTML cleanup, or documentation-site parsing during an ordinary backend task.

## Quality gate

`offline_library.py verify` enforces the contract:

- byte-tracked originals must exist and match their manifest SHA;
- every processable teaching document must have a Markdown derivative;
- every derivative must exist, match its own SHA, and point back to the correct upstream original blob;
- processed teaching files must be Markdown;
- a source with processable documents must be marked `agent_ready=true`.

Therefore a contribution that adds a PDF or HTML page without producing the processed Markdown layer fails CI.

## Runtime behavior

Normal agent use follows this order:

```text
curriculum decides what to learn
-> search/read processed Markdown
-> use exact original only for audit, provenance, licensing, or normative-byte checks
```

`offline_library.py search` and `read` use the processed layer by default. `--originals` / `--original` are deliberate escape hatches for exact source inspection.

## Why both layers are retained

Keeping only processed Markdown would lose evidence and make transformations difficult to audit. Keeping only originals would violate the skill's open-box goal because every agent would need to repeat document extraction and cleanup. The two-layer model provides both verifiability and immediate usability.
