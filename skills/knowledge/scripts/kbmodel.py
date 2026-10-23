"""Read-only parsing and path handling shared by the knowledge tools."""
from __future__ import annotations

import hashlib
import os
import re
import stat
from dataclasses import asdict, dataclass, field
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import unquote, urlsplit

import yaml
from markdown_it import MarkdownIt
from mdit_py_plugins.footnote import footnote_plugin

IGNORED_DIRS = {".git", ".obsidian"}
MAX_DOCUMENT_BYTES = 4 * 1024 * 1024  # Refuse oversized input; never silently truncate it.


class InputError(ValueError):
    pass


@dataclass(frozen=True)
class Issue:
    category: str
    code: str
    path: str
    message: str
    severity: str = "error"
    line: int | None = None

    def record(self) -> dict[str, Any]:
        return {k: v for k, v in asdict(self).items() if v is not None}


@dataclass
class Document:
    path: Path
    name: str
    metadata: dict[str, Any] | None
    body: str
    offset: int
    links: list[tuple[str, int]] = field(default_factory=list)
    references: set[str] = field(default_factory=set)
    definitions: set[str] = field(default_factory=set)
    headings: list[tuple[int, str, int]] = field(default_factory=list)
    anchors: set[str] = field(default_factory=set)
    list_items: int = 0
    prose: list[tuple[str, int]] = field(default_factory=list)


class UniqueLoader(yaml.SafeLoader):
    """Reject duplicate explicit keys while preserving YAML merge semantics."""
    def construct_mapping(self, node: yaml.MappingNode, deep: bool = False) -> dict:
        seen = set()
        for key_node, _ in node.value:
            if key_node.tag == "tag:yaml.org,2002:merge":
                continue
            key = self.construct_object(key_node, deep=deep)
            try:
                if key in seen:
                    raise yaml.constructor.ConstructorError(None, None, "duplicate key", key_node.start_mark)
                seen.add(key)
            except TypeError as exc:
                raise yaml.constructor.ConstructorError(None, None, "non-scalar key", key_node.start_mark) from exc
        return super().construct_mapping(node, deep=deep)


def digest(path: Path) -> str:
    if not stat.S_ISREG(path.stat().st_mode):
        raise InputError("Expected a regular file")
    result = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(128 * 1024), b""):
            result.update(block)
    return result.hexdigest()


def locations(bundle: str | Path, workspace: str | Path | None = None) -> tuple[Path, Path]:
    """The caller supplies locations; no project name, Git layout or folder name is assumed."""
    def directory(raw: str | Path) -> Path:
        path = Path(os.path.abspath(Path(raw).expanduser()))
        if _is_link(path) or not path.is_dir():
            raise InputError("Supply an existing real directory")
        return path
    root = directory(bundle)
    boundary = directory(workspace) if workspace is not None else root
    if not root.is_relative_to(boundary):
        raise InputError("Bundle must be inside the explicitly allowed workspace")
    root = checked_path(boundary, root.relative_to(boundary).as_posix(), boundary)
    return root, boundary.resolve()


def _is_link(path: Path) -> bool:
    """识别符号链接和 Windows 目录联接；兼容 Python 3.10。"""
    try:
        info = path.lstat()
    except FileNotFoundError:
        return False
    return stat.S_ISLNK(info.st_mode) or (
        os.name == "nt" and info.st_reparse_tag == stat.IO_REPARSE_TAG_MOUNT_POINT
    )


def checked_path(base: Path, value: str, boundary: Path) -> Path:
    """拒绝越界及链接穿越，返回实际路径；缺失尾段留给调用方诊断。"""
    if not value or "\x00" in value or "\\" in value:
        raise InputError("Use a non-empty path with forward slashes")
    candidate = Path(os.path.abspath(base / value))
    if not candidate.is_relative_to(boundary):
        raise InputError("Path leaves the authorized workspace")
    current = boundary
    for part in candidate.relative_to(boundary).parts:
        current = current / part
        if _is_link(current):
            raise InputError("Symlink or junction traversal is not allowed")
    resolved = candidate.resolve()
    if not resolved.is_relative_to(boundary.resolve()):
        raise InputError("Path leaves the authorized workspace")
    return resolved


def resolve_resource(doc: Document, resource: str, bundle: Path, workspace: Path, *, scope: bool = False) -> tuple[str, Path | None, str]:
    if scope:
        return "scope", None, ""
    if not isinstance(resource, str) or not resource.strip():
        raise InputError("Source resource must be a non-empty string")
    parsed = urlsplit(resource)
    if parsed.username is not None or parsed.password is not None:
        raise InputError("Credential-bearing URI is not allowed")
    if parsed.scheme:
        if parsed.scheme.lower() in {"javascript", "data", "file"}:
            raise InputError("Executable or host-local URI is not allowed")
        return "external", None, parsed.fragment
    if parsed.netloc:
        return "external", None, parsed.fragment
    decoded = unquote(parsed.path)
    if not decoded:
        return "local", doc.path, parsed.fragment
    base = bundle if decoded.startswith("/") else doc.path.parent
    return "local", checked_path(base, decoded.lstrip("/") if decoded.startswith("/") else decoded, workspace), unquote(parsed.fragment)


def aware_datetime(value: Any) -> datetime | None:
    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    return value if isinstance(value, datetime) and value.utcoffset() is not None else None


