# Project Manager offline reference library

This is the source-backed teaching layer for `project-manager`. It is deliberately separate from the authored operating references: the authored references explain how to work; this library supplies canonical/open material that the agent can learn from or consult like a dictionary.

## Layer model

```text
curriculum.md
    learning order and source purpose

processed/<source-id>/...
    default Agent reading/search layer
    PDF and other supported documents are converted to Markdown during sync

originals/<source-id>/...
    exact downloaded or Git-mirrored evidence
    SOURCE.json records source/version/license/hash/provenance

SOURCES.json
    reviewed source catalog

SOURCES.lock.json
    resolved revisions, URL hashes, counts, and agent-ready status

restricted-canon.md
    important standards/books that require authorized external editions
```

Do not make an Agent parse a PDF during ordinary use. The presence of an original PDF without a corresponding processed Markdown derivative is a verification failure.

## Bundled curriculum

The catalog intentionally spans different management problems rather than seven competing methodologies:

| Source | Primary teaching use |
|---|---|
| `usds-playbook` | users, iterative digital delivery, contracting, metrics, transition |
| `scrum-guide-2020` | minimum Scrum framework, empiricism, accountabilities, events, artifacts and commitments |
| `open-guide-to-kanban-2025-7` | workflow, WIP, flow, measures, improvement and value |
| `gao-agile-assessment` | organization/program-level Agile adoption, execution, monitoring and control |
| `gao-schedule-assessment` | reliable schedules, dependencies, critical path, baseline and schedule risk |
| `gao-cost-estimating` | credible estimates, WBS, uncertainty, reserves, EVM and forecast evidence |
| `pm2-project-management` | open governance/lifecycle/methodology map, phases, artifacts, mindsets and tailoring |

Read `curriculum.md` to understand how these sources fit together. They are complementary evidence models, not a recipe to install every practice in every project.

## Runtime use

From the skill directory:

```bash
python scripts/offline_library.py list
python scripts/offline_library.py search "Sprint Goal" --source scrum-guide-2020
python scripts/offline_library.py search "work in progress" --source open-guide-to-kanban-2025-7
python scripts/offline_library.py search "critical path" --source gao-schedule-assessment
python scripts/offline_library.py search "earned value" --source gao-cost-estimating
python scripts/offline_library.py search "governance" --source pm2-project-management
python scripts/offline_library.py read gao-schedule-assessment/gao-16-89g-schedule-assessment.pdf.md --start 1 --end 60
python scripts/offline_library.py verify
```

`search` and `read` use processed Markdown by default. Add `--originals` to search original text documents or `--original` when exact original text bytes matter. Binary PDFs remain available in `originals/` for audit/provenance but are not printed by the CLI.

## Source authority

Use source material at the right level:

- Scrum Guide defines Scrum; a training blog does not override it.
- Kanban source material defines its flow model; a board tool's defaults do not define Kanban.
- GAO guides are deep assessment/reference material, not mandatory policy for every project.
- PM² provides an open methodology model; adopt or tailor it only where governance and organizational context justify it.
- USDS Playbook is digital-delivery guidance, not a complete project-management standard.

Project contracts, sponsor/governance decisions, organizational process assets, finance/procurement controls, product authority, and actual delivery evidence outrank generic source material.

## Restricted canon

See `restricted-canon.md` for PMBOK/PMI, PRINCE2, ISO and commercial classics. Their importance does not grant this repository permission to redistribute their text.

## Updating the library

Use the repository workflow for project-manager library sync on a work branch. The process must:

1. validate the reviewed catalog;
2. resolve GitHub revisions or download reviewed HTTPS artifacts;
3. verify Git blobs or URL SHA-256 expectations;
4. preserve exact originals and provenance;
5. preprocess supported documents into Markdown;
6. run `offline_library.py verify` and project-manager tests;
7. commit only a fully verified library state.

For versioned URL sources, after the first verified sync, record the observed SHA-256 in `SOURCES.json`. A future byte change at the same versioned URL must fail until the catalog is deliberately updated and reviewed.
