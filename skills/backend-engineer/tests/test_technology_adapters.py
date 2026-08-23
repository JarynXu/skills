#!/usr/bin/env python3
"""Contract and execution tests for backend ecosystem adapters and tool planner."""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLANNER = ROOT / "scripts" / "plan_backend_checks.py"
INDEX = ROOT / "references" / "technologies" / "languages-and-frameworks.md"

ADAPTERS = {
    "jvm.md": ("JFR", "Testcontainers", "transaction"),
    "go.md": ("pprof", "race", "context.Context"),
    "dotnet.md": ("dotnet-trace", "WebApplicationFactory", "CancellationToken"),
    "python.md": ("py-spy", "pytest", "asyncio"),
    "node-typescript.md": ("event loop", "AsyncLocalStorage", "Testcontainers"),
    "rust.md": ("Miri", "Tokio", "cargo clippy"),
    "c-cpp.md": ("ASan", "gdb", "undefined behavior"),
}

EXTRA = {
    "tooling-and-evidence.md": ("debuggers", "profilers", "Testcontainers"),
    "database-tooling.md": ("PostgreSQL", "EXPLAIN", "migration"),
    "middleware-operations.md": ("Redis", "Kafka", "RabbitMQ"),
}


def fail(message: str) -> None:
    raise SystemExit(f"technology-adapter contract failed: {message}")


def run_plan(root: Path, *risks: str) -> dict[str, object]:
    cmd = [sys.executable, str(PLANNER), str(root)]
    for risk in risks:
        cmd.extend(["--risk", risk])
    proc = subprocess.run(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if proc.returncode != 0:
        fail(f"planner failed for {root}: {proc.stderr or proc.stdout}")
    return json.loads(proc.stdout)


def commands(plan: dict[str, object]) -> set[str]:
    return {str(item["command"]) for item in plan["commands"]}


def static_contract() -> None:
    index = INDEX.read_text(encoding="utf-8")
    for name, tokens in {**ADAPTERS, **EXTRA}.items():
        path = ROOT / "references" / "technologies" / name
        if not path.is_file():
            fail(f"missing technology reference: {name}")
        text = path.read_text(encoding="utf-8")
        for token in tokens:
            if token.lower() not in text.lower():
                fail(f"{name} missing expected capability token: {token}")
        if name in ADAPTERS and f"]({name})" not in index:
            fail(f"technology index does not route adapter: {name}")
    if "tooling-and-evidence.md" not in index:
        fail("technology index must route tooling-and-evidence.md")
    if not PLANNER.is_file():
        fail("plan_backend_checks.py missing")


def planner_contract() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)

        # Go: ecosystem-native candidates and risk escalation.
        go = root / "go-service"
        go.mkdir()
        (go / "go.mod").write_text("module example.com/demo\n\ngo 1.24\n", encoding="utf-8")
        (go / "main.go").write_text("package main\nfunc main(){}\n", encoding="utf-8")
        baseline = commands(run_plan(go))
        if not {"go test ./...", "go vet ./..."} <= baseline:
            fail(f"Go baseline candidates missing: {baseline}")
        with_race = commands(run_plan(go, "concurrency"))
        if "go test -race ./..." not in with_race:
            fail("Go concurrency risk must route race detector candidate")

        # Node: emit only actual declared scripts; generation is risk-gated.
        node = root / "node-service"
        node.mkdir()
        (node / "pnpm-lock.yaml").write_text("lockfileVersion: '9.0'\n", encoding="utf-8")
        (node / "package.json").write_text(json.dumps({
            "scripts": {
                "test": "vitest run",
                "lint": "eslint .",
                "typecheck": "tsc --noEmit",
                "generate": "node scripts/generate.js",
            },
            "dependencies": {"fastify": "1.0.0"},
        }), encoding="utf-8")
        node_base = commands(run_plan(node))
        for cmd in ("pnpm test", "pnpm lint", "pnpm typecheck"):
            if cmd not in node_base:
                fail(f"actual Node script not planned: {cmd}")
        if "pnpm generate" in node_base:
            fail("code-generation command must not be emitted without artifact risk")
        node_artifact = commands(run_plan(node, "artifact"))
        if "pnpm generate" not in node_artifact:
            fail("artifact risk must permit actual repository codegen script candidate")

        # JVM: wrapper commands, not system Gradle assumptions.
        jvm = root / "jvm-service"
        jvm.mkdir()
        (jvm / "gradlew").write_text("#!/bin/sh\n", encoding="utf-8")
        (jvm / "build.gradle").write_text("plugins { id 'java' }\n", encoding="utf-8")
        jvm_cmds = commands(run_plan(jvm))
        if not {"./gradlew test", "./gradlew check"} <= jvm_cmds:
            fail(f"Gradle wrapper candidates missing: {jvm_cmds}")

        # Python: choose adopted environment runner when tests are observable.
        py = root / "python-service"
        (py / "tests").mkdir(parents=True)
        (py / "pyproject.toml").write_text("[project]\nname='demo'\n[tool.pytest.ini_options]\n", encoding="utf-8")
        (py / "uv.lock").write_text("version = 1\n", encoding="utf-8")
        (py / "tests" / "test_demo.py").write_text("def test_demo(): assert True\n", encoding="utf-8")
        py_cmds = commands(run_plan(py))
        if "uv run pytest" not in py_cmds:
            fail(f"uv-based pytest candidate missing: {py_cmds}")

        # CMake: only declared preset names are emitted.
        cpp = root / "cpp-service"
        cpp.mkdir()
        (cpp / "CMakePresets.json").write_text(json.dumps({
            "version": 4,
            "configurePresets": [{"name": "dev"}],
            "buildPresets": [{"name": "dev-build", "configurePreset": "dev"}],
            "testPresets": [{"name": "dev-test", "configurePreset": "dev"}],
        }), encoding="utf-8")
        cpp_cmds = commands(run_plan(cpp))
        expected = {"cmake --preset dev", "cmake --build --preset dev-build", "ctest --preset dev-test"}
        if not expected <= cpp_cmds:
            fail(f"CMake preset candidates missing: {cpp_cmds}")

        # Planner contract: no command is marked as executed; it only reports candidates.
        plan = run_plan(go, "performance")
        if "commands" not in plan or "notes" not in plan or "detected" not in plan:
            fail("planner output shape incomplete")
        if any("executed" in item for item in plan["commands"]):
            fail("planner must not claim command execution")


def main() -> int:
    static_contract()
    planner_contract()
    print("backend-engineer technology adapter tests passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
