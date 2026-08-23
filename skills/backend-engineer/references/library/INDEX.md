# Backend Engineering Library

This library is the offline teaching and reference layer for `backend-engineer`. It is not a dump of links and it is not a single coding-standard bundle. Its job is to help an agent build a correct backend-engineering mental model, then retrieve exact guidance without rereading everything.

## Start here

Choose one mode:

- **Learn the discipline:** read [`curriculum/README.md`](curriculum/README.md), then follow the applicable language, systems, and framework tracks.
- **Learn one language well:** read [`curriculum/languages.md`](curriculum/languages.md). Detailed tracks exist for [Go](curriculum/go.md), [Java/JVM](curriculum/java-jvm.md), [Kotlin](curriculum/kotlin.md), [Python](curriculum/python.md), [C#/.NET](curriculum/csharp-dotnet.md), [Node.js/TypeScript](curriculum/node-typescript.md), [Rust](curriculum/rust.md), and [C/C++](curriculum/c-cpp.md).
- **Learn framework behavior:** read [`curriculum/frameworks.md`](curriculum/frameworks.md), then load only the official framework material selected by the real project stack.
- **Solve a backend problem:** read [`curriculum/systems.md`](curriculum/systems.md), then search the local processed Markdown for the relevant standard or guide.
- **Understand important books or standards we cannot redistribute:** read [`curriculum/restricted-canon.md`](curriculum/restricted-canon.md).
- **Understand why a source is here:** read [`curriculum/source-selection.md`](curriculum/source-selection.md) and the catalogs in `SOURCES.json` plus `sources.d/`.
- **Understand how raw manuals become agent-ready:** read [`curriculum/preprocessing.md`](curriculum/preprocessing.md).

## Teaching model

The library distinguishes five kinds of material:

1. **Canonical standard/specification** — defines language, protocol, or verification semantics. Read when correctness depends on exact meaning.
2. **Canonical practice** — official or ecosystem-owner guidance for writing idiomatic, maintainable code.
3. **Conceptual canon** — compact principles that shape judgment but do not replace specifications.
4. **Practice guide** — mature organizational/community experience, useful after the fundamentals are understood.
5. **Restricted canon** — important works that an expert should know but that are not mirrored because redistribution rights do not permit it or are unclear.

A famous document is not automatically current truth. For example, **Effective Go is foundational but explicitly predates generics and modules**, so the Go track pairs it with the current language specification, memory model, Google Go decisions/best practices, and modern engineering guidance.

## Two offline layers

Redistributable material is stored twice for different reasons:

```text
originals/<source-id>/
├── SOURCE.json
└── <byte-exact upstream files>

processed/<source-id>/
└── <agent-ready Markdown derived from the originals>
```

`originals/` is the provenance and audit layer. `SOURCE.json` records the resolved upstream commit, source repository, license, teaching tier, tracks, upstream Git blob SHA, local Git blob SHA, and processing map.

`processed/` is the normal runtime layer. HTML, RST, SGML/XML, AsciiDoc, plain text and PDF material is converted to Markdown during synchronization. PDF output retains page boundaries. Every generated Markdown file carries its source commit, path, original blob SHA, and transform name.

The skill must not make an Agent repeatedly clean HTML or extract a PDF during ordinary backend work. `offline_library.py verify` rejects processable source documents that lack Markdown derivatives.

## Offline commands

From `skills/backend-engineer/`:

```bash
python scripts/offline_library.py list
python scripts/offline_library.py search "memory model"
python scripts/offline_library.py search "idempotency" --source openapi-specification
python scripts/offline_library.py read go-official-guides/_content/doc/effective_go.html --start 1 --end 160
python scripts/offline_library.py verify
```

`search` and `read` use **processed Markdown by default**. `read` automatically tries the generated `.md` form for an HTML/PDF/RST/SGML path. Use exact originals only when necessary:

```bash
python scripts/offline_library.py search "MUST" --source http-core-rfc911x --originals
python scripts/offline_library.py read go-language/doc/go_mem.html --original --start 1 --end 80
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
