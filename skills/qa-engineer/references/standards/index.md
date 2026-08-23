# Quality standards and terminology lookup

Use this file as a dictionary entry point. Apply sources in this order unless the project establishes another hierarchy:

```text
project/product acceptance and quality policy
> contractual or regulatory obligations
> adopted organization process and gate definitions
> configured tool and framework rules
> applicable official standards and platform guidance
> source-backed offline testing material
> general authored guidance in this skill
```

When exact testing-tool, contract, integration, property-based, browser-automation, or application-security semantics matter, route to [`../library/INDEX.md`](../library/INDEX.md). The offline library contains pinned, redistributable source material with exact originals plus agent-ready Markdown; it does not override the consuming project's installed versions or accepted rules.

## Lookup map

| Concern | Primary local guidance |
|---|---|
| Test policy, strategy, levels, entry/exit | `../practices/risk-and-strategy.md` |
| Test conditions, cases, techniques, expected results | `../practices/test-design-and-oracles.md` |
| Functional, API, UI, data, message, integration | `../practices/functional-and-integration-testing.md` |
| Smoke, sanity, regression, exploratory | `../practices/exploratory-and-regression.md` |
| Performance, reliability, recovery, installation, upgrade | `../practices/nonfunctional-testing.md` |
| Security, accessibility, compatibility, localization, privacy | `../practices/security-accessibility-compatibility.md` |
| Environments, test data, isolation, reset, privacy | `../practices/test-environments-and-data.md` |
| Automation, fixtures, flake, CI, reports | `../practices/automation-architecture.md` |
| Repository-native test command selection | `../technologies/test-control-plane.md` |
| Defects, severity, retest, release evidence | `../practices/defects-and-release-evidence.md` |
| UAT and production validation | `../practices/uat-and-production-validation.md` |
| Tool choice | `../technologies/tool-routing.md` |
| Source-backed Playwright/Selenium/Pact/pytest/Hypothesis/Testcontainers/OWASP guidance | `../library/INDEX.md` |

## Terminology discipline

Use project terminology when it is defined. Otherwise keep these distinctions:

- test basis: sources from which expected behavior and conditions are derived;
- test condition: aspect or risk to challenge;
- test case: concrete preconditions, data, action, and expected result;
- test procedure/script: executable sequence;
- test oracle: basis for deciding expected versus observed;
- defect: confirmed divergence requiring disposition;
- incident: operational interruption or degradation;
- verification: evidence that specified requirements or controls are met;
- validation: evidence that the product supports intended use and outcomes;
- regression: unintended change to previously intended behavior;
- residual risk: exposure remaining after available controls and evidence.

Do not force one standard's vocabulary into an organization that has a clear, coherent equivalent.

## Adding source-derived material

Before adding exact or adapted external content, read `sources.md`. Record owner, title, exact version or resolved commit, canonical source, license, inclusion mode, local paths, modification status, attribution, preprocessing provenance, and update procedure. Keep independently licensed content separate from repository-authored guidance.

After changing the offline catalog, synchronize through `.github/workflows/sync-qa-library.yml` or the equivalent local scripts, then require `offline_library.py verify` and the QA test entry point to pass before treating the source as agent-ready.
