# Agent Skills

A growing collection of reusable skills for AI coding agents.

Each skill lives in its own directory under `skills/` and can be discovered and installed independently with the open `skills` CLI.

## Available skills

| Skill | Description |
|---|---|
| [`backend-engineer`](skills/backend-engineer/) | Senior polyglot backend engineering for designing, building, reviewing, testing, debugging, hardening, migrating, and operating production server-side systems. |
| [`designer`](skills/designer/) | Senior product, interaction, visual, and design-system practice for creating or evolving coherent interfaces, auditing designs, operating Figma or Pen safely, and preparing implementable handoff. |
| [`devops-engineer`](skills/devops-engineer/) | Senior DevOps and platform engineering for CI/CD, containers, Kubernetes/GitOps, infrastructure as code, configuration and identity, observability, release controls, recovery, and software supply-chain systems. |
| [`drawio`](skills/drawio/) | Create, edit, repair, inspect, validate, lay out, route, style, and export native editable diagrams.net/draw.io files with bundled XML references and deterministic Python tooling. |
| [`frontend-audit`](skills/frontend-audit/) | Audit and remediate frontend product experiences across web and desktop applications, including product truth, UX, accessibility, responsiveness, state handling, component-system compliance, and frontend architecture. |
| [`frontend-engineer`](skills/frontend-engineer/) | Act as the frontend owner who can understand, build, debug, review, audit, remediate, and verify production frontends through tested handoff. |
| [`product`](skills/product/) | 建立、逆向重建、审查、规范化并持续维护产品定义库，覆盖产品定义、业务流程与规则、产品和技术边界，以及面向 UX、UI、架构、开发、数据和 QA 的交接。 |
| [`project-manager`](skills/project-manager/) | Senior adaptive project management for governance, scope, schedule, cost, resources, procurement, RAID, stakeholders, predictive/agile/hybrid delivery, recovery, acceptance, closure, and benefits. |
| [`qa-engineer`](skills/qa-engineer/) | Senior quality engineering for risk-based strategy, functional and non-functional testing, automation, defect diagnosis, UAT facilitation, production validation, and release evidence. |
| [`skill-creator`](skills/skill-creator/) | Design, create, audit, refactor, and validate portable Agent Skills as professional behavior systems. |
| [`software-architect`](skills/software-architect/) | Discover, design, document, evaluate, and steward software architectures from system drivers through implementation conformance. |
| [`svg`](skills/svg/) | Create, edit, repair, validate, and optimize standalone SVG files with deterministic layout and parse/render verification. |
| [`vision`](skills/vision/) | Describe, analyze, or OCR images using an external vision API when the underlying model lacks native image understanding. |

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
├── skills/
│   ├── svg/
│   │   ├── SKILL.md
│   │   ├── examples/
│   │   ├── scripts/
│   │   └── tests/
│   └── another-skill/
│       └── SKILL.md
├── scripts/
│   ├── validate_repository.py
│   └── test_all.sh
├── templates/
│   └── skill/
│       └── SKILL.template.md
└── .github/workflows/
    └── validate-skills.yml
```

## Add another skill

1. Use [`skill-creator`](skills/skill-creator/) to define the target behavior, authority boundaries, implementation structure, and validation contract.
2. Initialize `skills/<skill-name>/` with the installed skill creator's initializer.
3. Use lowercase letters, digits, and hyphens for `<skill-name>`.
4. Set the YAML frontmatter `name` to exactly the directory name.
5. Add only the references, scripts, assets, metadata, and tests required by the behavior contract.
6. If the skill has executable tests, expose them as `skills/<skill-name>/tests/test.sh`.
7. Run the repository checks:

```bash
python scripts/validate_repository.py
bash scripts/test_all.sh
```

Use [`templates/skill/SKILL.template.md`](templates/skill/SKILL.template.md) only as a packaging fallback when the installed initializer is unavailable; it does not replace the `skill-creator` design workflow.

## Local CLI check

From the repository root:

```bash
npx skills add . --list
```

The output should include every directory under `skills/` that contains a valid `SKILL.md`.

## License

MIT
