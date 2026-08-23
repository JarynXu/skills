#!/usr/bin/env python3
"""Synchronize and preprocess the backend-engineer offline teaching library.

The library has two explicit layers:

- references/library/originals/<source-id>/ keeps byte-exact upstream evidence.
- references/library/processed/<source-id>/ keeps agent-ready Markdown derived at sync time.

Moving refs are resolved to immutable commits. Every downloaded GitHub file is
verified against its upstream Git blob identifier before it is accepted. The
processed layer is derived locally from those verified originals and never
pretends to be byte-exact upstream content.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import html as html_lib
import json
import os
import re
import shutil
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "references" / "library"
CATALOG = LIBRARY / "SOURCES.json"
ORIGINALS = LIBRARY / "originals"
PROCESSED = LIBRARY / "processed"
LOCK = LIBRARY / "SOURCES.lock.json"
API = "https://api.github.com"
RAW = "https://raw.githubusercontent.com"
USER_AGENT = "JarynXu-skills-backend-offline-library-sync/2"

DEFAULT_MAX_FILES = 2000
DEFAULT_MAX_BYTES = 50 * 1024 * 1024

SEARCHABLE_TEXT_EXTENSIONS = {
    ".md", ".markdown", ".txt", ".rst", ".html", ".htm", ".xml", ".sgml", ".adoc",
    ".json", ".yaml", ".yml", ".toml", ".ini", ".cfg", ".conf", ".properties",
    ".go", ".java", ".kt", ".kts", ".cs", ".py", ".rs", ".c", ".cc", ".cpp",
    ".h", ".hpp", ".proto", ".sh", ".bash", ".zsh", ".sql",
}
DOCUMENT_EXTENSIONS = {
    ".md", ".markdown", ".txt", ".rst", ".html", ".htm", ".xml", ".sgml", ".adoc", ".pdf"
}
TEXT_NAMES = {"license", "notice", "copying", "copyright", "readme", "changelog"}


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


def is_searchable_text(path: str) -> bool:
    p = PurePosixPath(path)
    return p.suffix.lower() in SEARCHABLE_TEXT_EXTENSIONS or p.name.lower() in TEXT_NAMES


def is_processable_document(path: str) -> bool:
    p = PurePosixPath(path)
    return p.suffix.lower() in DOCUMENT_EXTENSIONS


def processed_rel(path: str) -> str:
    p = PurePosixPath(path)
    if p.suffix.lower() in {".md", ".markdown"}:
        return str(p.with_suffix(".md"))
    return str(p) + ".md"


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


def provenance_header(manifest: dict[str, Any], original: dict[str, Any], transform: str) -> str:
    return (
        "> **Offline teaching derivative**  
"
        f"> Source: `{manifest['repo']}@{manifest['source_commit']}`  
"
        f"> Upstream path: `{original['upstream_path']}`  
"
        f"> Upstream Git blob: `{original['upstream_git_sha']}`  
"
        f"> Transform: `{transform}`  
"
        "> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.\n\n"
    )


def normalize_markdown(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{4,}", "\n\n\n", text)
    return text.strip() + "\n"


def html_to_markdown(text: str) -> str:
    try:
        from bs4 import BeautifulSoup  # type: ignore
        from markdownify import markdownify as md  # type: ignore
    except ImportError as exc:
        raise SyncError("HTML preprocessing requires beautifulsoup4 and markdownify") from exc
    soup = BeautifulSoup(text, "html.parser")
    for tag in soup(["script", "style", "nav", "noscript"]):
        tag.decompose()
    body = soup.body or soup
    return normalize_markdown(md(str(body), heading_style="ATX", bullets="-"))


def rst_to_markdown(text: str) -> str:
    try:
        from docutils.core import publish_parts  # type: ignore
    except ImportError as exc:
        raise SyncError("RST preprocessing requires docutils") from exc
    parts = publish_parts(source=text, writer_name="html5", settings_overrides={"report_level": 5, "halt_level": 6})
    return html_to_markdown(parts.get("html_body", text))


def asciidoc_to_markdown(text: str) -> str:
    lines = text.replace("\r\n", "\n").replace("\r", "\n").splitlines()
    out: list[str] = []
    in_block = False
    pending_language = ""
    for line in lines:
        source = re.match(r"^\[source(?:,([^\]]+))?\]\s*$", line)
        if source:
            pending_language = (source.group(1) or "").strip()
            continue
        if line.strip() in {"----", "...."}:
            if not in_block:
                out.append("```" + pending_language)
                pending_language = ""
            else:
                out.append("```")
            in_block = not in_block
            continue
        if not in_block:
            heading = re.match(r"^(=+)\s+(.+)$", line)
            if heading:
                out.append("#" * min(6, len(heading.group(1))) + " " + heading.group(2))
                continue
            if re.match(r"^:[A-Za-z0-9_-]+:", line):
                continue
            line = re.sub(r"xref:([^\[]+)\[([^\]]*)\]", lambda m: f"[{m.group(2) or m.group(1)}]({m.group(1)})", line)
            line = re.sub(r"link:([^\[]+)\[([^\]]*)\]", lambda m: f"[{m.group(2) or m.group(1)}]({m.group(1)})", line)
        out.append(line)
    if in_block:
        out.append("```")
    return normalize_markdown("\n".join(out))


def sgml_xml_to_markdown(text: str) -> str:
    work = text.replace("\r\n", "\n").replace("\r", "\n")
    work = re.sub(
        r"<title[^>]*>(.*?)</title>",
        lambda m: "\n\n## " + re.sub(r"<[^>]+>", "", m.group(1)).strip() + "\n\n",
        work,
        flags=re.I | re.S,
    )
    for tag in ("programlisting", "screen", "literallayout"):
        work = re.sub(
            rf"<{tag}[^>]*>(.*?)</{tag}>",
            lambda m: "\n\n```\n" + html_lib.unescape(re.sub(r"<[^>]+>", "", m.group(1))).strip() + "\n```\n\n",
            work,
            flags=re.I | re.S,
        )
    work = re.sub(r"<listitem[^>]*>", "\n- ", work, flags=re.I)
    work = re.sub(r"</?(?:para|simpara|section|sect1|sect2|sect3|chapter|appendix|itemizedlist|orderedlist)[^>]*>", "\n\n", work, flags=re.I)
    work = re.sub(r"<[^>]+>", "", work)
    work = html_lib.unescape(work)
    return normalize_markdown(work)


def pdf_to_markdown(path: Path) -> tuple[str, dict[str, Any], list[str]]:
    try:
        from pypdf import PdfReader  # type: ignore
    except ImportError as exc:
        raise SyncError("PDF preprocessing requires pypdf") from exc
    reader = PdfReader(str(path))
    out: list[str] = []
    empty_pages: list[int] = []
    for index, page in enumerate(reader.pages, start=1):
        text = (page.extract_text() or "").strip()
        out.append(f"## Page {index}\n")
        if text:
            out.append(text)
        else:
            empty_pages.append(index)
            out.append("_[No extractable text on this page; consult the byte-exact PDF original.]_")
        out.append("")
    warnings = []
    if empty_pages:
        warnings.append(f"pages without extractable text: {', '.join(map(str, empty_pages[:50]))}")
    return normalize_markdown("\n".join(out)), {"page_count": len(reader.pages), "empty_text_pages": empty_pages}, warnings


def convert_document(path: Path, upstream_path: str) -> tuple[str, str, dict[str, Any], list[str]]:
    suffix = PurePosixPath(upstream_path).suffix.lower()
    if suffix == ".pdf":
        body, metadata, warnings = pdf_to_markdown(path)
        return body, "pdf-to-page-structured-markdown:pypdf", metadata, warnings

    text = path.read_text(encoding="utf-8", errors="replace")
    if suffix in {".md", ".markdown"}:
        return normalize_markdown(text), "markdown-normalize", {}, []
    if suffix in {".html", ".htm"}:
        return html_to_markdown(text), "html-to-markdown:beautifulsoup+markdownify", {}, []
    if suffix == ".rst":
        return rst_to_markdown(text), "rst-to-html-to-markdown:docutils+markdownify", {}, []
    if suffix == ".adoc":
        return asciidoc_to_markdown(text), "asciidoc-structural-to-markdown", {}, []
    if suffix in {".sgml", ".xml"}:
        return sgml_xml_to_markdown(text), "sgml-xml-structural-to-markdown", {}, []
    return normalize_markdown(text), "plain-text-to-markdown", {}, []


def process_manifest(source_root: Path, manifest: dict[str, Any]) -> dict[str, Any]:
    source_id = str(manifest["source_id"])
    processed_root = PROCESSED / source_id
    if processed_root.exists():
        shutil.rmtree(processed_root)
    processed_root.mkdir(parents=True, exist_ok=True)

    processed_files: list[dict[str, Any]] = []
    warnings: list[str] = []
    for original in manifest.get("files", []):
        if not isinstance(original, dict):
            continue
        upstream_path = str(original.get("upstream_path") or original.get("local_path") or "")
        if not upstream_path or not is_processable_document(upstream_path):
            continue
        original_path = local_path(source_root, upstream_path)
        if not original_path.is_file():
            raise SyncError(f"cannot preprocess missing original: {source_id}/{upstream_path}")
        body, transform, metadata, doc_warnings = convert_document(original_path, upstream_path)
        rel = processed_rel(upstream_path)
        target = local_path(processed_root, rel)
        header = provenance_header(manifest, original, transform)
        data = (header + body).encode("utf-8")
        target.write_bytes(data)
        entry: dict[str, Any] = {
            "local_path": rel,
            "derived_from": upstream_path,
            "source_git_sha": original.get("upstream_git_sha"),
            "local_git_sha": git_blob_sha(data),
            "sha256": sha256(data),
            "bytes": len(data),
            "byte_exact": False,
            "searchable_text": True,
            "transform": transform,
        }
        entry.update(metadata)
        if doc_warnings:
            entry["warnings"] = doc_warnings
            warnings.extend(f"{upstream_path}: {item}" for item in doc_warnings)
        processed_files.append(entry)

    manifest["processed_files"] = processed_files
    manifest["processed_count"] = len(processed_files)
    manifest["processed_bytes"] = sum(int(item["bytes"]) for item in processed_files)
    manifest["processing_warnings"] = warnings
    manifest["agent_ready"] = bool(processed_files)
    (source_root / "SOURCE.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return manifest


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


def rebuild_lock(catalog: dict[str, Any]) -> None:
    summaries: dict[str, Any] = {}
    for source in catalog["sources"]:
        source_id = source["source_id"]
        manifest_path = ORIGINALS / source_id / "SOURCE.json"
        if not manifest_path.is_file():
            continue
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        summaries[source_id] = {
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
    lock = {
        "schema_version": 1,
        "catalog_git_sha": git_blob_sha(CATALOG.read_bytes()),
        "sources": summaries,
    }
    LOCK.write_text(json.dumps(lock, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def sync_one(gh: GitHub, source: dict[str, Any]) -> dict[str, Any]:
    source_id = source["source_id"]
    repo = source["repo"]
    requested_ref = source["ref"]
    commit, tree_sha = gh.resolve_commit(repo, requested_ref)
    print(f"[{source_id}] {repo}@{requested_ref} -> {commit}")

    selected: dict[str, RemoteFile] = {}
    for include in source["includes"]:
        for file in expand_include(gh, repo, commit, include):
            selected[file.path] = file
    if not selected:
        raise SyncError(f"source {source_id} selected no files")

    max_files = int(source.get("max_files", DEFAULT_MAX_FILES))
    max_bytes = int(source.get("max_bytes", DEFAULT_MAX_BYTES))
    selected_bytes = sum(max(0, item.size) for item in selected.values())
    if len(selected) > max_files:
        raise SyncError(
            f"source {source_id} selected {len(selected)} files, exceeding max_files={max_files}; curate the source instead of mirroring a site tree"
        )
    if selected_bytes > max_bytes:
        raise SyncError(
            f"source {source_id} selected about {selected_bytes} bytes, exceeding max_bytes={max_bytes}; curate the source instead of mirroring a site tree"
        )

    source_root = ORIGINALS / source_id
    if source_root.exists():
        shutil.rmtree(source_root)
    source_root.mkdir(parents=True, exist_ok=True)

    manifest_files: list[dict[str, Any]] = []
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
        manifest_files.append({
            "local_path": remote.path,
            "upstream_path": remote.path,
            "upstream_git_sha": remote.git_sha,
            "local_git_sha": actual,
            "sha256": sha256(data),
            "bytes": len(data),
            "byte_exact": True,
            "searchable_text": is_searchable_text(remote.path),
        })

    manifest: dict[str, Any] = {
        "schema_version": 2,
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
        "file_count": len(manifest_files),
        "total_original_bytes": total_bytes,
    }
    manifest = process_manifest(source_root, manifest)
    print(
        f"[{source_id}] wrote {manifest['file_count']} originals / {manifest['processed_count']} processed Markdown files / {total_bytes} original bytes"
    )
    return manifest


def process_existing(catalog: dict[str, Any]) -> None:
    count = 0
    for source in catalog["sources"]:
        source_id = source["source_id"]
        manifest_path = ORIGINALS / source_id / "SOURCE.json"
        if not manifest_path.is_file():
            raise SyncError(f"cannot process existing source without manifest: {source_id}")
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        process_manifest(manifest_path.parent, manifest)
        count += 1
    rebuild_lock(catalog)
    print(f"Preprocessed {count} installed source pack(s) into agent-ready Markdown.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", action="append", default=[], help="sync only the named source id; may repeat")
    parser.add_argument("--process-existing", action="store_true", help="rebuild processed Markdown from already vendored originals without network access")
    parser.add_argument("--token", default=None, help="GitHub token; defaults to GITHUB_TOKEN or GH_TOKEN")
    args = parser.parse_args()

    catalog = load_catalog()
    if args.process_existing:
        if args.source:
            parser.error("--process-existing cannot be combined with --source")
        process_existing(catalog)
        return 0

    requested = set(args.source)
    known = {s["source_id"] for s in catalog["sources"]}
    unknown = requested - known
    if unknown:
        raise SyncError(f"unknown source ids: {', '.join(sorted(unknown))}")

    token = args.token or os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    gh = GitHub(token)
    ORIGINALS.mkdir(parents=True, exist_ok=True)
    PROCESSED.mkdir(parents=True, exist_ok=True)

    synced = 0
    for source in catalog["sources"]:
        if requested and source["source_id"] not in requested:
            continue
        sync_one(gh, source)
        synced += 1
    rebuild_lock(catalog)
    print(f"Synchronized {synced} source pack(s).")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SyncError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
