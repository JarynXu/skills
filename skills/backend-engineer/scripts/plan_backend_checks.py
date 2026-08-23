#!/usr/bin/env python3
"""Produce a read-only candidate backend verification plan from repository evidence.

The script never executes project commands. Commands are candidates that an agent must
inspect against repository instructions, task risk, environment and authorization.
"""
from __future__ import annotations

import argparse
import json
import os
import shlex
import sys
from pathlib import Path

import inspect_backend

SKIP_DIRS = inspect_backend.SKIP_DIRS
RISK_CHOICES = ("contract", "data", "security", "concurrency", "performance", "migration", "artifact")


def walk_files(root: Path):
    for current, dirs, names in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".cache")]
        base = Path(current)
        for name in names:
            yield base / name


def rel_parent(root: Path, path: Path) -> str:
    rel = path.parent.relative_to(root).as_posix()
    return "." if rel == "." else rel


def command_record(command: str, phase: str, reason: str, *, cwd: str = ".", confidence: str = "conventional", mutates_workspace: bool = True, requires_environment: bool = False) -> dict[str, object]:
    return {
        "command": command,
        "cwd": cwd,
        "phase": phase,
        "reason": reason,
        "confidence": confidence,
        "mutates_workspace": mutates_workspace,
        "requires_environment": requires_environment,
    }


def add(out: list[dict[str, object]], seen: set[tuple[str, str]], record: dict[str, object]) -> None:
    key = (str(record["cwd"]), str(record["command"]))
    if key not in seen:
        seen.add(key)
        out.append(record)


def find_named(root: Path, names: set[str]) -> list[Path]:
    return [p for p in walk_files(root) if p.name in names]


def package_manager(root: Path, package_json: Path) -> str:
    parent = package_json.parent
    if (parent / "pnpm-lock.yaml").is_file() or (root / "pnpm-lock.yaml").is_file():
        return "pnpm"
    if (parent / "yarn.lock").is_file() or (root / "yarn.lock").is_file():
        return "yarn"
    return "npm"


def python_runner(root: Path, manifest: Path) -> str:
    parent = manifest.parent
    if (parent / "uv.lock").is_file() or (root / "uv.lock").is_file():
        return "uv run"
    if (parent / "poetry.lock").is_file() or (root / "poetry.lock").is_file():
        return "poetry run"
    return "python -m"


def parse_cmake_presets(path: Path) -> tuple[list[str], list[str], list[str]]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return [], [], []
    def names(key: str) -> list[str]:
        values = data.get(key, [])
        if not isinstance(values, list):
            return []
        return [str(item["name"]) for item in values if isinstance(item, dict) and isinstance(item.get("name"), str) and not item.get("hidden")]
    return names("configurePresets"), names("buildPresets"), names("testPresets")


