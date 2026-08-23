#!/usr/bin/env python3
"""Behavior tests for the read-only QA test planner."""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLANNER = ROOT / "scripts" / "plan_test_checks.py"


def run_plan(root: Path) -> dict[str, object]:
    result = subprocess.run(
        [sys.executable, str(PLANNER), str(root)],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def candidates(plan: dict[str, object]) -> list[dict[str, object]]:
    value = plan["candidates"]
    assert isinstance(value, list)
    return value


def find(plan: dict[str, object], command: str) -> dict[str, object]:
    for item in candidates(plan):
        if item["command"] == command:
            return item
    raise AssertionError((command, [item["command"] for item in candidates(plan)]))


def test_node_scripts_and_safety(tmp: Path) -> None:
    (tmp / "pnpm-lock.yaml").write_text("lockfileVersion: '9.0'\n", encoding="utf-8")
    (tmp / "package.json").write_text(json.dumps({
        "scripts": {
            "test": "vitest run",
            "test:integration": "vitest run tests/integration",
            "test:e2e": "playwright test",
            "test:contract": "pact verify",
            "test:coverage": "vitest run --coverage",
            "test:a11y": "playwright test tests/a11y",
            "test:load": "k6 run load/smoke.js",
            "test:security": "zap-baseline.py -t $TARGET",
            "lint": "eslint ."
        },
        "devDependencies": {
            "vitest": "3",
            "@playwright/test": "1"
        }
    }), encoding="utf-8")
    before = sorted(p.name for p in tmp.iterdir())
    plan = run_plan(tmp)
    after = sorted(p.name for p in tmp.iterdir())
    assert before == after, (before, after)
    assert plan["planner_mode"] == "read-only"
    assert plan["execution_performed"] is False
    assert plan["repository_evidence"]["package_manager"] == "pnpm"
    assert find(plan, "pnpm run test")["category"] == "unit"
    assert find(plan, "pnpm run test:integration")["category"] == "integration"
    assert find(plan, "pnpm run test:e2e")["category"] == "e2e"
    assert find(plan, "pnpm run test:contract")["category"] == "contract"
    assert find(plan, "pnpm run test:coverage")["category"] == "coverage"
    assert find(plan, "pnpm run test:a11y")["category"] == "accessibility"
    load = find(plan, "pnpm run test:load")
    assert load["category"] == "performance"
    assert load["requires_target"] is True
    assert load["may_mutate_external_state"] is True
    security = find(plan, "pnpm run test:security")
    assert security["authorization_required"] is True
    assert security["requires_target"] is True
    assert not any(item["command"] == "pnpm run lint" for item in candidates(plan))


def test_gradle_wrapper_and_tasks(tmp: Path) -> None:
    (tmp / "gradlew").write_text("#!/bin/sh\n", encoding="utf-8")
    (tmp / "build.gradle.kts").write_text(
        "plugins { jacoco }\n"
        "tasks.register<Test>(\"integrationTest\") {}\n"
        "tasks.register<Test>(\"contractTest\") {}\n",
        encoding="utf-8",
    )
    plan = run_plan(tmp)
    assert find(plan, "./gradlew test")["category"] == "unit"
    assert find(plan, "./gradlew integrationTest")["category"] == "integration"
    assert find(plan, "./gradlew contractTest")["category"] == "contract"
    assert find(plan, "./gradlew jacocoTestReport")["category"] == "coverage"


def test_python_go_dotnet_rust_and_cmake(tmp: Path) -> None:
    (tmp / "pyproject.toml").write_text("[tool.pytest.ini_options]\naddopts='-q'\n", encoding="utf-8")
    (tmp / "tox.ini").write_text("[tox]\nenvlist=py312\n", encoding="utf-8")
    (tmp / "noxfile.py").write_text("import nox\n", encoding="utf-8")
    (tmp / "go.mod").write_text("module example.test/demo\n", encoding="utf-8")
    (tmp / "Demo.sln").write_text("Microsoft Visual Studio Solution File\n", encoding="utf-8")
    (tmp / "Cargo.toml").write_text("[package]\nname='demo'\nversion='0.1.0'\n", encoding="utf-8")
    (tmp / "CMakePresets.json").write_text(json.dumps({
        "version": 6,
        "testPresets": [{"name": "ci-tests", "configurePreset": "ci"}]
    }), encoding="utf-8")
    plan = run_plan(tmp)
    assert find(plan, "python -m pytest")["category"] == "unit"
    assert find(plan, "tox")["category"] == "integration"
    assert find(plan, "nox")["category"] == "integration"
    assert find(plan, "go test ./...")["category"] == "unit"
    race = find(plan, "go test -race ./...")
    assert race["category"] == "concurrency"
    assert race["confidence"] == "medium"
    assert find(plan, "dotnet test Demo.sln")["category"] == "unit"
    assert find(plan, "cargo test --workspace")["category"] == "unit"
    assert find(plan, "ctest --preset ci-tests")["category"] == "unit"


def test_file_driven_targets_and_ci(tmp: Path) -> None:
    (tmp / "load").mkdir()
    (tmp / "load" / "checkout.js").write_text("import http from 'k6/http';\n", encoding="utf-8")
    (tmp / "perf.jmx").write_text("<jmeterTestPlan/>\n", encoding="utf-8")
    (tmp / "locustfile.py").write_text("from locust import HttpUser\n", encoding="utf-8")
    (tmp / "api.postman_collection.json").write_text("{}\n", encoding="utf-8")
    workflow = tmp / ".github" / "workflows"
    workflow.mkdir(parents=True)
    (workflow / "test.yml").write_text(
        "name: test\nsteps:\n  - run: go test ./...\n  - run: k6 run load/checkout.js\n",
        encoding="utf-8",
    )
    plan = run_plan(tmp)
    for command in (
        "k6 run load/checkout.js",
        "jmeter -n -t perf.jmx",
        "locust -f locustfile.py",
    ):
        item = find(plan, command)
        assert item["category"] == "performance"
        assert item["requires_target"] is True
        assert item["may_mutate_external_state"] is True
    postman = find(plan, "newman run api.postman_collection.json")
    assert postman["category"] == "integration"
    assert postman["requires_target"] is True
    assert postman["may_mutate_external_state"] is True
    ci = plan["observed_ci_commands"]
    assert any("go test ./..." in command for command in ci), ci
    assert any("k6 run load/checkout.js" in command for command in ci), ci


def test_text_and_missing_path(tmp: Path) -> None:
    result = subprocess.run(
        [sys.executable, str(PLANNER), str(tmp), "--format", "text"],
        check=True,
        capture_output=True,
        text=True,
    )
    assert "mode: read-only; no execution performed" in result.stdout
    missing = subprocess.run(
        [sys.executable, str(PLANNER), str(tmp / "missing")],
        capture_output=True,
        text=True,
    )
    assert missing.returncode == 2
    assert "not a directory" in missing.stderr


def main() -> None:
    with tempfile.TemporaryDirectory() as raw:
        test_node_scripts_and_safety(Path(raw))
    with tempfile.TemporaryDirectory() as raw:
        test_gradle_wrapper_and_tasks(Path(raw))
    with tempfile.TemporaryDirectory() as raw:
        test_python_go_dotnet_rust_and_cmake(Path(raw))
    with tempfile.TemporaryDirectory() as raw:
        test_file_driven_targets_and_ci(Path(raw))
    with tempfile.TemporaryDirectory() as raw:
        test_text_and_missing_path(Path(raw))
    print("qa test control plane passed")


if __name__ == "__main__":
    main()
