# Exploratory, smoke, sanity, and regression testing

Use this reference when discovery, rapid confidence, change impact, or historical failure matters.

## Distinguish the purposes

- **Smoke:** a small, stable set proving the build or deployment is testable and critical capabilities are not obviously broken.
- **Sanity:** focused confidence that a specific change or fix behaves plausibly before broader testing.
- **Regression:** evidence that intended existing behavior remains intact after change.
- **Exploratory:** simultaneous learning, test design, and execution guided by a mission and observations.

Do not label every short suite “smoke,” or every rerun “regression.” The name should communicate its decision use.

## Build a high-value smoke suite

Include environment identity, authentication or entry, one critical read and write where safe, key dependency connectivity, important background processing, and basic telemetry or health. Keep it fast, diagnosable, data-safe, and suitable for the promotion stage. A smoke pass means deeper testing can proceed; it does not establish release readiness.

## Select regression by impact

Trace changes through public contracts, shared modules, schemas, configuration, dependencies, feature flags, platforms, data, and historical defects. Include:

- direct changed behavior;
- consumers of changed contracts or reusable components;
- neighboring state and permission paths;
- previously escaped or repeatedly broken behavior;
- migration and mixed-version paths;
- representative unaffected critical journeys.

Maintain a stable core regression suite plus risk-triggered additions. Remove obsolete tests only after confirming the protected contract no longer exists.

## Conduct exploratory sessions

A useful charter includes target, risk or question, scope, constraints, data, timebox, and evidence to capture. During execution, vary data, sequence, state, roles, interruption, platform, timing, dependencies, and recovery. Follow surprising behavior rather than mechanically completing a script.

Capture notes sufficient to reproduce important observations: environment, version, data, actions, timing, artifacts, and open questions. A session report is not a narrative diary; it records coverage, observations, defects, and remaining leads.

## Use defect history without overfitting

Cluster escaped defects by causal gaps: missing requirement, wrong oracle, untested state, unrealistic data/environment, absent integration, flaky gate, ignored warning, or production-only condition. Add regression at the nearest faithful layer and improve the upstream gap where possible. Do not create a brittle end-to-end case for every past symptom.

## Manage compatibility regression

Keep supported versions and combinations explicit. Use representative and pairwise matrices, plus high-risk combinations and upgrade paths. Remove obsolete platforms only through product or support authority, not because testing is inconvenient.
