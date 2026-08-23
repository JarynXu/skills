# Project-management tool and system routing

Use tools to preserve authoritative project evidence and reduce coordination cost. Do not let the convenience of a tool decide the management method.

## Work tracking and product systems

Common systems include GitHub Projects/Issues, Jira, Azure DevOps, Linear and other backlog/workflow platforms. Inspect:

- workflow/status semantics;
- hierarchy and ownership;
- backlog versus committed scope;
- iteration/release fields;
- dependencies/links;
- custom fields and automation;
- permissions and edit authority;
- historical reporting behavior;
- integration with source/CI/release evidence.

A ticket state such as “Done” does not necessarily mean accepted, deployed or benefit-realized.

## Scheduling

Spreadsheets, Microsoft Project, Primavera and similar scheduling tools can model dependencies, calendars, baselines and critical path. Use the organization’s chosen system when schedule logic is substantial.

Verify:

- dependency type and actual logic;
- calendars/resource constraints;
- milestone meaning;
- baseline version;
- actual/remaining duration updates;
- constraints/deadlines;
- critical/near-critical paths;
- integration with external milestones.

Do not generate a detailed Gantt solely because a tool can.

## Spreadsheets and quantitative analysis

Spreadsheets remain useful for scenarios, EVM, cash flow, Monte Carlo, RAID analysis and reconciliations. Keep inputs, units, formulas, source dates and assumptions visible. Protect formulas/reference data from accidental edits and distinguish manual copies from authoritative systems.

Use `scripts/project_metrics.py` for reproducible EVM, PERT and simple throughput simulation when it fits the problem.

## Documentation and decisions

Google Docs/Drive, Confluence, SharePoint, repositories and document-management systems can hold charters, governance, decisions, plans, status and acceptance records. Prefer stable links/IDs and named owners over copying documents into multiple locations.

For decisions, preserve authority/date/rationale/consequence. Meeting notes are not automatically decisions unless the authority and choice are explicit.

## Communication

Email, Slack, Teams and meetings are communication channels, not ideal long-term sources of truth for every control. When a message makes a material decision, commitment or acceptance, move/record the decision in the governed system with provenance.

## Financial and procurement systems

Finance/ERP/procurement/contract systems own actuals, commitments, purchase orders, invoices and controlled commercial data. Project trackers should reference/reconcile rather than silently override them.

Do not infer legal interpretation, payment entitlement or available funding solely from a project spreadsheet.

## Quality and release systems

Test management, CI/CD, code hosting, security scanning, change/release management and observability systems provide evidence for quality/readiness. Project management integrates these signals but does not replace specialist interpretation.

## Reporting and dashboards

Dashboards should expose decisions and trends:

- milestone/forecast health;
- scope/change state;
- RAID trend and aging;
- cost/resource forecast;
- quality/acceptance readiness;
- dependency/blocker aging;
- decision latency;
- flow metrics where relevant;
- benefits/outcome evidence where observable.

A dashboard is a view. Preserve drill-down links to authoritative evidence.

## Automation and AI

Automation may summarize, reconcile, detect stale items, calculate metrics or draft status. It should not:

- approve a baseline/change;
- invent a sponsor decision;
- change product priorities without product authority;
- mark acceptance without acceptance evidence;
- edit financial actuals;
- close risks/issues without owner evidence;
- turn an AI forecast into a commitment.

Use AI to reduce administrative friction while preserving human/organizational authority and source provenance.

## Adoption rule

Introduce or change a project-management tool only when it improves a demonstrated control need. Consider migration cost, historical data, permissions, integrations, reporting semantics, exportability, automation, vendor lock-in and team workflow. Do not create parallel trackers simply because a new tool has better UI.
