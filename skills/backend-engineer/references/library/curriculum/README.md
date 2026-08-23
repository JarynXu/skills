# Backend engineering curriculum

Use this curriculum when the agent needs to **learn** rather than look up one rule. It deliberately separates timeless mental models, exact standards, language idioms, and operational practice.

## Learning outcomes

A senior backend engineer should be able to move from a business requirement to a production-safe implementation while reasoning about:

- language/runtime semantics and idioms;
- domain and module boundaries;
- public API and event contracts;
- data authority, transactions, indexes, migrations, caches, and consistency;
- remote calls, asynchronous work, retries, idempotency, backpressure, and partial failure;
- authentication, authorization, validation, secrets, privacy, and abuse resistance;
- test oracles and evidence at unit, integration, contract, migration, concurrency, performance, and resilience levels;
- observability, diagnostics, resource behavior, deployment compatibility, and incident recovery.

No one book or style guide covers this whole responsibility. The curriculum therefore teaches in layers.

## Recommended order

### Stage 0 — Project truth before generic knowledge

Before applying this library, inspect the actual repository, runtime, framework versions, configured formatter/linter, tests, schema tools, deployment descriptors, and production evidence. Generic guidance is a fallback, not a license to rewrite project conventions.

### Stage 1 — Language and runtime fluency

Choose the active language track in [`languages.md`](languages.md). The minimum sequence is:

1. language/runtime specification or official semantics;
2. memory/concurrency/resource model when applicable;
3. official or ecosystem-owner idioms;
4. mature style/API guidance;
5. diagnostics and testing tools.

Do not learn a language from a style guide alone.

### Stage 2 — Backend system fundamentals

Use [`systems.md`](systems.md) to learn the cross-language responsibilities that dominate production correctness:

1. contracts and HTTP/API semantics;
2. data, transactions, migrations, and consistency;
3. distributed failure and asynchronous workflows;
4. security and verification;
5. testing and release evidence;
6. operability, diagnostics, and performance.

### Stage 3 — Framework and middleware specialization

After fundamentals, learn the framework actually used by the project: Spring Boot/Jakarta/Quarkus, ASP.NET Core, Django/FastAPI, Node/Nest/Fastify, Axum/Actix, or another stack. Then learn only the middleware participating in the current behavior: PostgreSQL/MySQL, Redis, Kafka/RabbitMQ/NATS, Elasticsearch/OpenSearch, object storage, workflow engines, and so on.

Framework and middleware documentation is a **specialization layer**, not a substitute for understanding transactions, HTTP, concurrency, or failure semantics.

### Stage 4 — Production judgment

Practice diagnosis and change safety: establish baselines, form competing hypotheses, inspect traces/profiles/query plans/thread or task state, stage migrations, define rollback, and prove recovery. An engineer who only knows how to create code but cannot explain production behavior has not completed the backend curriculum.

## Reading tiers

| Tier | How to use it |
|---|---|
| `canonical-standard` | Read exact clauses when behavior or compliance depends on them. |
| `canonical` / `canonical-practice` | Learn early; revisit when designing APIs or libraries. |
| `conceptual-canon` | Internalize as heuristics, then test against concrete requirements. |
| `practice-guide` | Use after fundamentals; compare recommendations with local constraints. |
| `foundational-classic` | Learn the historical model and its limits; pair with current practice. |
| `restricted-canon` | Know the ideas and source; obtain the work separately when deep study is required. |

## How to reconcile disagreement

When two sources disagree, ask in order:

1. Are they governing the same scope and version?
2. Is one normative while the other is a style preference?
3. Is one intentionally organization-specific?
4. Is the older source missing language/runtime features introduced later?
5. What does the consuming project's formatter, analyzer, framework, or contract require?

Preserve the reason for deviations from a normative requirement or an adopted project rule. Do not argue about cosmetic style when an automated formatter already settles it.

## Curriculum maintenance

A new source belongs in this library only if it closes a real learning or reference gap. Every proposed source should answer:

- What capability does an agent gain from reading it?
- Is it authoritative, canonical, or merely popular?
- What other source corrects its blind spots or age?
- Is the exact version redistributable?
- Should an agent read it end-to-end or use it as a dictionary?
- How will we detect and review upstream change?

The source selection rules are formalized in [`source-selection.md`](source-selection.md).
