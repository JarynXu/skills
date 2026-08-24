#!/usr/bin/env python3
"""Synchronize the project-manager offline library from GitHub and reviewed HTTPS sources.

GitHub sources preserve upstream Git blob identity. URL sources preserve the exact
HTTP response bytes, pin a version label, and can require an expected SHA-256.
All processable originals are converted into agent-ready Markdown by the shared
preprocessing core before the library is considered ready.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import ipaddress
import json
import os
import shutil
import socket
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import sync_offline_library_core as core  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "references" / "library"
CATALOG = LIBRARY / "SOURCES.json"
ORIGINALS = LIBRARY / "originals"
PROCESSED = LIBRARY / "processed"
LOCK = LIBRARY / "SOURCES.lock.json"
USER_AGENT = "JarynXu-skills-project-manager-offline-library-sync/1"
DEFAULT_MAX_BYTES = 80 * 1024 * 1024


class ProjectSyncError(core.SyncError):
    pass


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_catalog() -> dict[str, Any]:
    try:
        data = json.loads(CATALOG.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ProjectSyncError(f"cannot read catalog {CATALOG}: {exc}") from exc
    if data.get("schema_version") != 1 or not isinstance(data.get("sources"), list):
        raise ProjectSyncError("unsupported or invalid SOURCES.json")
    ids: set[str] = set()
    for source in data["sources"]:
        if not isinstance(source, dict):
            raise ProjectSyncError("source entry must be an object")
        source_id = source.get("source_id")
        if not isinstance(source_id, str) or not source_id or source_id in ids:
            raise ProjectSyncError(f"invalid/duplicate source_id: {source_id!r}")
        core.safe_rel(source_id)
        ids.add(source_id)
        kind = source.get("kind", "github")
        if kind not in {"github", "url"}:
            raise ProjectSyncError(f"source {source_id}: unsupported kind={kind!r}")
        includes = source.get("includes")
        if not isinstance(includes, list) or not includes:
            raise ProjectSyncError(f"source {source_id} has no includes")
        if kind == "github":
            if not isinstance(source.get("repo"), str) or not isinstance(source.get("ref"), str):
                raise ProjectSyncError(f"source {source_id}: github source requires repo and ref")
        else:
            if not isinstance(source.get("version"), str) or not source["version"].strip():
                raise ProjectSyncError(f"source {source_id}: url source requires a version label")
            for include in includes:
                if not isinstance(include, dict):
                    raise ProjectSyncError(f"source {source_id}: include must be an object")
                url = include.get("url")
                path = include.get("path")
                if not isinstance(url, str) or not isinstance(path, str):
                    raise ProjectSyncError(f"source {source_id}: url include requires url and path")
                validate_public_https_url(url)
                core.safe_rel(path)
                expected = include.get("expected_sha256")
                if expected is not None and (not isinstance(expected, str) or len(expected) != 64):
                    raise ProjectSyncError(f"source {source_id}:{path}: expected_sha256 must be 64 hex chars")
    return data


def validate_public_https_url(url: str) -> None:
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme != "https" or not parsed.hostname:
        raise ProjectSyncError(f"only absolute HTTPS source URLs are allowed: {url}")
    host = parsed.hostname.rstrip(".").lower()
    if host in {"localhost", "localhost.localdomain"} or host.endswith(".local"):
        raise ProjectSyncError(f"local source host is not allowed: {host}")
    try:
        address = ipaddress.ip_address(host)
    except ValueError:
        address = None
    if address is not None and not address.is_global:
        raise ProjectSyncError(f"non-public source address is not allowed: {host}")


def resolved_host_is_public(host: str) -> bool:
    try:
        infos = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
    except OSError:
        # DNS may be unavailable in a dry/local environment; textual URL validation
        # still prevents explicit localhost/private-IP catalog entries.
        return True
    for info in infos:
        raw = info[4][0]
        try:
            address = ipaddress.ip_address(raw)
        except ValueError:
            continue
        if not address.is_global:
            return False
    return True


def download_url(url: str, max_bytes: int, retries: int = 4) -> tuple[bytes, str, str | None]:
    validate_public_https_url(url)
    last: Exception | None = None
    for attempt in range(retries):
        request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                resolved = response.geturl()
                validate_public_https_url(resolved)
                parsed = urllib.parse.urlparse(resolved)
                if parsed.hostname and not resolved_host_is_public(parsed.hostname):
                    raise ProjectSyncError(f"source redirected to a non-public address: {resolved}")
                declared = response.headers.get("Content-Length")
                if declared and int(declared) > max_bytes:
                    raise ProjectSyncError(f"source exceeds max_bytes={max_bytes}: {url}")
                chunks: list[bytes] = []
                total = 0
                while True:
                    chunk = response.read(min(1024 * 1024, max_bytes - total + 1))
                    if not chunk:
                        break
                    total += len(chunk)
                    if total > max_bytes:
                        raise ProjectSyncError(f"source exceeds max_bytes={max_bytes}: {url}")
                    chunks.append(chunk)
                return b"".join(chunks), resolved, response.headers.get("Content-Type")
        except ProjectSyncError:
            raise
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError) as exc:
            last = exc
            if attempt + 1 < retries:
                time.sleep(2.0 ** attempt)
                continue
            raise ProjectSyncError(f"download failed: {url}: {exc}") from exc
    raise ProjectSyncError(f"download failed: {url}: {last}")


_ORIGINAL_PROVENANCE_HEADER = core.provenance_header


def project_provenance_header(manifest: dict[str, Any], original: dict[str, Any], transform: str) -> str:
    if manifest.get("source_kind") != "url":
        return _ORIGINAL_PROVENANCE_HEADER(manifest, original, transform)
    return (
        "> **Offline teaching derivative**  \n"
        f"> Source: `{manifest.get('title')}` ({manifest.get('version')})  \n"
        f"> Official URL: `{original.get('source_url')}`  \n"
        f"> Retrieved URL: `{original.get('resolved_url')}`  \n"
        f"> Original SHA-256: `{original.get('sha256')}`  \n"
        f"> Transform: `{transform}`  \n"
        "> This Markdown is generated for agent use. Consult `originals/` when exact source bytes matter.\n\n"
    )


core.provenance_header = project_provenance_header


def write_manifest(source_root: Path, manifest: dict[str, Any]) -> None:
    (source_root / "SOURCE.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def process_manifest(source_root: Path, manifest: dict[str, Any]) -> dict[str, Any]:
    processed = core.process_manifest(source_root, manifest)
    if processed.get("source_kind") == "url":
        originals = {
            str(item.get("upstream_path") or item.get("local_path")): item
            for item in processed.get("files", [])
            if isinstance(item, dict)
        }
        for item in processed.get("processed_files", []):
            if not isinstance(item, dict):
                continue
            source = originals.get(str(item.get("derived_from") or ""))
            if source and isinstance(source.get("sha256"), str):
                item["source_sha256"] = source["sha256"]
            item.pop("source_git_sha", None)
        write_manifest(source_root, processed)
    return processed


def sync_url_one(source: dict[str, Any]) -> dict[str, Any]:
    source_id = source["source_id"]
    source_root = ORIGINALS / source_id
    if source_root.exists():
        shutil.rmtree(source_root)
    source_root.mkdir(parents=True, exist_ok=True)
    max_bytes = int(source.get("max_bytes", DEFAULT_MAX_BYTES))
    manifest_files: list[dict[str, Any]] = []
    total = 0
    for include in source["includes"]:
        url = include["url"]
        path = include["path"]
        data, resolved, content_type = download_url(url, max_bytes=max_bytes)
        digest = sha256(data)
        expected = include.get("expected_sha256")
        if expected and digest.lower() != str(expected).lower():
            raise ProjectSyncError(
                f"sha256 mismatch for {source_id}:{path}: expected={expected} downloaded={digest}"
            )
        target = core.local_path(source_root, path)
        target.write_bytes(data)
        total += len(data)
        manifest_files.append({
            "local_path": path,
            "upstream_path": path,
            "source_url": url,
            "resolved_url": resolved,
            "content_type": content_type,
            "sha256": digest,
            "local_git_sha": core.git_blob_sha(data),
            "bytes": len(data),
            "byte_exact": True,
            "searchable_text": core.is_searchable_text(path),
        })
    manifest: dict[str, Any] = {
        "schema_version": 2,
        "source_kind": "url",
        "source_id": source_id,
        "title": source["title"],
        "version": source["version"],
        "license": source.get("license"),
        "license_notes": source.get("license_notes"),
        "tier": source.get("tier"),
        "tracks": source.get("tracks", []),
        "retrieved_at": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat(),
        "files": manifest_files,
        "file_count": len(manifest_files),
        "total_original_bytes": total,
    }
    manifest = process_manifest(source_root, manifest)
    print(f"[{source_id}] wrote {manifest['file_count']} URL original(s) / {manifest['processed_count']} processed Markdown file(s)")
    return manifest


def normalize_github_manifest(source_id: str, manifest: dict[str, Any]) -> dict[str, Any]:
    manifest["source_kind"] = "github"
    write_manifest(ORIGINALS / source_id, manifest)
    return manifest


def rebuild_lock(catalog: dict[str, Any]) -> None:
    summaries: dict[str, Any] = {}
    for source in catalog["sources"]:
        source_id = source["source_id"]
        path = ORIGINALS / source_id / "SOURCE.json"
        if not path.is_file():
            continue
        manifest = json.loads(path.read_text(encoding="utf-8"))
        item: dict[str, Any] = {
            "source_kind": manifest.get("source_kind", "github"),
            "version": manifest.get("version"),
            "repo": manifest.get("repo"),
            "requested_ref": manifest.get("requested_ref"),
            "source_commit": manifest.get("source_commit"),
            "retrieved_at": manifest.get("retrieved_at"),
            "file_count": manifest.get("file_count", 0),
            "total_original_bytes": manifest.get("total_original_bytes", 0),
            "processed_count": manifest.get("processed_count", 0),
            "processed_bytes": manifest.get("processed_bytes", 0),
            "agent_ready": manifest.get("agent_ready", False),
        }
        if manifest.get("source_kind") == "url":
            item["files"] = [
                {
                    "path": entry.get("local_path"),
                    "source_url": entry.get("source_url"),
                    "resolved_url": entry.get("resolved_url"),
                    "sha256": entry.get("sha256"),
                }
                for entry in manifest.get("files", [])
                if isinstance(entry, dict)
            ]
        summaries[source_id] = item
    raw = CATALOG.read_bytes()
    lock = {
        "schema_version": 3,
        "catalog_git_sha": core.git_blob_sha(raw),
        "catalog_sha256": sha256(raw),
        "catalog_source_count": len(catalog["sources"]),
        "sources": summaries,
    }
    LOCK.write_text(json.dumps(lock, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def process_existing(catalog: dict[str, Any]) -> None:
    count = 0
    for source in catalog["sources"]:
        source_id = source["source_id"]
        path = ORIGINALS / source_id / "SOURCE.json"
        if not path.is_file():
            raise ProjectSyncError(f"cannot process existing source without manifest: {source_id}")
        manifest = json.loads(path.read_text(encoding="utf-8"))
        process_manifest(path.parent, manifest)
        count += 1
    rebuild_lock(catalog)
    print(f"Preprocessed {count} installed source pack(s).")


def synchronize(catalog: dict[str, Any], requested: set[str]) -> None:
    known = {source["source_id"] for source in catalog["sources"]}
    unknown = requested - known
    if unknown:
        raise ProjectSyncError("unknown source ids: " + ", ".join(sorted(unknown)))
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    gh = core.GitHub(token)
    ORIGINALS.mkdir(parents=True, exist_ok=True)
    PROCESSED.mkdir(parents=True, exist_ok=True)
    count = 0
    for source in catalog["sources"]:
        if requested and source["source_id"] not in requested:
            continue
        kind = source.get("kind", "github")
        if kind == "github":
            manifest = core.sync_one(gh, source)
            normalize_github_manifest(source["source_id"], manifest)
        else:
            sync_url_one(source)
        count += 1
    rebuild_lock(catalog)
    print(f"Synchronized {count} project-management source pack(s).")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", action="append", default=[], help="sync only this source id; may repeat")
    parser.add_argument("--process-existing", action="store_true")
    parser.add_argument("--list-source-ids", action="store_true")
    parser.add_argument("--print-catalog", action="store_true")
    args = parser.parse_args()
    catalog = load_catalog()
    if args.list_source_ids:
        for source in catalog["sources"]:
            print(source["source_id"])
        return 0
    if args.print_catalog:
        print(json.dumps(catalog, ensure_ascii=False, indent=2, sort_keys=True))
        return 0
    if args.process_existing:
        if args.source:
            parser.error("--process-existing cannot be combined with --source")
        process_existing(catalog)
        return 0
    synchronize(catalog, set(args.source))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ProjectSyncError, core.SyncError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
