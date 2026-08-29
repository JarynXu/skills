---
name: code-quality-review
description: Independently review changed code for structural complexity, ownership mistakes, abstraction quality, branching growth, maintainability, clarity, consistency, and behavior-preserving simplification. Use for deep code-quality review, maintainability review, structural review, implementation refinement, or a second-pass review after code is implemented and verified.
---

# Code Quality Review

Review code from an independent maintainer's perspective. Challenge whether the implementation has introduced accidental complexity before polishing how that complexity is expressed. Preserve intended behavior and project constraints; do not reward passing tests when the structure has clearly regressed.

## Establish the review boundary

1. Read applicable repository instructions and the project conventions that govern the changed code.
2. Identify the requested behavior, changed files, surrounding ownership boundaries, and available diff or branch baseline.
3. Distinguish review from remediation:
   - If the user asked only for review, inspect and report; do not silently edit code.
   - If remediation is explicitly requested, establish behavioral evidence before structural changes and verify again afterward.
4. Review the changed surface and the directly affected consumers or owners needed to judge it. Do not turn a scoped review into repository-wide cleanup.

Treat tests, compilation, lint, and static analysis as evidence about behavior and conformance, not as proof that the implementation is well structured.

## First challenge the structure

Ask whether the change represents the problem with the least accidental complexity compatible with the real domain and project architecture.

Look for structural signals such as:

- new modes, flags, discriminators, nullable states, or special cases that encode misplaced or accidental variability;
- condition trees or branch families repeated across files or layers;
- duplicated authority or state that must remain synchronized;
- helpers, wrappers, adapters, facades, contexts, or generic mechanisms that merely move complexity without owning a stable concept;
- transport, persistence, framework, vendor, or UI details leaking across an ownership boundary;
- compatibility paths without a real coexistence need, expiry condition, or migration boundary;
- files, classes, modules, or components accumulating unrelated reasons to change;
- speculative abstractions whose consumers or substitution need do not yet exist;
- broad types, optionality, casts, or escape hatches that hide invariants the surrounding code could express explicitly.

For each signal, ask what responsibility or real variability caused it. Prefer a structural reframe that deletes branches, duplicated state, helper layers, or special cases over a tidier implementation of the same accidental model.

Do not mechanically replace conditionals with patterns, split files by size alone, or introduce more abstraction to satisfy an aesthetic preference. Complexity that belongs to the domain should remain visible and well owned.

## Then refine the accepted structure

Only after the ownership and structural model hold, inspect local expression while preserving behavior:

- reduce unnecessary nesting and indirect control flow;
- remove genuine duplication and redundant intermediate abstractions;
- choose names that expose responsibility and domain meaning;
- keep related logic together without merging distinct concerns;
- prefer explicit readable control flow over clever compression or dense expressions;
- keep comments for non-obvious invariants, hazards, tradeoffs, and reasons rather than narration of syntax;
- remove dead branches, temporary scaffolding, debug output, expired compatibility code, and unused dependencies;
- follow coherent project conventions and formatter/linter rules.

Do not optimize for line count. A shorter implementation is worse when it hides state, failure behavior, ordering, ownership, or useful abstractions.

## Preserve behavior when recommending or applying change

A quality improvement must not silently alter product semantics, public contracts, error behavior, side-effect ordering, persistence rules, concurrency semantics, authorization, observability, or compatibility.

When remediation is authorized:

1. establish the current behavioral oracle with focused tests, characterization evidence, contracts, or another reliable source;
2. make the structural correction before local polish when the structure is the defect;
3. keep unrelated cleanup outside the patch;
4. rerun the narrowest evidence that can detect behavior change, then expand according to risk;
5. inspect the final diff again from an independent maintainer perspective.

If the desired simplification requires changing accepted behavior or architecture outside the delegated boundary, report the structural problem and the required decision instead of smuggling the redesign into a cleanup patch.

## Prioritize findings by consequence

Lead with a small number of high-conviction findings rather than cosmetic volume. Prefer this order:

1. structural regressions or wrong ownership that create continuing complexity;
2. opportunities to remove a major source of branches, modes, duplicated state, or indirection;
3. abstraction and boundary problems that materially increase cognitive load or future error;
4. file/module responsibility growth and decomposition problems;
5. local clarity, duplication, naming, control-flow, and comment problems that materially affect maintenance;
6. minor style only when project tooling or conventions make it consequential.

For each material finding, state:

```text
condition or location
-> structural or implementation problem
-> maintenance or correctness consequence
-> property the correction should satisfy
```

Recommend one concrete shape only when the evidence constrains the solution enough to justify it. Otherwise describe the responsibility or invariant the corrected design must express.

## Use independent review as a different lens

Do not merely repeat the implementation skill's self-review. Assume the author may have consistently applied a locally reasonable but globally wrong model. Reconstruct enough surrounding context to challenge that model, especially when the change crosses files, introduces new variability, or alters a shared boundary.

A repeated class of defect discovered across many reviews is evidence that the producing development workflow should learn the rule earlier. The review remains valuable for independent perspective and second-order effects, not as a permanent repair stage for mistakes that can reliably be prevented during generation.

## Complete with bounded confidence

If material findings exist, lead with them in consequence order and distinguish blocking structural issues from optional refinements. If none are found, state that no material code-quality regression was found within the reviewed evidence and name meaningful unverified boundaries.

Do not claim architectural correctness, behavior correctness, or production readiness beyond the evidence actually reviewed.
