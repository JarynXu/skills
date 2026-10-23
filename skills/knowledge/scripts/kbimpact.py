"""Trace declared evidence dependencies separately from ordinary navigation links."""
from __future__ import annotations

from collections import deque
from pathlib import PurePath
from typing import Mapping, Sequence


def overlaps(source: PurePath, changed: PurePath) -> bool:
    """目录来源包含后代，目录变更涵盖其内部来源。"""
    return source.is_relative_to(changed) or changed.is_relative_to(source)


def impact(source_users: Mapping[str, Sequence[str]], links: Mapping[str, Sequence[str]],
           changed: Sequence[str], bundle_prefix: str) -> dict[str, list[str]]:
    """按宿主平台的路径规则追踪声明依赖，保留文档名的大小写。

    sources 的派生关系参与传播；普通导航链接不成为事实依赖。
    缺失来源仍参与比较，支持删除后的影响分析。
    """
    sources = [(PurePath(source), {PurePath(doc) for doc in docs}) for source, docs in source_users.items()]
    navigation = {PurePath(doc): {PurePath(target) for target in targets} for doc, targets in links.items()}
    changes = [PurePath(path) for path in changed]
    prefix = PurePath(bundle_prefix)

    def readers(paths: Sequence[PurePath]) -> set[PurePath]:
        return {doc for source, docs in sources if any(overlaps(source, path) for path in paths) for doc in docs}

    direct = readers(changes)
    affected = set(direct)
    pending = deque(sorted(direct))
    while pending:
        doc = pending.popleft()
        path = prefix / doc
        for reader in sorted(readers([path]) - affected):
            affected.add(reader)
            pending.append(reader)

    # Also find hyperlinks to moved/deleted documents even when no source points at them.
    link_seeds = set(affected)
    for targets in navigation.values():
        for target in targets:
            if any(overlaps(prefix / target, item) for item in changes):
                link_seeds.add(target)
    linked = set(link_seeds)
    while True:
        parents = {doc for doc, targets in navigation.items() if linked.intersection(targets)}
        additions = parents - linked
        if not additions:
            break
        linked.update(additions)
    return {
        "direct": sorted(path.as_posix() for path in direct),
        "derived": sorted(path.as_posix() for path in affected - direct),
        "link_references": sorted(path.as_posix() for path in (linked - link_seeds) - affected),
    }
