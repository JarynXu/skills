# Backend engineering curriculum

Use this curriculum when the agent needs to **learn** rather than look up one rule. It deliberately separates exact semantics, durable mental models, ecosystem practice, framework behavior, and production evidence.

## Learning outcomes

A senior backend engineer should be able to move from a business requirement to a production-safe implementation while reasoning about:

- language/runtime semantics, ownership and idioms;
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

Inspect the actual repository, runtime and framework versions, configured formatter/linter/compiler, tests, schema tools, deployment descriptors, telemetry and production evidence. Generic guidance is a fallback, not a license to rewrite project conventions.

### Stage 1 — Language and runtime fluency

Choose the active language track in [`languages.md`](languages.md). Detailed tracks currently cover:

- [Go](go.md)
- [Java/JVM](java-jvm.md)
- [Kotlin](kotlin.md)
- [Python](python.md)
- [C#/.NET](csharp-dotnet.md)
- [Node.js/TypeScript](node-typescript.md)
- [Rust](rust.md)
- [C/C++](c-cpp.md)

The minimum sequence is always:

1. language/runtime specification or official semantics;
2. memory/concurrency/resource model;
3. official/ecosystem-owner idioms;
4. mature API/style practice;
5. framework behavior;
6. testing and diagnostics.

Do not learn a language from a style guide alone.

### Stage 2 — Backend system fundamentals

Use [`systems.md`](systems.md) to learn cross-language responsibilities that dominate production correctness:

1. contracts and HTTP/API/RPC semantics;
2. data, transactions, migrations, indexes and consistency;
3. distributed failure and asynchronous workflows;
4. security and verification;
5. testing and release evidence;
6. observability, diagnostics and performance.

### Stage 3 — Framework and middleware specialization

Use [`frameworks.md`](frameworks.md) after the fundamentals. Learn the actual framework used by the project, then only the middleware participating in current behavior. Framework and middleware documentation is a **specialization layer**, not a substitute for understanding transactions, HTTP, concurrency or failure semantics.

### Stage 4 — Production judgment

Practice diagnosis and change safety: establish baselines, form competing hypotheses, inspect traces/profiles/query plans/thread or task state, stage migrations, define rollback, and prove recovery. An engineer who only knows how to create code but cannot explain production behavior has not completed the backend curriculum.

## Reading tiers

| Tier | How to use it |
|---|---|
| `canonical-standard` | Read exact clauses when behavior or compliance depends on them. |
| `canonical` / `canonical-practice` | Learn early; revisit when designing APIs or libraries. |
| `advanced-canon` | Read only after prerequisites; use for unsafe, low-level or specialist work. |
| `conceptual-canon` | Internalize as heuristics, then test against concrete requirements. |
| `practice-guide` | Use after fundamentals; compare recommendations with local constraints. |
| `foundational-classic` | Learn the historical model and its limits; pair with current practice. |
| `restricted-canon` | Know the ideas and source; obtain the work separately when deep study is required. |

## Originals versus teaching material

The source files in `../originals/` preserve provenance. Normal learning/search uses generated Markdown in `../processed/`. Read [`preprocessing.md`](preprocessing.md) for the rule that PDF, HTML, RST, SGML/XML and similar inputs must be preprocessed during synchronization rather than left for every Agent to clean again.

## How to reconcile disagreement

When two sources disagree, ask in order:

1. Are they governing the same scope and version?
2. Is one normative while the other is a style preference?
3. Is one intentionally organization-specific?
4. Is the older source missing language/runtime features introduced later?
5. What does the consuming project's formatter, analyzer, framework, contract or runtime evidence require?

Preserve the reason for deviations from a normative requirement or an adopted project rule. Do not argue about cosmetic style when automated tooling already settles it.

## Curriculum maintenance

A new source belongs in this library only if it closes a real learning or reference gap. Every proposed source should answer:

- What capability does an agent gain from reading it?
- Is it authoritative, canonical, or merely popular?
- What other source corrects its blind spots or age?
- Is the exact version redistributable?
- Should an agent read it end-to-end or use it as a dictionary?
- What processed Markdown form makes it agent-ready?
- How will we detect and review upstream change?

The source selection rules are formalized in [`source-selection.md`](source-selection.md). Important non-redistributable books and formal standards are mapped in [`restricted-canon.md`](restricted-canon.md) instead of being copied illegally.
