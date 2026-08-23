# Source selection and teaching policy

This library is curated like a technical curriculum. Popularity alone is not a selection criterion.

## Selection rubric

Score a proposed source against these questions.

### 1. Authority

Prefer, in order:

1. formal standards/specifications for exact semantics;
2. language/project/framework maintainers;
3. recognized ecosystem organizations with mature production experience;
4. long-lived community consensus with transparent ownership;
5. individual expert material when it adds a unique mental model.

An individual's article can be excellent, but it should not silently become a normative rule.

### 2. Learning value

A source must close a specific capability gap. Useful categories include:

- exact semantics or interoperability;
- idiomatic language/API design;
- production reliability and failure reasoning;
- security verification;
- testing strategy or test mechanics;
- data/transaction behavior;
- diagnostics/performance;
- architecture judgment.

Do not add a second source that merely repeats an existing guide unless comparison itself has teaching value.

### 3. Scope and prerequisites

Record what the learner should know first and whether the material is:

- foundational;
- language/runtime specific;
- framework/tool specific;
- conceptual;
- reference-only;
- historical/classic.

A classic that predates current features should be paired with a modern source that corrects the gap.

### 4. Currency

Ask what in the source can age:

- language features;
- runtime behavior;
- framework APIs;
- security advice;
- cloud/product defaults;
- operational tools.

Timeless ideas can remain useful even when examples age, but the curriculum must say so explicitly. Pin exact commits so an upstream update becomes a reviewable curriculum change rather than an invisible semantic change.

### 5. Redistribution and offline suitability

Before vendoring exact text or binaries:

1. identify the exact artifact and copyright owner;
2. verify the license applies to the documentation/artifact, not just neighboring code;
3. preserve required copyright, attribution, license and notices;
4. identify ShareAlike, NonCommercial, NoDerivatives, source-available, trademark or patent conditions;
5. reject or classify as `restricted-canon` if the repository cannot legally redistribute the desired work for its intended open/community use;
6. keep third-party material in a source-specific directory so the repository root license does not appear to relicense it.

The sync process should preserve byte-exact upstream files whenever possible. Any generated text extraction, normalization or translation must be labeled as derived.

### 6. Agent usability

A good source must be teachable. Decide whether it should be:

- read end-to-end once;
- read as one stage in a curriculum;
- searched like a dictionary;
- used only for exact normative clauses;
- used only when the detected stack selects it.

Large documentation sites should be narrowed to the chapters that carry backend engineering decisions rather than mirrored indiscriminately.

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
```

Then add it to `SOURCES.json`, run the sync, inspect the generated diff and `SOURCE.json`, run `offline_library.py verify`, and exercise at least one realistic search/read task that proves an agent can actually retrieve the intended knowledge.

## Updating a source

Never update a vendored source merely because upstream changed. Review:

- resolved old versus new commit;
- files added/removed/modified;
- semantic changes to rules or guarantees;
- license changes;
- whether the curriculum text or learning order must change;
- whether project defaults should remain pinned to an older stable standard/version.

For a protocol or framework with multiple active versions, the library may retain multiple versioned sources when backward compatibility work needs them.

## Removing a source

Remove or demote material when it becomes misleading, abandoned, legally unsuitable, substantially superseded, or redundant. Preserve a short curriculum note when the historical source is still commonly cited so agents understand references encountered in older code or documentation.

## What not to do

- Do not equate a company style guide with a language specification.
- Do not equate a certification syllabus with a complete professional discipline.
- Do not mirror an entire vendor documentation site just because it is available.
- Do not teach architecture patterns without the forces and failure modes they address.
- Do not hide conflicting advice; explain scope and authority.
- Do not claim a source is offline unless its actual files and manifest are present and `verify` passes.
