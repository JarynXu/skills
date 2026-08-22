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

## Lookup map

| Question | Read or inspect |
|---|---|
| Naming, formatting, comments, file layout | project formatter/linter; language section in `technologies/languages-and-frameworks.md`; source registry |
| Error and exception handling | `contracts-and-integration.md`, runtime language guidance, project error model |
| Nullability, ownership, lifetime, resources | selected language/runtime guidance |
| API and event compatibility | `contracts-and-integration.md` |
| Domain layers and DDD | `domain-and-architecture.md` |
| SQL, transactions, migrations, indexes | `data-and-consistency.md` |
| Cache, queue, search, workflow | `technologies/middleware.md` |
| Timeout, retry, idempotency, resilience | `distributed-reliability.md` |
| Authentication, authorization, validation, secrets | `security-and-privacy.md` |
| Test type and evidence | `testing-and-quality.md` |
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

For one question, follow the lookup map and inspect project configuration. For a new ecosystem or broad review, read `complete-learning-path.md` and the selected technology section. Do not load every language or framework merely to show breadth.

## Contributing a source-derived rule

Before adding exact or adapted external text, read `sources.md`. Record source owner, title, exact version or commit, canonical location, license, inclusion mode, modifications, attribution, and update procedure. Keep differently licensed material distinguishable from this repository's MIT-authored guidance.
