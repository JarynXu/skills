# Orient to product and test-system truth

Use this reference before broad strategy, inherited-suite assessment, release investigation, or testing in an unfamiliar product.

## Establish sources and authority

Locate repository instructions, product definitions, acceptance criteria, architecture and design sources, API/event schemas, data rules, implementation, deployment configuration, release controls, existing test plans and automation, defect history, incidents, support cases, analytics, and current environment documentation.

Classify sources as authoritative, observed, historical, generated, proposed, or unresolved. A current screen proves appearance, not intended behavior. A green test proves its asserted path under its environment, not complete product correctness. A previous defect report proves a past observation, not current reproduction.

## Map only what changes the test decision

Determine the relevant subset of:

- actors, roles, permissions, journeys, states, transitions, irreversible actions, and recovery;
- entry surfaces: UI, API, event, file, CLI, scheduled work, device, native host, or third-party callback;
- data authority, lifecycle, migrations, privacy, test-data sources, and cleanup;
- synchronous and asynchronous dependencies, contracts, failure behavior, and service virtualization;
- supported browsers, devices, operating systems, locales, networks, deployment topologies, and versions;
- build, package, seed, migration, startup, test, report, release, rollback, and observability paths;
- known defects, flaky tests, quarantines, production escapes, support hotspots, and historical risk.

Every retained item must affect scope, risk, test design, environment, oracle, release decision, or handoff.

## Inventory the existing test system

Run `scripts/inspect_test_system.py` for a read-only first pass when useful. Then verify:

- test locations and ownership;
- frameworks, runners, browser/device drivers, performance tools, service virtualization, and report systems;
- configured scripts and CI jobs rather than package presence alone;
- test levels represented and risks omitted;
- data creation, reset, isolation, secrets, accounts, and environment selection;
- flaky, skipped, quarantined, slow, or non-gating suites;
- artifacts retained on failure and whether they are safe and sufficient;
- differences between local, CI, staging, preproduction, and production-like behavior.

Do not count generated fixtures, archived scripts, examples, or dependencies as active capability without an execution path.

## Establish a baseline

Record product version or commit, environment, configuration, dependencies, data state, tool versions, and what can actually run. Execute the smallest representative smoke or focused suite when authorized. Preserve pre-existing failures separately from change-induced failures.

If the environment is unavailable or materially unlike production, state which claims cannot be supported. Do not convert environment limitation into product pass or fail.

## Trace representative behavior

Trace one important normal path, one boundary or negative path, and one failure or recovery path through visible behavior, contract, data, dependencies, and telemetry. Identify points where asynchronous completion, eventual consistency, retries, caching, permissions, or mixed versions can make the obvious oracle wrong.

## Stop orientation proportionately

Proceed when the task has a trustworthy product rule, affected risk surface, environment and data plan, test-system route, oracle source, release context, and visible material uncertainty. Continue only when a missing fact could select a different test level, expected result, platform matrix, destructive action, or release conclusion.
