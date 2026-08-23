# Complete backend learning path

Use this route when the agent lacks a broad backend mental model or must take ownership of an unfamiliar backend discipline. For a focused task, use the routes in `SKILL.md` instead.

This path has two complementary layers:

- the skill-authored references teach **how to reason and act** as a backend owner;
- `library/` teaches **the underlying language, protocol, database, security, testing, framework, and production canon** from pinned original sources.

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

11. Read `library/curriculum/README.md` to understand the teaching tiers and learning sequence.
12. Read the active language track in `library/curriculum/languages.md`; follow a detailed track where one exists (`go.md`, `kotlin.md`, `rust.md`) instead of learning from style rules alone.
13. Read `library/curriculum/systems.md` for HTTP/API semantics, data/transactions, distributed failure, security verification, testing, observability, and production operation.
14. Read only the applicable local originals. Use `python scripts/offline_library.py search ...` when a dictionary lookup is sufficient; read a complete source when the curriculum marks it as foundational.
15. Read `library/curriculum/restricted-canon.md` to recognize influential books/standards that are intentionally not copied into the open repository. Obtain authorized copies only when deeper study is needed.

## Phase 3 — Specialize in the project stack

16. Read `library/curriculum/frameworks.md` to learn the common questions that must be answered for lifecycle, dependency/configuration, concurrency, transactions, protocol behavior, security, testing, and production operation.
17. Read only the applicable sections of `technologies/languages-and-frameworks.md` and `technologies/middleware.md`.
18. Read the installed framework/database/broker/runtime documentation selected by project evidence and version. The offline library provides durable fundamentals and curated canonical product material; it does not pretend to mirror every version of every framework.
19. Use `standards/index.md` for recurring lookup and `standards/sources.md` before adding or updating external guidance.

## Return to the real project

After learning, return to the repository being changed. Inspect its local rules, versions, configured tools, tests, deployment, telemetry and runtime evidence, because general knowledge never overrides observed project authority or version-specific behavior.

A completed learning pass should make the agent able to explain **why** a rule applies, whether it is semantic or stylistic, what source has authority, what evidence proves the behavior, and what would make the recommendation change.
