"""Read-only OKF checks. Project conventions are supplied by the project, not this module."""
from __future__ import annotations

import re
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

from kbmodel import Document, InputError, Issue, aware_datetime, checked_path, digest, load_documents, locations, resolve_resource


def audit(bundle: Path, workspace: Path | None = None, *, files: list[str] | None = None,
          check_sources: bool = False, require_index: bool = False) -> tuple[dict[str, Any], dict[str, Document]]:
    bundle, workspace = locations(bundle, workspace)
    selected = None if files is None else set(files)
    if selected is not None and not selected:
        raise InputError("Select at least one document, or omit --file for a full check")
    if selected is not None and require_index:
        for name in list(selected):
            parent = checked_path(bundle, name, bundle).parent
            while parent.is_relative_to(bundle):
                selected.add((parent / "index.md").relative_to(bundle).as_posix())
                if parent == bundle:
                    break
                parent = parent.parent
    docs, issues = load_documents(bundle, None if selected is None else sorted(selected))
    links: dict[str, set[str]] = {name: set() for name in docs}
    users: dict[str, set[str]] = {}
    hashes: dict[Path, str] = {}
    external, scopes = 0, 0

    def add(category: str, code: str, doc: Document | str, message: str, severity: str = "error", line: int | None = None) -> None:
        issues.append(Issue(category, code, doc.name if isinstance(doc, Document) else doc, message, severity, line))

    for doc in docs.values():
        meta = doc.metadata or {}
        if doc.path.name == "index.md":
            if doc.metadata is not None and (doc.name != "index.md" or set(meta) - {"okf_version"}):
                add("format", "index_frontmatter", doc, "Only root index.md may declare okf_version")
            if "okf_version" in meta and str(meta["okf_version"]) != "0.2":
                add("coverage", "unrecognized_version", doc, "This checker covers OKF 0.2; inspect other versions separately", "warning")
        elif doc.path.name == "log.md":
            dates = [text for level, text, _ in doc.headings if level == 2]
            for text in dates:
                try:
                    if date.fromisoformat(text).isoformat() != text:
                        raise ValueError()
                except ValueError:
                    add("format", "log_date", doc, "Date headings use YYYY-MM-DD")
            if dates != sorted(dates, reverse=True):
                add("format", "log_order", doc, "Place newer date groups first")
        elif not isinstance(meta.get("type"), str) or not meta["type"].strip():
            add("format", "missing_type", doc, "A concept requires a non-empty string type")
        generated = meta.get("generated")
        if "generated" in meta:
            if not isinstance(generated, dict) or not isinstance(generated.get("by"), str) or not generated["by"].strip():
                add("format", "generated_actor", doc, "A supplied generated block requires by")
            elif "at" in generated and aware_datetime(generated["at"]) is None:
                add("format", "generated_time", doc, "Use a datetime with an explicit UTC offset")
        verified = meta.get("verified", [])
        verified = [verified] if isinstance(verified, dict) else verified
        if not isinstance(verified, list):
            add("format", "verified_shape", doc, "verified must be a mapping or list of mappings")
            verified = []
        verified_times = []
        for event in verified:
            if not isinstance(event, dict) or not isinstance(event.get("by"), str) or not event["by"].strip() or aware_datetime(event.get("at")) is None:
                add("format", "verified_event", doc, "A verification event requires by and offset-aware at")
            else:
                verified_times.append(aware_datetime(event["at"]))
        produced = aware_datetime(generated.get("at")) if isinstance(generated, dict) else None
        if produced and verified_times and max(verified_times) < produced:
            add("review", "verification_predates_edit", doc, "Recorded verification predates current content", "warning")
        if "stale_after" in meta:
            stale = aware_datetime(meta["stale_after"])
            if stale is None:
                add("format", "stale_after_time", doc, "stale_after is an offset-aware datetime")
            elif stale <= datetime.now(timezone.utc):
                add("review", "past_stale_after", doc, "Reassess the concept against relevant evidence", "warning")
        if "status" in meta and not isinstance(meta["status"], str):
            add("format", "status_type", doc, "status must be a string")
        entries = meta.get("sources", [])
        if not isinstance(entries, list):
            add("format", "sources_shape", doc, "sources must be a list")
            entries = []
        ids: set[str] = set()
        for src in entries:
            if not isinstance(src, dict) or not isinstance(src.get("resource"), str) or not src["resource"].strip():
                add("format", "source_resource", doc, "Each source requires resource")
                continue
            sid = src.get("id")
            if sid is not None:
                if not isinstance(sid, str) or not sid:
                    add("format", "source_id", doc, "Source id must be a non-empty string")
                elif sid in ids:
                    add("consistency", "duplicate_source_id", doc, "Use unambiguous source IDs")
                else:
                    ids.add(sid)
            if "last_modified" in src and aware_datetime(src["last_modified"]) is None:
                add("format", "source_time", doc, "Use offset-aware source timestamps")
            value = src.get("sha256")
            if "sha256" in src and (not isinstance(value, str) or not re.fullmatch(r"[a-fA-F0-9]{64}", value)):
                add("consistency", "invalid_sha256", doc, "sha256 extension must contain 64 hexadecimal digits")
                continue
            resource = src["resource"]
            scope = src.get("kind") == "scope" or (" " in resource and not any(c in resource for c in ("/", ".", "#")))
            try:
                kind, target, _ = resolve_resource(doc, resource, bundle, workspace, scope=scope)
                if kind == "external":
                    external += 1
                elif kind == "scope":
                    scopes += 1
                elif target is not None:
                    key = target.relative_to(workspace).as_posix()
                    users.setdefault(key, set()).add(doc.name)
                    if not target.exists():
                        add("source", "missing_source", doc, "Local source is missing: " + key)
                    elif check_sources and value is not None:
                        if target not in hashes:
                            hashes[target] = digest(target)
                        if hashes[target] != value.lower():
                            add("source", "source_changed", doc, "Source changed: " + key + "; inspect claims, do not just refresh its hash")
            except (InputError, OSError, ValueError):
                add("security", "unsafe_source", doc, "Source is inaccessible or outside the allowed workspace; sensitive URI values are not echoed")
        if doc.references - doc.definitions:
            add("consistency", "undefined_footnote", doc, "A cited footnote has no definition")
        if doc.definitions - doc.references:
            add("consistency", "unused_footnote", doc, "Remove or use unreferenced footnotes", "warning")
        if meta.get("type") == "Attested Computation":
            add("coverage", "attestation_not_checked", doc, "No attestation or referenced program is executed", "warning")
        for uri, line in doc.links:
            try:
                kind, target, _ = resolve_resource(doc, uri, bundle, workspace)
                if kind != "local" or target is None:
                    continue
                if target.is_dir() and target.is_relative_to(bundle):
                    target = checked_path(target, "index.md", workspace)
                if target.is_relative_to(bundle) and target.suffix == ".md":
                    links[doc.name].add(target.relative_to(bundle).as_posix())
                if not target.exists():
                    add("consistency", "broken_link", doc, "A local link target is missing", line=line)
            except (InputError, OSError, ValueError):
                add("security", "unsafe_link", doc, "Link leaves the allowed workspace or uses an unsafe location", line=line)
    if require_index:
        if "index.md" not in docs:
            add("navigation", "missing_root_index", "index.md", "Requested index check requires a root index")
        for doc in docs.values():
            if doc.name == "index.md":
                continue
            parent = doc.path.parent.parent if doc.path.name == "index.md" else doc.path.parent
            index = (parent / "index.md").relative_to(bundle).as_posix()
            if doc.name not in links.get(index, set()):
                add("navigation", "not_in_parent_index", doc, "List this item from its owning directory index")
        if files is None:
            reached, pending = set(), ["index.md"]
            while pending:
                name = pending.pop()
                if name not in reached:
                    reached.add(name)
                    pending.extend(links.get(name, set()) - reached)
            for name in sorted(set(docs) - reached):
                add("navigation", "unreachable", name, "No path from the root index")
    errors = sum(i.severity == "error" for i in issues)
    return {
        "ok": errors == 0,
        "counts": {"documents": len(docs), "errors": errors, "warnings": len(issues) - errors, "source_files_hashed": len(hashes)},
        "issues": [i.record() for i in issues],
        "source_users": {k: sorted(v) for k, v in sorted(users.items())},
        "links": {k: sorted(v) for k, v in sorted(links.items())},
        "coverage": {"scope": "full_bundle" if files is None else "selected_documents", "source_hashes_checked": check_sources,
                     "external_sources_not_fetched": external, "scope_descriptors_not_resolved": scopes,
                     "semantic_review": "not_performed", "runtime_validation": "not_performed",
                     "limits": "Core OKF syntax and local consistency only; no universal format certification, semantic freshness proof, renderer-specific fragment check or general secret scan"},
    }, docs
