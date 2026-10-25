# Agent Skills

A growing collection of reusable skills for AI coding agents.

Each skill lives in its own directory under `skills/` and can be discovered and installed independently with the open `skills` CLI.

This collection contains 23 skills. See [V1 restoration](docs/v1-restoration.md) for preserved versions and verification scope. The standalone [maintainable-design skill](skills/maintainable-design/) is separate from the preserved `feature/skills-maintainability` optimization branch.

## Available skills

| Skill | Description |
|---|---|
| [`backend-engineer`](skills/backend-engineer/) | Senior polyglot backend engineering for designing, building, reviewing, testing, debugging, hardening, migrating, and operating production server-side systems. |
| [`code-review`](skills/code-review/) | Independent code review for structural complexity, ownership, abstraction health, maintainability, clarity, consistency, correctness risks, and behavior-preserving refinement. |
| [`coremail`](skills/coremail/) | Operate Coremail accounts, mail, attachments, contacts, calendars, and settings through the local SDK, CEF CDP, and bundled Windows controls. |
| [`design-judgment`](skills/design-judgment/) | Make context-sensitive choices about concepts, naming, abstractions, configuration, and interactions, with explicit tradeoffs and evidence. |
| [`designer`](skills/designer/) | Senior product, interaction, visual, and design-system practice for creating or evolving coherent interfaces, auditing designs, operating Figma or Pen safely, and preparing implementable handoff. |
| [`devops-engineer`](skills/devops-engineer/) | Senior DevOps and platform engineering for CI/CD, containers, Kubernetes/GitOps, infrastructure as code, configuration and identity, observability, release controls, recovery, and software supply-chain systems. |
| [`dispatcher`](skills/dispatcher/) | Assign authorized work to existing agent sessions, manage capacity and workspace ownership, and track delivery and completion. |
| [`drawio`](skills/drawio/) | Create, edit, repair, inspect, validate, lay out, route, style, and export native editable diagrams.net/draw.io files with bundled XML references and deterministic Python tooling. |
| [`frontend-audit`](skills/frontend-audit/) | Audit and remediate frontend product experiences across web and desktop applications, including product truth, UX, accessibility, responsiveness, state handling, component-system compliance, and frontend architecture. |
| [`frontend-engineer`](skills/frontend-engineer/) | Act as the frontend owner who can understand, build, debug, review, audit, remediate, and verify production frontends through tested handoff. |
| [`icenter`](skills/icenter/) | Operate iCenter accounts, messages, files, monitoring, meetings and applications through dependency-free SDK/API tools over CDP, with page or optional desktop tools selected for the task. |
| [`knowledge`](skills/knowledge/) | 主动检索项目背景、识别开发与排障中的知识变化，按证据取舍、更新和组织长期知识；无需用户点名，读写遵循任务权限。 |
| [`maintainable-design`](skills/maintainable-design/) | Implement, refactor and review maintainable code with useful contracts, clear ownership and dependable defaults. |
| [`natural-writing`](skills/natural-writing/) | 撰写、改写和审查面向读者的自然语言，处理空泛评价、虚假推理、机械结构和语义受损。 |
| [`presentation`](skills/presentation/) | Plan, create, revise and review presentations, slide decks and speaker notes. |
| [`product`](skills/product/) | 建立、逆向重建、审查、规范化并持续维护产品定义库，覆盖产品定义、业务流程与规则、产品和技术边界，以及面向 UX、UI、架构、开发、数据和 QA 的交接。 |
| [`project-manager`](skills/project-manager/) | Senior adaptive project management for governance, scope, schedule, cost, resources, procurement, RAID, stakeholders, predictive/agile/hybrid delivery, recovery, acceptance, closure, and benefits. |
| [`qa-engineer`](skills/qa-engineer/) | Senior quality engineering for risk-based strategy, functional and non-functional testing, automation, defect diagnosis, UAT facilitation, production validation, and release evidence. |
| [`skill-creator`](skills/skill-creator/) | Design, create, audit, refactor, and validate portable Agent Skills as professional behavior systems. |
| [`software-architect`](skills/software-architect/) | Discover, design, document, evaluate, and steward software architectures from system drivers through implementation conformance. |
| [`svg`](skills/svg/) | Create, edit, repair, validate, and optimize standalone SVG files with deterministic layout and parse/render verification. |
| [`vision`](skills/vision/) | Describe, analyze, or OCR images using an external vision API when the underlying model lacks native image understanding. |
| [`watcher`](skills/watcher/) | Collect and persist external events, wake a configured agent session, and retain delivery and recovery evidence. |

The [automation composition example](docs/automation/composition.md) connects iCenter, watcher, and dispatcher through their public interfaces, with separate state and migration boundaries.

## Install

List all skills available in this repository:

```bash
npx skills add JarynXu/skills --list
```

Install one skill:

```bash
npx skills add JarynXu/skills --skill svg
```

Install one skill globally for Codex without prompts:

```bash
npx skills add JarynXu/skills --skill svg --global --agent codex --yes
```

Install every skill in this repository for Codex:

```bash
npx skills add JarynXu/skills --skill '*' --agent codex
```

A skill can also be installed directly from its GitHub directory URL:

```bash
npx skills add https://github.com/JarynXu/skills/tree/main/skills/svg
```

## Repository layout

```text
.
├── AGENTS.md               # Rules entry point
├── CONTRIBUTING.md         # Package, Git, verification, and release contracts
├── skills/<name>/          # Independently installable skill packages
├── docs/                   # Maintainer documentation and verification records
├── scripts/                # Repository checks
├── templates/              # Authoring scaffolding
├── THIRD_PARTY_LICENSES/   # Redistributed material's license texts
└── .github/workflows/      # Validation and library maintenance automation
```

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for package layout, resource ownership, version control, required commands, and release boundaries. Use [skill-creator](skills/skill-creator/SKILL.md) for skill design and validation methods.

## License

Repository-authored material is available under the [MIT License](LICENSE) to the extent the repository has the right to license it. Vendored or source-derived third-party material retains its original license, public-domain status, attribution requirements, and disclaimers; it is not relicensed under MIT merely by being included here.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), `THIRD_PARTY_LICENSES/`, and the `SOURCES.json` / `SOURCE.json` provenance records inside offline reference libraries for source-specific terms.
