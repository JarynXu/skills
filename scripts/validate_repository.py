#!/usr/bin/env python3
"""Validate public skill structure, frontmatter, and repository discovery metadata."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILLS_DIR = ROOT / "skills"
README = ROOT / "README.md"
NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
README_SKILL_ROW_RE = re.compile(r"^\| \[`([^`]+)`\]\(skills/([^/]+)/\) \|", re.MULTILINE)


def parse_frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        raise ValueError("missing opening YAML frontmatter delimiter")

    try:
        closing = next(i for i, line in enumerate(lines[1:], start=1) if line.strip() == "---")
    except StopIteration as exc:
        raise ValueError("missing closing YAML frontmatter delimiter") from exc

    data: dict[str, str] = {}
    for line in lines[1:closing]:
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line.startswith((" ", "\t")):
            continue
        key, sep, value = line.partition(":")
        if sep:
            data[key.strip()] = value.strip().strip('"\'')
    return data


def validate_readme(skill_names: set[str]) -> list[str]:
    errors: list[str] = []
    if not README.is_file():
        return ["README.md: missing repository README"]

    try:
        text = README.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        return [f"README.md: cannot read: {exc}"]

    start_marker = "## Available skills"
    start = text.find(start_marker)
    if start < 0:
        return ["README.md: missing '## Available skills' section"]
    section_start = start + len(start_marker)
    next_heading = text.find("\n## ", section_start)
    section = text[section_start:] if next_heading < 0 else text[section_start:next_heading]

    rows = README_SKILL_ROW_RE.findall(section)
    readme_names: list[str] = []
    for label, target in rows:
        if label != target:
            errors.append(
                f"README.md: skill table label {label!r} points to skills/{target}/; label and target must match"
            )
        readme_names.append(label)

    if len(readme_names) != len(set(readme_names)):
        duplicates = sorted({name for name in readme_names if readme_names.count(name) > 1})
        errors.append("README.md: duplicate skill table entries: " + ", ".join(duplicates))

    readme_set = set(readme_names)
    missing = sorted(skill_names - readme_set)
    extra = sorted(readme_set - skill_names)
    if missing:
        errors.append("README.md: missing skill table entries: " + ", ".join(missing))
    if extra:
        errors.append("README.md: skill table lists unknown skills: " + ", ".join(extra))

    if readme_names != sorted(readme_names):
        errors.append("README.md: Available skills entries must be sorted by skill name")

    return errors


def main() -> int:
    errors: list[str] = []
    discovered: list[tuple[str, Path]] = []

    if not SKILLS_DIR.is_dir():
        print("ERROR: missing skills/ directory", file=sys.stderr)
        return 1

    for child in sorted(SKILLS_DIR.iterdir()):
        if not child.is_dir() or child.name.startswith("."):
            continue
        skill_file = child / "SKILL.md"
        if not skill_file.is_file():
            errors.append(f"{child.relative_to(ROOT)}: missing SKILL.md")
            continue

        try:
            meta = parse_frontmatter(skill_file)
        except (OSError, UnicodeError, ValueError) as exc:
            errors.append(f"{skill_file.relative_to(ROOT)}: {exc}")
            continue

        name = meta.get("name", "")
        description = meta.get("description", "")

        if not name:
            errors.append(f"{skill_file.relative_to(ROOT)}: missing required 'name'")
        elif not NAME_RE.fullmatch(name):
            errors.append(
                f"{skill_file.relative_to(ROOT)}: invalid name {name!r}; "
                "use lowercase letters, digits, and single hyphens"
            )
        elif name != child.name:
            errors.append(
                f"{skill_file.relative_to(ROOT)}: frontmatter name {name!r} "
                f"does not match directory {child.name!r}"
            )

        if not description:
            errors.append(f"{skill_file.relative_to(ROOT)}: missing required 'description'")
        elif len(description) < 40:
            errors.append(
                f"{skill_file.relative_to(ROOT)}: description is too vague; "
                "use at least 40 characters"
            )

        discovered.append((name, skill_file))

    if not discovered:
        errors.append("no skills were discovered under skills/")

    seen: dict[str, Path] = {}
    for name, path in discovered:
        if not name:
            continue
        if name in seen:
            errors.append(
                f"duplicate skill name {name!r}: "
                f"{seen[name].relative_to(ROOT)} and {path.relative_to(ROOT)}"
            )
        else:
            seen[name] = path

    errors.extend(validate_readme(set(seen)))

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    names = ", ".join(sorted(seen))
    print(f"Validated {len(seen)} skill(s): {names}; README discovery table is synchronized")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
