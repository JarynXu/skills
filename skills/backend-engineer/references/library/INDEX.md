# Backend offline reference library

This directory contains source material bundled with the skill so normal agent use does not depend on internet access. Treat the library as evidence, not as authority over the consuming project's own rules.

## Use modes

### Lookup

For a narrow question, search locally instead of reading every manual:

```bash
python scripts/offline_library.py list
python scripts/offline_library.py search "并发" --source alibaba-p3c
python scripts/offline_library.py search "unique index" --limit 20
python scripts/offline_library.py read alibaba-p3c/p3c-gitbook/MySQL数据库/索引规约.md
```

### Learn

When the agent does not know the applicable body of knowledge, read a selected source sequentially from its native table of contents or index. For Alibaba P3C, begin with:

```text
originals/alibaba-p3c/p3c-gitbook/SUMMARY.md
```

Do not turn a complete-learning request into mandatory preload for ordinary tasks.

### Verify

Before trusting a vendored source after repository changes:

```bash
python scripts/offline_library.py verify
```

The verifier computes Git blob SHA-1 locally. Files marked `byte_exact=true` in each `SOURCE.json` must equal the pinned upstream Git blob SHA. No network access is used.

## Source registry

Each source lives under `originals/<source-id>/` and has a `SOURCE.json` containing provenance, exact upstream revision, license, local inclusion state, and any known omissions.

Current sources:

- `alibaba-p3c`: historical P3C GitBook text, pinned to Alibaba commit `6c59c8c36ecd8722c712d5685b8c3822c1c8b030`. Its text files are byte-exact Git mirrors. The GitBook itself states that it is older than the current manual, so it must not be represented as the current Yellow Mountain edition.

## Integrity and completeness language

Use these terms precisely:

- **byte-exact**: local Git blob SHA equals the pinned upstream blob SHA.
- **normalized**: substantive text is preserved but byte representation differs; the local SHA is recorded separately.
- **missing binary original**: the pinned source is known but cannot be transported through the active connector. It is not counted as vendored.
- **restricted**: redistribution permission is absent or unclear; only independently authored operational guidance may be bundled.

A source may be useful offline while still being historically old. Provenance and applicability are separate decisions.
