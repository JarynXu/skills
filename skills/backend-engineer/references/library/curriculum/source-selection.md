# Source selection and teaching policy

This library is curated like a technical curriculum. Popularity alone is not a selection criterion.

## Selection rubric

### 1. Authority

Prefer, in order:

1. formal standards/specifications for exact semantics;
2. language/project/framework maintainers;
3. recognized ecosystem organizations with mature production experience;
4. long-lived community consensus with transparent ownership;
5. individual expert material when it adds a unique mental model.

An individual's article can be excellent, but it should not silently become a normative rule.

### 2. Learning value

A source must close a specific capability gap: semantics/interoperability, idiomatic API design, production reliability, security verification, testing, data/transactions, diagnostics/performance, or architecture judgment.

Do not add a second source that merely repeats an existing guide unless comparison itself has teaching value.

### 3. Scope and prerequisites

Record what the learner should know first and whether the source is foundational, language/runtime-specific, framework/tool-specific, conceptual, reference-only, historical/classic, or advanced.

A classic that predates current features should be paired with a modern source that corrects the gap.

### 4. Currency

Ask what can age: language features, runtime behavior, framework APIs, security advice, cloud/product defaults, or tooling. Pin exact upstream commits so change is reviewable rather than invisible.

### 5. Redistribution and offline suitability

Before vendoring exact material:

1. identify the exact artifact and copyright owner;
2. verify the license applies to that documentation/artifact, not merely neighboring code;
3. preserve required copyright, attribution, license and notices;
4. identify ShareAlike, NonCommercial, NoDerivatives, source-available, trademark or patent conditions;
5. classify as `restricted-canon` when the repository cannot legally redistribute the desired work;
6. keep third-party material in source-specific directories so the repository root license does not appear to relicense it.

Byte-exact upstream files belong in `originals/`. Generated normalization, extraction or conversion belongs in `processed/` and must be labeled as derived.

### 6. Agent usability

A source must be teachable. Decide whether it should be read end-to-end, read as one curriculum stage, searched like a dictionary, used for exact clauses only, or loaded only when the detected stack selects it.

**Offline is not the same as agent-ready.** PDF, HTML, RST, SGML/XML and other non-runtime-friendly originals must be preprocessed into Markdown before the source is considered ready for ordinary Agent use. Read [`preprocessing.md`](preprocessing.md).

### 7. Size and signal budget

Every recursive selection is suspicious until inspected. A source that expands into generated assets, dependency trees, screenshots, translations, test fixtures, site builds, or unrelated examples has failed curation even if redistribution is legal.

Prefer a smaller authoritative chapter set over a full documentation-site mirror. Use `CURATION.json` for source-specific post-sync pruning when a useful source cannot be selected cleanly by directory alone.

## Catalog organization

`../SOURCES.json` is the base curriculum catalog. Additional focused bookcases belong under `../sources.d/*.json`. Every catalog file uses the same schema:

```json
{
  "schema_version": 1,
  "sources": [ ... ]
}
```

`sync_library_catalogs.py` merges the base catalog and all `sources.d` modules, rejects duplicate `source_id` values, and records catalog provenance in `SOURCES.lock.json`.

This keeps additions reviewable: adding Rust language canon, a database bookcase, or a future framework curriculum does not require editing one ever-growing JSON file.

## Adding a source

A source proposal should contain:

```text
source id
title and owner
canonical repository/location
requested ref/tag
license and attribution obligations
teaching tier
learning tracks
why the source is needed
selected paths
known age/scope caveats
sources that complement or supersede it
expected processed Markdown form
```

Then:

1. add it to the appropriate catalog module;
2. run the sync;
3. inspect the actual original/processed diff and `SOURCE.json`;
4. run `offline_library.py verify`;
5. exercise realistic search/read tasks;
6. review size and search noise before calling it part of the curriculum.

## Updating a source

Never update a vendored source merely because upstream changed. Review old/new commit, semantic changes, license changes, preprocessing output, and whether the curriculum order or caveats must change.

For protocols/frameworks with multiple active versions, retain multiple versioned source packs only when real compatibility work requires them.

## Removing a source

Remove or demote material when it becomes misleading, abandoned, legally unsuitable, substantially superseded, redundant, or too noisy for its learning value. Keep a curriculum note when a historical source remains commonly cited.

## What not to do

- Do not equate a company style guide with a language specification.
- Do not equate a certification syllabus with a complete professional discipline.
- Do not mirror an entire vendor documentation site just because it is available.
- Do not ship a PDF or image and call the skill agent-ready when the Agent still has to extract it.
- Do not measure curriculum quality by file count.
- Do not hide conflicting advice; explain scope and authority.
- Do not claim a source is offline/agent-ready unless originals, processed Markdown, manifest and verification agree.