def build_plan(root: Path, risks: set[str]) -> dict[str, object]:
    evidence = inspect_backend.inspect(root, 30000)
    commands: list[dict[str, object]] = []
    seen: set[tuple[str, str]] = set()
    notes: list[str] = [
        "Candidates are inferred from repository evidence; inspect repository instructions and tool configuration before execution.",
        "The planner does not execute commands and does not grant environment, network, database, production, publishing or destructive authority.",
    ]

    files = list(walk_files(root))

    # JVM / Gradle / Maven.
    for path in files:
        if path.name == "gradlew":
            cwd = rel_parent(root, path)
            prefix = "./gradlew"
            add(commands, seen, command_record(f"{prefix} test", "test", "Gradle wrapper detected; focused project test lifecycle candidate.", cwd=cwd, confidence="repository-wrapper"))
            add(commands, seen, command_record(f"{prefix} check", "verify", "Gradle wrapper detected; configured verification lifecycle candidate.", cwd=cwd, confidence="repository-wrapper"))
        elif path.name == "mvnw":
            cwd = rel_parent(root, path)
            prefix = "./mvnw"
            add(commands, seen, command_record(f"{prefix} test", "test", "Maven wrapper detected; unit-test lifecycle candidate.", cwd=cwd, confidence="repository-wrapper"))
            add(commands, seen, command_record(f"{prefix} verify", "verify", "Maven wrapper detected; full verification lifecycle candidate.", cwd=cwd, confidence="repository-wrapper"))

    # Go modules/workspaces.
    for path in files:
        if path.name == "go.mod":
            cwd = rel_parent(root, path)
            add(commands, seen, command_record("go test ./...", "test", "Go module detected; package test candidate.", cwd=cwd, confidence="ecosystem-native"))
            add(commands, seen, command_record("go vet ./...", "static-analysis", "Go module detected; standard vet candidate.", cwd=cwd, confidence="ecosystem-native", mutates_workspace=False))
            if "concurrency" in risks:
                add(commands, seen, command_record("go test -race ./...", "concurrency", "Concurrency risk requested; Go race detector candidate.", cwd=cwd, confidence="ecosystem-native"))
            if "performance" in risks:
                add(commands, seen, command_record("go test -bench=. -benchmem ./...", "performance", "Performance risk requested; repository benchmarks candidate if benchmark functions exist.", cwd=cwd, confidence="conventional"))

    # Node package scripts: only actual declared scripts are emitted.
    package_scripts = evidence.get("package_scripts", {})
    if isinstance(package_scripts, dict):
        for rel, scripts in sorted(package_scripts.items()):
            package_json = root / rel
            manager = package_manager(root, package_json)
            run_word = "run " if manager == "npm" else ""
            if not isinstance(scripts, dict):
                continue
            for name in sorted(scripts):
                lowered = name.lower()
                if lowered == "test" or lowered.startswith("test:"):
                    phase = "test"
                elif "lint" in lowered or "type" in lowered or "check" in lowered:
                    phase = "static-analysis"
                elif "build" in lowered:
                    phase = "build"
                elif "migrat" in lowered:
                    phase = "migration"
                elif "generate" in lowered or "codegen" in lowered:
                    phase = "codegen"
                elif "audit" in lowered:
                    phase = "security"
                else:
                    phase = "verify"
                if phase in {"migration", "codegen"} and phase not in risks and "artifact" not in risks:
                    continue
                add(commands, seen, command_record(f"{manager} {run_word}{shlex.quote(name)}", phase, f"Actual package.json script detected: {name}.", cwd=rel_parent(root, package_json), confidence="repository-script", requires_environment=phase in {"migration", "security"}))

    # Python projects.
    for path in files:
        if path.name == "pyproject.toml":
            cwd = rel_parent(root, path)
            runner = python_runner(root, path)
            tests_present = bool(evidence.get("test_directories")) or "pytest" in set(evidence.get("test_frameworks", []))
            if tests_present:
                cmd = f"{runner} pytest" if runner != "python -m" else "python -m pytest"
                add(commands, seen, command_record(cmd, "test", "Python project with test evidence detected.", cwd=cwd, confidence="ecosystem-native"))
            quality = set(evidence.get("quality_tools", []))
            if "python-static-analysis" in quality:
                notes.append("Python static-analysis configuration detected; prefer the project's configured Ruff/mypy/pyright command rather than inventing flags.")

    # .NET projects.
    dotnet_roots: set[str] = set()
    for path in files:
        if path.suffix in {".sln", ".csproj", ".fsproj"}:
            dotnet_roots.add(rel_parent(root, path))
    for cwd in sorted(dotnet_roots):
        add(commands, seen, command_record("dotnet build", "build", ".NET solution/project detected; SDK build candidate.", cwd=cwd, confidence="ecosystem-native"))
        add(commands, seen, command_record("dotnet test", "test", ".NET solution/project detected; SDK test candidate.", cwd=cwd, confidence="ecosystem-native"))
        if "migration" in risks and "ef-migrations" in set(evidence.get("migration_tools", [])):
            add(commands, seen, command_record("dotnet ef migrations list", "migration", "EF Core migration tooling detected; migration inventory candidate before mutation.", cwd=cwd, confidence="conventional", mutates_workspace=False, requires_environment=True))

    # Rust workspaces/packages.
    for path in files:
        if path.name == "Cargo.toml":
            cwd = rel_parent(root, path)
            add(commands, seen, command_record("cargo check", "build", "Cargo manifest detected; fast compile/type candidate.", cwd=cwd, confidence="ecosystem-native"))
            add(commands, seen, command_record("cargo test", "test", "Cargo manifest detected; project test candidate.", cwd=cwd, confidence="ecosystem-native"))
            add(commands, seen, command_record("cargo fmt -- --check", "static-analysis", "Cargo manifest detected; formatting verification candidate.", cwd=cwd, confidence="ecosystem-native", mutates_workspace=False))
            add(commands, seen, command_record("cargo clippy --all-targets", "static-analysis", "Cargo manifest detected; Clippy candidate; honor repository lint policy.", cwd=cwd, confidence="ecosystem-native"))

    # CMake presets where actual preset names are available.
    for path in files:
        if path.name == "CMakePresets.json":
            cwd = rel_parent(root, path)
            configure, build, tests = parse_cmake_presets(path)
            for name in configure:
                add(commands, seen, command_record(f"cmake --preset {shlex.quote(name)}", "configure", "Declared CMake configure preset.", cwd=cwd, confidence="repository-config"))
            for name in build:
                add(commands, seen, command_record(f"cmake --build --preset {shlex.quote(name)}", "build", "Declared CMake build preset.", cwd=cwd, confidence="repository-config"))
            for name in tests:
                add(commands, seen, command_record(f"ctest --preset {shlex.quote(name)}", "test", "Declared CTest preset.", cwd=cwd, confidence="repository-config"))

    # Read-only migration/status candidates only when a recognizable config is present.
    for path in files:
        if path.name == "alembic.ini" and "migration" in risks:
            cwd = rel_parent(root, path)
            add(commands, seen, command_record("alembic current", "migration", "Alembic configuration detected; current revision inspection candidate.", cwd=cwd, confidence="ecosystem-native", mutates_workspace=False, requires_environment=True))
            add(commands, seen, command_record("alembic heads", "migration", "Alembic configuration detected; head inventory candidate.", cwd=cwd, confidence="ecosystem-native", mutates_workspace=False))

    if "contract" in risks:
        notes.append("Contract risk selected: inspect OpenAPI/protobuf/GraphQL schemas and run the project's actual contract/provider-consumer checks; generic clients alone are insufficient.")
    if "data" in risks:
        notes.append("Data risk selected: include real database constraints/transactions/query-plan evidence and representative migration behavior where applicable.")
    if "security" in risks:
        notes.append("Security risk selected: use configured SAST/dependency/secret/dynamic checks and negative authorization/input tests; do not run invasive tests without authorization.")
    if "performance" in risks:
        notes.append("Performance risk selected: establish a workload and baseline before profiler/benchmark/load-test execution.")
    if "artifact" in risks:
        notes.append("Artifact risk selected: verify clean build/code-generation freshness, dependency resolution and the actual packaged/container artifact.")

    return {
        "root": str(root.resolve()),
        "risks": sorted(risks),
        "detected": {
            key: evidence.get(key)
            for key in (
                "languages", "frameworks", "build_tools", "dependency_controls", "migration_tools",
                "code_generation", "test_frameworks", "quality_tools", "data_systems", "middleware",
                "observability", "delivery", "candidate_knowledge_routes",
            )
        },
        "commands": commands,
        "notes": notes,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".")
    parser.add_argument("--risk", action="append", choices=RISK_CHOICES, default=[])
    parser.add_argument("--format", choices=("json", "text"), default="json")
    args = parser.parse_args()

    root = Path(args.root)
    if not root.is_dir():
        print(f"ERROR: not a directory: {root}", file=sys.stderr)
        return 2

    plan = build_plan(root, set(args.risk))
    if args.format == "json":
        print(json.dumps(plan, ensure_ascii=False, indent=2, sort_keys=True))
    else:
        for item in plan["commands"]:
            flags = []
            if item["mutates_workspace"]:
                flags.append("writes-local")
            if item["requires_environment"]:
                flags.append("needs-env")
            print(f"[{item['phase']}] ({item['confidence']}) {item['cwd']}: {item['command']}" + (f"  # {','.join(flags)}" if flags else ""))
            print(f"  {item['reason']}")
        if plan["notes"]:
            print("notes:")
            for note in plan["notes"]:
                print(f"- {note}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
