# QA test control plane

Use this reference when an agent must turn repository evidence into a concrete verification path without guessing commands or treating tool detection as execution authority.

## Two read-only tools

`inspect_test_system.py` inventories evidence that a test system exists: test directories, manifests, configs/specs, CI, test frameworks, UI/device tools, API/contract/service-virtualization tools, performance/resilience tools, security/accessibility tools, reporting and coverage.

`plan_test_checks.py` converts stronger repository evidence into **candidate commands**. It prefers:

```text
repository-owned package scripts
> build/test wrappers
> explicit test presets
> configured ecosystem entry points
> generic ecosystem fallbacks
```

Neither script executes tests, changes files, creates data, contacts a target, or widens authorization.

## Typical usage

```bash
python scripts/inspect_test_system.py /path/to/project
python scripts/plan_test_checks.py /path/to/project
python scripts/plan_test_checks.py /path/to/project --format text
```

Treat output as orientation evidence, not a checklist that must all be run.

## What the planner may identify

- Node package scripts for unit, integration, contract, E2E, accessibility, smoke, coverage, performance or security suites;
- Gradle/Maven wrapper-based test and integration lifecycles;
- pytest, tox and nox entry points;
- Go tests and the race detector as distinct evidence paths;
- .NET and Rust test entry points;
- CMake test presets;
- Postman collections, k6, JMeter and Locust artifacts;
- test commands already visible in CI configuration.

A detected dependency alone is weaker evidence than a configured command. The planner deliberately does not synthesize detailed framework commands from a library name when repository ownership is unclear.

## Select candidates from risk

Choose the candidate because it can falsify a relevant claim:

- logic/state rule → focused unit/component check;
- database, broker, cache, protocol or external integration → integration/contract evidence;
- browser/device/user journey → E2E or platform path;
- compatibility contract → consumer/provider/schema/version matrix;
- concurrency/race risk → concurrency-specific evidence;
- latency/capacity claim → controlled performance workload plus telemetry;
- authorization/input/security claim → explicitly authorized security assurance;
- release/deployment claim → deployed smoke/system/production-safe evidence.

Do not run unit + integration + E2E + performance merely because all are present. The evidence boundary determines depth.

## Command safety classes

Before executing a candidate, classify its real target and side effects.

### Repository-local candidates

Compiler/test-runner commands may still start containers, services, browsers, emulators, databases, or network calls through test fixtures. Inspect configuration and setup code before assuming they are local.

### Target-dependent candidates

E2E, smoke, Postman/Newman and similar suites often take an environment URL and credentials. Verify the selected target, identity, data setup, cleanup and allowed mutations first.

### Load-generating candidates

k6, JMeter, Locust, stress/soak/capacity scripts can materially affect services and infrastructure. Require explicit target and workload understanding; use environment-specific authorization, thresholds, stop conditions and generator-capacity checks.

### Security candidates

DAST, fuzzing against remote services, authorization bypass checks, credential attacks or invasive scanners may create hostile traffic. A configured security script is evidence of capability, not permission. Preserve the security owner's authorization boundary.

### Production candidates

Any command that can reach production must be treated according to its actual production effects even if its file name says `smoke` or `test`. Confirm authorization, blast radius, test identity, traffic, observability, abort/rollback/reconciliation and cleanup.

## Prefer the project-native path

Before running a generic candidate such as `python -m pytest`, `go test ./...` or `cargo test --workspace`, inspect:

- repository instructions and task runners;
- CI jobs and their setup;
- package/build scripts;
- required environment variables and secrets;
- markers/tags/profiles/test categories;
- containers/services and fixtures;
- generated code/migrations/test data;
- sharding, retries and quarantine behavior.

If CI uses a wrapper command, use that wrapper unless the narrower command is intentionally chosen for local falsification.

## Interpret results correctly

A command result needs context:

```text
candidate selected
+ reason/risk protected
+ exact command actually executed
+ product/test versions
+ environment/target
+ data/identity
+ exit status and artifacts
+ failed/skipped/retried/quarantined details
+ evidence limitation
```

A green exit code does not prove every test ran. Inspect skips, filters, retries, shards, quarantine and report completeness when they can affect the decision.

## When to extend the planner

Add deterministic detection only when repository evidence can support a safe candidate without hidden assumptions. Good additions have:

- a clear file/config/script signal;
- an unambiguous candidate entry point or explicit placeholder;
- a defined risk/evidence category;
- safety flags for targets, authorization and external mutation;
- automated fixture tests proving selection behavior.

Do not turn the planner into a universal command generator. Uncertain or version-sensitive behavior belongs in the technology adapter or project-specific investigation.
