# Agent Skills

Reusable, product-oriented skills for coding agents. Each skill follows the open Agent Skills format and keeps its canonical source under `skills/<skill-name>/`.

## Available skills

- `frontend-audit` — audit and remediate frontend product truth, UX, implementation consistency, and end-to-end verification.

## Install

List the skills in this repository:

```bash
npx skills add <owner>/skills --list
```

Install `frontend-audit` for Codex:

```bash
npx skills add <owner>/skills --skill frontend-audit --agent codex
```

Use `--global` to install it for all projects. Replace `<owner>` with the GitHub account or organization after the remote repository is created.
