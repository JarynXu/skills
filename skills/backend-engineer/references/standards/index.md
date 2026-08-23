# Backend standards lookup index

Use this file as a dictionary entry point. Apply rules in this order unless the project explicitly establishes another hierarchy:

```text
project and repository instructions
> accepted architecture and product contracts
> language/protocol/runtime semantics
> configured framework/tool rules
> adopted organization standards
> official ecosystem guidance
> general guidance in this skill
```

A standard does not authorize unrelated cleanup. Apply it to new or changed code and to existing code only within an authorized remediation scope.

## Offline-first lookup

Use the bundled [offline teaching library](../library/INDEX.md) before going to the network when an applicable source is installed locally. Normal `search` and `read` operate on **agent-ready processed Markdown**, not raw PDF/HTML/RST/SGML. Exact originals remain available only when provenance, licensing, or normative-byte inspection is needed.

```bash
python scripts/offline_library.py list
python scripts/offline_library.py search "query" --source <source-id>
python scripts/offline_library.py read <source-id>/<original-path>
python scripts/offline_library.py search "MUST" --source <source-id> --originals
python scripts/offline_library.py verify
```

The curriculum decides what should be learned and in what order. Use `../library/curriculum/README.md` when the agent lacks the mental model; use this index and `offline_library.py search` when the agent already understands the subject and needs an exact lookup.

For a current project rule, the project still outranks an older bundled manual. A verified mirror proves source integrity, not present-day applicability. Inspect source provenance/version when age or compatibility matters.

## Lookup map

| Question | Read or inspect |
|---|---|
| Language semantics, memory model, ownership | detailed language track under `../library/curriculum/`; bundled canonical source where redistributable |
| Naming, formatting, comments, file layout | project formatter/linter first; applicable official/organization guide second |
| Java/JVM engineering | `curriculum/java-jvm.md`; P3C, Google Java, Spring sources as applicable |
| Go engineering | `curriculum/go.md`; Go spec/memory model, Effective Go, Proverbs, Google/Uber guidance |
| Kotlin engineering | `curriculum/kotlin.md`; Kotlin spec and official conventions |
| Python engineering | `curriculum/python.md`; CPython reference/runtime, PEPs, Django/FastAPI sources |
| C#/.NET engineering | `curriculum/csharp-dotnet.md`; C# standard, .NET conventions, ASP.NET Core sources |
| Node.js/TypeScript | `curriculum/node-typescript.md`; Node runtime docs and curated production practice |
| Rust engineering | `curriculum/rust.md`; Rust Book, Reference, API Guidelines and Nomicon |
| C/C++ engineering | `curriculum/c-cpp.md`; project standard/compiler/ABI plus authorized formal standard when required |
| Error and exception handling | `contracts-and-integration.md`, runtime guidance, project error model |
| API and event compatibility | `contracts-and-integration.md`; HTTP/OpenAPI/gRPC sources |
| Domain layers and DDD | `domain-and-architecture.md`; restricted books are mapped, not reproduced |
| SQL, transactions, migrations, indexes | `data-and-consistency.md`; PostgreSQL and applicable database sources |
| Cache, queue, search, workflow | `technologies/middleware.md`; Redis/Kafka/product sources when relevant |
| Timeout, retry, idempotency, resilience | `distributed-reliability.md`; protocol/framework guarantees |
| Authentication, authorization, validation, secrets | `security-and-privacy.md`; OWASP ASVS/Cheat Sheets |
| Test type and evidence | `testing-and-quality.md`; Pact/framework test guidance as applicable |
| Logs, metrics, traces, health | `observability-and-operations.md`; OpenTelemetry specification |
| Profiling and debugging | `performance-and-diagnostics.md`; language/runtime diagnostic sources |

## Coding-rule categories

When creating or reviewing a rule, make it executable by stating:

- condition and scope;
- constrained object or behavior;
- reason or failure prevented;
- preferred mechanism and allowed exceptions;
- automated enforcement when reliable;
- review or runtime evidence when not mechanically decidable.

Avoid stylistic rules that fight the project's formatter. Avoid portability rules when the product intentionally targets one runtime. Preserve generated-code boundaries and fix generators/templates rather than hand-editing generated outputs.

## Learn versus lookup

For one question, use the lookup map and processed-library search. For a new ecosystem or broad review, read `../complete-learning-path.md` and the applicable detailed language/system/framework curriculum. Do not load every language or framework merely to show breadth.

When a source has a meaningful native learning order, preserve that order in the curriculum. The processed Markdown layer is a usability transform, not a license to flatten a book/specification into disconnected snippets.

## Contributing a source-derived rule

Before adding exact or adapted external text, read `sources.md` plus `../library/curriculum/source-selection.md` and `../library/curriculum/preprocessing.md`. Record source owner, title, exact version/commit, canonical location, license, inclusion mode, modifications, attribution, update procedure, and expected processed representation.

For vendored sources, both the original evidence and processed Markdown must pass `python scripts/offline_library.py verify`. Never label a source `byte_exact` unless its local Git blob SHA equals the pinned upstream blob SHA. Never label a PDF/HTML/etc. `agent_ready` merely because the original file exists.
