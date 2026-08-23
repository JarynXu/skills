#!/usr/bin/env python3
"""Synchronize the backend-engineer offline teaching library from pinned GitHub sources.

The source catalog lives at references/library/SOURCES.json. Moving refs are
resolved once per run to immutable commits. Every vendored GitHub file is then
downloaded from that commit and verified against Git's blob object identifier
before it is written locally.

Optional PDF extraction uses pypdf and produces explicitly derived text files;
the original PDF remains the authority.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import shutil
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "references" / "library"
CATALOG = LIBRARY / "SOURCES.json"
ORIGINALS = LIBRARY / "originals"
LOCK = LIBRARY / "SOURCES.lock.json"
API = "https://api.github.com"
RAW = "https://raw.githubusercontent.com"
USER_AGENT = "JarynXu-skills-backend-offline-library-sync/1"

TEXT_EXTENSIONS = {
    ".md", ".markdown", ".txt", ".rst", ".html", ".htm", ".xml", ".sgml",
    ".json", ".yaml", ".yml", ".toml", ".ini", ".cfg", ".conf", ".properties",
    ".go", ".java", ".kt", ".kts", ".cs", ".py", ".rs", ".c", ".cc", ".cpp",
    ".h", ".hpp", ".proto", ".sh", ".bash", ".zsh", ".sql",
}


class SyncError(RuntimeError):
    pass


@dataclass(frozen=True)
class RemoteFile:
    path: str
    git_sha: str
    size: int


def git_blob_sha(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def safe_rel(path: str) -> PurePosixPath:
    p = PurePosixPath(path)
    if p.is_absolute() or any(part in {"", ".", ".."} for part in p.parts):
        raise SyncError(f"unsafe repository path: {path!r}")
    return p


def local_path(base: Path, rel: str) -> Path:
    parts = safe_rel(rel).parts
    candidate = base.joinpath(*parts)
    candidate.parent.mkdir(parents=True, exist_ok=True)
    return candidate


class GitHub:
    def __init__(self, token: str | None, retries: int = 4) -> None:
        self.token = token
        self.retries = retries

    def _request(self, url: str, *, accept: str = "application/vnd.github+json") -> bytes:
        headers = {
            "Accept": accept,
            "User-Agent": USER_AGENT,
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        last: Exception | None = None
        for attempt in range(self.retries):
            req = urllib.request.Request(url, headers=headers)
            try:
                with urllib.request.urlopen(req, timeout=90) as response:
                    return response.read()
            except urllib.error.HTTPError as exc:
                body = exc.read().decode("utf-8", errors="replace")
                if exc.code in {403, 429, 500, 502, 503, 504} and attempt + 1 < self.retries:
                    reset = exc.headers.get("X-RateLimit-Reset")
                    delay = min(30.0, 2.0 ** attempt)
                    if exc.code == 403 and reset and exc.headers.get("X-RateLimit-Remaining") == "0":
                        delay = max(delay, min(60.0, int(reset) - int(time.time()) + 1))
                    time.sleep(max(0.5, delay))
                    last = SyncError(f"GitHub HTTP {exc.code}: {url}: {body[:300]}")
                    continue
                raise SyncError(f"GitHub HTTP {exc.code}: {url}: {body[:1000]}") from exc
            except (urllib.error.URLError, TimeoutError) as exc:
                last = exc
                if attempt + 1 < self.retries:
                    time.sleep(2.0 ** attempt)
                    continue
                raise SyncError(f"GitHub request failed: {url}: {exc}") from exc
        raise SyncError(f"GitHub request failed: {url}: {last}")

    def json(self, url: str) -> Any:
        return json.loads(self._request(url).decode("utf-8"))

    def resolve_commit(self, repo: str, ref: str) -> tuple[str, str]:
        encoded = urllib.parse.quote(ref, safe="")
        data = self.json(f"{API}/repos/{repo}/commits/{encoded}")
        return data["sha"], data["commit"]["tree"]["sha"]

    def contents(self, repo: str, commit: str, path: str) -> Any:
        encoded_path = "/".join(urllib.parse.quote(part, safe="") for part in safe_rel(path).parts)
        encoded_ref = urllib.parse.quote(commit, safe="")
        return self.json(f"{API}/repos/{repo}/contents/{encoded_path}?ref={encoded_ref}")

    def raw(self, repo: str, commit: str, path: str) -> bytes:
        encoded_path = "/".join(urllib.parse.quote(part, safe="") for part in safe_rel(path).parts)
        # raw.githubusercontent.com accepts immutable commit SHAs in the path.
        url = f"{RAW}/{repo}/{urllib.parse.quote(commit, safe='')}/{encoded_path}"
        return self._request(url, accept="application/octet-stream")


def expand_include(gh: GitHub, repo: str, commit: str, include: dict[str, Any]) -> list[RemoteFile]:
    path = include.get("path")
    if not isinstance(path, str):
        raise SyncError(f"include missing string path in {repo}: {include!r}")
    recursive = bool(include.get("recursive", False))
    first = gh.contents(repo, commit, path)
    if isinstance(first, dict) and first.get("type") == "file":
        return [RemoteFile(path=first["path"], git_sha=first["sha"], size=int(first.get("size", 0)))]
    if not isinstance(first, list):
        raise SyncError(f"expected file or directory at {repo}@{commit}:{path}")
    if not recursive:
        raise SyncError(f"{repo}@{commit}:{path} is a directory; set recursive=true")

    out: list[RemoteFile] = []
    queue: list[list[dict[str, Any]]] = [first]
    while queue:
        entries = queue.pop(0)
        for item in entries:
            kind = item.get("type")
            if kind == "file":
                out.append(RemoteFile(path=item["path"], git_sha=item["sha"], size=int(item.get("size", 0))))
            elif kind == "dir":
                child = gh.contents(repo, commit, item["path"])
                if not isinstance(child, list):
                    raise SyncError(f"expected directory listing for {repo}@{commit}:{item['path']}")
                queue.append(child)
            elif kind in {"symlink", "submodule"}:
                raise SyncError(f"unsupported {kind} in recursive source {repo}@{commit}:{item.get('path')}")
            else:
                raise SyncError(f"unknown content type {kind!r} at {repo}@{commit}:{item.get('path')}")
    return sorted(out, key=lambda f: f.path)


def should_search_file(path: str) -> bool:
    p = PurePosixPath(path)
    return p.suffix.lower() in TEXT_EXTENSIONS or p.name.lower() in {
        "license", "notice", "copying", "copyright", "readme", "changelog"
    }


def extract_pdf(path: Path, destination: Path) -> bool:
    try:
        from pypdf import PdfReader  # type: ignore
    except ImportError:
        return False
    reader = PdfReader(str(path))
    chunks: list[str] = []
    for index, page in enumerate(reader.pages, 1):
        text = page.extract_text() or ""
        chunks.append(f"\n\n===== PAGE {index} =====\n\n{text}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text("".join(chunks).lstrip(), encoding="utf-8")
    return True


def load_catalog() -> dict[str, Any]:
    try:
        data = json.loads(CATALOG.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise SyncError(f"cannot read catalog {CATALOG}: {exc}") from exc
    if data.get("schema_version") != 1 or not isinstance(data.get("sources"), list):
        raise SyncError("unsupported or invalid SOURCES.json")
    ids: set[str] = set()
    for source in data["sources"]:
        source_id = source.get("source_id")
        if not isinstance(source_id, str) or not source_id or source_id in ids:
            raise SyncError(f"invalid/duplicate source_id: {source_id!r}")
        safe_rel(source_id)
        ids.add(source_id)
        if not isinstance(source.get("includes"), list) or not source["includes"]:
            raise SyncError(f"source {source_id} has no includes")
    return data


def sync_one(gh: GitHub, source: dict[str, Any], *, extract_pdfs: bool) -> dict[str, Any]:
    source_id = source["source_id"]
    repo = source["repo"]
    requested_ref = source["ref"]
    commit, tree_sha = gh.resolve_commit(repo, requested_ref)
    print(f"[{source_id}] {repo}@{requested_ref} -> {commit}")

    selected: dict[str, RemoteFile] = {}
    pdf_extract_paths: set[str] = set()
    for include in source["includes"]:
        files = expand_include(gh, repo, commit, include)
        if include.get("extract_pdf_text"):
            if len(files) != 1 or PurePosixPath(files[0].path).suffix.lower() != ".pdf":
                raise SyncError(f"extract_pdf_text requires one PDF file: {source_id}:{include}")
            pdf_extract_paths.add(files[0].path)
        for file in files:
            selected[file.path] = file
    if not selected:
        raise SyncError(f"source {source_id} selected no files")

    source_root = ORIGINALS / source_id
    if source_root.exists():
        shutil.rmtree(source_root)
    source_root.mkdir(parents=True, exist_ok=True)

    manifest_files: list[dict[str, Any]] = []
    derived: list[dict[str, Any]] = []
    total_bytes = 0
    for remote in sorted(selected.values(), key=lambda f: f.path):
        data = gh.raw(repo, commit, remote.path)
        actual = git_blob_sha(data)
        if actual != remote.git_sha:
            raise SyncError(
                f"blob mismatch for {source_id}:{remote.path}: upstream={remote.git_sha} downloaded={actual}"
            )
        target = local_path(source_root, remote.path)
        target.write_bytes(data)
        total_bytes += len(data)
        entry = {
            "local_path": remote.path,
            "upstream_path": remote.path,
            "upstream_git_sha": remote.git_sha,
            "local_git_sha": actual,
            "sha256": sha256(data),
            "bytes": len(data),
            "byte_exact": True,
            "searchable_text": should_search_file(remote.path),
        }
        manifest_files.append(entry)

        if remote.path in pdf_extract_paths and extract_pdfs:
            derived_rel = str(PurePosixPath("derived") / (PurePosixPath(remote.path).name + ".txt"))
            derived_target = local_path(source_root, derived_rel)
            if extract_pdf(target, derived_target):
                derived_data = derived_target.read_bytes()
                derived.append({
                    "local_path": derived_rel,
                    "derived_from": remote.path,
                    "local_git_sha": git_blob_sha(derived_data),
                    "sha256": sha256(derived_data),
                    "bytes": len(derived_data),
                    "byte_exact": False,
                    "searchable_text": True,
                    "derivation": "pypdf text extraction; original PDF remains authoritative",
                })
            else:
                print(f"[{source_id}] pypdf unavailable; kept PDF without derived text", file=sys.stderr)

    manifest = {
        "schema_version": 1,
        "source_id": source_id,
        "title": source["title"],
        "repo": repo,
        "requested_ref": requested_ref,
        "source_commit": commit,
        "source_tree": tree_sha,
        "source_url": f"https://github.com/{repo}/tree/{commit}",
        "license": source.get("license"),
        "tier": source.get("tier"),
        "tracks": source.get("tracks", []),
        "retrieved_at": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat(),
        "files": manifest_files,
        "derived_files": derived,
        "file_count": len(manifest_files),
        "derived_count": len(derived),
        "total_original_bytes": total_bytes,
    }
    (source_root / "SOURCE.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(f"[{source_id}] wrote {len(manifest_files)} originals, {len(derived)} derived, {total_bytes} bytes")
    return manifest


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", action="append", default=[], help="sync only the named source id; may repeat")
    parser.add_argument("--no-pdf-extract", action="store_true", help="keep original PDFs but skip derived text")
    parser.add_argument("--token", default=None, help="GitHub token; defaults to GITHUB_TOKEN or GH_TOKEN")
    args = parser.parse_args()

    catalog = load_catalog()
    requested = set(args.source)
    known = {s["source_id"] for s in catalog["sources"]}
    unknown = requested - known
    if unknown:
        raise SyncError(f"unknown source ids: {', '.join(sorted(unknown))}")

    token = args.token or os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    gh = GitHub(token)
    ORIGINALS.mkdir(parents=True, exist_ok=True)

    manifests: list[dict[str, Any]] = []
    for source in catalog["sources"]:
        if requested and source["source_id"] not in requested:
            continue
        manifests.append(sync_one(gh, source, extract_pdfs=not args.no_pdf_extract))

    # A partial sync intentionally preserves the lock entries for sources not selected,
    # but replaces entries for sources that were refreshed.
    prior: dict[str, Any] = {"schema_version": 1, "sources": {}}
    if LOCK.exists():
        try:
            loaded = json.loads(LOCK.read_text(encoding="utf-8"))
            if loaded.get("schema_version") == 1 and isinstance(loaded.get("sources"), dict):
                prior = loaded
        except (OSError, json.JSONDecodeError):
            pass
    locked = dict(prior.get("sources", {}))
    for manifest in manifests:
        locked[manifest["source_id"]] = {
            "repo": manifest["repo"],
            "requested_ref": manifest["requested_ref"],
            "source_commit": manifest["source_commit"],
            "file_count": manifest["file_count"],
            "derived_count": manifest["derived_count"],
            "total_original_bytes": manifest["total_original_bytes"],
            "retrieved_at": manifest["retrieved_at"],
        }
    lock_data = {
        "schema_version": 1,
        "catalog_git_sha": git_blob_sha(CATALOG.read_bytes()),
        "sources": dict(sorted(locked.items())),
    }
    LOCK.write_text(json.dumps(lock_data, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SyncError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(2)
