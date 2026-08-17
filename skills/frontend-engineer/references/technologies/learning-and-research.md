# Technology learning and research

Use research to close a concrete implementation uncertainty. Do not load broad tutorials into context when the project already fixes the stack and only one behavior is unknown.

## Start from the installed reality

Determine the actual technology and version from:

- Package manifests, workspace declarations, and lockfiles.
- Installed package metadata and type declarations when available.
- Framework, compiler, bundler, lint, test, and deployment configuration.
- Imports and representative working code.
- Active migrations or compatibility layers documented by the project.

Do not assume the newest documentation matches the repository. Do not assume old-looking syntax is obsolete until the configured version and migration state are known.

## Identify the missing mental model

Before searching, state the decision that is blocked and the smallest fact that can resolve it. For an unfamiliar technology, learn these dimensions first:

| Dimension | Question |
|---|---|
| Execution | When and where does this code run? |
| Ownership | Which boundary owns data, state, effects, and cleanup? |
| Updates | What causes recomputation or rendering, and what is captured? |
| Identity | How are instances preserved, replaced, keyed, or cached? |
| Contracts | Which inputs are checked statically, at build time, or at runtime? |
| Failure | How are errors, cancellation, concurrency, and unavailable capabilities represented? |
| Escape hatches | Which APIs bypass the normal model, and what invariant must the caller preserve? |

Syntax becomes reliable only after these relationships are understood.

## Use evidence in order

Prefer:

1. Project configuration, local contracts, and working project examples.
2. Current official documentation for the detected version.
3. Official specifications, release notes, migration guides, RFCs, and maintainers' explanations.
4. Authoritative library documentation for integrated dependencies.
5. Well-supported community consensus for practices the official docs intentionally leave open.
6. Focused experiments or source inspection when documentation is ambiguous.

Community patterns are evidence of practical tradeoffs, not automatic rules. Evaluate them against the project's version, rendering mode, scale, team conventions, accessibility, and deployment constraints.

## Research narrowly

1. Reproduce or isolate the uncertain behavior if possible.
2. Search official sources using the exact version and concept.
3. Compare the result with project code and configuration.
4. Build a minimal experiment or focused test when interpretation remains ambiguous.
5. Apply the result at the owning boundary.
6. Verify it in the real project environment.
7. Stop when the implementation decision is supported and remaining uncertainty cannot change it.

Browse again when an API is unfamiliar, version-sensitive, deprecated, security-relevant, host-specific, or contradicted by local behavior. Do not rely on remembered signatures for those cases.

## Turn knowledge into practice

For each relevant rule, connect four layers:

- **Semantic fact:** what the language or framework guarantees.
- **Project constraint:** how this repository configures and structures it.
- **Engineering consequence:** which ownership, failure, or maintenance problem the rule prevents.
- **Verification:** how the project can prove the behavior.

This keeps “best practice” from becoming a copied folder layout or style preference detached from its purpose.

## Keep notes at the right lifetime

- **Task-local notes:** temporary hypotheses, links, experiments, and commands. Discard or summarize at handoff.
- **Project knowledge:** stable facts about versions, conventions, decisions, traps, and verification. Record them in the project's existing documentation, decision, or knowledge mechanism when future work needs them.
- **Reusable skill knowledge:** technology-independent or broadly validated lessons. Add these only after repeated evidence shows they are not one project's accidental convention.

Never promote a project quirk into the global skill automatically. Do not create a permanent development diary when the repository has no need for one.
