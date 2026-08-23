#!/usr/bin/env python3
"""Require every DevOps canon source to be agent-ready and semantically searchable."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORIGINALS = ROOT / "references" / "library" / "originals"
PROCESSED = ROOT / "references" / "library" / "processed"

EXPECTATIONS: dict[str, tuple[str, ...]] = {
    "docker-docs": ("multi-stage", "build secrets"),
    "kubernetes": ("crashloopbackoff", "pod lifecycle"),
    "kustomize": ("kustomization",),
    "argo-cd": ("desired state", "gitops"),
    "flux-gitops": ("reconciliation", "gitops"),
    "github-actions": ("workflow", "artifact attestation"),
    "prometheus-practices": ("alerting", "instrumentation"),
    "opentelemetry": ("metrics data model", "logs data model"),
    "oci-runtime": ("runtime and lifecycle", "container process"),
    "oci-image": ("image manifest", "image index"),
    "slsa": ("build l3", "provenance"),
    "cosign": ("sign the supplied container image", "image digest"),
}


def corpus(source_id: str) -> str:
    root = PROCESSED / source_id
    assert root.is_dir(), f"{source_id}: processed directory missing"
    texts: list[str] = []
    files = sorted(root.rglob("*.md"))
    assert files, f"{source_id}: no processed Markdown"
    for path in files:
        texts.append(path.read_text(encoding="utf-8", errors="replace").lower())
    return "\n".join(texts)


def main() -> None:
    installed = {path.parent.name for path in ORIGINALS.glob("*/SOURCE.json")}
    assert installed == set(EXPECTATIONS), (installed, set(EXPECTATIONS))

    for source_id, terms in EXPECTATIONS.items():
        manifest_path = ORIGINALS / source_id / "SOURCE.json"
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        assert data.get("source_id") == source_id, data
        assert data.get("source_commit"), source_id
        assert data.get("agent_ready") is True, f"{source_id}: agent_ready is not true"
        processed = data.get("processed_files")
        assert isinstance(processed, list) and processed, f"{source_id}: processed_files missing"
        text = corpus(source_id)
        assert any(term.lower() in text for term in terms), f"{source_id}: none of {terms!r} found in processed Markdown"

    index = (ROOT / "references" / "library" / "INDEX.md").read_text(encoding="utf-8")
    learning = (ROOT / "references" / "complete-learning-path.md").read_text(encoding="utf-8")
    for source_id in EXPECTATIONS:
        assert f"`{source_id}`" in index, f"{source_id}: missing from library INDEX"
    assert "library/processed/" in learning
    assert "scripts/offline_library.py search" in learning
    print("devops offline canon readiness passed")


if __name__ == "__main__":
    main()
