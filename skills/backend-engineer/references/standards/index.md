# Backend standards lookup index

Use this file as a dictionary entry point. Apply rules in this order unless the project explicitly establishes another hierarchy:

```text
project and repository instructions
> accepted architecture and product contracts
> configured language/framework/tool rules
> adopted organization standards
> official ecosystem guidance
> general guidance in this skill
```

A standard does not authorize unrelated cleanup. Apply it to new or changed code and to existing code only within an authorized remediation scope.

## Offline-first lookup

Use the bundled [offline reference library](../library/INDEX.md) before going to the network when an applicable source is installed locally. The library preserves pinned source revisions and supports both complete reading and dictionary-style lookup.

```bash
python scripts/offline_library.py list
python scripts/offline_library.py search "query" --source <source-id>
python scripts/offline_library.py read <source-id>/<path>
python scripts/offline_library.py verify
```

For a current project rule, the project still outranks an older bundled manual. A byte-exact mirror proves source integrity, not present-day applicability. Inspect each source's `SOURCE.json` before treating its contents as current or complete.

## Lookup map

| Question | Read or inspect |
|---|---|
| Naming, formatting, comments, file layout | project formatter/linter; language section in `technologies/languages-and-frameworks.md`; bundled coding-standard source selected by project language |
| Java coding rules | local `alibaba-p3c` and Google Java material when installed; project rules remain authoritative |
| Error and exception handling | `contracts-and-integration.md`, runtime language guidance, project error model, applicable local standard |
| Nullability, ownership, lifetime, resources | selected language/runtime guidance |
| API and event compatibility | `contracts-and-integration.md` and bundled protocol/API standards when present |
| Domain layers and DDD | `domain-and-architecture.md`; restricted books are not reproduced without permission |
| SQL, transactions, migrations, indexes | `data-and-consistency.md`; applicable local database rules |
| Cache, queue, search, workflow | `technologies/middleware.md` |
| Timeout, retry, idempotency, resilience | `distributed-reliability.md` |
| Authentication, authorization, validation, secrets | `security-and-privacy.md`; local OWASP material when installed |
| Test type and evidence | `testing-and-quality.md` and local quality/testing sources when installed |
| Logs, metrics, traces, health | `observability-and-operations.md` |
| Profiling and debugging | `performance-and-diagnostics.md` |

## Coding-rule categories

When creating or reviewing a rule, make it executable by stating:

- condition and scope;
- constrained object or behavior;
- reason or failure prevented;
- preferred mechanism and allowed exceptions;
- automated enforcement when reliable;
- review or runtime evidence when not mechanically decidable.

Avoid stylistic rules that fight the project's formatter. Avoid portability rules when the product intentionally targets one runtime. Preserve generated code boundaries and fix generators or templates rather than hand-editing generated outputs.

## Learn versus lookup

For one question, use the lookup map and local search. For a new ecosystem or broad review, read `complete-learning-path.md`, then select only the applicable local source and technology section. Do not load every language or framework merely to show breadth.

When a local source has its own table of contents, use that native ordering for complete learning. Do not replace an original manual with a flattened agent summary when the agent explicitly needs to learn the source.

## Contributing a source-derived rule

Before adding exact or adapted external text, read `sources.md`. Record source owner, title, exact version or commit, canonical location, license, inclusion mode, modifications, attribution, and update procedure. Keep differently licensed material distinguishable from this repository's MIT-authored guidance.

For vendored originals, also add or update `references/library/originals/<source-id>/SOURCE.json` and make `python scripts/offline_library.py verify` pass. Never label a source `byte_exact` unless its local Git blob SHA equals the pinned upstream blob SHA.
