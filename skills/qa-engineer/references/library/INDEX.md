# QA offline reference library

Use this library for source-backed testing guidance without requiring network access. The consuming project's requirements, contracts, accepted risk decisions, and repository instructions remain authoritative.

## Commands

```bash
python scripts/offline_library.py list
python scripts/offline_library.py search "authorization matrix" --source owasp-cheat-sheet-series
python scripts/offline_library.py search "input validation" --source owasp-cheat-sheet-series
python scripts/offline_library.py read owasp-cheat-sheet-series/cheatsheets/Authorization_Regression_Testing_Cheat_Sheet.md
python scripts/offline_library.py verify
```

## Installed source packages

### OWASP Cheat Sheet Series - QA security testing subset

Pinned upstream: `OWASP/CheatSheetSeries` commit `6b8819da79e0537d072e04296ffa3adfc94ba881`.

Bundled byte-exact guidance:

- authorization regression testing;
- authorization testing automation;
- REST assessment;
- input validation.

The source package is licensed CC BY-SA 4.0 and is kept under `originals/owasp-cheat-sheet-series/` with its own `SOURCE.json` and license text. Do not present the vendored OWASP text as original material from this repository or imply OWASP endorsement.

This package is deliberately curated. Relative links inside the original cheat sheets may refer to other OWASP documents not bundled here; use the local material that is present and do not claim that the whole upstream repository is offline.

## Evidence use

Use the original source to derive test ideas, oracles, negative cases, authorization matrices, and release gates. Keep the QA artifact itself specific to the system under test: identify the requirement or risk, test condition, expected result, actual evidence, and residual uncertainty.

For normal functional testing, do not load the security source package unless the task actually involves security controls, trust boundaries, authorization, API assessment, or input handling.
