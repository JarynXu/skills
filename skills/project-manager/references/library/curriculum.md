# Project-management offline curriculum

This curriculum turns the local library into a learning sequence rather than a document shelf. The project itself remains the final authority: sponsor/governance, contracts, product authority, finance/procurement systems, delivery tools, specialist evidence, and actual outcomes override generic guidance.

## Choose learning depth

### Full learning

Use this path when project-management concepts are unfamiliar, when the project is already in trouble, or when the agent cannot explain why a control exists.

### Focused learning

Use only the relevant track when the management model is already understood. Search `processed/` first and return to `originals/` only for exact wording, page context, license, or provenance.

## Track 1 — Project purpose, authority, governance, and lifecycle

Start with the authored control plane:

1. `../core/project-truth-and-authority.md`
2. `../core/adaptive-management-system.md`
3. `../practices/scope-requirements-and-change.md`

Then study **PM² Project Management** for an openly published end-to-end methodology: governance model, lifecycle/phases, activities, artifacts, monitor-and-control concepts, tailoring, and mindsets. Use the 2025 Highlights as a quick operational map and the v3.1 change note to understand the current full-guide lineage.

Do not imitate a methodology mechanically. Learn what problem each role, phase, artifact, and control solves, then tailor it to the project's decision rights and evidence needs.

## Track 2 — Scope, schedule, dependencies, and reliable plans

Read `../practices/schedule-estimation-and-dependencies.md`, then use the **GAO Schedule Assessment Guide** as the deep reference for:

- defining all activities and sequencing them logically;
- resources and realistic durations;
- valid critical path and reasonable float;
- schedule risk analysis;
- baseline integrity and progress updates;
- traceability between schedule, cost, scope, and EVM.

A schedule is a model, not a promise. Learn the assumptions and data needed for the schedule to support decisions.

## Track 3 — Cost, estimate credibility, reserves, and performance

Read `../practices/cost-resources-and-procurement.md`, then study the **GAO Cost Estimating and Assessment Guide** for:

- estimate purpose and technical baseline;
- work breakdown structures;
- data collection and normalization;
- estimating methods;
- sensitivity, risk, and uncertainty;
- documentation and independent validation;
- earned value management and estimate-at-completion reasoning.

Use `scripts/project_metrics.py` only after the model and data are understood. A computed CPI, SPI, PERT estimate, percentile, or Monte Carlo forecast is evidence—not an approved commitment.

## Track 4 — Adaptive delivery, Scrum, Kanban, and empirical control

Read `../practices/agile-flow-and-hybrid-delivery.md` before choosing a framework.

Then learn three complementary sources:

1. **The Scrum Guide** for the minimum Scrum framework: empiricism, accountabilities, events, artifacts, commitments, Sprint Goal, Product Goal, and Definition of Done.
2. **Open Guide to Kanban** for visualizing workflow, managing work in progress, actively managing work items, improving flow, and using flow/value measures.
3. **GAO Agile Assessment Guide** for organization-level adoption, program monitoring/control, metrics, requirements, culture, team dynamics, DevOps/CI relationships, and evidence used to assess whether Agile is actually working.

Do not turn Scrum events or Kanban boards into ceremonial compliance. Ask what feedback loop, flow constraint, risk, or decision each mechanism is intended to improve.

## Track 5 — User-centered digital delivery, incremental value, and procurement

Study the selected **U.S. Digital Services Playbook** plays after the adaptive-delivery track. They reinforce:

- understanding primary users and their needs;
- iterative and incremental delivery;
- structuring budgets/contracts so they do not prevent learning and delivery;
- using meaningful metrics;
- planning transition and ongoing ownership.

This material is deliberately narrower than a project-management body of knowledge. Use it to pressure-test whether governance and procurement enable delivery rather than merely produce compliance artifacts.

## Track 6 — Risk, decisions, stakeholders, quality, release, and recovery

Return to the authored references:

- `../practices/risk-decisions-stakeholders-and-communications.md`
- `../practices/quality-acceptance-release-and-transition.md`
- `../practices/project-recovery-closure-and-benefits.md`

Use GAO schedule/cost/agile sources as evidence models where they intersect with these controls. Risk is not a separate spreadsheet exercise: uncertainty must influence scope, schedule, cost, procurement, quality, decision timing, and contingency.

## Track 7 — Hybrid management

Hybrid does not mean running two complete systems at once. Combine controls only when each solves a real problem.

A common software-project combination is:

```text
sponsor/governance + funding/contract milestones
    ↓
product outcomes and roadmap
    ↓
rolling-wave delivery / Scrum or flow system
    ↓
reliable dependencies, cost/schedule forecasts, RAID and decisions
    ↓
quality/release evidence and benefits tracking
```

Use PM² for governance/lifecycle structure, GAO for quantitative reliability, Scrum/Kanban for empirical delivery, and USDS for digital-delivery/procurement pressure tests. Preserve one coherent source of truth for commitments and decisions.

## Restricted canon

Read `restricted-canon.md` to know which influential standards/books should be studied from an authorized edition when the project or organization adopts them. A source being important does not create redistribution rights.

## Runtime lookup

From the skill directory:

```bash
python scripts/offline_library.py list
python scripts/offline_library.py search "critical path" --source gao-schedule-assessment
python scripts/offline_library.py search "Sprint Goal" --source scrum-guide-2020
python scripts/offline_library.py search "work in progress" --source open-guide-to-kanban-2025-7
python scripts/offline_library.py search "governance" --source pm2-project-management
python scripts/offline_library.py read scrum-guide-2020/scrum-guide-2020.pdf.md --start 1 --end 80
python scripts/offline_library.py verify
```

Search results are navigation evidence, not decisions. Read enough surrounding context to understand conditions, exceptions, definitions, and the authority of the source.
