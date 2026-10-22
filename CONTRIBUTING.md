# Contributing

This document owns repository engineering and delivery contracts. Skill design and validation methods belong to [skill-creator](skills/skill-creator/SKILL.md). Read the references it selects for the task; do not create a second authoring standard here.

## Package contract

Keep each public skill's canonical source at `skills/<name>/SKILL.md`. Use UTF-8 text. The entry starts with YAML frontmatter containing exactly these fields:

```yaml
---
name: example-skill
description: Explain the capability and the situations in which an agent should use it.
---
```

- Use lowercase letters and digits separated by single hyphens for `name`. Match the containing directory and keep the name unique.
- Review the description for task selection. Character count does not establish whether it describes a useful trigger.
- Keep required runtime files within the skill directory so the skill can be installed on its own. Use relative links to bundled resources.
- Declare external tools, environment requirements, and supported interfaces at their point of use. Optional host metadata belongs under `agents/`; portable behavior must not require undocumented host hooks or context.
- Keep the [README skill table](README.md#available-skills) synchronized with public skills and sorted by name.
- Do not put another discoverable `SKILL.md` in examples or fixtures. Do not author per-skill README files, changelogs, or installation guides; use repository documentation for those purposes. Preserve required third-party notices.

An installed initializer may scaffold a new package. [The template](templates/skill/SKILL.template.md) is a fallback when that initializer is unavailable. Neither chooses the skill's workflow or requires optional directories to be created.

## Resource ownership

| Location | Responsibility |
|---|---|
| `skills/<name>/SKILL.md`, `references/`, `scripts/`, `assets/`, `agents/` | Installable instructions and resources, organized using skill-creator |
| `skills/<name>/tests/` | Optional executable regression checks and their fixtures |
| `skills/<name>/evals/` | Optional reusable behavioral tasks and acceptance criteria |
| `docs/` | Maintainer documentation and selected verification records; skill-specific records live under `docs/<name>/` |
| `scripts/`, `.github/workflows/` | Repository checks and maintenance automation |
| `templates/` | Scaffolding for authors |

Tests and evaluation materials serve maintainers. Do not route ordinary skill use through them, and keep expected outcomes out of the evaluated agent's inputs. Keep reusable cases together with their acceptance criteria when reorganizing them. A run record may link to those cases instead of copying them.

Create only resources used by the skill or its maintenance. A verification obligation does not require a `tests/` directory, an evaluation harness, or a new script. Follow [the validation method](skills/skill-creator/references/validation.md) to select evidence and its retention scope.

Do not commit installed copies such as `.agents/skills/` or `.claude/skills/`, caches, temporary run output, credentials, or private source data. Keep third-party attribution and provenance with redistributed material; follow [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Changes and version control

Inspect the current branch, history, working-tree changes, and staged changes before editing or preparing a commit. Preserve unrelated work. An instruction to edit does not authorize a commit, push, merge, tag, or release; follow the authority granted for the task or the project's release policy.

Use a logical change as the commit boundary. Include its necessary references, consumers, and verification updates. Use Conventional Commits (`type(scope): summary`) with a stable scope where one exists. Describe the resulting behavior, compatibility impact, and observed verification; do not use a sequence of editing steps as the change description.

Use Git history to preserve prior versions. Identify source revisions by commits and published revisions by release tags. Do not introduce per-skill version counters without a requirement to release skills independently. For an uncommitted comparison, preserve an identifiable local snapshot or diff until the result can be tied to a committed revision.

Review changes to skill names and triggers, tool parameters and results, dependencies, authority boundaries, and external effects for compatibility. Update affected references and consumers in scope; document migration requirements and unresolved external dependencies. Do not rewrite shared history or discard another contributor's work to simplify a change.

## Verification and submission

Every skill change requires evidence for the affected contract. Select and execute verification using [skill-creator's method](skills/skill-creator/references/validation.md). Keep required checks and relevant regression coverage. Report an unavailable or failing check and its impact; do not count it as passed or weaken its contract to obtain a pass.

Before submitting, run the existing repository entry points:

```bash
python scripts/validate_repository.py
bash scripts/test_all.sh
npx skills add . --list
```

The validator checks entry metadata and the README discovery table; it is not a complete link or behavior validator. The test runner executes existing `skills/<name>/tests/test.sh` entries from the repository root and repository composition checks in `scripts/tests/*.test.cjs`. Add such checks only when executable evidence is warranted. The discovery command lists skills without installing them. A successful command supports only the properties that command inspected.

Include the change's source revision or pending diff, actual verification, and material gaps in the handoff. Keep package checks, resource execution, and model-task results distinguishable. Reuse existing evidence for unchanged behavior with its original scope; a new editing session does not invalidate it.

## Release boundary

Publish only with release authorization. Release notes identify the source revision, affected capabilities, compatibility or dependency changes, and verification limits. Preserve release history. Keep local edits, local commits, remote updates, and published releases distinct in status reports.
