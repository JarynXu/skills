#!/usr/bin/env python3
"""Apply source-specific teaching curation to already synchronized source packs."""
from __future__ import annotations

import argparse
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "references" / "library"
ORIGINALS = LIBRARY / "originals"
PROCESSED = LIBRARY / "processed"
RULES_PATH = LIBRARY / "CURATION.json"


def load_rules() -> dict[str, dict[str, object]]:
    data = json.loads(RULES_PATH.read_text(encoding="utf-8"))
    if data.get("schema_version") != 1 or not isinstance(data.get("rules"), dict):
        raise SystemExit("invalid CURATION.json")
    return data["rules"]


def remove_empty_dirs(root: Path) -> None:
    if not root.is_dir():
        return
    for path in sorted((p for p in root.rglob("*") if p.is_dir()), key=lambda p: len(p.parts), reverse=True):
        try:
            path.rmdir()
        except OSError:
            pass


def prune_source(source_id: str, rule: dict[str, object]) -> tuple[int, int]:
    source_root = ORIGINALS / source_id
    manifest_path = source_root / "SOURCE.json"
    if not manifest_path.is_file():
        return 0, 0
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    patterns = [re.compile(str(value)) for value in rule.get("keep_regex", [])]
    if not patterns:
        return 0, 0

    def keep(path: str) -> bool:
        return any(pattern.search(path) for pattern in patterns)

    files = manifest.get("files", [])
    if not isinstance(files, list):
        raise SystemExit(f"{source_id}: invalid files manifest")

    kept_files: list[dict[str, object]] = []
    removed_originals = 0
    removed_paths: set[str] = set()
    for item in files:
        if not isinstance(item, dict):
            continue
        rel = item.get("local_path") or item.get("upstream_path")
        if not isinstance(rel, str):
            continue
        if keep(rel):
            kept_files.append(item)
            continue
        target = source_root / rel
        if target.is_file():
            target.unlink()
        removed_paths.add(rel)
        removed_originals += 1

    processed_entries = manifest.get("processed_files", [])
    kept_processed: list[dict[str, object]] = []
    removed_processed = 0
    processed_root = PROCESSED / source_id
    if isinstance(processed_entries, list):
        for item in processed_entries:
            if not isinstance(item, dict):
                continue
            derived_from = item.get("derived_from")
            local_path = item.get("local_path")
            if isinstance(derived_from, str) and derived_from in removed_paths:
                if isinstance(local_path, str):
                    target = processed_root / local_path
                    if target.is_file():
                        target.unlink()
                removed_processed += 1
                continue
            kept_processed.append(item)

    manifest["files"] = kept_files
    manifest["file_count"] = len(kept_files)
    manifest["total_original_bytes"] = sum(int(item.get("bytes", 0)) for item in kept_files)
    if isinstance(processed_entries, list):
        manifest["processed_files"] = kept_processed
        manifest["processed_count"] = len(kept_processed)
        manifest["processed_bytes"] = sum(int(item.get("bytes", 0)) for item in kept_processed)
    manifest["curation"] = {
        "rule_file": "CURATION.json",
        "reason": rule.get("reason"),
        "removed_originals": removed_originals,
        "removed_processed": removed_processed,
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    remove_empty_dirs(source_root)
    remove_empty_dirs(processed_root)
    return removed_originals, removed_processed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", action="append", default=[])
    args = parser.parse_args()
    rules = load_rules()
    requested = set(args.source)
    unknown = requested - set(rules)
    if unknown:
        parser.error("unknown curated source(s): " + ", ".join(sorted(unknown)))

    total_originals = 0
    total_processed = 0
    for source_id, rule in rules.items():
        if requested and source_id not in requested:
            continue
        removed_originals, removed_processed = prune_source(source_id, rule)
        total_originals += removed_originals
        total_processed += removed_processed
        if removed_originals or removed_processed:
            print(f"{source_id}: removed {removed_originals} original(s), {removed_processed} processed file(s)")
    print(f"Curated library: removed {total_originals} original(s), {total_processed} processed file(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
