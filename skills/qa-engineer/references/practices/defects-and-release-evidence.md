# Defect analysis and release evidence

Use this reference for reproduction, minimization, defect records, severity and priority, root-cause collaboration, retest, quality gates, residual risk, and recommendations.

## Convert an observation into reproducible evidence

Record:

- product build/commit and environment/configuration;
- actor, identity, permissions, tenant, locale, platform, and data;
- preconditions and relevant prior state;
- minimal actions or request sequence;
- expected result and authority;
- observed result and durable side effects;
- frequency, timing, correlation IDs, logs, traces, screenshots, dumps, or payloads;
- comparison with a working condition;
- cleanup and data-sensitivity status.

Minimize variables without deleting the failure mechanism. Confirm whether the issue reproduces after reset and whether it predates the change.

## Classify before assigning cause

Possible classifications include product defect, test defect, environment/configuration defect, test-data defect, requirement conflict, third-party defect, known limitation, or unknown. A symptom location is not necessarily the causal component.

Use bisection, controlled comparisons, logs/traces, contract inspection, data checks, and lower-level tests to discriminate hypotheses. Engineering owns implementation root-cause decisions; QA supplies evidence and verifies the fix.

## Separate severity and priority

Assess severity from user/business impact, data/security consequence, scope, frequency/exposure, workaround, reversibility, and recovery. Priority additionally includes release goals, dependencies, cost, timing, customer commitment, and risk appetite. Record the decision owner and disagreements rather than changing severity to force scheduling.

## Verify fixes and closure

Reproduce the original failure on the unfixed build where feasible, verify the fix under the same and relevant varied conditions, inspect unintended effects, run impact-based regression, and confirm telemetry or migration consequences. Close only when the agreed acceptance and evidence boundary is met. “Cannot reproduce” requires environment and attempt evidence and remains different from fixed.

## Build release evidence

Summarize by risk and decision, not test counts:

- scope and versions;
- environments and data;
- material risks and coverage;
- passed, failed, blocked, not-run, and unavailable evidence;
- open defects and retest status;
- performance/resilience/security/accessibility/compatibility outcomes where applicable;
- changes since the last assessment;
- residual risks, mitigations, monitoring, rollback, and owners;
- recommendation and authority for the final decision.

A green pipeline is an input. Inspect skipped tests, flaky retries, environment drift, matrix gaps, report publication failures, and non-gating suites.

## Recommend without manufacturing certainty

Use recommendations such as `READY WITHIN TESTED SCOPE`, `READY WITH ACCEPTED RESIDUAL RISK`, `NOT READY`, or `INSUFFICIENT EVIDENCE`, according to project vocabulary. Tie the recommendation to explicit conditions and decision owner. QA may enforce an agreed gate; otherwise it advises and escalates rather than pretending to approve the business release.
