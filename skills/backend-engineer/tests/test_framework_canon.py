#!/usr/bin/env python3
"""Static contract checks for the curated backend framework canon catalog."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "references" / "library" / "sources.d" / "framework-canon.json"

EXPECTED_REPOS = {
    "quarkus-core-docs": "quarkusio/quarkus",
    "micronaut-core-docs": "micronaut-projects/micronaut-core",
    "ktor-server-docs": "ktorio/ktor-documentation",
    "fastify-core-docs": "fastify/fastify",
    "nestjs-core-docs": "nestjs/docs.nestjs.com",
    "gin-core-docs": "gin-gonic/gin",
    "tokio-guides": "tokio-rs/website",
    "sqlalchemy-core-docs": "sqlalchemy/sqlalchemy",
    "efcore-core-docs": "dotnet/EntityFramework.Docs",
    "celery-core-docs": "celery/celery",
}

ALLOWED_RECURSIVE = {
    ("micronaut-core-docs", "src/main/docs/guide/config"),
    ("micronaut-core-docs", "src/main/docs/guide/ioc/injection"),
    ("micronaut-core-docs", "src/main/docs/guide/ioc/scopes"),
    ("micronaut-core-docs", "src/main/docs/guide/httpServer"),
    ("micronaut-core-docs", "src/main/docs/guide/contextPropagation"),
    ("tokio-guides", "content/tokio/tutorial"),
}

SUPPORTED_SUFFIXES = {
    ".md",
    ".rst",
    ".adoc",
    ".asciidoc",
    ".html",
    ".htm",
    ".xml",
    ".sgml",
    ".pdf",
}


def require_track(sources: dict[str, dict], source_ids: set[str], track: str) -> None:
    assert any(track in sources[source_id]["tracks"] for source_id in source_ids), (
        track,
        source_ids,
    )


def main() -> None:
    payload = json.loads(CATALOG.read_text(encoding="utf-8"))
    assert payload.get("schema_version") == 1, payload
    entries = payload.get("sources")
    assert isinstance(entries, list), payload

    sources = {entry["source_id"]: entry for entry in entries}
    assert len(sources) == len(entries), "duplicate source_id in framework canon"
    assert set(sources) == set(EXPECTED_REPOS), sorted(sources)

    for source_id, expected_repo in EXPECTED_REPOS.items():
        source = sources[source_id]
        assert source["repo"] == expected_repo, (source_id, source["repo"])
        assert source["tier"] == "canonical-practice", source_id
        for field in ("title", "ref", "license", "tracks", "includes"):
            assert source.get(field), (source_id, field)
        assert isinstance(source["tracks"], list), source_id
        assert isinstance(source["includes"], list), source_id

        paths: set[str] = set()
        has_provenance = False
        for item in source["includes"]:
            path = item["path"]
            assert path not in paths, (source_id, "duplicate include", path)
            paths.add(path)
            assert not path.startswith("/"), (source_id, path)
            assert ".." not in Path(path).parts, (source_id, path)
            lower = path.lower()
            assert not lower.endswith(".mdx"), (source_id, "MDX not supported", path)
            assert not lower.endswith(".topic"), (source_id, "Ktor .topic not supported", path)

            if item.get("recursive"):
                assert (source_id, path) in ALLOWED_RECURSIVE, (
                    source_id,
                    "unreviewed recursive include",
                    path,
                )
            else:
                name = Path(path).name.lower()
                if name.startswith("license") or name.startswith("copying") or name.startswith("notice"):
                    has_provenance = True
                else:
                    assert Path(path).suffix.lower() in SUPPORTED_SUFFIXES, (
                        source_id,
                        "unsupported preprocessing suffix",
                        path,
                    )

        assert has_provenance, (source_id, "missing license/provenance include")

    jvm = {"quarkus-core-docs", "micronaut-core-docs", "ktor-server-docs"}
    node = {"fastify-core-docs", "nestjs-core-docs"}
    go = {"gin-core-docs"}
    rust = {"tokio-guides"}
    data = {"sqlalchemy-core-docs", "efcore-core-docs"}
    tasks = {"celery-core-docs"}

    require_track(sources, jvm, "java-jvm")
    require_track(sources, jvm, "kotlin")
    require_track(sources, node, "node-typescript")
    require_track(sources, go, "go")
    require_track(sources, rust, "rust")
    require_track(sources, data, "transactions")
    require_track(sources, tasks, "distributed-tasks")

    all_ids = set(sources)
    for track in (
        "lifecycle",
        "dependency-injection",
        "configuration",
        "concurrency",
        "transactions",
        "security",
        "testing",
        "diagnostics",
    ):
        require_track(sources, all_ids, track)

    # Explicitly deferred until the preprocessing/source-quality contract is strong enough.
    assert "express-core-docs" not in sources
    assert "axum-core-docs" not in sources
    assert "echo-core-docs" not in sources

    print("framework canon catalog contract passed")


if __name__ == "__main__":
    main()
