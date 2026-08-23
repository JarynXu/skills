#!/usr/bin/env python3
"""Read-only inventory of delivery, infrastructure, platform, and operations signals."""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path

SKIP_DIRS = {
    ".git", ".hg", ".svn", "node_modules", "vendor", "target", "build", "dist", "out",
    ".gradle", ".idea", ".vscode", ".venv", "venv", "__pycache__", ".terraform",
    ".pulumi", ".cache", "coverage",
}
MAX_TEXT = 512 * 1024
YAML_SUFFIXES = {".yml", ".yaml"}
TEXT_SUFFIXES = {
    ".yml", ".yaml", ".json", ".toml", ".hcl", ".tf", ".tfvars", ".md", ".txt",
    ".sh", ".bash", ".zsh", ".ps1", ".py", ".js", ".ts", ".go", ".java", ".kt",
    ".cs", ".rs", ".xml", ".properties", ".conf", ".ini",
}


def read_text(path: Path) -> str:
    try:
        if not path.is_file() or path.stat().st_size > MAX_TEXT:
            return ""
        return path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""


def rel(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def add_path(bucket: dict[str, set[str]], key: str, path: str) -> None:
    bucket[key].add(path)


def looks_like_kubernetes(text: str) -> bool:
    return bool(re.search(r"(?m)^apiVersion:\s*[^\s]+\s*$", text) and re.search(r"(?m)^kind:\s*[A-Za-z][A-Za-z0-9]+\s*$", text))


def inspect(root: Path, max_files: int) -> dict[str, object]:
    tools: dict[str, set[str]] = defaultdict(set)
    paths: dict[str, set[str]] = defaultdict(set)
    task_entrypoints: set[str] = set()
    scanned = 0

    for current, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".cache")]
        current_path = Path(current)
        for name in files:
            if scanned >= max_files:
                break
            scanned += 1
            path = current_path / name
            r = rel(path, root)
            low = r.lower()
            lname = name.lower()
            suffix = path.suffix.lower()

            if low.startswith(".github/workflows/") and suffix in YAML_SUFFIXES:
                tools["ci"].add("github-actions")
                add_path(paths, "ci_files", r)
            elif lname == ".gitlab-ci.yml":
                tools["ci"].add("gitlab-ci")
                add_path(paths, "ci_files", r)
            elif lname == "jenkinsfile":
                tools["ci"].add("jenkins")
                add_path(paths, "ci_files", r)
            elif lname == "azure-pipelines.yml" or low.startswith(".azure-pipelines/"):
                tools["ci"].add("azure-pipelines")
                add_path(paths, "ci_files", r)
            elif low.startswith(".circleci/") and suffix in YAML_SUFFIXES:
                tools["ci"].add("circleci")
                add_path(paths, "ci_files", r)
            elif lname == "pipeline.yml" and ".buildkite" in low:
                tools["ci"].add("buildkite")
                add_path(paths, "ci_files", r)

            if lname == "dockerfile" or lname.startswith("dockerfile."):
                tools["containers"].add("dockerfile")
                add_path(paths, "dockerfiles", r)
            if lname in {"compose.yml", "compose.yaml", "docker-compose.yml", "docker-compose.yaml"}:
                tools["containers"].add("docker-compose")
                add_path(paths, "compose_files", r)

            if lname == "chart.yaml":
                tools["orchestration"].add("helm")
                add_path(paths, "helm_charts", rel(path.parent, root) or ".")
            if lname in {"kustomization.yaml", "kustomization.yml"}:
                tools["orchestration"].add("kustomize")
                add_path(paths, "kustomize_roots", rel(path.parent, root) or ".")

            if suffix == ".tf" or lname in {".terraform.lock.hcl", ".terraform-version", ".opentofu-version"}:
                tools["iac"].add("terraform-compatible")
                add_path(paths, "terraform_roots", rel(path.parent, root) or ".")
            if lname.startswith("pulumi") and suffix in YAML_SUFFIXES.union({".json"}):
                tools["iac"].add("pulumi")
                add_path(paths, "pulumi_roots", rel(path.parent, root) or ".")
            if suffix == ".bicep":
                tools["iac"].add("azure-bicep")
                add_path(paths, "bicep_files", r)
            if lname == "ansible.cfg":
                tools["iac"].add("ansible")
                add_path(paths, "ansible_files", r)

            if lname in {"makefile", "justfile", "taskfile.yml", "taskfile.yaml"}:
                task_entrypoints.add(r)
            if lname == "package.json":
                task_entrypoints.add(r)

            text = ""
            if suffix in TEXT_SUFFIXES or lname in {
                "dockerfile", "makefile", "jenkinsfile", "ansible.cfg", "renovate.json",
            } or lname.startswith("dockerfile."):
                text = read_text(path)

            if suffix in YAML_SUFFIXES and text and looks_like_kubernetes(text):
                tools["orchestration"].add("kubernetes")
                add_path(paths, "kubernetes_manifests", r)
                kind = re.search(r"(?m)^kind:\s*([^\s#]+)", text)
                api = re.search(r"(?m)^apiVersion:\s*([^\s#]+)", text)
                kind_value = kind.group(1) if kind else ""
                api_value = api.group(1) if api else ""
                if kind_value == "Application" and "argoproj.io" in api_value:
                    tools["gitops"].add("argocd")
                if "toolkit.fluxcd.io" in api_value:
                    tools["gitops"].add("flux")
                if kind_value == "SealedSecret" or "bitnami.com" in api_value and "sealed" in text.lower():
                    tools["configuration_secrets"].add("sealed-secrets")
                if "external-secrets.io" in api_value:
                    tools["configuration_secrets"].add("external-secrets")
                if kind_value in {"ServiceMonitor", "PodMonitor", "PrometheusRule"}:
                    tools["observability"].add("prometheus-operator")
                if kind_value == "OpenTelemetryCollector" or "opentelemetry.io" in api_value:
                    tools["observability"].add("opentelemetry-operator")

            lower = text.lower()
            if lower:
                if re.search(r"\bprovider\s+\"aws\"|hashicorp/aws|aws_", lower):
                    tools["cloud"].add("aws")
                if re.search(r"\bprovider\s+\"google\"|hashicorp/google|google_", lower):
                    tools["cloud"].add("gcp")
                if re.search(r"\bprovider\s+\"azurerm\"|hashicorp/azurerm|azurerm_", lower):
                    tools["cloud"].add("azure")
                if "pulumi" in lower:
                    tools["iac"].add("pulumi")
                if re.search(r"\bansible(?:-playbook)?\b", lower):
                    tools["iac"].add("ansible")
                if "argoproj.io" in lower or "argocd" in lower:
                    tools["gitops"].add("argocd")
                if "toolkit.fluxcd.io" in lower or re.search(r"\bflux\s+(?:reconcile|diff|build)\b", lower):
                    tools["gitops"].add("flux")
                if "sops" in lower or lname == ".sops.yaml":
                    tools["configuration_secrets"].add("sops")
                if re.search(r"\bvault\b", lower):
                    tools["configuration_secrets"].add("vault")
                if "external-secrets" in lower:
                    tools["configuration_secrets"].add("external-secrets")
                if "sealedsecret" in lower or "sealed-secrets" in lower:
                    tools["configuration_secrets"].add("sealed-secrets")
                if "opentelemetry" in lower or "otelcol" in lower:
                    tools["observability"].add("opentelemetry")
                if "prometheus" in lower:
                    tools["observability"].add("prometheus")
                if "grafana" in lower:
                    tools["observability"].add("grafana")
                if re.search(r"\bcosign\b", lower):
                    tools["supply_chain"].add("cosign")
                if re.search(r"\bsyft\b|cyclonedx|spdx", lower):
                    tools["supply_chain"].add("sbom")
                if re.search(r"\bgrype\b|\btrivy\b|osv-scanner", lower):
                    tools["supply_chain"].add("artifact-scanning")
                if "slsa" in lower:
                    tools["supply_chain"].add("slsa")

            if lname == ".sops.yaml":
                tools["configuration_secrets"].add("sops")
                add_path(paths, "secret_config_files", r)
            if low.startswith(".github/dependabot"):
                tools["supply_chain"].add("dependabot")
            if lname.startswith("renovate"):
                tools["supply_chain"].add("renovate")
            if lname in {"prometheus.yml", "prometheus.yaml"}:
                tools["observability"].add("prometheus")
                add_path(paths, "observability_files", r)
            if "otel" in lname and suffix in YAML_SUFFIXES:
                tools["observability"].add("opentelemetry")
                add_path(paths, "observability_files", r)

        if scanned >= max_files:
            break

    # Infer Ansible playbooks after basic scanning to avoid treating every YAML file as a playbook.
    for path in list(root.glob("*.yml")) + list(root.glob("*.yaml")):
        text = read_text(path)
        if re.search(r"(?m)^-?\s*hosts:\s*", text) and re.search(r"(?m)^\s*(tasks|roles):\s*", text):
            tools["iac"].add("ansible")
            add_path(paths, "ansible_playbooks", rel(path, root))

    return {
        "root": str(root.resolve()),
        "files_scanned": scanned,
        "scan_truncated": scanned >= max_files,
        "tools": {key: sorted(values) for key, values in sorted(tools.items())},
        "paths": {key: sorted(values) for key, values in sorted(paths.items())},
        "task_entrypoints": sorted(task_entrypoints),
        "next_checks": [
            "Confirm detected files are active source-of-truth inputs rather than examples, generated output, or retired configuration.",
            "Identify exact environment/account/cluster/namespace/region and immutable artifact identity before remote operations.",
            "Prefer repository-owned validation, render, plan, diff, build, promotion, rollback, and policy commands over generic defaults.",
            "Separate local checks, remote reads, remote mutations, destructive actions, and production authorization before execution.",
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".")
    parser.add_argument("--max-files", type=int, default=20000)
    parser.add_argument("--format", choices=("json", "text"), default="json")
    args = parser.parse_args()
    root = Path(args.root)
    if not root.is_dir():
        print(f"ERROR: not a directory: {root}", file=sys.stderr)
        return 2
    data = inspect(root, max(1, args.max_files))
    if args.format == "json":
        print(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True))
    else:
        for key, value in data.items():
            print(f"{key}: {value}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
