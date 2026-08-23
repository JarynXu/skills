# Backend source governance and provenance

This skill is intentionally offline-first. Redistributable canonical standards, language guides, practice guides, and selected product documentation are synchronized into `references/library/originals/` from the catalog in [`../library/SOURCES.json`](../library/SOURCES.json).

## Source states

- **AUTHORED:** original agent-oriented guidance maintained in this repository.
- **VENDORED-EXACT:** byte-exact external source file, pinned to an immutable upstream commit and verified by Git blob SHA.
- **DERIVED:** mechanically generated representation such as PDF text extraction; useful for search, never the authority over the original.
- **CURRICULUM-MAPPED:** important source described and sequenced in the curriculum without copying its protected expression.
- **RESTRICTED-CANON:** influential book/standard whose redistribution terms do not permit or clearly support inclusion in this open repository.

## Current source of truth

The maintained source catalog is:

```text
references/library/SOURCES.json
```

Each installed source generates:

```text
references/library/originals/<source-id>/SOURCE.json
```

The generated manifest records the owner/repository, requested ref, resolved immutable commit, license description, teaching tier, learning tracks, exact selected paths, Git blob SHA, SHA-256, byte size, and whether a file is byte-exact or derived.

`SOURCES.lock.json` records the resolved revision of every synchronized source so upstream change is reviewable.

## Inclusion rules

1. **Select for learning value first.** Popularity alone is not sufficient. Prefer formal specifications, project/language owners, and mature community consensus.
2. **Pin moving refs.** A branch such as `main` is resolved to an immutable commit for each synchronization run.
3. **Verify bytes.** Exact GitHub files are accepted only if the downloaded bytes reproduce the upstream Git blob SHA.
4. **Preserve license boundaries.** Third-party content remains under its own source directory with its own notices. The repository's MIT license does not relicense third-party material.
5. **Label transformations.** PDF extraction, normalization, translation, indexing, or summarization is `DERIVED` and must point back to the original.
6. **Do not vendor restricted works.** Commercial books, paid ISO/IEC standards, and works with unclear or unsuitable redistribution rights stay in `library/curriculum/restricted-canon.md` until permission is established.
7. **Teach age and scope.** A classic may be worth learning while no longer being sufficient. The curriculum must pair it with current specifications or practice where needed.
8. **Prefer project truth at runtime.** A local project's formatter, analyzer, framework version, accepted contract, and architecture decisions outrank generic library defaults.

## Synchronization

The deterministic synchronizer is:

```bash
python scripts/sync_offline_library.py
```

It reads `library/SOURCES.json`, resolves upstream revisions, expands selected files/directories, downloads originals, verifies Git object identity, optionally derives searchable text from PDFs, and writes per-source manifests plus a lock file.

After synchronization, run:

```bash
python scripts/offline_library.py verify
bash tests/test.sh
```

The repository workflow `sync-backend-library.yml` performs this process on the dedicated library-build branch so generated source updates are reviewable before `main` changes.

## Adding or updating a source

Read [`../library/curriculum/source-selection.md`](../library/curriculum/source-selection.md). A proposed source must identify:

- what backend capability it teaches;
- why it is authoritative/canonical/useful;
- exact repository/location and requested revision;
- documentation/artifact license, not merely adjacent code license;
- material tier and prerequisite learning;
- selected paths rather than indiscriminate site mirroring;
- known age/scope limitations;
- companion sources needed to correct blind spots.

Then change `SOURCES.json`, synchronize, review the generated semantic diff, verify, and add a realistic offline lookup test.

## Important licensing distinctions

Open source code does not automatically mean adjacent documentation is under the same license. Documentation repositories may use CC BY, CC BY-SA, CC BY-NC-SA, project-specific terms, or different terms per file. The exact artifact governs.

For example, a current vendor documentation site may be readable publicly while its license restricts commercial redistribution. In that situation, prefer a separately redistributable protocol/specification source for the offline library and keep the broader vendor docs as an external/current reference rather than silently restricting the whole skills ecosystem.

Formal standards can also have restrictive publication terms. When formal conformance needs a paid or restricted standard, record the exact edition in the curriculum and use a lawfully obtained copy in the consuming environment rather than copying it into this repository.
