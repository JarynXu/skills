# Test tool routing

Select tools only after the target surface, stack, protocol, platform, environment, and risk are known. Existing project configuration and executable commands outrank this catalog.

## Web UI and browser

- **Playwright:** multi-browser automation, network/context control, traces, screenshots/video, parallel workers, and modern end-to-end/component workflows.
- **Cypress:** browser-focused application testing with strong interactive diagnostics and project ecosystem integration.
- **Selenium/WebDriver:** broad language and browser ecosystem, legacy and grid environments.
- **WebdriverIO:** Node.js WebDriver/Appium ecosystem.

Choose from supported browser matrix, language, existing suite, component versus end-to-end need, remote grid, debugging, and team ownership. Use accessibility-first stable locators.

## Mobile, desktop, and devices

- **Appium:** cross-platform mobile/native automation through WebDriver-compatible drivers.
- Platform tools such as XCTest/XCUITest, Espresso/UI Automator, WinAppDriver or current Windows automation, and host-specific frameworks may provide deeper fidelity.
- Device/browser farms provide matrix breadth; real devices remain necessary for hardware, lifecycle, power, driver, and performance mechanisms.

## API, protocol, and contract

- **Postman/Newman** and **Bruno:** collection-based API workflows and CI execution.
- **REST Assured**, **Karate**, **Supertest**, **pytest/httpx**, language HTTP clients, and gRPC/protocol-specific harnesses support code-centric tests.
- **Pact** and **Spring Cloud Contract:** consumer/provider contract workflows.
- **Schemathesis** and schema-derived tools: generated API exploration; add domain oracles.
- **WireMock**, MockServer, Mountebank, Hoverfly, and ecosystem equivalents: service virtualization.

## Language test ecosystems

- JVM: JUnit 5, TestNG, AssertJ, Mockito/MockK, Testcontainers, Cucumber/JBehave where behavior collaboration justifies it.
- .NET: xUnit, NUnit, MSTest, FluentAssertions, Moq/NSubstitute, SpecFlow-compatible ecosystems where maintained.
- Python: pytest, unittest, Hypothesis, tox/nox, coverage, Robot Framework when keyword-driven collaboration is appropriate.
- JavaScript/TypeScript: Node test runner, Vitest, Jest, Mocha, Supertest, Testing Library.
- Go: `go test`, table tests, fuzzing, race detector, Testify where adopted, Testcontainers.
- Rust: Cargo test, proptest/quickcheck, criterion, integration harnesses.
- C/C++: GoogleTest/GoogleMock, Catch2, doctest, CTest, sanitizers and fuzzers.

## Performance and resilience

- k6: scriptable protocol/load tests with CI and distributed options.
- JMeter: broad protocol/plugin ecosystem and established enterprise use.
- Gatling: code-based load modeling in JVM ecosystems.
- Locust: Python-based distributed user behavior.
- Toxiproxy, Chaos Mesh, Litmus, Gremlin or platform fault injection: use only in authorized controlled scope.
- Profilers and telemetry are required to explain bottlenecks; a load generator alone is insufficient.

## Security and accessibility

- OWASP ZAP and authorized DAST tools for dynamic web/API checks.
- Ecosystem dependency, secret, SAST, container, and IaC scanners as triage inputs.
- axe-core, Lighthouse, Pa11y, Accessibility Insights, browser/platform inspectors, and real assistive technologies for accessibility.

## Reports and management

Allure, JUnit XML, HTML reports, traces, screenshots, videos, logs, and dashboards organize evidence. Test-management systems may support cases, traceability, runs, and approvals. Do not make proprietary tool availability a correctness dependency; preserve exportable evidence and source control where practical.

## Adoption rule

Introduce a tool only when it closes a demonstrated evidence gap and its license, version, integration, data handling, runtime cost, false-positive behavior, ownership, maintenance, and exit path are acceptable. Do not add a second framework merely for personal preference.
