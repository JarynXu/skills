#!/usr/bin/env python3
"""Search, read, inventory, and verify this skill's vendored offline library."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]
ORIGINALS_ROOT = SKILL_ROOT / "references" / "library" / "originals"
TEXT_SUFFIXES = {".md", ".txt", ".html", ".htm", ".xml", ".json", ".yaml", ".yml", ".rst", ".adoc"}


def manifests():
    if not ORIGINALS_ROOT.is_dir():
        return []
    result = []
    for path in sorted(ORIGINALS_ROOT.glob("*/SOURCE.json")):
        with path.open("r", encoding="utf-8") as handle:
            result.append((path.parent, json.load(handle)))
    return result


def git_blob_sha(data: bytes) -> str:
    return hashlib.sha1(f"blob {len(data)}\0".encode("ascii") + data).hexdigest()


def safe_target(root: Path, relative: str) -> Path:
    target = (root / relative).resolve()
    try:
        target.relative_to(root.resolve())
    except ValueError as exc:
        raise ValueError(f"path escapes source root: {relative}") from exc
    return target


def list_sources(_):
    items = manifests()
    if not items:
        print("No offline sources are installed.")
        return 1
    for _, data in items:
        files = data.get("files", [])
        exact = sum(1 for item in files if item.get("byte_exact") is True)
        print(f"{data.get('source_id')}\t{data.get('title')}\tcommit={data.get('source_commit')}\tfiles={len(files)}\tbyte_exact={exact}")
    return 0


def text_files(root: Path):
    for path in sorted(root.rglob("*")):
        if path.is_file() and path.name != "SOURCE.json" and path.suffix.lower() in TEXT_SUFFIXES:
            yield path


def search(args):
    flags = 0 if args.case_sensitive else re.IGNORECASE
    try:
        pattern = re.compile(args.query if args.regex else re.escape(args.query), flags)
    except re.error as exc:
        print(f"ERROR: invalid regular expression: {exc}", file=sys.stderr)
        return 2
    count = 0
    for root, data in manifests():
        source_id = str(data.get("source_id", root.name))
        if args.source and args.source != source_id:
            continue
        for path in text_files(root):
            for number, line in enumerate(path.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
                if pattern.search(line):
                    print(f"{path.relative_to(ORIGINALS_ROOT)}:{number}: {line[:500]}")
                    count += 1
                    if count >= args.limit:
                        return 0
    return 0 if count else 1


def read(args):
    parts = Path(args.path).parts
    if len(parts) < 2:
        print("ERROR: use <source-id>/<path>", file=sys.stderr)
        return 2
    root = ORIGINALS_ROOT / parts[0]
    if not root.is_dir():
        print(f"ERROR: unknown source: {parts[0]}", file=sys.stderr)
        return 2
    try:
        target = safe_target(root, str(Path(*parts[1:])))
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    if not target.is_file() or target.suffix.lower() not in TEXT_SUFFIXES:
        print(f"ERROR: readable text file not found: {args.path}", file=sys.stderr)
        return 2
    lines = target.read_text(encoding="utf-8", errors="replace").splitlines()
    start = max(1, args.start)
    end = min(len(lines), args.end if args.end is not None else len(lines))
    for number in range(start, end + 1):
        print(f"{number:>6}  {lines[number - 1]}")
    return 0


def verify(_):
    failures = []
    checked = 0
    items = manifests()
    if not items:
        print("ERROR: no source manifests found", file=sys.stderr)
        return 1
    for root, data in items:
        source_id = str(data.get("source_id", root.name))
        for item in data.get("files", []):
            relative = str(item["path"])
            target = safe_target(root, relative)
            if not target.is_file():
                failures.append(f"{source_id}/{relative}: missing")
                continue
            actual = git_blob_sha(target.read_bytes())
            expected = str(item.get("local_git_sha") or item.get("upstream_git_sha") or "")
            checked += 1
            if actual != expected:
                failures.append(f"{source_id}/{relative}: local sha {actual} != expected {expected}")
            if item.get("byte_exact") is True and actual != str(item.get("upstream_git_sha") or ""):
                failures.append(f"{source_id}/{relative}: byte-exact upstream mismatch")
    if failures:
        for failure in failures:
            print(f"ERROR: {failure}", file=sys.stderr)
        return 1
    print(f"Verified {checked} vendored file(s) across {len(items)} source(s).")
    return 0


def parser():
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest="command", required=True)
    q = sub.add_parser("list"); q.set_defaults(func=list_sources)
    q = sub.add_parser("search"); q.add_argument("query"); q.add_argument("--source"); q.add_argument("--limit", type=int, default=50); q.add_argument("--regex", action="store_true"); q.add_argument("--case-sensitive", action="store_true"); q.set_defaults(func=search)
    q = sub.add_parser("read"); q.add_argument("path"); q.add_argument("--start", type=int, default=1); q.add_argument("--end", type=int); q.set_defaults(func=read)
    q = sub.add_parser("verify"); q.set_defaults(func=verify)
    return p


def main():
    p = parser(); args = p.parse_args()
    if getattr(args, "limit", 1) < 1: p.error("--limit must be >= 1")
    if getattr(args, "start", 1) < 1: p.error("--start must be >= 1")
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
