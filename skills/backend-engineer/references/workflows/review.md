# Review backend changes

Use this workflow for code, design, schema, configuration, migration, dependency, or operational reviews. Review is read-only unless remediation is separately requested.

The goal is to find consequential defects and missing evidence, not to prove the reviewer is thorough.

## Reconstruct intent and scope

Before judging style, identify:

- requested behavior or acceptance criteria;
- affected ownership boundary;
- public/internal contract changes;
- data/schema/migration impact;
- dependencies and operational path;
- expected compatibility and rollout model;
- tests/evidence supplied by the change.

If intent is ambiguous, distinguish “cannot verify intent” from “implementation is wrong.”

## Review by consequence

Prioritize defects in this order when applicable:

1. incorrect business behavior or data loss/corruption;
2. authorization, tenant isolation, secrets or privacy failures;
3. public contract or migration incompatibility;
4. concurrency, distributed side effects, retry/idempotency and recovery defects;
5. reliability/resource/performance issues with real impact;
6. missing tests/observability/operability that prevent safe use;
7. maintainability defects that materially increase future error;
8. style differences not already resolved by project tooling.

Do not bury a high-consequence finding among cosmetic comments.

## Follow the behavior path

Trace the changed path end to end:

```text
input/trigger
-> permission and validation
-> domain/application decision
-> transaction/state
-> external side effects
-> result/error
-> telemetry and recovery
```

Inspect both success and failure paths. Check boundaries that the diff may not show directly: generated code, migrations, schemas, config, lockfiles, deployment descriptors, consumers and tests.

## Test the assumptions in the change

Ask where applicable:

- Is the source of truth correct?
- Can the operation repeat safely?
- What happens on timeout, cancellation, duplicate delivery or partial success?
- Does concurrency violate an invariant?
- Are transaction and lock scopes correct?
- Can old and new versions/data coexist during rollout?
- Can an unauthorized/other-tenant caller reach the path?
- Does a cache/index/replica become an accidental authority?
- Are resources, queues, payloads and cardinality bounded?
- Does telemetry expose the state needed to diagnose failure?
- Are tests preserving the real failure mechanism or mocking it away?
- Does the dependency/runtime change preserve build, generated artifacts and compatibility?

Load the corresponding practice/library reference only when the changed surface requires it.

## Validate evidence, not just code

Read test code and CI/configuration enough to understand what actually ran. A test name is not evidence. Check whether:

- test fixtures exercise the intended state;
- real database/protocol/messaging semantics are preserved when relevant;
- negative security cases exist;
- migration/mixed-version behavior is represented;
- performance claims have a baseline and representative workload;
- generated/lockfile outputs match their authoritative sources.

When tooling is available and the task permits, run the smallest relevant checks. Do not turn a review into an unrelated repair.

## Write actionable findings

A blocking finding should contain:

```text
condition
-> observed defect
-> consequence
-> evidence/location
-> required property of the correction
```

Recommend a specific implementation only when the solution is constrained enough to justify it. Otherwise state the invariant/contract the fix must satisfy.

Avoid findings that amount only to personal preference, speculative future architecture, or repository-wide cleanup outside the change.

## Completion

Lead with findings ordered by severity/consequence. If no blocking defects are found, state that conclusion with the evidence scope and any meaningful unverified areas.

Do not claim the change is production-safe merely because no issue was found in the reviewed diff. Review confidence is bounded by the available requirements, tests, environment and runtime evidence.
