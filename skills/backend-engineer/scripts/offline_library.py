#!/usr/bin/env python3
"""Search, read, inventory, and verify the backend skill's vendored offline library."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]
LIBRARY_ROOT = SKILL_ROOT / "references" / "library"
ORIGINALS_ROOT = LIBRARY_ROOT / "originals"
TEXT_SUFFIXES = {
    ".md", ".markdown", ".txt", ".html", ".htm", ".xml", ".sgml", ".rst", ".adoc",
    ".json", ".yaml", ".yml", ".toml", ".ini", ".cfg", ".conf", ".properties",
    ".css", ".js", ".ts", ".py", ".java", ".kt", ".kts", ".go", ".rs", ".cs",
    ".c", ".cc", ".cpp", ".h", ".hpp", ".proto", ".sql", ".sh", ".bash", ".zsh",
}
TEXT_NAMES = {"license", "notice", "copying", "copyright", "readme", "changelog"}


def source_manifests() -> list[tuple[Path, dict[str, object]]]:
    found: list[tuple[Path, dict[str, object]]] = []
    if not ORIGINALS_ROOT.is_dir():
        return found
    for path in sorted(ORIGINALS_ROOT.glob("*/SOURCE.json")):
        with path.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
        found.append((path.parent, data))
    return found


def git_blob_sha(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


def safe_target(source_root: Path, relative: str) -> Path:
    target = (source_root / relative).resolve()
    root = source_root.resolve()
    try:
        target.relative_to(root)
    except ValueError as exc:
        raise ValueError(f"path escapes source root: {relative}") from exc
    return target


def manifest_entries(data: dict[str, object]):
    for key in ("files", "derived_files"):
        values = data.get(key, [])
        if not isinstance(values, list):
            continue
        for item in values:
            if isinstance(item, dict):
                yield item


def entry_path(item: dict[str, object]) -> str:
    value = item.get("path") or item.get("local_path")
    if not isinstance(value, str) or not value:
        raise ValueError(f"manifest entry has no path: {item!r}")
    return value


def command_list(_: argparse.Namespace) -> int:
    manifests = source_manifests()
    if not manifests:
        print("No offline sources are installed.")
        return 1
    for _, data in manifests:
        files = data.get("files", []) if isinstance(data.get("files", []), list) else []
        derived = data.get("derived_files", []) if isinstance(data.get("derived_files", []), list) else []
        missing = data.get("missing_binary_originals", []) if isinstance(data.get("missing_binary_originals", []), list) else []
        exact = sum(1 for item in files if isinstance(item, dict) and item.get("byte_exact") is True)
        print(
            f"{data.get('source_id')}\t{data.get('title')}\t"
            f"commit={data.get('source_commit')}\tfiles={len(files)}\t"
            f"byte_exact={exact}\tderived={len(derived)}\tmissing_binary={len(missing)}"
        )
    return 0


def is_text_path(path: Path) -> bool:
    return path.suffix.lower() in TEXT_SUFFIXES or path.name.lower() in TEXT_NAMES


def iter_text_files(source_root: Path):
    for path in sorted(source_root.rglob("*")):
        if not path.is_file() or path.name == "SOURCE.json":
            continue
        if not is_text_path(path):
            continue
        yield path


def command_search(args: argparse.Namespace) -> int:
    query = args.query
    flags = 0 if args.case_sensitive else re.IGNORECASE
    try:
        pattern = re.compile(query if args.regex else re.escape(query), flags)
    except re.error as exc:
        print(f"ERROR: invalid regular expression: {exc}", file=sys.stderr)
        return 2

    matches = 0
    manifests = source_manifests()
    for source_root, data in manifests:
        source_id = str(data.get("source_id", source_root.name))
        if args.source and source_id != args.source:
            continue
        for path in iter_text_files(source_root):
            try:
                lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
            except OSError:
                continue
            for number, line in enumerate(lines, start=1):
                if not pattern.search(line):
                    continue
                rel = path.relative_to(ORIGINALS_ROOT)
                print(f"{rel}:{number}: {line[:500]}")
                matches += 1
                if matches >= args.limit:
                    return 0
    return 0 if matches else 1


def command_read(args: argparse.Namespace) -> int:
    parts = Path(args.path).parts
    if len(parts) < 2:
        print("ERROR: use <source-id>/<path> for read", file=sys.stderr)
        return 2
    source_root = ORIGINALS_ROOT / parts[0]
    if not source_root.is_dir():
        print(f"ERROR: unknown source: {parts[0]}", file=sys.stderr)
        return 2
    try:
        target = safe_target(source_root, str(Path(*parts[1:])))
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    if not target.is_file():
        print(f"ERROR: file not found: {args.path}", file=sys.stderr)
        return 2
    if not is_text_path(target):
        print(f"ERROR: binary/non-text original cannot be printed: {args.path}", file=sys.stderr)
        return 2
    text = target.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()
    start = max(1, args.start)
    end = args.end if args.end is not None else len(lines)
    end = min(len(lines), max(start, end))
    for number in range(start, end + 1):
        print(f"{number:>6}  {lines[number - 1]}")
    return 0


def command_verify(_: argparse.Namespace) -> int:
    failures: list[str] = []
    checked = 0
    manifests = source_manifests()
    if not manifests:
        print("ERROR: no source manifests found", file=sys.stderr)
        return 1

    for source_root, data in manifests:
        source_id = str(data.get("source_id", source_root.name))
        for item in manifest_entries(data):
            try:
                relative = entry_path(item)
                target = safe_target(source_root, relative)
            except (ValueError, KeyError) as exc:
                failures.append(f"{source_id}: invalid manifest entry: {exc}")
                continue
            if not target.is_file():
                failures.append(f"{source_id}/{relative}: missing")
                continue
            actual = git_blob_sha(target.read_bytes())
            expected = str(item.get("local_git_sha") or item.get("upstream_git_sha") or "")
            checked += 1
            if not expected:
                failures.append(f"{source_id}/{relative}: manifest has no expected Git blob sha")
            elif actual != expected:
                failures.append(f"{source_id}/{relative}: local sha {actual} != expected {expected}")
            if item.get("byte_exact") is True:
                upstream = str(item.get("upstream_git_sha") or "")
                if not upstream:
                    failures.append(f"{source_id}/{relative}: byte-exact entry has no upstream sha")
                elif actual != upstream:
                    failures.append(
                        f"{source_id}/{relative}: expected byte-exact upstream sha {upstream}, got {actual}"
                    )

    if failures:
        for failure in failures:
            print(f"ERROR: {failure}", file=sys.stderr)
        return 1
    print(f"Verified {checked} vendored/derived file(s) across {len(manifests)} source(s).")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    p_list = sub.add_parser("list", help="list installed offline source packages")
    p_list.set_defaults(func=command_list)

    p_search = sub.add_parser("search", help="search text originals without network access")
    p_search.add_argument("query")
    p_search.add_argument("--source")
    p_search.add_argument("--limit", type=int, default=50)
    p_search.add_argument("--regex", action="store_true")
    p_search.add_argument("--case-sensitive", action="store_true")
    p_search.set_defaults(func=command_search)

    p_read = sub.add_parser("read", help="read a local source file by source-id/path")
    p_read.add_argument("path")
    p_read.add_argument("--start", type=int, default=1)
    p_read.add_argument("--end", type=int)
    p_read.set_defaults(func=command_read)

    p_verify = sub.add_parser("verify", help="verify local Git blob SHA values from SOURCE.json")
    p_verify.set_defaults(func=command_verify)
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
