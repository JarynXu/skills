#!/usr/bin/env python3
"""Static contract checks for the backend-engineer runtime control plane."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "SKILL.md"

MODE_LINKS = {
    "ORIENT": "references/core/project-orientation.md",
    "DESIGN": "references/core/engineering-model.md",
    "BUILD / REFACTOR / HARDEN": "references/workflows/implement-and-refactor.md",
    "DIAGNOSE": "references/workflows/diagnose.md",
    "REVIEW": "references/workflows/review.md",
    "MIGRATE / UPGRADE": "references/workflows/migration-and-upgrade.md",
    "OPERATE": "references/workflows/production-operation.md",
}

REQUIRED_DIRECT_LINKS = {
    "references/core/risk-and-verification.md",
    "references/library/INDEX.md",
    "references/practices/build-dependencies-and-generated-code.md",
    "references/technologies/languages-and-frameworks.md",
    *MODE_LINKS.values(),
}

FORBIDDEN_RUNTIME_HISTORY = (
    "backend-engineer-control-plane-rebuild",
    "backend-engineer-technology-adapters-rebuild",
    "backend-engineer-runtime-diagnostics-rebuild",
    "PR #",
    "checkpoint",
    "this refactor project",
)


def fail(message: str) -> None:
    raise SystemExit(f"control-plane contract failed: {message}")


def require_semantics(text: str, label: str, concept_groups: tuple[tuple[str, ...], ...]) -> None:
    """Require each semantic group to be represented without pinning exact prose."""
    lowered = text.lower()
    missing = []
    for alternatives in concept_groups:
        if not any(term.lower() in lowered for term in alternatives):
            missing.append(" | ".join(alternatives))
    if missing:
        fail(f"missing control-plane semantics for {label}: " + "; ".join(missing))


def main() -> int:
    text = SKILL.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        fail("SKILL.md must start with frontmatter")
    frontmatter = text.split("---", 2)[1]
    keys = [
        line.split(":", 1)[0].strip()
        for line in frontmatter.splitlines()
        if ":" in line and line.strip()
    ]
    if keys != ["name", "description"]:
        fail(f"unexpected frontmatter keys/order: {keys}")

    for label, path in MODE_LINKS.items():
        if label not in text or f"]({path})" not in text:
            fail(f"mode route missing: {label} -> {path}")

    linked = set(re.findall(r"\]\(([^)]+\.md)\)", text))
    missing_direct = REQUIRED_DIRECT_LINKS - linked
    if missing_direct:
        fail("SKILL.md missing direct routes: " + ", ".join(sorted(missing_direct)))

    for rel in sorted(REQUIRED_DIRECT_LINKS):
        if not (ROOT / rel).is_file():
            fail(f"missing routed file: {rel}")

    for marker in FORBIDDEN_RUNTIME_HISTORY:
        if marker.lower() in text.lower():
            fail(f"authoring history leaked into runtime SKILL.md: {marker}")

    # Protect behavioral invariants rather than historical headings. Each group
    # names semantic evidence that must remain discoverable in the runtime
    # control plane while allowing the prose and control-loop labels to evolve.
    semantic_contracts = {
        "delegation and authority": (("delegation", "delegated"), ("authority", "authorized")),
        "knowledge readiness": (("knowledge", "curriculum", "offline_library"), ("language", "runtime", "framework")),
        "adjacent ownership": (("adjacent ownership", "product/requirements authority", "software architecture owns"),),
        "risk surface": (("risk surface", "risk-and-verification"), ("public contracts", "persistent data", "authorization/privacy")),
        "change surface": (("change surface",), ("contracts", "persisted data", "external dependencies")),
        "pre-mutation evidence": (("before mutation", "before editing", "before structural refactoring"), ("evidence", "tests", "oracle")),
        "progressive verification": (("verify progressively", "verification depth", "focused tests"),),
        "consumer boundary": (("consumer boundary", "direct consumers"), ("unverified", "not verified")),
    }
    for label, groups in semantic_contracts.items():
        require_semantics(text, label, groups)

    cases = (ROOT / "tests" / "behavior-cases.md").read_text(encoding="utf-8")
    for token in ("BUILD", "DIAGNOSE", "REVIEW", "MIGRATE", "OPERATE"):
        if token not in cases:
            fail(f"behavior acceptance case missing mode: {token}")

    # Ecosystem adapters and diagnostic planners are runtime capabilities, so
    # execute their contract tests rather than checking packaging only.
    sys.path.insert(0, str(ROOT / "tests"))
    import test_technology_adapters  # type: ignore
    import test_runtime_diagnostics  # type: ignore

    if test_technology_adapters.main() != 0:
        fail("technology adapter tests failed")
    if test_runtime_diagnostics.main() != 0:
        fail("runtime diagnostic tests failed")

    print("backend-engineer control-plane contract passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
