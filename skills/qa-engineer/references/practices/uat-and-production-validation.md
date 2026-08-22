# UAT and production validation

Use this reference for user acceptance, alpha/beta, pilot, operational acceptance, canary checks, synthetic monitoring, production smoke, and post-release validation.

## Preserve acceptance authority

UAT asks whether the solution supports real business outcomes under acceptable rules and workflows. QA can design the approach, prepare environments and data, train participants, facilitate sessions, capture evidence, and coordinate defects. The authorized business owner accepts or rejects the product.

Define participants, roles, scenarios, data, environment, prerequisites, support, evidence, defect process, decision criteria, and sign-off authority. Use realistic business narratives and exceptions, not merely retitled system test cases.

## Prepare an acceptance-ready environment

Confirm version, configuration, integrations, roles, data, privacy, reset, support contacts, observability, and known limitations. Separate UAT findings caused by incomplete environment or training from product defects, while preserving their effect on acceptance.

## Alpha, beta, and pilot testing

Define target cohort, consent and privacy, feature exposure, support path, telemetry, feedback method, issue triage, rollback/disable controls, and exit criteria. Qualitative feedback and product analytics complement each other; neither automatically establishes causality.

## Operational acceptance

Verify deployment, configuration, identity, certificates, observability, alerts, dashboards, runbooks, capacity, backup/restore, incident contacts, support procedures, rollback, data migration, and handoff according to operational ownership. QA coordinates evidence; operations accepts its operational responsibilities.

## Production-safe validation

Before production action establish explicit authorization, target, time window, accounts and data, rate, expected side effects, observability, abort condition, rollback, cleanup, and communication. Prefer read-only or synthetic checks. Use canary or small cohort where the release mechanism supports it.

Production smoke should verify deployment identity, critical entry and one safe representative journey, essential dependencies, background work where observable, and telemetry. Do not create irreversible business transactions without an approved test path.

## Validate after release

Compare error rate, latency, business completion, queues, data reconciliation, support signals, and critical synthetic journeys against a baseline and rollout thresholds. Distinguish no traffic from success. Observe long enough for delayed jobs, caches, retries, and migrations relevant to the risk.

When thresholds fail, preserve evidence and trigger the agreed pause, rollback, disable, or incident path. Do not continue experimentation during material impact without authorization.

## Feed acceptance results back

Record accepted limitations, deferred defects, training/process issues, production-only gaps, monitoring requirements, and owners. Update regression, risk, runbooks, requirements, or product definitions at their authoritative sources rather than treating sign-off as permanent proof.
