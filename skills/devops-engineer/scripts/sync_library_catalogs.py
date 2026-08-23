#!/usr/bin/env python3
"""Synchronize backend library sources from the base catalog plus sources.d modules.

This thin orchestrator keeps the original synchronizer focused on one merged
catalog while allowing curriculum additions to be reviewed as small independent
JSON files under references/library/sources.d/.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import tempfile
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import sync_offline_library as core  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "references" / "library"
BASE_CATALOG = LIBRARY / "SOURCES.json"
CATALOG_DIR = LIBRARY / "sources.d"


class CatalogError(RuntimeError):
    pass


def catalog_paths() -> list[Path]:
    paths = [BASE_CATALOG]
    if CATALOG_DIR.is_dir():
        paths.extend(sorted(CATALOG_DIR.glob("*.json")))
    return paths


def load_catalog_file(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise CatalogError(f"cannot read catalog {path}: {exc}") from exc
    if data.get("schema_version") != 1 or not isinstance(data.get("sources"), list):
        raise CatalogError(f"unsupported or invalid catalog: {path}")
    return data


def load_merged_catalog() -> tuple[dict[str, Any], list[dict[str, str]]]:
    merged: dict[str, Any] = {"schema_version": 1, "policy": {}, "sources": []}
    ids: dict[str, str] = {}
    provenance: list[dict[str, str]] = []

    for index, path in enumerate(catalog_paths()):
        data = load_catalog_file(path)
        if index == 0 and isinstance(data.get("policy"), dict):
            merged["policy"] = data["policy"]
        rel = path.relative_to(LIBRARY).as_posix()
        raw = path.read_bytes()
        provenance.append({
            "path": rel,
            "git_blob_sha": core.git_blob_sha(raw),
            "sha256": hashlib.sha256(raw).hexdigest(),
        })
        for source in data["sources"]:
            if not isinstance(source, dict):
                raise CatalogError(f"{rel}: source entry must be an object")
            source_id = source.get("source_id")
            if not isinstance(source_id, str) or not source_id:
                raise CatalogError(f"{rel}: invalid source_id={source_id!r}")
            if source_id in ids:
                raise CatalogError(f"duplicate source_id {source_id!r} in {ids[source_id]} and {rel}")
            core.safe_rel(source_id)
            includes = source.get("includes")
            if not isinstance(includes, list) or not includes:
                raise CatalogError(f"{rel}: source {source_id} has no includes")
            ids[source_id] = rel
            merged["sources"].append(source)
    return merged, provenance


def canonical_bytes(catalog: dict[str, Any]) -> bytes:
    return (json.dumps(catalog, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8")


def augment_lock(catalog: dict[str, Any], provenance: list[dict[str, str]]) -> None:
    if not core.LOCK.is_file():
        return
    lock = json.loads(core.LOCK.read_text(encoding="utf-8"))
    merged = canonical_bytes(catalog)
    lock["catalog_git_sha"] = core.git_blob_sha(merged)
    lock["catalog_sha256"] = hashlib.sha256(merged).hexdigest()
    lock["catalog_files"] = provenance
    lock["catalog_source_count"] = len(catalog["sources"])
    core.LOCK.write_text(json.dumps(lock, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def with_core_catalog(catalog: dict[str, Any]):
    temp = tempfile.NamedTemporaryFile(prefix="backend-sources-", suffix=".json", delete=False)
    path = Path(temp.name)
    try:
        temp.write(canonical_bytes(catalog))
        temp.close()
        core.CATALOG = path
        return path
    except Exception:
        temp.close()
        path.unlink(missing_ok=True)
        raise


def process_existing(catalog: dict[str, Any], provenance: list[dict[str, str]]) -> None:
    temp = with_core_catalog(catalog)
    try:
        core.process_existing(catalog)
        augment_lock(catalog, provenance)
    finally:
        temp.unlink(missing_ok=True)


def synchronize(catalog: dict[str, Any], provenance: list[dict[str, str]], requested: set[str]) -> None:
    known = {source["source_id"] for source in catalog["sources"]}
    unknown = requested - known
    if unknown:
        raise CatalogError("unknown source ids: " + ", ".join(sorted(unknown)))

    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    gh = core.GitHub(token)
    core.ORIGINALS.mkdir(parents=True, exist_ok=True)
    core.PROCESSED.mkdir(parents=True, exist_ok=True)

    temp = with_core_catalog(catalog)
    try:
        count = 0
        for source in catalog["sources"]:
            if requested and source["source_id"] not in requested:
                continue
            core.sync_one(gh, source)
            count += 1
        core.rebuild_lock(catalog)
        augment_lock(catalog, provenance)
        print(f"Synchronized {count} source pack(s) from {len(provenance)} catalog file(s).")
    finally:
        temp.unlink(missing_ok=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", action="append", default=[], help="sync only this source id; may repeat")
    parser.add_argument("--process-existing", action="store_true")
    parser.add_argument("--list-source-ids", action="store_true")
    parser.add_argument("--print-catalog", action="store_true")
    args = parser.parse_args()

    catalog, provenance = load_merged_catalog()
    if args.list_source_ids:
        for source in catalog["sources"]:
            print(source["source_id"])
        return 0
    if args.print_catalog:
        print(canonical_bytes(catalog).decode("utf-8"), end="")
        return 0
    if args.process_existing:
        if args.source:
            parser.error("--process-existing cannot be combined with --source")
        process_existing(catalog, provenance)
        return 0
    synchronize(catalog, provenance, set(args.source))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (CatalogError, core.SyncError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
