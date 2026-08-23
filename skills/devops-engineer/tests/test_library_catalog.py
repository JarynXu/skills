#!/usr/bin/env python3
"""Static contract for the DevOps offline teaching-library catalog."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "references" / "library" / "SOURCES.json"

EXPECTED = {
    "docker-docs",
    "kubernetes",
    "kustomize",
    "argo-cd",
    "flux-gitops",
    "github-actions",
    "prometheus-practices",
    "opentelemetry",
    "oci-runtime",
    "oci-image",
    "slsa",
    "cosign",
}
REQUIRED_TRACKS = {
    "containers",
    "kubernetes",
    "gitops",
    "ci-cd",
    "metrics",
    "observability",
    "supply-chain",
}


def main() -> None:
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    assert data["schema_version"] == 1
    policy = data.get("policy") or {}
    assert "agent-ready Markdown" in " ".join(policy.get("selection_rules", []))

    sources = data.get("sources")
    assert isinstance(sources, list) and sources
    ids = [item["source_id"] for item in sources]
    assert len(ids) == len(set(ids)), ids
    assert set(ids) == EXPECTED, (set(ids), EXPECTED)

    tracks: set[str] = set()
    for source in sources:
        assert source.get("repo") and "/" in source["repo"], source
        assert source.get("ref"), source
        assert source.get("license"), source
        assert source.get("tier"), source
        current_tracks = source.get("tracks")
        assert isinstance(current_tracks, list) and current_tracks, source
        tracks.update(current_tracks)
        includes = source.get("includes")
        assert isinstance(includes, list) and len(includes) >= 2, source
        license_entries = [item for item in includes if Path(item["path"]).name.lower().startswith(("license", "copying"))]
        assert license_entries, f"{source['source_id']}: no license evidence included"
        for item in includes:
            path = item["path"]
            assert not path.endswith(".mdx"), f"{source['source_id']}: MDX is not currently agent-ready: {path}"
            if item.get("recursive"):
                assert path not in {".", "docs", "content", "website"}, f"{source['source_id']}: recursive scope too broad: {path}"
    assert REQUIRED_TRACKS <= tracks, (REQUIRED_TRACKS - tracks)

    by_id = {item["source_id"]: item for item in sources}
    assert by_id["github-actions"]["license"] == "CC-BY-4.0"
    assert by_id["slsa"]["license"] == "Community Specification License 1.0"
    assert by_id["kubernetes"]["license"] == "CC-BY-4.0"
    assert by_id["oci-runtime"]["repo"] == "opencontainers/runtime-spec"
    assert by_id["oci-image"]["repo"] == "opencontainers/image-spec"
    assert by_id["cosign"]["repo"] == "sigstore/cosign"
    print("devops library catalog contract passed")


if __name__ == "__main__":
    main()
