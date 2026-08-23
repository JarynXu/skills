#!/usr/bin/env python3
"""Behavior tests for the DevOps delivery inspector and read-only planner."""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INSPECT = ROOT / "scripts" / "inspect_delivery_system.py"
PLAN = ROOT / "scripts" / "plan_delivery_checks.py"


def run_json(script: Path, root: Path) -> dict[str, object]:
    result = subprocess.run(
        [sys.executable, str(script), str(root)],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def candidate(plan: dict[str, object], command: str) -> dict[str, object]:
    for item in plan["candidates"]:  # type: ignore[index]
        if item["command"] == command:
            return item
    raise AssertionError((command, [item["command"] for item in plan["candidates"]]))  # type: ignore[index]


def snapshot(root: Path) -> dict[str, bytes]:
    return {
        path.relative_to(root).as_posix(): path.read_bytes()
        for path in sorted(root.rglob("*"))
        if path.is_file()
    }


def build_fixture(root: Path) -> None:
    (root / ".github" / "workflows").mkdir(parents=True)
    (root / "k8s").mkdir()
    (root / "chart").mkdir()
    (root / "overlays" / "prod").mkdir(parents=True)
    (root / "infra").mkdir()

    (root / "pnpm-lock.yaml").write_text("lockfileVersion: '9.0'\n", encoding="utf-8")
    (root / "package.json").write_text(json.dumps({
        "scripts": {
            "infra:validate": "terraform validate",
            "infra:plan": "terraform plan",
            "image:build": "docker build -t demo .",
            "deploy:prod": "kubectl apply -f k8s",
            "destroy:preview": "terraform destroy",
            "lint:js": "eslint ."
        }
    }), encoding="utf-8")
    (root / "Makefile").write_text(
        "render:\n\thelm template demo chart\n\nrelease:\n\t./scripts/release.sh\n",
        encoding="utf-8",
    )
    (root / "Dockerfile").write_text("FROM alpine:3.22\nUSER 65532\n", encoding="utf-8")
    (root / "compose.yaml").write_text("services:\n  app:\n    image: demo:latest\n", encoding="utf-8")

    (root / "k8s" / "deployment.yaml").write_text(
        "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: demo\nspec:\n  selector:\n    matchLabels:\n      app: demo\n",
        encoding="utf-8",
    )
    (root / "k8s" / "service.yaml").write_text(
        "apiVersion: v1\nkind: Service\nmetadata:\n  name: demo\nspec:\n  selector:\n    app: demo\n",
        encoding="utf-8",
    )
    (root / "k8s" / "argocd.yaml").write_text(
        "apiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: demo\n",
        encoding="utf-8",
    )
    (root / "k8s" / "flux.yaml").write_text(
        "apiVersion: kustomize.toolkit.fluxcd.io/v1\nkind: Kustomization\nmetadata:\n  name: demo\n",
        encoding="utf-8",
    )
    (root / "k8s" / "external-secret.yaml").write_text(
        "apiVersion: external-secrets.io/v1\nkind: ExternalSecret\nmetadata:\n  name: demo\n",
        encoding="utf-8",
    )
    (root / "k8s" / "monitor.yaml").write_text(
        "apiVersion: monitoring.coreos.com/v1\nkind: ServiceMonitor\nmetadata:\n  name: demo\n",
        encoding="utf-8",
    )
    (root / "chart" / "Chart.yaml").write_text("apiVersion: v2\nname: demo\nversion: 0.1.0\n", encoding="utf-8")
    (root / "overlays" / "prod" / "kustomization.yaml").write_text("resources:\n- ../../k8s/deployment.yaml\n", encoding="utf-8")

    (root / "infra" / "main.tf").write_text(
        'terraform { required_providers { aws = { source = "hashicorp/aws" } } }\n'
        'provider "aws" { region = "us-east-1" }\n'
        'resource "aws_s3_bucket" "demo" { bucket = "example-demo" }\n',
        encoding="utf-8",
    )
    (root / "infra" / ".terraform.lock.hcl").write_text("# lock\n", encoding="utf-8")
    (root / "Pulumi.yaml").write_text("name: demo\nruntime: python\n", encoding="utf-8")
    (root / "playbook.yml").write_text(
        "- hosts: web\n  become: true\n  tasks:\n    - name: ping\n      ansible.builtin.ping:\n",
        encoding="utf-8",
    )
    (root / ".sops.yaml").write_text("creation_rules:\n- age: age1example\n", encoding="utf-8")
    (root / "prometheus.yml").write_text("global:\n  scrape_interval: 15s\n", encoding="utf-8")

    (root / ".github" / "workflows" / "delivery.yml").write_text(
        "name: delivery\n"
        "on: [push]\n"
        "jobs:\n"
        "  build:\n"
        "    runs-on: ubuntu-latest\n"
        "    steps:\n"
        "      - run: terraform -chdir=infra plan\n"
        "      - run: kubectl diff -f k8s\n"
        "      - run: cosign verify demo@example\n"
        "      - run: syft demo -o spdx-json\n"
        "      - run: trivy image demo\n",
        encoding="utf-8",
    )


def test_inspector_and_planner(root: Path) -> None:
    build_fixture(root)
    before = snapshot(root)
    inventory = run_json(INSPECT, root)
    after_inspect = snapshot(root)
    assert before == after_inspect

    tools = inventory["tools"]
    assert "github-actions" in tools["ci"]
    assert {"dockerfile", "docker-compose"} <= set(tools["containers"])
    assert {"kubernetes", "helm", "kustomize"} <= set(tools["orchestration"])
    assert {"terraform-compatible", "pulumi", "ansible"} <= set(tools["iac"])
    assert {"argocd", "flux"} <= set(tools["gitops"])
    assert {"sops", "external-secrets"} <= set(tools["configuration_secrets"])
    assert {"prometheus", "prometheus-operator"} <= set(tools["observability"])
    assert {"cosign", "sbom", "artifact-scanning"} <= set(tools["supply_chain"])
    assert "aws" in tools["cloud"]
    paths = inventory["paths"]
    assert "Dockerfile" in paths["dockerfiles"]
    assert "chart" in paths["helm_charts"]
    assert "overlays/prod" in paths["kustomize_roots"]
    assert "infra" in paths["terraform_roots"]

    plan = run_json(PLAN, root)
    after_plan = snapshot(root)
    assert before == after_plan
    assert plan["planner_mode"] == "read-only"
    assert plan["execution_performed"] is False
    assert plan["repository_evidence"]["package_manager"] == "pnpm"

    local_validate = candidate(plan, "pnpm run infra:validate")
    assert local_validate["category"] == "validate"
    assert local_validate["mutates_remote_state"] is False

    script_plan = candidate(plan, "pnpm run infra:plan")
    assert script_plan["category"] == "plan"
    assert script_plan["requires_target"] is True
    assert script_plan["authorization_required"] is True
    assert script_plan["may_lock_remote_state"] is True

    build = candidate(plan, "pnpm run image:build")
    assert build["category"] == "build"
    assert build["mutates_local_state"] is True
    assert build["may_use_network"] is True

    deploy = candidate(plan, "pnpm run deploy:prod")
    assert deploy["category"] == "deploy"
    assert deploy["mutates_remote_state"] is True
    assert deploy["requires_target"] is True

    destroy = candidate(plan, "pnpm run destroy:preview")
    assert destroy["destructive"] is True
    assert destroy["mutates_remote_state"] is True
    assert not any(item["command"] == "pnpm run lint:js" for item in plan["candidates"])

    assert candidate(plan, "make render")["category"] == "render"
    assert candidate(plan, "make release")["mutates_remote_state"] is True

    assert candidate(plan, "terraform -chdir=infra fmt -check -recursive")["category"] == "format"
    tf_plan = candidate(plan, "terraform -chdir=infra plan")
    assert tf_plan["may_lock_remote_state"] is True
    assert tf_plan["mutates_remote_state"] is False

    dry = candidate(plan, "kubectl apply --dry-run=client -f k8s")
    assert dry["locality"] == "local"
    diff = candidate(plan, "kubectl diff -f k8s")
    assert diff["locality"] == "remote"
    assert diff["requires_target"] is True
    assert diff["mutates_remote_state"] is False

    assert candidate(plan, "helm lint chart")["category"] == "validate"
    assert candidate(plan, "helm template qa-render chart")["category"] == "render"
    assert candidate(plan, "kubectl kustomize overlays/prod")["category"] == "render"
    assert candidate(plan, "docker compose -f compose.yaml config")["category"] == "render"

    syntax = candidate(plan, "ansible-playbook --syntax-check playbook.yml")
    assert syntax["locality"] == "local"
    check = candidate(plan, "ansible-playbook --check --diff playbook.yml")
    assert check["authorization_required"] is True
    assert check["mutates_remote_state"] is True

    pulumi = candidate(plan, "pulumi preview")
    assert pulumi["requires_target"] is True
    assert pulumi["authorization_required"] is True

    ci = plan["observed_ci_commands"]
    assert any("terraform -chdir=infra plan" in item for item in ci), ci
    assert any("kubectl diff -f k8s" in item for item in ci), ci
    assert any("cosign verify" in item for item in ci), ci


def test_opentofu_selection(root: Path) -> None:
    (root / ".opentofu-version").write_text("1.9.0\n", encoding="utf-8")
    (root / "main.tf").write_text('terraform { required_version = ">= 1.8" }\n', encoding="utf-8")
    plan = run_json(PLAN, root)
    assert candidate(plan, "tofu fmt -check -recursive")["category"] == "format"
    assert candidate(plan, "tofu validate")["category"] == "validate"
    assert candidate(plan, "tofu plan")["requires_target"] is True


def test_text_and_missing(root: Path) -> None:
    text = subprocess.run(
        [sys.executable, str(PLAN), str(root), "--format", "text"],
        check=True,
        capture_output=True,
        text=True,
    )
    assert "mode: read-only; no execution performed" in text.stdout
    for script in (INSPECT, PLAN):
        missing = subprocess.run(
            [sys.executable, str(script), str(root / "missing")],
            capture_output=True,
            text=True,
        )
        assert missing.returncode == 2
        assert "not a directory" in missing.stderr


def main() -> None:
    with tempfile.TemporaryDirectory() as raw:
        test_inspector_and_planner(Path(raw))
    with tempfile.TemporaryDirectory() as raw:
        test_opentofu_selection(Path(raw))
    with tempfile.TemporaryDirectory() as raw:
        test_text_and_missing(Path(raw))
    print("devops-engineer control-plane tests passed")


if __name__ == "__main__":
    main()
