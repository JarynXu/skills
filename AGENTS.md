# Skill collection conventions

- Keep canonical skill sources under `skills/<skill-name>/`.
- Follow the open Agent Skills `SKILL.md` format with only `name` and `description` in frontmatter.
- Keep skills portable across agents. Put optional product-specific metadata under `agents/` and avoid requiring agent-specific hooks or context features.
- Encode stable decision rules and workflows, not project history, personal preferences, temporary tool sequences, or hidden reasoning traces.
- Keep the main `SKILL.md` concise. Move detailed, conditionally needed guidance into directly linked `references/` files.
- Add scripts only for deterministic, repeated work. Make audit scripts read-only by default and treat their output as evidence, not conclusions.
- Do not add README, changelog, or installation guides inside individual skill folders.
- Initialize new skills with the installed skill creator, validate them with `quick_validate.py`, test their scripts, and verify repository discovery with `npx skills add . --list`.
- Do not commit installed copies such as `.agents/skills/`, `.claude/skills/`, or other agent-specific installation targets.
