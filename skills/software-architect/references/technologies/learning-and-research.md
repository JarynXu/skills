# Technology Learning and Research

A software architect needs broad technical fluency and the discipline to learn the project's exact technologies before applying generic experience. Load detailed knowledge only when the current system or decision requires it.

## Discover the real stack first

Derive the project's technologies and versions from authoritative local evidence such as manifests, lockfiles, build configuration, deployment definitions, generated metadata, and runtime output. Documentation is useful, but verify claims that can drift.

For each architecture-significant technology, identify:

- why it exists in this system and which capability it owns;
- the version, configuration, extensions, and deployment mode in use;
- where its authoritative data and control boundaries lie;
- which teams operate it and which external services it depends on;
- which architectural decisions or constraints explain its use.

## Learn the mental model, not only the syntax

Seek answers to the questions that govern correct use:

- What is the unit of composition and where does authority live?
- What lifecycle creates, mutates, persists, and destroys state?
- What is synchronous, asynchronous, cached, replicated, or eventually consistent?
- How are concurrency, ordering, transactions, retries, and idempotency expressed?
- How does the technology fail, recover, scale, and expose health?
- Which extension points are intended, and which uses fight the design?
- What security and trust assumptions does it make?
- Which guarantees are contractual, configurable, or merely incidental?

Relate these answers to system drivers before recommending a pattern.

## Research with a stopping question

State the uncertainty and the decision it blocks. Consult the smallest set of sources needed to resolve it, preferring:

1. current official documentation, specifications, and release or support policies;
2. project source and maintainers' primary material;
3. reproducible local experiments and measurements;
4. reputable operational experience relevant to the same version and context.

Search current sources for version behavior, compatibility, deprecations, security, licensing, lifecycle, and cloud-service limits. Do not rely on remembered defaults when the answer can change.

Stop when the decision criteria can be evaluated with stated confidence. More reading is not a substitute for a missing experiment or stakeholder decision.

## Keep learning notes separate from architecture decisions

Capture durable project-specific findings close to the project's knowledge system when they will help later work: non-obvious semantics, verified limitations, operational traps, and links to exact sources. Mark version and verification date where staleness matters.

Do not turn generic tutorials, copied documentation, browsing history, or personal scratch notes into canonical architecture. Promote only conclusions that are relevant, verified, and maintained; record consequential choices through the project's decision mechanism.
