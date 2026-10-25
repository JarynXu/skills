# Context and relationships verification — 2026-10-23

## Source and change

This Local change starts from `main` at `dc7d71ca7d08f9830fe47721c20f2ef9fea798ea`, including the existing uncommitted naming-family refinement. The pre-edit version, worktree status, and existing-file hashes are preserved under `.tmp/design-judgment-context-20261023/`.

The two runtime files reorganize existing guidance around actual uses, roles, relationships, guarantees, and consumer context. Names and their reliably visible context jointly convey meaning; qualifiers remain useful when context disappears or distinctions matter. Interface composition, shared configuration choices, and UI promises apply the same reasoning without making uniformity the overriding design goal. Existing authority boundaries and the independent maintenance-skill relationship remain unchanged. The runtime files together grew by 43 whitespace-delimited words; that size observation is not quality evidence.

## Checks

- `python3 scripts/validate_repository.py`: passed for 23 skills and the synchronized discovery table.
- `PATH=/workspace/.framework-tools/node22/node_modules/node/bin:$PATH npx --no-install skills add . --list`: passed using the existing Node 22 runtime and cached CLI; no package installation.
- `bash scripts/test_all.sh`: ran and failed with the existing `BrokenPipeError` at `skills/backend-engineer/scripts/offline_library.py:124`. Earlier backend/framework checks passed; later suites were not reached. No unrelated implementation or test was changed.
- Scoped UTF-8, trailing whitespace, relative links, JSON parsing, frozen runtime hashes, and preservation of unrelated pre-existing files were checked. The final scoped diff and hashes are retained with the local evidence.

## Bounded transfer observation

The [six reusable tasks and frozen criteria](../../skills/design-judgment/evals/contextual-relations.json) were independently authored before reading either runtime. The candidate was frozen before the implementer received the prompts. Usage snippets require inferring transformations, selection versus execution, contextual redundancy, per-attempt versus overall guarantees, detached notification context, and cache versus authoritative-store roles. They contain both common relationships under changed vocabulary and superficially similar forms with different responsibilities. They are not an orthogonal benchmark that isolates every variable.

Two fresh agents received identical ordered tasks and the complete respective previous or candidate skill/reference, without criteria or other-arm answers. Model/configuration were inherited without overrides; exact model identity was unavailable. Full outputs are retained locally as `previous-output.txt` and `candidate-output.txt` in the snapshot directory.

Both outputs handled the central semantic and contract distinctions across all six tasks. Under the fixture's explicit contextual-redundancy criterion, the previous T6 answer was partial: it kept private `quoteCache` and `quoteStore` inside `QuoteService` without a contextual reason. These are understandable names, not generally incorrect code. The candidate used `cache` and `store` locally while retaining `QuoteCache` and `QuoteStore` for optional external contracts. The shown scope has one cache and one store, with no competing domain, which supports this omission. The candidate also retained an appropriate noun-based selector in T3. All candidate responses met the frozen criteria.

This is one narrow observation, not proof of increased capability, a general preference for shorter names, or improved taste. Each arm was one six-task batch, so examples could influence later answers. The author also judged the outputs. A follow-up corrected one extra paragraph break in the previous input transcription before its answer; words and tasks were unchanged, but the input-format/follow-up asymmetry limits comparison. This explicitly activated-skill exercise did not test discovery, reference selection, real project investigation, executing the proposed code, production outcomes, or reliable behavior across models. Prior evaluations were not rerun and retain only their original scope.

No commit, push, installation, or publication was performed.

## Authoritative guidance consolidation — 03:08 UTC follow-up

The current naming guidance was consolidated around clarity at actual use sites, audience vocabulary, meaningful roles, and context readers can reliably access. The main skill grew by six words. Its existing reference now links to five primary pages from Swift, Go, GOV.UK, and W3C, with concise applicability limits. All five pages were opened and the supporting passages inspected on 2026-10-23. Language-specific grammar and verb-led public-service naming were not adopted as universal rules; visual proximity was distinguished from programmatically available context. No new runtime resource or evaluation fixture was added.

The same source HEAD and a fresh current-tree snapshot identify this revision under `.tmp/design-judgment-sources-20261023/`. The earlier record above describes the earlier version and is not fresh evidence for this consolidation.

A single fresh respondent, using inherited configuration without overrides, read the complete revised skill and reference and answered smoke scenarios based on existing T1, T3, and T5. Prompts preserved their facts and behavior but used a compact presentation, so this was not an exact replay or comparison. The original acceptance criteria and earlier answers were withheld. The output preserved conversion meaning while removing redundant private source wording, retained an appropriate noun-based selector while distinguishing actual encoding, and used compact contextual UI copy versus self-contained notification copy. All three met their relevant existing criteria. The exact answer is retained as `smoke-output.txt` in the snapshot directory.

This checks a small set of previously known behaviors, not new held-out transfer, automatic activation, source retrieval by the respondent, user comprehension, accessibility conformance, or increased capability. No baseline comparison or broader benchmark was run.

Required package validation and cached CLI discovery passed for 23 skills without installation. The full test entry point again failed in the unchanged backend offline-library search with `BrokenPipeError`; later suites were not reached. Scoped text, link, JSON, frozen-hash, and preservation checks are recorded with the local diff. No unrelated repair, commit, push, installation, or publication was performed.

