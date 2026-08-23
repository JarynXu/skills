#!/usr/bin/env python3
"""Search, read, inventory, and verify the backend skill's offline teaching library."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path, PurePosixPath

SKILL_ROOT = Path(__file__).resolve().parents[1]
LIBRARY_ROOT = SKILL_ROOT / "references" / "library"
ORIGINALS_ROOT = LIBRARY_ROOT / "originals"
PROCESSED_ROOT = LIBRARY_ROOT / "processed"
DOCUMENT_SUFFIXES = {".md", ".markdown", ".txt", ".html", ".htm", ".xml", ".sgml", ".rst", ".adoc", ".pdf"}
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


def safe_target(root: Path, relative: str) -> Path:
    target = (root / relative).resolve()
    resolved_root = root.resolve()
    try:
        target.relative_to(resolved_root)
    except ValueError as exc:
        raise ValueError(f"path escapes library root: {relative}") from exc
    return target


def entry_path(item: dict[str, object]) -> str:
    value = item.get("path") or item.get("local_path")
    if not isinstance(value, str) or not value:
        raise ValueError(f"manifest entry has no path: {item!r}")
    return value


def is_text_path(path: Path) -> bool:
    return path.suffix.lower() in TEXT_SUFFIXES or path.name.lower() in TEXT_NAMES


def is_processable_document(path: str) -> bool:
    return PurePosixPath(path).suffix.lower() in DOCUMENT_SUFFIXES


def command_list(_: argparse.Namespace) -> int:
    manifests = source_manifests()
    if not manifests:
        print("No offline sources are installed.")
        return 1
    for _, data in manifests:
        files = data.get("files", []) if isinstance(data.get("files", []), list) else []
        processed = data.get("processed_files", []) if isinstance(data.get("processed_files", []), list) else []
        exact = sum(1 for item in files if isinstance(item, dict) and item.get("byte_exact") is True)
        warnings = data.get("processing_warnings", []) if isinstance(data.get("processing_warnings", []), list) else []
        print(
            f"{data.get('source_id')}\t{data.get('title')}\t"
            f"commit={data.get('source_commit')}\toriginals={len(files)}\t"
            f"byte_exact={exact}\tprocessed_md={len(processed)}\t"
            f"agent_ready={bool(data.get('agent_ready'))}\twarnings={len(warnings)}"
        )
    return 0


def iter_text_files(root: Path):
    if not root.is_dir():
        return
    for path in sorted(root.rglob("*")):
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

    root = ORIGINALS_ROOT if args.originals else PROCESSED_ROOT
    matches = 0
    manifests = source_manifests()
    for source_root, data in manifests:
        source_id = str(data.get("source_id", source_root.name))
        if args.source and source_id != args.source:
            continue
        selected_root = root / source_id
        for path in iter_text_files(selected_root) or []:
            try:
                lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
            except OSError:
                continue
            for number, line in enumerate(lines, start=1):
                if not pattern.search(line):
                    continue
                rel = path.relative_to(root)
                layer = "original" if args.originals else "processed"
                print(f"{layer}:{rel}:{number}: {line[:500]}")
                matches += 1
                if matches >= args.limit:
                    return 0
    return 0 if matches else 1


def resolve_read_target(arg_path: str, originals: bool) -> tuple[Path, str]:
    parts = Path(arg_path).parts
    if len(parts) < 2:
        raise ValueError("use <source-id>/<path> for read")
    source_id = parts[0]
    rel = str(Path(*parts[1:]))
    preferred_root = ORIGINALS_ROOT if originals else PROCESSED_ROOT
    source_root = preferred_root / source_id
    if not source_root.is_dir():
        raise ValueError(f"unknown source or layer: {source_id}")
    target = safe_target(source_root, rel)
    if target.is_file():
        return target, "original" if originals else "processed"
    if not originals:
        md_target = safe_target(source_root, rel + ".md")
        if md_target.is_file():
            return md_target, "processed"
    raise ValueError(f"file not found in {'originals' if originals else 'processed'}: {arg_path}")


def command_read(args: argparse.Namespace) -> int:
    try:
        target, layer = resolve_read_target(args.path, args.original)
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    if not is_text_path(target):
        print(f"ERROR: binary/non-text file cannot be printed: {args.path}", file=sys.stderr)
        return 2
    lines = target.read_text(encoding="utf-8", errors="replace").splitlines()
    start = max(1, args.start)
    end = args.end if args.end is not None else len(lines)
    end = min(len(lines), max(start, end))
    print(f"# layer={layer} path={target.relative_to(LIBRARY_ROOT)}")
    for number in range(start, end + 1):
        print(f"{number:>6}  {lines[number - 1]}")
    return 0


def command_verify(_: argparse.Namespace) -> int:
    failures: list[str] = []
    original_checked = 0
    processed_checked = 0
    manifests = source_manifests()
    if not manifests:
        print("ERROR: no source manifests found", file=sys.stderr)
        return 1

    for source_root, data in manifests:
        source_id = str(data.get("source_id", source_root.name))
        originals_by_path: dict[str, dict[str, object]] = {}
        files = data.get("files", [])
        if not isinstance(files, list):
            failures.append(f"{source_id}: files must be a list")
            continue

        for item in files:
            if not isinstance(item, dict):
                continue
            try:
                relative = entry_path(item)
                target = safe_target(source_root, relative)
            except ValueError as exc:
                failures.append(f"{source_id}: invalid original manifest entry: {exc}")
                continue
            originals_by_path[relative] = item
            if not target.is_file():
                failures.append(f"{source_id}/{relative}: original missing")
                continue
            actual = git_blob_sha(target.read_bytes())
            expected = str(item.get("local_git_sha") or item.get("upstream_git_sha") or "")
            original_checked += 1
            if not expected:
                failures.append(f"{source_id}/{relative}: original manifest has no expected Git blob sha")
            elif actual != expected:
                failures.append(f"{source_id}/{relative}: original sha {actual} != expected {expected}")
            if item.get("byte_exact") is True:
                upstream = str(item.get("upstream_git_sha") or "")
                if not upstream or actual != upstream:
                    failures.append(f"{source_id}/{relative}: byte-exact original does not match upstream Git blob")

        processed_entries = data.get("processed_files", [])
        if not isinstance(processed_entries, list):
            failures.append(f"{source_id}: processed_files must be a list")
            processed_entries = []
        processed_from: set[str] = set()
        processed_root = PROCESSED_ROOT / source_id
        for item in processed_entries:
            if not isinstance(item, dict):
                continue
            try:
                relative = entry_path(item)
                target = safe_target(processed_root, relative)
            except ValueError as exc:
                failures.append(f"{source_id}: invalid processed manifest entry: {exc}")
                continue
            derived_from = item.get("derived_from")
            if not isinstance(derived_from, str) or derived_from not in originals_by_path:
                failures.append(f"{source_id}/{relative}: processed file has invalid derived_from={derived_from!r}")
                continue
            processed_from.add(derived_from)
            if not target.is_file():
                failures.append(f"{source_id}/{relative}: processed Markdown missing")
                continue
            actual = git_blob_sha(target.read_bytes())
            expected = str(item.get("local_git_sha") or "")
            processed_checked += 1
            if not expected or actual != expected:
                failures.append(f"{source_id}/{relative}: processed sha mismatch")
            original_sha = str(originals_by_path[derived_from].get("upstream_git_sha") or "")
            source_sha = str(item.get("source_git_sha") or "")
            if original_sha and source_sha != original_sha:
                failures.append(f"{source_id}/{relative}: processed provenance no longer matches original blob")
            if target.suffix.lower() != ".md":
                failures.append(f"{source_id}/{relative}: processed teaching file must be Markdown")

        required = {path for path in originals_by_path if is_processable_document(path)}
        missing_processed = sorted(required - processed_from)
        if missing_processed:
            preview = ", ".join(missing_processed[:10])
            failures.append(f"{source_id}: {len(missing_processed)} processable document(s) lack Markdown derivatives: {preview}")
        if required and data.get("agent_ready") is not True:
            failures.append(f"{source_id}: processable documents exist but agent_ready is not true")

    if failures:
        for failure in failures:
            print(f"ERROR: {failure}", file=sys.stderr)
        return 1
    print(
        f"Verified {original_checked} byte-tracked original(s) and {processed_checked} agent-ready Markdown file(s) across {len(manifests)} source(s)."
    )
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    p_list = sub.add_parser("list", help="list installed offline source packages")
    p_list.set_defaults(func=command_list)

    p_search = sub.add_parser("search", help="search agent-ready Markdown by default")
    p_search.add_argument("query")
    p_search.add_argument("--source")
    p_search.add_argument("--limit", type=int, default=50)
    p_search.add_argument("--regex", action="store_true")
    p_search.add_argument("--case-sensitive", action="store_true")
    p_search.add_argument("--originals", action="store_true", help="search byte-exact originals instead of processed Markdown")
    p_search.set_defaults(func=command_search)

    p_read = sub.add_parser("read", help="read processed Markdown by default")
    p_read.add_argument("path")
    p_read.add_argument("--start", type=int, default=1)
    p_read.add_argument("--end", type=int)
    p_read.add_argument("--original", action="store_true", help="read from originals instead of processed Markdown")
    p_read.set_defaults(func=command_read)

    p_verify = sub.add_parser("verify", help="verify original bytes, processed Markdown, provenance, and processing coverage")
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
