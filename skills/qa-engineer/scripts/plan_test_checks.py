#!/usr/bin/env python3
"""Build a read-only candidate QA check plan from repository evidence.

The planner never executes a command. It prefers repository-owned scripts, wrappers,
presets, and configuration over generic defaults, and marks checks that need a target,
load authorization, security authorization, or other external state.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable

SKIP_DIRS = {
    ".git", ".hg", ".svn", "node_modules", "vendor", "target", "build", "dist", "out",
    ".gradle", ".idea", ".vscode", ".venv", "venv", "__pycache__", ".tox", ".nox",
    ".pytest_cache", "coverage", ".cache",
}
MAX_TEXT = 512 * 1024

SCRIPT_RULES: list[tuple[str, re.Pattern[str]]] = [
    ("coverage", re.compile(r"(^|[:_-])(coverage|cov)($|[:_-])", re.I)),
    ("accessibility", re.compile(r"(^|[:_-])(a11y|accessibility|axe)($|[:_-])", re.I)),
    ("contract", re.compile(r"(^|[:_-])(contract|pact)($|[:_-])", re.I)),
    ("performance", re.compile(r"(^|[:_-])(load|perf|performance|stress|soak|capacity)($|[:_-])", re.I)),
    ("security", re.compile(r"(^|[:_-])(security|dast|zap|security-test)($|[:_-])", re.I)),
    ("e2e", re.compile(r"(^|[:_-])(e2e|end-to-end|ui|browser)($|[:_-])", re.I)),
    ("integration", re.compile(r"(^|[:_-])(integration|int-test|it)($|[:_-])", re.I)),
    ("unit", re.compile(r"^(test|unit|test[:_-]unit|unit[:_-]test)$", re.I)),
    ("smoke", re.compile(r"(^|[:_-])(smoke|sanity)($|[:_-])", re.I)),
]

CATEGORY_ORDER = {
    "unit": 10,
    "integration": 20,
    "contract": 30,
    "e2e": 40,
    "accessibility": 50,
    "coverage": 60,
    "smoke": 70,
    "performance": 80,
    "security": 90,
    "concurrency": 95,
    "other": 100,
}

@dataclass(frozen=True)
class Candidate:
    category: str
    command: str
    evidence: str
    confidence: str = "high"
    requires_target: bool = False
    authorization_required: bool = False
    may_mutate_external_state: bool = False
    notes: str = ""


def read_text(path: Path) -> str:
    try:
        if not path.is_file() or path.stat().st_size > MAX_TEXT:
            return ""
        return path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""


def package_manager(root: Path) -> str:
    if (root / "pnpm-lock.yaml").exists():
        return "pnpm"
    if (root / "yarn.lock").exists():
        return "yarn"
    if (root / "bun.lockb").exists() or (root / "bun.lock").exists():
        return "bun"
    return "npm"


def script_command(manager: str, name: str) -> str:
    if manager == "yarn":
        return f"yarn run {name}"
    if manager == "pnpm":
        return f"pnpm run {name}"
    if manager == "bun":
        return f"bun run {name}"
    return f"npm run {name}"


def classify_script(name: str, command: str) -> str | None:
    value = f"{name} {command}"
    for category, pattern in SCRIPT_RULES:
        if pattern.search(name) or (category in {"performance", "security", "accessibility", "contract"} and pattern.search(value)):
            return category
    return None


def iter_files(root: Path, max_files: int = 20000) -> Iterable[Path]:
    count = 0
    for current, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".cache")]
        for name in files:
            if count >= max_files:
                return
            count += 1
            yield Path(current) / name


def add(candidates: list[Candidate], candidate: Candidate) -> None:
    if not any(c.command == candidate.command and c.category == candidate.category for c in candidates):
        candidates.append(candidate)


def plan_node(root: Path, candidates: list[Candidate], evidence: dict[str, object]) -> None:
    package = root / "package.json"
    if not package.is_file():
        return
    try:
        payload = json.loads(package.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        evidence["package_json_error"] = "package.json could not be parsed"
        return
    scripts = payload.get("scripts") or {}
    if not isinstance(scripts, dict):
        scripts = {}
    manager = package_manager(root)
    evidence["package_manager"] = manager
    evidence["package_scripts"] = sorted(str(name) for name in scripts)
    for name, value in scripts.items():
        if not isinstance(value, str):
            continue
        category = classify_script(str(name), value)
        if not category:
            continue
        high_risk = category in {"performance", "security"}
        add(candidates, Candidate(
            category=category,
            command=script_command(manager, str(name)),
            evidence=f"package.json script {name!r}: {value}",
            requires_target=high_risk,
            authorization_required=category == "security",
            may_mutate_external_state=category in {"e2e", "smoke", "performance", "security"},
            notes="Repository-owned package script; inspect its target/environment before execution." if high_risk else "Repository-owned package script.",
        ))


def contains_any(root: Path, names: tuple[str, ...]) -> bool:
    return any((root / name).exists() for name in names)


def plan_jvm(root: Path, candidates: list[Candidate]) -> None:
    gradle = root / "gradlew"
    gradle_bat = root / "gradlew.bat"
    build_files = [p for p in (root / "build.gradle", root / "build.gradle.kts") if p.is_file()]
    build_text = "\n".join(read_text(p) for p in build_files)
    if gradle.exists() or gradle_bat.exists() or build_files:
        launcher = "./gradlew" if gradle.exists() else ("gradlew.bat" if gradle_bat.exists() else "gradle")
        confidence = "high" if gradle.exists() or gradle_bat.exists() else "medium"
        add(candidates, Candidate("unit", f"{launcher} test", "Gradle project/wrapper detected", confidence=confidence))
        if re.search(r"\bintegrationTest\b", build_text):
            add(candidates, Candidate("integration", f"{launcher} integrationTest", "integrationTest task referenced in Gradle build", confidence=confidence))
        if re.search(r"\bfunctionalTest\b", build_text):
            add(candidates, Candidate("integration", f"{launcher} functionalTest", "functionalTest task referenced in Gradle build", confidence=confidence))
        if re.search(r"\bcontractTest\b", build_text):
            add(candidates, Candidate("contract", f"{launcher} contractTest", "contractTest task referenced in Gradle build", confidence=confidence))
        if "jacoco" in build_text.lower():
            add(candidates, Candidate("coverage", f"{launcher} jacocoTestReport", "JaCoCo referenced in Gradle build", confidence="medium", notes="Verify the report task name is configured before execution."))

    pom = root / "pom.xml"
    if pom.is_file():
        launcher = "./mvnw" if (root / "mvnw").exists() else ("mvnw.cmd" if (root / "mvnw.cmd").exists() else "mvn")
        confidence = "high" if launcher != "mvn" else "medium"
        add(candidates, Candidate("unit", f"{launcher} test", "Maven pom.xml detected", confidence=confidence))
        pom_text = read_text(pom).lower()
        if "maven-failsafe-plugin" in pom_text or "integration-test" in pom_text:
            add(candidates, Candidate("integration", f"{launcher} verify", "Maven Failsafe/integration-test lifecycle evidence detected", confidence=confidence))
        if "jacoco" in pom_text:
            add(candidates, Candidate("coverage", f"{launcher} verify", "JaCoCo referenced in Maven build", confidence=confidence, notes="Use the configured Maven lifecycle/report rather than inventing a separate coverage command."))


def plan_python(root: Path, candidates: list[Candidate]) -> None:
    pyproject = read_text(root / "pyproject.toml")
    pytest_cfg = contains_any(root, ("pytest.ini", "setup.cfg", "tox.ini")) or "pytest" in pyproject.lower()
    if pytest_cfg:
        add(candidates, Candidate("unit", "python -m pytest", "pytest configuration/dependency evidence detected", confidence="medium", notes="Prefer a repository wrapper/task if one exists; inspect markers and default options before execution."))
    if (root / "tox.ini").is_file() or "[tool.tox" in pyproject.lower():
        add(candidates, Candidate("integration", "tox", "tox configuration detected", confidence="medium", notes="Inspect tox environments before choosing which matrix to execute."))
    if (root / "noxfile.py").is_file():
        add(candidates, Candidate("integration", "nox", "noxfile.py detected", confidence="medium", notes="Inspect sessions before execution."))


def plan_go(root: Path, candidates: list[Candidate]) -> None:
    if not (root / "go.mod").is_file() and not (root / "go.work").is_file():
        return
    add(candidates, Candidate("unit", "go test ./...", "Go module/workspace detected"))
    add(candidates, Candidate("concurrency", "go test -race ./...", "Go module/workspace detected; race detector is a distinct concurrency evidence path", confidence="medium", notes="Use when concurrency risk justifies the extra runtime/cgo/platform cost."))


def plan_dotnet(root: Path, candidates: list[Candidate]) -> None:
    solutions = sorted(root.glob("*.sln")) + sorted(root.glob("*.slnx"))
    projects = sorted(root.glob("*.csproj")) + sorted(root.glob("*.fsproj"))
    if not solutions and not projects:
        return
    target = solutions[0].name if len(solutions) == 1 else ""
    command = f"dotnet test {target}".rstrip()
    add(candidates, Candidate("unit", command, f".NET solution/project detected{': ' + target if target else ''}"))


def plan_rust(root: Path, candidates: list[Candidate]) -> None:
    if not (root / "Cargo.toml").is_file():
        return
    add(candidates, Candidate("unit", "cargo test --workspace", "Cargo workspace/package detected", confidence="medium", notes="For a single non-workspace package, cargo accepts this when a workspace root exists; otherwise use the project-native command discovered in CI."))
    if (root / ".config" / "nextest.toml").is_file() or (root / ".cargo" / "nextest.toml").is_file():
        add(candidates, Candidate("unit", "cargo nextest run", "nextest configuration detected"))


def plan_cmake(root: Path, candidates: list[Candidate]) -> None:
    presets = root / "CMakePresets.json"
    if presets.is_file():
        try:
            payload = json.loads(presets.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            payload = {}
        for preset in payload.get("testPresets", []) if isinstance(payload, dict) else []:
            if isinstance(preset, dict) and isinstance(preset.get("name"), str):
                add(candidates, Candidate("unit", f"ctest --preset {preset['name']}", f"CMake test preset {preset['name']!r}"))


def plan_file_driven(root: Path, candidates: list[Candidate]) -> None:
    for path in iter_files(root):
        rel = path.relative_to(root).as_posix()
        low = rel.lower()
        suffix = path.suffix.lower()
        if suffix == ".jmx":
            add(candidates, Candidate("performance", f"jmeter -n -t {rel}", f"JMeter plan detected: {rel}", requires_target=True, may_mutate_external_state=True, notes="Load-generating command; confirm target, workload, credentials, abort conditions, and authorization."))
        elif path.name == "locustfile.py":
            add(candidates, Candidate("performance", f"locust -f {rel}", f"Locust file detected: {rel}", requires_target=True, may_mutate_external_state=True, notes="Interactive/distributed load entry point; target and workload parameters still required."))
        elif low.endswith(".postman_collection.json"):
            add(candidates, Candidate("integration", f"newman run {rel}", f"Postman collection detected: {rel}", requires_target=True, may_mutate_external_state=True, notes="Collection may mutate target state; inspect variables, environment, auth, cleanup, and assertions."))
        elif suffix in {".js", ".ts"}:
            text = read_text(path)
            if re.search(r"(?:from|require\()\s*['\"]k6(?:/|['\"])", text):
                add(candidates, Candidate("performance", f"k6 run {rel}", f"k6 script detected: {rel}", requires_target=True, may_mutate_external_state=True, notes="Load-generating command; confirm target, workload model, thresholds, generator capacity, and authorization."))


def observed_ci_commands(root: Path) -> list[str]:
    commands: set[str] = set()
    patterns = [
        re.compile(r"(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?[\w:.-]+"),
        re.compile(r"(?:\.\/gradlew|gradle|\.\/mvnw|mvn|dotnet\s+test|go\s+test|cargo\s+(?:test|nextest\s+run)|python\s+-m\s+pytest|pytest|tox|nox|k6\s+run|jmeter\s+-n\s+-t)\b[^\n\r]*"),
    ]
    for base in (root / ".github" / "workflows", root):
        if not base.exists():
            continue
        files = list(base.glob("*.yml")) + list(base.glob("*.yaml")) if base != root else [p for p in (root / ".gitlab-ci.yml", root / "Jenkinsfile") if p.is_file()]
        for path in files:
            text = read_text(path)
            for pattern in patterns:
                for match in pattern.finditer(text):
                    command = match.group(0).strip().strip("'\"")
                    if len(command) <= 240:
                        commands.add(command)
    return sorted(commands)


def build_plan(root: Path) -> dict[str, object]:
    candidates: list[Candidate] = []
    evidence: dict[str, object] = {}
    plan_node(root, candidates, evidence)
    plan_jvm(root, candidates)
    plan_python(root, candidates)
    plan_go(root, candidates)
    plan_dotnet(root, candidates)
    plan_rust(root, candidates)
    plan_cmake(root, candidates)
    plan_file_driven(root, candidates)
    ci = observed_ci_commands(root)
    candidates.sort(key=lambda c: (CATEGORY_ORDER.get(c.category, 100), c.command))
    return {
        "root": str(root.resolve()),
        "planner_mode": "read-only",
        "execution_performed": False,
        "repository_evidence": evidence,
        "observed_ci_commands": ci,
        "candidates": [asdict(c) for c in candidates],
        "rules": [
            "A candidate is not permission to execute it and is not proof that it is valid for every environment.",
            "Prefer repository-owned scripts, wrappers, presets, and CI commands over generic fallback commands.",
            "Inspect target, credentials, data, cleanup, side effects, and authorization before E2E, smoke, load, DAST, chaos, or production-facing execution.",
            "Choose checks from the protected risk and evidence gap; do not run every candidate merely because it was detected.",
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".")
    parser.add_argument("--format", choices=("json", "text"), default="json")
    args = parser.parse_args()
    root = Path(args.root)
    if not root.is_dir():
        print(f"ERROR: not a directory: {root}", file=sys.stderr)
        return 2
    plan = build_plan(root)
    if args.format == "json":
        print(json.dumps(plan, ensure_ascii=False, indent=2, sort_keys=True))
    else:
        print(f"root: {plan['root']}")
        print("mode: read-only; no execution performed")
        for item in plan["candidates"]:
            flags = []
            if item["requires_target"]:
                flags.append("requires-target")
            if item["authorization_required"]:
                flags.append("authorization-required")
            if item["may_mutate_external_state"]:
                flags.append("external-state")
            suffix = f" [{' '.join(flags)}]" if flags else ""
            print(f"{item['category']}: {item['command']}{suffix} <- {item['evidence']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