The final preservation comparison found a concurrent change to `skills/icenter/scripts/image-page.cjs`, outside this task. This change did not write or restore that file; its current contents were left intact. The other 83 pre-existing out-of-scope files matched their starting hashes.

## Cross-domain reference refinement — 03:32 UTC follow-up

The reference already contained UI, configuration, and interaction examples. This revision made its shared reasoning explicit, strengthened the UI context contrast, and added a hypothetical service-name contrast about audience vocabulary and changed task scope. Repetitive code-name lists and the duplicated closing style-rule section were reduced or removed. Existing contract, configuration, and interaction distinctions remain. The reference shrank from 1,213 to 1,182 whitespace-delimited words; length is not a quality measure. `SKILL.md` and the verified source-guidance section remain byte-identical. The service interviews are part of an illustrative premise, not reported research.

A fresh respondent read both complete runtime files and answered compact presentations of existing T3, T5, and H05 once. Criteria and prior answers were withheld. It distinguished selector and encoder roles without banning nouns, adapted UI versus notification wording to available context, and retained distinct review actions where permissions, required information, and outcomes differ. All three met their relevant existing criteria. The exact output is retained under `.tmp/design-judgment-cross-domain-20261023/smoke-output.txt`.

This was a small known-case smoke check, not a new benchmark, exact repeated experiment, service-name user study, accessibility test, or evidence of increased general capability. Previous evaluations retain only their original scope.

The 23-skill repository validator and cached CLI discovery passed. The required full tests again stopped at the unchanged backend offline-library `BrokenPipeError`; later suites were not reached. Scoped text, links, source-section identity, unchanged entry, frozen reference hashes, and preservation observations are recorded with the local diff. Unrelated concurrent files were neither restored nor held to a global stable-worktree requirement. No commit, push, installation, or publication was performed.

## Change locality in decomposition — 09:24 UTC follow-up

The user reported that applying the two design skills while reorganizing code led to shotgun surgery, but supplied no application code or diff. The existing skills already cover coherent responsibility, independently changing knowledge, and cognitive coupling. This change addresses a narrower instructional gap: they did not explicitly make a before/after change scenario part of deciding a nontrivial split. That is a plausible mitigation, not a verified explanation of the reported behavior or a repair to the user's application.

`maintainable-design/SKILL.md` now asks for an evidenced change scenario before decomposition, distinguishes one-time migration from recurring synchronized edits, and checks the resulting structure afterward. `references/foundations.md` contrasts scattered cancellation-policy interpretations with a legitimate feature crossing UI, API, storage, and audit contracts. It links Fowler and Beck's publisher-hosted discussion of Shotgun Surgery, inspected on this date, for the recurring scattered-edit concern rather than a file-count rule. `design-judgment/SKILL.md` adds the corresponding comparison of ongoing coordination and transition costs. Its naming section and entire context-sensitive reference are byte-for-byte unchanged. No fixed file-size, class-count, layer-count, or mandatory document requirement was added.

Three reusable tasks and separate acceptance criteria are in [change-locality.json](../../skills/maintainable-design/evals/change-locality.json). A separate task author did not read the candidate; its prompts were received after the runtime edit was frozen. Two fresh agents each read all four assigned runtime files and answered the same three prompts, in the same order, once. The previous arm used the saved baseline; the candidate arm used the frozen working files. Both used inherited settings without overrides, and both confirmed complete reads. Expected outcomes and other-arm responses were withheld. The implementer reviewed the complete outputs nonblind against the pre-run criteria.

Both arms met the criteria in all three tasks: keep the shipping-offer rule cohesive despite field-specific consumers; retain legitimate export-format boundaries and plan a compatible rollout; consolidate duplicated coupon decisions without reverting independent tax and presentation boundaries. No measured improvement was established. This is a six-response offline decision comparison with explicit activation, not a test of automatic triggering, real refactoring execution, production outcomes, or general engineering taste. Single samples, batched prompts, authored scenarios, and nonblind model review limit the result. Suggested implementation tests in these responses were not executed.

The snapshot and scoped diff are in `.tmp/design-change-locality-20261023/`; `tasks.json` contains answer-only inputs and `observations.json` retains selected exact excerpts, per-case observations, and protocol limits. The prior runtime files, candidate hashes, and command logs are retained there. No full response transcript is claimed by the excerpt record.

Checks run on the candidate:

- `python3 scripts/validate_repository.py`: passed for 23 skills and the synchronized discovery table.
- `PATH=/workspace/.framework-tools/node22/node_modules/node/bin:$PATH npx --no-install skills add . --list`: passed without installing anything.
- `bash scripts/test_all.sh`: exited 1 after the existing backend-engineer adapter, diagnostic, control-plane, catalog, routing, and readiness checks. It again stopped at `skills/backend-engineer/scripts/offline_library.py:124` with `BrokenPipeError`; later suites were not reached. The unrelated failure was not edited or treated as a pass.
- Scoped UTF-8, final-newline, whitespace, relative-link, evaluation-JSON, and diff checks passed. Frozen runtime hashes matched after the comparison. These are structural checks, not behavioral evidence.

The work remains uncommitted. No installation, push, publication, or cloud-repository operation was performed. Concurrent knowledge work and other unrelated files were not edited; repository-wide stability was not a completion requirement.