class HtmlLinks(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.links: list[str] = []
        self.anchors: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for key, value in attrs:
            if value is not None and key in {"href", "src"}:
                self.links.append(value)
            if value is not None and (key == "id" or (tag == "a" and key == "name")):
                self.anchors.add(value)


def walk_tokens(tokens: Iterable, line: int = 1) -> Iterable[tuple[Any, int]]:
    for token in tokens:
        token_line = token.map[0] + 1 if token.map else line
        yield token, token_line
        if token.children:
            yield from walk_tokens(token.children, token_line)


def parse_document(path: Path, kb: Path) -> tuple[Document | None, list[Issue]]:
    name = path.relative_to(kb).as_posix()
    if not stat.S_ISREG(path.stat().st_mode):
        return None, [Issue("environment", "not_regular_document", name, "Only regular Markdown files can be read")]
    if path.stat().st_size > MAX_DOCUMENT_BYTES:
        return None, [Issue("environment", "document_too_large", name, "Split or explicitly inspect this file; it exceeds 4 MiB")]
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeError:
        return None, [Issue("format", "invalid_utf8", name, "Document is not valid UTF-8")]
    lines = text.splitlines(keepends=True)
    metadata = None
    offset = 0
    issues: list[Issue] = []
    if lines and lines[0].strip() == "---":
        end = next((i for i, line in enumerate(lines[1:], 1) if line.strip() == "---"), None)
        if end is None:
            return None, [Issue("format", "unclosed_frontmatter", name, "Close frontmatter with ---")]
        try:
            metadata = yaml.load("".join(lines[1:end]), Loader=UniqueLoader)
        except yaml.YAMLError as exc:
            mark = getattr(exc, "problem_mark", None)
            return None, [Issue("format", "invalid_yaml", name, "Invalid YAML or duplicate explicit key", line=mark.line + 2 if mark else 1)]
        if not isinstance(metadata, dict):
            return None, [Issue("format", "metadata_not_mapping", name, "Frontmatter must be a mapping")]
        offset = end + 1
    body = "".join(lines[offset:])
    doc = Document(path, name, metadata, body, offset)
    parser = MarkdownIt("commonmark", {"html": True}).enable("table")
    parser.use(footnote_plugin, inline=False, always_match_refs=True, move_to_end=False)
    tokens = parser.parse(body)
    slug_counts: dict[str, int] = {}
    for i, token in enumerate(tokens):
        if token.type == "heading_open" and i + 1 < len(tokens):
            text_heading = tokens[i + 1].content
            line = (token.map[0] + 1 if token.map else 1) + offset
            doc.headings.append((int(token.tag[1:]), text_heading, line))
            slug = re.sub(r"[^\w\- ]", "", text_heading.lower()).replace(" ", "-")
            n = slug_counts.get(slug, 0)
            slug_counts[slug] = n + 1
            doc.anchors.add(slug if n == 0 else f"{slug}-{n}")
        if token.type == "list_item_open":
            doc.list_items += 1
        if token.type == "footnote_reference_open":
            label = token.meta["label"]
            if label in doc.definitions:
                issues.append(Issue("consistency", "duplicate_footnote", name, "Footnote is defined more than once", line=offset + 1))
            doc.definitions.add(label)
    for token, line in walk_tokens(tokens):
        line += offset
        if token.type == "link_open":
            doc.links.append((token.attrGet("href") or "", line))
        elif token.type == "image":
            doc.links.append((token.attrGet("src") or "", line))
        elif token.type == "footnote_ref":
            doc.references.add(token.meta.get("label", ""))
        elif token.type == "text":
            doc.prose.append((token.content, line))
        elif token.type in {"html_inline", "html_block"}:
            html = HtmlLinks()
            html.feed(token.content)
            doc.links.extend((value, line) for value in html.links)
            doc.anchors.update(html.anchors)
    # Do not echo potential secret values into diagnostics.
    if re.search(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----", text):
        issues.append(Issue("security", "private_key_marker", name, "Potential private key material; inspect and remove sensitive content"))
    return doc, issues


def load_documents(bundle: Path, selected: list[str] | None = None) -> tuple[dict[str, Document], list[Issue]]:
    docs: dict[str, Document] = {}
    issues: list[Issue] = []
    def read(path: Path) -> None:
        name = path.relative_to(bundle).as_posix()
        try:
            path = checked_path(bundle, name, bundle)
            name = path.relative_to(bundle).as_posix()
            if path.suffix != ".md":
                raise InputError("Select Markdown documents")
            doc, found = parse_document(path, bundle)
            issues.extend(found)
            if doc is not None:
                docs[name] = doc
        except InputError:
            issues.append(Issue("security", "unsafe_document", name, "Use real Markdown files inside the bundle"))
        except (OSError, ValueError, RecursionError):
            issues.append(Issue("environment", "unreadable_document", name, "Document could not be parsed completely"))
    if selected is not None:
        for name in sorted(set(selected)):
            read(checked_path(bundle, name, bundle))
        return docs, issues
    def inaccessible(error: OSError) -> None:
        issues.append(Issue("environment", "unreadable_directory", ".", "A directory could not be inspected"))
    for base, dirs, files in os.walk(bundle, followlinks=False, onerror=inaccessible):
        dirs.sort()
        for entry in list(dirs):
            path = Path(base) / entry
            if entry in IGNORED_DIRS:
                dirs.remove(entry)
            elif _is_link(path):
                dirs.remove(entry)
                issues.append(Issue("security", "symlink_directory", path.relative_to(bundle).as_posix(), "Symlink or junction directory was not traversed"))
        for entry in sorted(files):
            if entry.endswith(".md"):
                read(Path(base) / entry)
    return docs, issues
