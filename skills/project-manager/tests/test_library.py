#!/usr/bin/env python3
"""Contracts for the project-manager source-backed offline curriculum."""
from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "references" / "library"
CATALOG = LIBRARY / "SOURCES.json"
LOCK = LIBRARY / "SOURCES.lock.json"
ORIGINALS = LIBRARY / "originals"
PROCESSED = LIBRARY / "processed"

EXPECTED = {
    "usds-playbook",
    "scrum-guide-2020",
    "open-guide-to-kanban-2025-7",
    "gao-agile-assessment",
    "gao-schedule-assessment",
    "gao-cost-estimating",
    "pm2-project-management",
}
URL_HOSTS = {"scrumguides.org", "kanbanguides.org", "www.gao.gov", "pm2.europa.eu"}
SEMANTIC_CHECKS = {
    "usds-playbook": [("primary users",), ("agile", "iterative")],
    "scrum-guide-2020": [("sprint goal",), ("definition of done",)],
    "open-guide-to-kanban-2025-7": [("work in progress", "work in process"), ("improving flow", "flow")],
    "gao-agile-assessment": [("agile", "best practices"), ("monitoring", "control")],
    "gao-schedule-assessment": [("critical path",), ("schedule risk",)],
    "gao-cost-estimating": [("earned value management",), ("work breakdown structure",)],
    "pm2-project-management": [("governance",), ("project lifecycle", "project life cycle")],
}


def text_for(source_id: str) -> str:
    parts: list[str] = []
    for path in sorted((PROCESSED / source_id).rglob("*.md")):
        parts.append(path.read_text(encoding="utf-8", errors="replace").lower())
    return "\n".join(parts)


def main() -> None:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    sources = catalog["sources"]
    by_id = {source["source_id"]: source for source in sources}
    assert set(by_id) == EXPECTED and len(sources) == 7

    for source in sources:
        assert source.get("license") and source.get("tier") and source.get("tracks"), source["source_id"]
        includes = source["includes"]
        assert includes
        if source.get("kind", "github") == "url":
            assert source.get("version")
            for include in includes:
                parsed = urlparse(include["url"])
                assert parsed.scheme == "https" and parsed.hostname in URL_HOSTS, include
                assert include["path"].lower().endswith(".pdf"), include
                expected = include.get("expected_sha256")
                assert isinstance(expected, str) and len(expected) == 64, include
        else:
            assert source.get("repo") == "usds/playbook" and len(source.get("ref", "")) == 40

    assert (LIBRARY / "curriculum.md").stat().st_size > 3000
    assert (LIBRARY / "restricted-canon.md").stat().st_size > 2500

    lock = json.loads(LOCK.read_text(encoding="utf-8"))
    assert lock["catalog_source_count"] == 7
    assert set(lock["sources"]) == EXPECTED

    manifests = list(ORIGINALS.glob("*/SOURCE.json"))
    assert len(manifests) == 7, [p.parent.name for p in manifests]
    for source_id in sorted(EXPECTED):
        manifest_path = ORIGINALS / source_id / "SOURCE.json"
        assert manifest_path.is_file(), source_id
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        assert manifest.get("agent_ready") is True, source_id
        assert int(manifest.get("file_count", 0)) >= 1, source_id
        assert int(manifest.get("processed_count", 0)) >= 1, source_id
        assert (PROCESSED / source_id).is_dir(), source_id
        if source_id != "usds-playbook":
            assert manifest.get("source_kind") == "url", source_id
            expected_by_path = {item["path"]: item["expected_sha256"] for item in by_id[source_id]["includes"]}
            for item in manifest["files"]:
                assert item.get("sha256") == expected_by_path[item["local_path"]], (source_id, item)
                assert str(item.get("source_url", "")).startswith("https://")
        else:
            assert manifest.get("source_kind") == "github"

        corpus = text_for(source_id)
        assert corpus.strip(), source_id
        for alternatives in SEMANTIC_CHECKS[source_id]:
            assert any(term in corpus for term in alternatives), (source_id, alternatives)

    index = (LIBRARY / "INDEX.md").read_text(encoding="utf-8")
    curriculum = (LIBRARY / "curriculum.md").read_text(encoding="utf-8")
    restricted = (LIBRARY / "restricted-canon.md").read_text(encoding="utf-8")
    for source_id in EXPECTED:
        assert source_id in index, source_id
    for term in ("Scrum", "Kanban", "GAO", "PM²", "USDS"):
        assert term in curriculum, term
    for term in ("PMBOK", "PRINCE2", "ISO 21502"):
        assert term in restricted, term

    print("project-manager offline curriculum passed")


if __name__ == "__main__":
    main()
