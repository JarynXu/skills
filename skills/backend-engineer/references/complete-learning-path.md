# Complete backend learning path

Use this route when the agent lacks a broad backend mental model or must take ownership of an unfamiliar backend discipline. For a focused task, use the routes in `SKILL.md` instead.

This path has two complementary layers:

- the skill-authored references teach **how to reason and act** as a backend owner;
- `library/` teaches **the underlying language, protocol, database, security, testing, framework, and production canon** from pinned sources and agent-ready Markdown.

## Phase 1 — Learn the role and decision model

1. Read `core/project-orientation.md` to learn how project truth and runtime evidence are established.
2. Read `core/engineering-model.md` to understand behavior slicing, responsibility allocation, authority, and completion.
3. Read `practices/domain-and-architecture.md` for domain policy, modularity, DDD, clean/hexagonal boundaries, and service decomposition.
4. Read `practices/contracts-and-integration.md` for public semantics, errors, idempotency, compatibility, events, and third-party boundaries.
5. Read `practices/data-and-consistency.md` for authority, modeling, transactions, migrations, indexes, caches, replicas, and lifecycle.
6. Read `practices/distributed-reliability.md` for remote failure, queues, asynchronous workflows, backpressure, and recovery.
7. Read `practices/security-and-privacy.md` before designing externally reachable or sensitive behavior.
8. Read `practices/testing-and-quality.md` to select evidence at unit, component, integration, contract, migration, performance, and resilience levels.
9. Read `practices/observability-and-operations.md` so implementation is deployable, diagnosable, and supportable.
10. Read `practices/performance-and-diagnostics.md` for measurement, profiling, debugging, and controlled optimization.

## Phase 2 — Learn the canon behind the role

11. Read `library/curriculum/README.md` to understand teaching tiers, authority, preprocessing, and learning order.
12. Read the active language track in `library/curriculum/languages.md`, then follow the detailed language file for Go, Java/JVM, Kotlin, Python, C#/.NET, Node.js/TypeScript, Rust, or C/C++. Do not learn a language from a style guide alone.
13. Read `library/curriculum/systems.md` for HTTP/API/RPC semantics, data/transactions, distributed failure, security verification, testing, observability, and production operation.
14. Read `library/curriculum/frameworks.md` before specializing in Spring, Django/FastAPI, ASP.NET Core, Node frameworks, Rust web stacks, or other application frameworks.
15. Use the **processed Markdown layer** for ordinary study and lookup. Run `python scripts/offline_library.py search ...` or `read ...`; use `--originals` / `--original` only when exact upstream bytes, attribution, or normative provenance matters.
16. Read a complete canonical source when the curriculum marks it as foundational; use dictionary-style search when the mental model is already established.
17. Read `library/curriculum/restricted-canon.md` to recognize influential books and formal standards that are intentionally not copied into the open repository. Obtain authorized copies only when deeper study is needed.

## Phase 3 — Specialize in the project stack

18. Read only the applicable sections of `technologies/languages-and-frameworks.md` and `technologies/middleware.md`.
19. Search the bundled framework/database/broker/runtime source pack selected by project evidence and version. The library deliberately curates high-value chapters instead of mirroring every page of every product site.
20. Use `standards/index.md` for recurring lookup and `standards/sources.md` before adding or updating external guidance.

## Return to the real project

After learning, return to the repository being changed. Inspect its local rules, versions, configured tools, tests, deployment, telemetry and runtime evidence, because general knowledge never overrides observed project authority or version-specific behavior.

A completed learning pass should make the agent able to explain **why** a rule applies, whether it is semantic, framework-specific, organizational, or stylistic, what source has authority, what evidence proves the behavior, and what would make the recommendation change.
