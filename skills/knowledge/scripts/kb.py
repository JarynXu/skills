#!/usr/bin/env python3
"""Optional read-only tools for OKF bundles. No project policy or Git state is assumed."""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import re
import sys

sys.dont_write_bytecode = True


def main() -> int:
    parser = argparse.ArgumentParser(description="Read-only OKF helpers; project policies remain in project instructions.")
    commands = parser.add_subparsers(dest="command", required=True)
    for name in ("check", "impact", "source"):
        item = commands.add_parser(name)
        item.add_argument("--bundle", required=True, help="Knowledge directory; any name or location")
        item.add_argument("--workspace", help="Allowed source-reading boundary; defaults to the bundle")
        if name == "check":
            item.add_argument("--file", action="append", help="Bundle-relative Markdown file; repeat to select a scope")
            item.add_argument("--sources", action="store_true", help="Also hash existing source records in selected documents")
            item.add_argument("--require-index", action="store_true", help="Check directory navigation; not an OKF requirement")
        elif name == "impact":
            item.add_argument("--source", action="append", required=True, help="Workspace-relative changed file or directory")
        else:
            item.add_argument("--document", required=True, help="Bundle-relative destination concept")
            item.add_argument("--file", required=True, help="Workspace-relative source file")
            item.add_argument("--id", required=True)
            item.add_argument("--hash", action="store_true", help="Include sha256 only when the project uses fingerprints")
    args = parser.parse_args()
    def emit(value: dict) -> None:
        print(json.dumps(value, ensure_ascii=False, indent=2))
    try:
        import yaml
        from kbcheck import audit
        from kbimpact import impact
        from kbmodel import InputError, checked_path, digest, locations
    except ImportError:
        emit({"ok": False, "code": "missing_dependencies", "message": "Use Python >=3.10 with scripts/requirements.txt in an authorized environment; no installation was attempted"})
        return 2
    try:
        bundle, workspace = locations(args.bundle, args.workspace)
        if args.command == "check":
            report, _ = audit(bundle, workspace, files=args.file, check_sources=args.sources, require_index=args.require_index)
            report.pop("links"); report.pop("source_users")
            emit(report)
        elif args.command == "impact":
            report, _ = audit(bundle, workspace)
            paths = [checked_path(workspace, s.rstrip("/"), workspace).relative_to(workspace).as_posix() for s in args.source]
            candidates = impact(report["source_users"], report["links"], paths, bundle.relative_to(workspace).as_posix())
            report = {
                "ok": report["ok"], **candidates, "issues": report["issues"],
                "coverage": report["coverage"],
                "limits": "direct/derived follow declared sources; link_references are navigation only. Investigate implicit dependencies separately. Missing sources or links remain errors, but discovered candidates are still returned.",
            }
            emit(report)
        else:
            if not re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9._-]*", args.id):
                raise InputError("Use a simple stable source ID")
            doc = checked_path(bundle, args.document, bundle)
            if doc.suffix != ".md" or doc.name in {"index.md", "log.md"}:
                raise InputError("Supply a non-reserved Markdown concept")
            source = checked_path(workspace, args.file, workspace)
            if not source.is_file():
                raise InputError("Source file does not exist")
            record = {"id": args.id, "resource": Path(os.path.relpath(source, doc.parent)).as_posix()}
            if args.hash:
                record["sha256"] = digest(source)
            print(yaml.safe_dump([record], allow_unicode=True, sort_keys=False), end="")
            return 0
        if any(i["category"] == "environment" and i["severity"] == "error" for i in report["issues"]):
            return 2
        return 0 if report["ok"] else 1
    except (InputError, OSError, ValueError, RecursionError) as exc:
        emit({"ok": False, "code": "operation_not_completed", "message": str(exc) if isinstance(exc, InputError) else "Input could not be processed completely; inspect the selected paths"})
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
