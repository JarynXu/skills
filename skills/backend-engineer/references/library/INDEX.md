# Backend Engineering Library

This library is the offline teaching and reference layer for `backend-engineer`. It is not a dump of links and it is not a single coding-standard bundle. Its job is to help an agent build a correct backend-engineering mental model, then retrieve exact guidance without rereading everything.

## Start here

Choose one mode:

- **Learn the discipline:** read [`curriculum/README.md`](curriculum/README.md), then follow the applicable language and systems tracks.
- **Learn one language well:** read [`curriculum/languages.md`](curriculum/languages.md); for Go, use the detailed [`curriculum/go.md`](curriculum/go.md) track.
- **Solve a backend problem:** read [`curriculum/systems.md`](curriculum/systems.md), then search the local originals for the relevant standard or guide.
- **Understand important books or standards we cannot redistribute:** read [`curriculum/restricted-canon.md`](curriculum/restricted-canon.md).
- **Inspect why a source is here and how it is maintained:** read [`curriculum/source-selection.md`](curriculum/source-selection.md) and `SOURCES.json`.

## Teaching model

The library distinguishes five kinds of material:

1. **Canonical standard/specification** — defines language, protocol, or verification semantics. Read when correctness depends on exact meaning.
2. **Canonical practice** — official or ecosystem-owner guidance for writing idiomatic, maintainable code.
3. **Conceptual canon** — compact principles that shape judgment but do not replace specifications.
4. **Practice guide** — mature organizational/community experience, useful after the fundamentals are understood.
5. **Restricted canon** — important works that an expert should know but that are not mirrored because redistribution rights do not permit it or are unclear.

A famous document is not automatically current truth. For example, **Effective Go is foundational but explicitly predates generics and modules**, so the Go track pairs it with the current language specification, memory model, Google Go decisions/best practices, and modern engineering guidance.

## Offline originals

Redistributable source material lives under:

```text
originals/<source-id>/
├── SOURCE.json
└── <byte-exact upstream files>
```

`SOURCE.json` records the resolved upstream commit, source repository, license, teaching tier, tracks, upstream Git blob SHA, and local Git blob SHA. Generated extracts such as searchable text derived from a PDF are marked as derived rather than byte-exact originals.

The canonical source list is [`SOURCES.json`](SOURCES.json). The sync process resolves moving refs to immutable commits and verifies downloaded bytes against upstream Git blob identifiers before accepting them.

## Offline commands

From `skills/backend-engineer/`:

```bash
python scripts/offline_library.py list
python scripts/offline_library.py search "memory model"
python scripts/offline_library.py search "idempotency" --source openapi-specification
python scripts/offline_library.py read go-official-guides/_content/doc/effective_go.html --lines 1:160
python scripts/offline_library.py verify
```

Search first when the agent already understands the subject. Follow the curriculum when the agent lacks the mental model or when several sources appear to disagree.

## Authority order during real project work

The library teaches defaults; it does not override the project being changed. Apply guidance in this order:

```text
project/repository instructions and configured tools
> accepted product and architecture contracts
> applicable language/protocol specification
> official framework/tool documentation for the installed version
> adopted organization conventions
> mature industry practice in this library
> generic skill defaults
```

When a source conflicts with a newer specification or the real project's configured version, investigate the conflict instead of applying a rule mechanically.
