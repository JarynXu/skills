# Quality standards and terminology lookup

Use this file as a dictionary entry point. Apply sources in this order unless the project establishes another hierarchy:

```text
project/product acceptance and quality policy
> contractual or regulatory obligations
> adopted organization process and gate definitions
> configured tool and framework rules
> applicable official standards and platform guidance
> general guidance in this skill
```

## Lookup map

| Concern | Primary local guidance |
|---|---|
| Test policy, strategy, levels, entry/exit | `risk-and-strategy.md` |
| Test conditions, cases, techniques, expected results | `test-design-and-oracles.md` |
| Functional, API, UI, data, message, integration | `functional-and-integration-testing.md` |
| Smoke, sanity, regression, exploratory | `exploratory-and-regression.md` |
| Performance, reliability, recovery, installation, upgrade | `nonfunctional-testing.md` |
| Security, accessibility, compatibility, localization, privacy | `security-accessibility-compatibility.md` |
| Automation, fixtures, flake, CI, reports | `automation-architecture.md` |
| Defects, severity, retest, release evidence | `defects-and-release-evidence.md` |
| UAT and production validation | `uat-and-production-validation.md` |
| Tool choice | `technologies/tool-routing.md` |

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

Before adding exact or adapted external content, read `sources.md`. Record owner, title, exact version or commit, canonical source, license, inclusion mode, local paths, modification status, attribution, and update procedure. Keep independently licensed content separate from MIT-authored guidance.
