# Test automation architecture

Use this reference for choosing tools, structuring test code, controlling environments and data, managing flakiness, parallel execution, reporting, and CI integration.

## Automate a decision, not a manual script

Define the protected risk, test level, oracle, trigger, expected lifetime, owner, runtime budget, and failure action. A check that nobody trusts or acts on is not useful automation.

## Structure test code by stable responsibility

Keep domain intent separate from drivers and setup:

- readable tests or scenarios express behavior and expected results;
- domain-specific clients, page/screen objects, or task abstractions expose stable user or API actions without hiding assertions;
- fixtures/builders create valid and intentionally invalid data;
- adapters manage browsers, devices, services, databases, queues, clocks, and external stubs;
- environment/configuration selects authorized targets and secrets;
- artifact collection captures diagnostics without leaking sensitive data.

Avoid generic abstraction frameworks before repeated stable patterns exist. Do not centralize every selector or endpoint into a brittle global object.

## Control dependencies faithfully

Use mocks for local branching, stubs for fixed protocol responses, fakes for simplified behavior, simulators for platform behavior, service virtualization for controlled integrations, contract tests for compatibility, and real dependencies for semantics substitutes remove. Label limitations.

Testcontainers or ephemeral environments can improve database, broker, and service fidelity. Pin versions and apply real migrations. A lightweight substitute is acceptable only when the protected behavior is equivalent.

## Design deterministic fixtures

Control time, randomness, IDs, locale, network, feature flags, and cleanup when they are not the subject. Create data through public or supported setup paths where possible. Use unique namespaces, tenants, accounts, or schemas for parallel isolation. Make cleanup idempotent and preserve failed state only under a controlled retention policy.

## Manage concurrency and flakiness

Parallelize only independent tests and resources. Define worker bounds, sharding, ordering, retries, and artifacts. Retries may identify intermittent behavior but must not turn a first-attempt failure into silent success. Track first-attempt pass rate and quarantine only with owner, reason, issue, compensating evidence, and expiry.

Diagnose flake causes: uncontrolled time, shared data, async waiting, environment capacity, browser/device lifecycle, network, dependency instability, order coupling, or product race. Fix the mechanism rather than adding sleeps.

## Integrate into delivery

Layer gates by feedback speed and risk:

```text
pre-commit/local focused checks
-> pull-request static and fast tests
-> integration and contract suites
-> deploy-stage smoke/system checks
-> scheduled matrix/performance/resilience suites
-> production-safe verification
```

Define failure ownership, artifact retention, rerun policy, waiver authority, and cost. Cancel obsolete runs where safe. Keep test and product versions traceable.

## Reporting and observability

A useful failure report includes expected/observed, step or request, environment, version, data identity, logs, trace/correlation IDs, screenshots/video where relevant, network or console evidence, and retained state. Allure or similar systems can organize results, but generated dashboards do not replace classification and decision context.

Review automation as production code: correctness, readability, security, dependencies, performance, observability, and maintainability. Remove obsolete tests when their protected contract is retired and their decision use is gone.
