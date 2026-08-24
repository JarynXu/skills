#!/usr/bin/env python3
"""Search, read, inventory, and verify the project-manager offline teaching library."""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import offline_library_core as core  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "references" / "library"
ORIGINALS = LIBRARY / "originals"
PROCESSED = LIBRARY / "processed"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def verify(_: argparse.Namespace) -> int:
    failures: list[str] = []
    original_checked = 0
    processed_checked = 0
    manifests = core.source_manifests()
    if not manifests:
        print("ERROR: no source manifests found", file=sys.stderr)
        return 1

    for source_root, data in manifests:
        source_id = str(data.get("source_id", source_root.name))
        kind = str(data.get("source_kind") or "github")
        originals_by_path: dict[str, dict[str, object]] = {}
        files = data.get("files", [])
        if not isinstance(files, list):
            failures.append(f"{source_id}: files must be a list")
            continue
        for item in files:
            if not isinstance(item, dict):
                continue
            try:
                relative = core.entry_path(item)
                target = core.safe_target(source_root, relative)
            except ValueError as exc:
                failures.append(f"{source_id}: invalid original manifest entry: {exc}")
                continue
            originals_by_path[relative] = item
            if not target.is_file():
                failures.append(f"{source_id}/{relative}: original missing")
                continue
            raw = target.read_bytes()
            actual_git = core.git_blob_sha(raw)
            expected_git = str(item.get("local_git_sha") or "")
            original_checked += 1
            if not expected_git or actual_git != expected_git:
                failures.append(f"{source_id}/{relative}: local Git blob sha mismatch")
            if item.get("byte_exact") is True:
                if kind == "url":
                    expected_sha256 = str(item.get("sha256") or "")
                    actual_sha256 = sha256(raw)
                    if not expected_sha256 or actual_sha256 != expected_sha256:
                        failures.append(f"{source_id}/{relative}: byte-exact URL original sha256 mismatch")
                    url = str(item.get("source_url") or "")
                    if not url.startswith("https://"):
                        failures.append(f"{source_id}/{relative}: URL original has no HTTPS source URL")
                else:
                    upstream = str(item.get("upstream_git_sha") or "")
                    if not upstream or actual_git != upstream:
                        failures.append(f"{source_id}/{relative}: byte-exact GitHub original does not match upstream blob")

        processed_entries = data.get("processed_files", [])
        if not isinstance(processed_entries, list):
            failures.append(f"{source_id}: processed_files must be a list")
            processed_entries = []
        processed_from: set[str] = set()
        processed_root = PROCESSED / source_id
        for item in processed_entries:
            if not isinstance(item, dict):
                continue
            try:
                relative = core.entry_path(item)
                target = core.safe_target(processed_root, relative)
            except ValueError as exc:
                failures.append(f"{source_id}: invalid processed manifest entry: {exc}")
                continue
            derived = item.get("derived_from")
            if not isinstance(derived, str) or derived not in originals_by_path:
                failures.append(f"{source_id}/{relative}: invalid derived_from={derived!r}")
                continue
            processed_from.add(derived)
            if not target.is_file():
                failures.append(f"{source_id}/{relative}: processed Markdown missing")
                continue
            raw = target.read_bytes()
            actual = core.git_blob_sha(raw)
            expected = str(item.get("local_git_sha") or "")
            processed_checked += 1
            if not expected or actual != expected:
                failures.append(f"{source_id}/{relative}: processed sha mismatch")
            original = originals_by_path[derived]
            if kind == "url":
                expected_source = str(original.get("sha256") or "")
                if str(item.get("source_sha256") or "") != expected_source:
                    failures.append(f"{source_id}/{relative}: processed URL provenance sha256 mismatch")
            else:
                expected_source = str(original.get("upstream_git_sha") or "")
                if expected_source and str(item.get("source_git_sha") or "") != expected_source:
                    failures.append(f"{source_id}/{relative}: processed Git provenance mismatch")
            if target.suffix.lower() != ".md":
                failures.append(f"{source_id}/{relative}: processed teaching file must be Markdown")

        required = {path for path in originals_by_path if core.is_processable_document(path)}
        missing = sorted(required - processed_from)
        if missing:
            failures.append(
                f"{source_id}: {len(missing)} processable original(s) lack Markdown derivatives: "
                + ", ".join(missing[:8])
            )
        if required and data.get("agent_ready") is not True:
            failures.append(f"{source_id}: processable documents exist but agent_ready is not true")

    if failures:
        for failure in failures:
            print(f"ERROR: {failure}", file=sys.stderr)
        return 1
    print(
        f"Verified {original_checked} exact/tracked original(s) and {processed_checked} agent-ready Markdown file(s) across {len(manifests)} source(s)."
    )
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    p_list = sub.add_parser("list", help="list installed source packs")
    p_list.set_defaults(func=core.command_list)
    p_search = sub.add_parser("search", help="search processed Markdown by default")
    p_search.add_argument("query")
    p_search.add_argument("--source")
    p_search.add_argument("--limit", type=int, default=50)
    p_search.add_argument("--regex", action="store_true")
    p_search.add_argument("--case-sensitive", action="store_true")
    p_search.add_argument("--originals", action="store_true")
    p_search.set_defaults(func=core.command_search)
    p_read = sub.add_parser("read", help="read processed Markdown by default")
    p_read.add_argument("path")
    p_read.add_argument("--start", type=int, default=1)
    p_read.add_argument("--end", type=int)
    p_read.add_argument("--original", action="store_true")
    p_read.set_defaults(func=core.command_read)
    p_verify = sub.add_parser("verify", help="verify exact originals, derivatives, provenance and processing coverage")
    p_verify.set_defaults(func=verify)
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    if getattr(args, "limit", 1) < 1:
        parser.error("--limit must be >= 1")
    if getattr(args, "start", 1) < 1:
        parser.error("--start must be >= 1")
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
