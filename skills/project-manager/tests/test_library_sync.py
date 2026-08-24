#!/usr/bin/env python3
"""Contracts for project-manager library source synchronization."""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "sync_project_library.py"

spec = importlib.util.spec_from_file_location("pm_sync", SCRIPT)
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)


def rejected(url: str) -> bool:
    try:
        module.validate_public_https_url(url)
    except Exception:
        return True
    return False


def main() -> None:
    catalog = module.load_catalog()
    assert len(catalog["sources"]) == 7
    ids = [source["source_id"] for source in catalog["sources"]]
    assert len(ids) == len(set(ids))
    assert rejected("http://example.com/file.pdf")
    assert rejected("https://localhost/file.pdf")
    assert rejected("https://127.0.0.1/file.pdf")
    assert rejected("https://10.0.0.1/file.pdf")
    module.validate_public_https_url("https://www.gao.gov/assets/gao-20-195g.pdf")
    for source in catalog["sources"]:
        kind = source.get("kind", "github")
        if kind == "url":
            assert source.get("version")
            for include in source["includes"]:
                assert include["path"].endswith(".pdf")
                module.validate_public_https_url(include["url"])
                expected = include.get("expected_sha256")
                assert isinstance(expected, str) and len(expected) == 64, (source["source_id"], include)
                int(expected, 16)
        else:
            assert source["repo"] == "usds/playbook"
            assert len(source["ref"]) == 40
    print("project-manager library sync contracts passed")


if __name__ == "__main__":
    main()
