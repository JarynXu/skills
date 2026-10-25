# Design judgment verification — 2026-10-22

## Source and scope

The candidate was written in the Local repository at `/workspace/skills`, on `main` with HEAD `21beee838a17d4d879a0eff54adb841dd5d0a1f6`. It remains an uncommitted local change. No commit, push, merge, installation, or publication was performed.

The runtime change adds `design-judgment` with one conditional contrast reference, one cooperation paragraph in `maintainable-design`, and a README discovery entry/count update. The maintenance skill retains its code-contract responsibility and independent usability. Neither package requires sibling runtime files.

A pre-edit snapshot preserves the README and maintenance entry as they existed in the user's working tree, along with the pre-existing diff and hashes. The scoped diff and transient outputs are under `.tmp/design-judgment-20261022/`; they distinguish this work from unrelated existing edits.

## Package and repository checks

- `python3 scripts/validate_repository.py`: passed; 23 skills and synchronized README table.
- `npx skills add . --list`: initially failed under the default Node 18.19.1 because the CLI imports unavailable `node:util.styleText`. Re-ran with the already installed Node 22.20.0 on PATH; passed and listed all 23 skills, including `design-judgment`. This listed packages without installing them.
- Scoped UTF-8, whitespace, bundled relative-link checks and `git diff --check -- README.md skills/maintainable-design/SKILL.md`: passed.
- The reusable evaluation JSON parses and contains ten task prompts with evaluator-only criteria, outside runtime routing.
- `bash scripts/test_all.sh`: failed in the unchanged `backend-engineer/scripts/offline_library.py` with `BrokenPipeError` during a piped search check. Earlier backend control-plane and framework checks ran; the runner stopped before later suites. The full repository test suite is not passing. No unrelated test or implementation was changed.
- The unscoped Git whitespace check also reports pre-existing CRLF/trailing-whitespace warnings in iCenter changes. Scoped checks pass; those unrelated edits were left intact.

These checks establish only their inspected structural or executable properties, not design quality or model improvement.

## Bounded decision evaluation

The [reusable cases](../../skills/design-judgment/evals/contextual-decisions.json) were independently authored without seeing the candidate instructions or worked examples. Acceptance was frozen before output inspection. The candidate was frozen before these cases were received and was not revised using their results.

Two fresh agents, with inherited model/settings and no model or reasoning overrides, answered the same ten prompts in the same randomized order. The precise model identifier was not exposed. The baseline received no skill. The candidate received the full new skill and its reference. Neither received the evaluator-only criteria, pairing map, prior answers, or proposed fixes.

Both agents met the frozen core criteria for all ten tasks:
- Naming followed persistent-place versus bounded-placement identity.
- Parser boundaries followed independent provider semantics versus one versioned owner.
- Configuration differed for station calibration versus a fixed shared product rule.
- Interaction distinguished reversible private edits from live external effects.
- The read-only review kept an adequate design; the reservation case did not invent a missing commitment guarantee.

The baseline already passed the same criteria. This run therefore shows no pass-rate improvement attributable to the skill. Qualitative differences do not establish overall superiority.

Each arm was one ten-task batch, not ten isolated trials; cross-case context was possible. This was a finite offline recommendation check with fallible model judgment, not an implementation, user study, production test, or statistical estimate. Supplying the skill directly did not test automatic triggering, conditional reference loading, or host-level cooperation with `maintainable-design`. No claim is made that all agents acquire good taste or that future tasks will pass.

Runtime hashes at evaluation:
- `SKILL.md`: `d3b244b19ec6843d858c7616d0246fff36e9695576c3d362dd699a8030c27a8e`
- Contrast reference: `317485fd1b083449d6b3f7cf6a3f4848ef1946ae3c50b9ce500ad1324b52bb2f`

The candidate is available for local review with the above evidence and remaining gaps. Any later adoption or publication should preserve these limits and resolve the repository-wide test failure in its owning change.

## Naming relationships refinement — 17:09 UTC follow-up

The follow-up extends naming judgment from an individual label to its semantic neighborhood: shared family concepts, peers and abstraction levels, corresponding operations, call sites, and discoverability. It preserves meaningful conventions while distinguishing factories, diagnostics, results, and other adjacent roles from genuine family members. A conditional reference adds family-member/non-member and paired-operation contrasts. No naming graph, mandatory document, new runtime script, or change to the maintenance skill was introduced.

The repository had independently advanced to HEAD `dc7d71ca7d08f9830fe47721c20f2ef9fea798ea` before this follow-up. A fresh snapshot under `.tmp/design-judgment-naming-20261022/` preserves the current files and existing changes. The earlier verification above remains evidence for its original version, not a new execution on this revision.

Three independently authored [naming-relationship tasks](../../skills/design-judgment/evals/naming-relations.json) exercise a true family member, an adjacent non-member, and a public pair with a justified future migration. Their criteria were frozen without seeing the revised instructions; the candidate was frozen before the prompts were received. Two fresh agents received the same prompts in order 2, 1, 3, with the previous or revised full skill and reference respectively. Neither received expected outcomes or criteria. Both inherited configuration without model or reasoning overrides; the precise model identifier was unavailable.

Both versions met all three core criteria. This is a limited no-regression observation, not evidence that the revision improves model performance. The evaluation used one three-task batch per version, explicit task facts, and an evaluator aware of the version; automatic triggering, reference selection, real code changes, and broader naming quality remain untested. The earlier ten-case experiment was not repeated.

For this revision, the repository validator and CLI discovery passed with 23 skills, using the existing Node 22.20.0 runtime for discovery. The required full test entry point was run again and stopped at the same `BrokenPipeError` in unchanged `backend-engineer/scripts/offline_library.py`; later suites were not reached. That failure was not repaired or suppressed. Scoped text, links, evaluation JSON, diff, and preservation checks are recorded with the local evidence. No commit, push, installation, or publication was performed.
