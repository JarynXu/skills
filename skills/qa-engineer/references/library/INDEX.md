# QA Offline Teaching Library

This library is the source-backed teaching and reference layer for `qa-engineer`. It is not a generic documentation cache. It exists so an agent can learn important test mechanisms when its mental model is weak, then retrieve exact official guidance later without depending on the network.

The consuming project's requirements, accepted risk decisions, repository instructions, configured tools, supported versions, environments, test data, and execution authority remain higher priority than generic material here.

## Start here

Choose the path that matches the knowledge gap:

- **Testing strategy or test design is unclear:** start with the authored QA model in `../core/quality-model.md`, `../practices/risk-and-strategy.md`, and `../practices/test-design-and-oracles.md`; use the offline sources below only to deepen a mechanism or tool.
- **Browser/E2E automation:** search `playwright-test-docs` first when the project uses Playwright; use `selenium-test-practices` for WebDriver/Selenium-oriented design guidance and durable browser-test practices.
- **Contract testing:** search `pact-specification` for consumer/provider contract and verification semantics.
- **Python test architecture:** search `pytest-core-docs` for fixtures, assertions, parametrization, selection, failure handling and test seams.
- **Property-based/generative testing:** search `hypothesis-property-testing` for shrinking and generative-test design.
- **Real dependency integration tests:** search `testcontainers-core-docs` for container lifecycle, networking, wait strategies, configuration and reuse trade-offs.
- **Application-security test design:** use `owasp-wstg` for security-testing methodology and `owasp-cheat-sheet-series` for compact authorization/API/input-validation guidance.

Do not preload every source. Select one source because the real test decision depends on it.

## Source packages

| Source ID | Role in the curriculum | Authority |
|---|---|---|
| `playwright-test-docs` | Browser/API/accessibility automation, fixtures, isolation, assertions, CI | Playwright project owner |
| `selenium-test-practices` | WebDriver test design, test independence, automation design practices | Selenium project owner |
| `pact-specification` | Consumer/provider contract format and verification guidance | Pact project specification |
| `pytest-core-docs` | Python test runner semantics, fixtures, assertions, parametrization, diagnostics | pytest project owner |
| `hypothesis-property-testing` | Property-based test generation and shrinking concepts | Hypothesis project owner |
| `testcontainers-core-docs` | Real-dependency integration test environments and lifecycle | Testcontainers project owner |
| `owasp-wstg` | Web application security-testing framework and selected test methods | OWASP WSTG |
| `owasp-cheat-sheet-series` | Focused authorization, REST and input-validation test guidance | OWASP Cheat Sheet Series |

Tool documentation is authoritative for the pinned upstream commit, not automatically for the consuming project's installed version. When versions differ, inspect the project's version-specific behavior before applying an API or default mechanically.

## Two offline layers

Every synced package has an audit layer and an agent-use layer:

```text
originals/<source-id>/
├── SOURCE.json
└── <byte-exact selected upstream files>

processed/<source-id>/
└── <agent-ready Markdown derivatives>
```

`SOURCE.json` records the upstream repository, resolved commit, source paths, Git blob SHA values, processing provenance, warnings and readiness status. `originals/` is used when exact upstream bytes matter. `processed/` is the normal search/read layer.

HTML, RST, SGML/XML, AsciiDoc, text and PDF inputs supported by the synchronizer are converted deterministically to Markdown. Existing Markdown is normalized into the processed layer with provenance headers. The verifier rejects processable documents that lack a Markdown derivative.

## Commands

From `skills/qa-engineer/`:

```bash
python scripts/offline_library.py list
python scripts/offline_library.py search "fixture" --source pytest-core-docs
python scripts/offline_library.py search "auto-retrying assertions" --source playwright-test-docs
python scripts/offline_library.py search "provider verification" --source pact-specification
python scripts/offline_library.py search "business logic" --source owasp-wstg
python scripts/offline_library.py read playwright-test-docs/docs/src/test-assertions-js.md --start 1 --end 120
python scripts/offline_library.py verify
```

Search and read use **processed Markdown by default**. Exact originals require explicit opt-in:

```bash
python scripts/offline_library.py search "fixture" --source pytest-core-docs --originals
python scripts/offline_library.py read pytest-core-docs/doc/en/how-to/fixtures.rst --original --start 1 --end 80
```

## Authority order

During real project work, apply evidence in this order:

```text
project requirements, risk decisions and repository instructions
> project's actual test architecture, supported versions and configured tools
> product/architecture/protocol/security standards that define the expected behavior
> official documentation for the installed test tool or dependency
> pinned source-backed material in this library
> authored QA practice guidance
> generic defaults
```

A source can teach how a mechanism works without deciding whether that mechanism should be used in the project.

## Safety boundary

Nothing in this library authorizes execution. Browser suites may mutate accounts and data; contract verification may contact providers; Testcontainers may start local containers; WSTG techniques can generate hostile traffic; load/security/production checks require their own target and authorization review.

Use `python scripts/plan_test_checks.py <project-root>` to derive candidate commands from repository evidence. Treat those candidates as planning evidence, not permission.

## Source governance

`SOURCES.json` is the reviewable source catalog. Each sync resolves mutable branch names to an exact commit, downloads selected Git blobs, verifies byte identity, preprocesses agent-ready Markdown, and writes `SOURCES.lock.json`.

Selection is deliberately curated. Do not mirror an entire upstream documentation tree because it is convenient. Add a source only when it closes a real QA knowledge gap, its exact material is redistributable under known terms, and a test can prove the synced material remains usable.
