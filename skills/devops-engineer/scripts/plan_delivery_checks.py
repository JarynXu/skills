#!/usr/bin/env python3
"""Build a read-only candidate DevOps verification and change plan from repository evidence.

The planner never executes commands. It classifies candidates by locality, remote
state access, mutation potential, destructiveness, target requirements, and authority.
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
    ".gradle", ".idea", ".vscode", ".venv", "venv", "__pycache__", ".terraform",
    ".pulumi", ".cache", "coverage",
}
MAX_TEXT = 512 * 1024

@dataclass(frozen=True)
class Candidate:
    category: str
    command: str
    evidence: str
    confidence: str = "high"
    locality: str = "local"  # local | remote | mixed
    requires_target: bool = False
    authorization_required: bool = False
    mutates_local_state: bool = False
    mutates_remote_state: bool = False
    destructive: bool = False
    may_use_network: bool = False
    may_lock_remote_state: bool = False
    notes: str = ""

ORDER = {
    "format": 10,
    "validate": 20,
    "render": 30,
    "policy": 40,
    "diff": 50,
    "plan": 60,
    "build": 70,
    "scan": 75,
    "publish": 80,
    "deploy": 90,
    "release": 95,
    "rollback": 100,
    "destroy": 110,
    "other": 120,
}

SCRIPT_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("destroy", re.compile(r"(^|[:_.-])(destroy|delete|purge|teardown|decommission)($|[:_.-])", re.I)),
    ("rollback", re.compile(r"(^|[:_.-])(rollback|revert)($|[:_.-])", re.I)),
    ("release", re.compile(r"(^|[:_.-])(release|promote)($|[:_.-])", re.I)),
    ("deploy", re.compile(r"(^|[:_.-])(deploy|apply|sync|reconcile)($|[:_.-])", re.I)),
    ("publish", re.compile(r"(^|[:_.-])(publish|push|upload)($|[:_.-])", re.I)),
    ("scan", re.compile(r"(^|[:_.-])(scan|security|sbom|provenance|attest|sign)($|[:_.-])", re.I)),
    ("build", re.compile(r"(^|[:_.-])(build|package|image)($|[:_.-])", re.I)),
    ("plan", re.compile(r"(^|[:_.-])(plan|preview)($|[:_.-])", re.I)),
    ("diff", re.compile(r"(^|[:_.-])(diff)($|[:_.-])", re.I)),
    ("policy", re.compile(r"(^|[:_.-])(policy|conftest|opa)($|[:_.-])", re.I)),
    ("render", re.compile(r"(^|[:_.-])(render|template|manifest)($|[:_.-])", re.I)),
    ("validate", re.compile(r"(^|[:_.-])(validate|verify|check|lint|test)($|[:_.-])", re.I)),
    ("format", re.compile(r"(^|[:_.-])(fmt|format)($|[:_.-])", re.I)),
]


def read_text(path: Path) -> str:
    try:
        if not path.is_file() or path.stat().st_size > MAX_TEXT:
            return ""
        return path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""


def safe_rel(path: Path, root: Path) -> str:
    value = path.relative_to(root).as_posix()
    return value or "."


def iter_files(root: Path, max_files: int = 20000) -> Iterable[Path]:
    count = 0
    for current, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".cache")]
        for name in files:
            if count >= max_files:
                return
            count += 1
            yield Path(current) / name


def classify_name(name: str) -> str | None:
    for category, pattern in SCRIPT_PATTERNS:
        if pattern.search(name):
            return category
    return None


def safety_for(category: str) -> dict[str, object]:
    if category in {"format", "validate", "render", "policy"}:
        return {}
    if category in {"diff", "plan"}:
        return {
            "locality": "remote",
            "requires_target": True,
            "authorization_required": True,
            "may_use_network": True,
            "may_lock_remote_state": category == "plan",
        }
    if category in {"build", "scan"}:
        return {
            "locality": "mixed",
            "mutates_local_state": True,
            "may_use_network": True,
        }
    if category in {"publish", "deploy", "release", "rollback"}:
        return {
            "locality": "remote",
            "requires_target": True,
            "authorization_required": True,
            "mutates_remote_state": True,
            "may_use_network": True,
        }
    if category == "destroy":
        return {
            "locality": "remote",
            "requires_target": True,
            "authorization_required": True,
            "mutates_remote_state": True,
            "destructive": True,
            "may_use_network": True,
        }
    return {}


def add(items: list[Candidate], candidate: Candidate) -> None:
    if not any(c.command == candidate.command and c.category == candidate.category for c in items):
        items.append(candidate)


def from_named_entry(category: str, command: str, evidence: str, **overrides: object) -> Candidate:
    fields = safety_for(category)
    fields.update(overrides)
    return Candidate(category=category, command=command, evidence=evidence, **fields)


def package_manager(root: Path) -> str:
    if (root / "pnpm-lock.yaml").exists():
        return "pnpm"
    if (root / "yarn.lock").exists():
        return "yarn"
    if (root / "bun.lock").exists() or (root / "bun.lockb").exists():
        return "bun"
    return "npm"


def package_command(manager: str, name: str) -> str:
    if manager == "yarn":
        return f"yarn run {name}"
    if manager == "pnpm":
        return f"pnpm run {name}"
    if manager == "bun":
        return f"bun run {name}"
    return f"npm run {name}"


def plan_package_scripts(root: Path, items: list[Candidate], evidence: dict[str, object]) -> None:
    path = root / "package.json"
    if not path.is_file():
        return
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        evidence["package_json_error"] = "package.json could not be parsed"
        return
    scripts = payload.get("scripts") if isinstance(payload, dict) else None
    if not isinstance(scripts, dict):
        return
    manager = package_manager(root)
    evidence["package_manager"] = manager
    evidence["package_scripts"] = sorted(str(k) for k in scripts)
    for name, body in scripts.items():
        if not isinstance(body, str):
            continue
        category = classify_name(str(name))
        if not category:
            continue
        note = "Repository-owned package script; inspect its implementation, target, credentials, environment, and side effects before execution."
        add(items, from_named_entry(category, package_command(manager, str(name)), f"package.json script {name!r}: {body}", notes=note))


def plan_makefile(root: Path, items: list[Candidate], evidence: dict[str, object]) -> None:
    path = root / "Makefile"
    if not path.is_file():
        return
    text = read_text(path)
    targets: list[str] = []
    for match in re.finditer(r"(?m)^([A-Za-z0-9][A-Za-z0-9_.-]*):(?!=)", text):
        name = match.group(1)
        if name.startswith("."):
            continue
        targets.append(name)
        category = classify_name(name)
        if category:
            add(items, from_named_entry(category, f"make {name}", f"Makefile target {name!r}", notes="Repository-owned Make target; inspect prerequisites and recipe before execution."))
    evidence["make_targets"] = sorted(set(targets))


def terraform_tool(root: Path, ci_commands: list[str]) -> str:
    if (root / ".opentofu-version").exists() or any(re.search(r"\btofu\b", cmd) for cmd in ci_commands):
        return "tofu"
    return "terraform"


def terraform_roots(root: Path) -> list[Path]:
    roots: set[Path] = set()
    for path in iter_files(root):
        if path.suffix == ".tf" or path.name in {".terraform.lock.hcl", ".terraform-version", ".opentofu-version"}:
            roots.add(path.parent)
    return sorted(roots)


def plan_terraform(root: Path, items: list[Candidate], ci_commands: list[str]) -> None:
    tool = terraform_tool(root, ci_commands)
    for directory in terraform_roots(root):
        r = safe_rel(directory, root)
        chdir = f"-chdir={r} " if r != "." else ""
        add(items, Candidate("format", f"{tool} {chdir}fmt -check -recursive".replace("  ", " "), f"Terraform-compatible configuration detected at {r}"))
        add(items, Candidate("validate", f"{tool} {chdir}validate".replace("  ", " "), f"Terraform-compatible configuration detected at {r}", confidence="medium", notes="Validation may require prior provider/module initialization; do not run init implicitly just to satisfy this candidate."))
        add(items, Candidate(
            "plan",
            f"{tool} {chdir}plan".replace("  ", " "),
            f"Terraform-compatible configuration detected at {r}",
            locality="remote",
            requires_target=True,
            authorization_required=True,
            may_use_network=True,
            may_lock_remote_state=True,
            notes="Plan can read provider APIs, state backends, credentials, data sources and acquire state locks. Confirm workspace/account/region/backend and variable sources first.",
        ))


def looks_like_kube(text: str) -> bool:
    return bool(re.search(r"(?m)^apiVersion:\s*", text) and re.search(r"(?m)^kind:\s*", text))


def kube_sources(root: Path) -> tuple[list[Path], list[Path], list[Path]]:
    manifests: list[Path] = []
    charts: list[Path] = []
    kustomize: list[Path] = []
    for path in iter_files(root):
        lname = path.name.lower()
        if lname == "chart.yaml":
            charts.append(path.parent)
        if lname in {"kustomization.yaml", "kustomization.yml"}:
            kustomize.append(path.parent)
        if path.suffix.lower() in {".yml", ".yaml"} and looks_like_kube(read_text(path)):
            manifests.append(path)
    return sorted(set(manifests)), sorted(set(charts)), sorted(set(kustomize))


def compact_kube_targets(paths: list[Path], root: Path) -> list[str]:
    # Prefer common parent directory when there are several manifests under it; otherwise keep exact file.
    groups: dict[Path, list[Path]] = {}
    for path in paths:
        groups.setdefault(path.parent, []).append(path)
    out: list[str] = []
    for parent, members in sorted(groups.items(), key=lambda item: str(item[0])):
        if len(members) >= 2:
            out.append(safe_rel(parent, root))
        else:
            out.append(safe_rel(members[0], root))
    return out


def plan_kubernetes(root: Path, items: list[Candidate]) -> None:
    manifests, charts, kustomize = kube_sources(root)
    for target in compact_kube_targets(manifests, root):
        add(items, Candidate(
            "validate",
            f"kubectl apply --dry-run=client -f {target}",
            f"Kubernetes manifest source detected at {target}",
            notes="Client dry-run checks local decoding/defaulting only; CRDs, admission and cluster policy may require separate server-side evidence.",
        ))
        add(items, Candidate(
            "diff",
            f"kubectl diff -f {target}",
            f"Kubernetes manifest source detected at {target}",
            locality="remote",
            requires_target=True,
            authorization_required=True,
            may_use_network=True,
            notes="kubectl diff contacts the selected cluster and may invoke server-side dry-run/admission webhooks. Verify context, namespace and credentials first.",
        ))
    for chart in charts:
        r = safe_rel(chart, root)
        add(items, Candidate("validate", f"helm lint {r}", f"Helm Chart.yaml detected at {r}"))
        add(items, Candidate("render", f"helm template qa-render {r}", f"Helm Chart.yaml detected at {r}", notes="Render with the project's actual values/schema before treating this generic render as representative."))
    for directory in kustomize:
        r = safe_rel(directory, root)
        add(items, Candidate("render", f"kubectl kustomize {r}", f"Kustomization detected at {r}"))


def plan_compose(root: Path, items: list[Candidate]) -> None:
    names = {"compose.yml", "compose.yaml", "docker-compose.yml", "docker-compose.yaml"}
    for path in iter_files(root):
        if path.name.lower() in names:
            r = safe_rel(path, root)
            add(items, Candidate("render", f"docker compose -f {r} config", f"Compose file detected: {r}", notes="Configuration expansion may read environment/.env values; prevent secret disclosure in captured output."))


def plan_ansible(root: Path, items: list[Candidate]) -> None:
    for path in list(root.glob("*.yml")) + list(root.glob("*.yaml")):
        text = read_text(path)
        if not (re.search(r"(?m)^-?\s*hosts:\s*", text) and re.search(r"(?m)^\s*(tasks|roles):\s*", text)):
            continue
        r = safe_rel(path, root)
        add(items, Candidate("validate", f"ansible-playbook --syntax-check {r}", f"Ansible playbook shape detected: {r}"))
        add(items, Candidate(
            "plan",
            f"ansible-playbook --check --diff {r}",
            f"Ansible playbook shape detected: {r}",
            locality="remote",
            requires_target=True,
            authorization_required=True,
            may_use_network=True,
            mutates_remote_state=True,
            notes="Check mode is not a universal no-op guarantee; module support varies and lookups/plugins can have side effects. Confirm inventory, limit, credentials and module behavior first.",
        ))


def plan_pulumi(root: Path, items: list[Candidate]) -> None:
    roots: set[Path] = set()
    for path in iter_files(root):
        if path.name.startswith("Pulumi") and path.suffix.lower() in {".yaml", ".yml", ".json"}:
            roots.add(path.parent)
    for directory in sorted(roots):
        r = safe_rel(directory, root)
        prefix = f"cd {r} && " if r != "." else ""
        add(items, Candidate(
            "plan",
            f"{prefix}pulumi preview",
            f"Pulumi project/stack files detected at {r}",
            locality="remote",
            requires_target=True,
            authorization_required=True,
            may_use_network=True,
            notes="Preview executes project/provider code and reads the selected stack/backend/cloud APIs. Confirm stack, account, secrets provider and config first.",
        ))


def observed_ci_commands(root: Path) -> list[str]:
    files: list[Path] = []
    workflow_dir = root / ".github" / "workflows"
    if workflow_dir.is_dir():
        files.extend(workflow_dir.glob("*.yml"))
        files.extend(workflow_dir.glob("*.yaml"))
    for name in (".gitlab-ci.yml", "Jenkinsfile", "azure-pipelines.yml"):
        path = root / name
        if path.is_file():
            files.append(path)
    patterns = [
        re.compile(r"(?:terraform|tofu)\s+[^\n\r]+"),
        re.compile(r"kubectl\s+[^\n\r]+"),
        re.compile(r"helm\s+[^\n\r]+"),
        re.compile(r"pulumi\s+[^\n\r]+"),
        re.compile(r"ansible-playbook\s+[^\n\r]+"),
        re.compile(r"docker\s+(?:build|compose|push|login)\b[^\n\r]*"),
        re.compile(r"(?:cosign|syft|grype|trivy)\s+[^\n\r]+"),
        re.compile(r"(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?[\w:.-]+"),
        re.compile(r"make\s+[A-Za-z0-9_.-]+"),
    ]
    commands: set[str] = set()
    for path in files:
        text = read_text(path)
        for pattern in patterns:
            for match in pattern.finditer(text):
                value = match.group(0).strip().strip("'\"")
                value = re.split(r"\s+#", value)[0].rstrip()
                if 2 <= len(value) <= 300:
                    commands.add(value)
    return sorted(commands)


def build_plan(root: Path) -> dict[str, object]:
    items: list[Candidate] = []
    evidence: dict[str, object] = {}
    ci = observed_ci_commands(root)
    plan_package_scripts(root, items, evidence)
    plan_makefile(root, items, evidence)
    plan_terraform(root, items, ci)
    plan_kubernetes(root, items)
    plan_compose(root, items)
    plan_ansible(root, items)
    plan_pulumi(root, items)
    items.sort(key=lambda c: (ORDER.get(c.category, 999), c.command))
    return {
        "root": str(root.resolve()),
        "planner_mode": "read-only",
        "execution_performed": False,
        "repository_evidence": evidence,
        "observed_ci_commands": ci,
        "candidates": [asdict(item) for item in items],
        "rules": [
            "A candidate is evidence for planning, not permission to execute it.",
            "Verify repository instructions and inspect the exact script/target/configuration before running a candidate.",
            "Resolve environment, account/project/subscription, cluster/context/namespace/region, artifact identity and credentials before remote commands.",
            "Treat plan/diff/check modes according to their actual tool semantics: they may read APIs, acquire locks, run plugins/providers or invoke admission/webhooks.",
            "Deploy/apply/release/rollback/publish and destructive candidates require explicit remote authority and a verified recovery path.",
            "Production access never implies production change authorization.",
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
            flags: list[str] = []
            if item["requires_target"]:
                flags.append("requires-target")
            if item["authorization_required"]:
                flags.append("authorization-required")
            if item["mutates_local_state"]:
                flags.append("local-mutation")
            if item["mutates_remote_state"]:
                flags.append("remote-mutation")
            if item["destructive"]:
                flags.append("destructive")
            if item["may_lock_remote_state"]:
                flags.append("may-lock-state")
            suffix = f" [{' '.join(flags)}]" if flags else ""
            print(f"{item['category']}: {item['command']}{suffix} <- {item['evidence']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
