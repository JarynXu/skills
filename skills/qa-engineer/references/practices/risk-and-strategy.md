# Risk-based test strategy

Use this reference for release, project, feature, migration, or change-level strategy.

## Frame the decision

Identify what decision the evidence supports: design readiness, implementation readiness, merge, environment promotion, release, business acceptance, operational acceptance, or incident recovery. Establish scope, non-goals, authority, timeline, dependencies, and consequence of a wrong decision.

## Build a risk inventory from evidence

Derive risks from product value, architecture, data, change diff, dependency changes, historical defects, incidents, support volume, observability gaps, security/privacy exposure, platform matrix, migrations, and operational complexity.

For each material risk, record:

```text
risk -> affected behavior/quality -> evidence source
-> test level/type -> environment/data -> owner
-> entry/exit condition -> residual risk if unavailable
```

Do not create a risk table whose rows never change the test plan or release decision.

## Select test levels and types

Use layered evidence:

- developer-level unit and component checks for fast policy feedback;
- integration and contract tests for real boundaries;
- system and end-to-end tests for critical assembled journeys;
- exploratory testing for unknowns and interaction between conditions;
- non-functional tests for quality attributes;
- UAT and operational acceptance for owner-specific decisions;
- production validation for deployment and real-environment risks.

Avoid duplicating the same assertion at every layer. Retain a small number of high-value end-to-end journeys and place broader combinations at cheaper faithful layers.

## Define environments and data

Map each claim to the minimum faithful environment. Consider topology, versions, configuration, certificates, integrations, feature flags, network, hardware, data volume and distribution, privacy, reset, and observability. Use production-like behavior where risk demands it, not an expensive environment by default.

Test data should represent valid, invalid, boundary, historical, adversarial, volume, tenancy, locale, lifecycle, and migration cases as relevant. Define generation, masking, ownership, refresh, isolation, and deletion.

## Decide automation economics

Automate when a test is repeated, stable enough, deterministic or controllable, valuable as a gate, expensive to execute manually, or important across a matrix. Keep manual or exploratory work when human perception, rapidly changing behavior, one-time investigation, or unknown-space discovery dominates.

Include build and maintenance cost, environment cost, execution time, diagnostic quality, flake probability, ownership, and expected lifetime. A test with no owner or decision use is debt, even if it passes.

## Set entry, exit, and gates

Entry criteria should prevent meaningless execution: deployable build, known environment, seeded data, dependency availability, and accepted requirement state. Exit criteria should be evidence-based: completed high-risk coverage, blocking defects resolved or accepted, performance thresholds met, required platforms exercised, residual risk reviewed, and artifacts available.

Distinguish hard gates, advisory signals, waivers, and manual decisions. Record who may approve an exception and its expiry or follow-up.

## Adapt during execution

Update strategy when new defects, changed scope, environment evidence, production telemetry, or schedule constraints change risk. Reduce low-value breadth before omitting high-consequence evidence. State the changed residual risk rather than presenting a compressed plan as equivalent.
