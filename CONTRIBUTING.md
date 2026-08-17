# Contributing

## Authoring contract

Before creating, redesigning, auditing, or substantially updating a skill, read and follow [`skills/skill-creator/SKILL.md`](skills/skill-creator/SKILL.md) and the references it routes to for the current task. It is the authoritative definition of skill-design behavior in this repository; templates and repository checks cover packaging but do not replace behavioral design or forward validation.

## Skill directory contract

Every public skill must use this layout:

```text
skills/<name>/SKILL.md
```

The `SKILL.md` file must begin with YAML frontmatter containing at least:

```yaml
---
name: example-skill
description: Explain what the skill does and when an agent should use it.
---
```

Requirements:

- `name` must contain only lowercase letters, digits, and hyphens.
- `name` must exactly match the containing directory name.
- `description` must be concrete enough for an agent to decide when to load the skill.
- Skill names must be unique within the repository.
- Supporting files must stay inside the skill directory unless they are repository-wide tooling.
- Do not place another discoverable `SKILL.md` inside examples or test fixtures.

## Optional test convention

A skill may expose a portable test entry point at:

```text
skills/<name>/tests/test.sh
```

The repository test runner executes each of these files from the repository root.

## Before submitting

Run:

```bash
python scripts/validate_repository.py
bash scripts/test_all.sh
npx skills add . --list
```
