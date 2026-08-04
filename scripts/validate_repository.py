#!/usr/bin/env python3
"""Validate the structure and frontmatter of every public skill in this repository."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILLS_DIR = ROOT / "skills"
NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


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

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    names = ", ".join(sorted(seen))
    print(f"Validated {len(seen)} skill(s): {names}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
