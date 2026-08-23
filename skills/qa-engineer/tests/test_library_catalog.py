#!/usr/bin/env python3
"""Static contract for the QA offline-source catalog and discoverability routes."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "references" / "library"
CATALOG = LIBRARY / "SOURCES.json"
EXPECTED = {
    "owasp-cheat-sheet-series": "OWASP/CheatSheetSeries",
    "playwright-test-docs": "microsoft/playwright",
    "selenium-test-practices": "SeleniumHQ/seleniumhq.github.io",
    "pact-specification": "pact-foundation/pact-specification",
    "pytest-core-docs": "pytest-dev/pytest",
    "hypothesis-property-testing": "HypothesisWorks/hypothesis",
    "testcontainers-core-docs": "testcontainers/testcontainers-java",
    "owasp-wstg": "OWASP/wstg",
}
LICENSE_NAMES = {"license", "license.md", "license.txt", "copying", "copyright"}


def main() -> None:
    payload = json.loads(CATALOG.read_text(encoding="utf-8"))
    assert payload["schema_version"] == 1
    sources = payload["sources"]
    assert isinstance(sources, list) and sources
    by_id = {source["source_id"]: source for source in sources}
    assert set(by_id) == set(EXPECTED), (set(by_id), set(EXPECTED))

    for source_id, repo in EXPECTED.items():
        source = by_id[source_id]
        assert source["repo"] == repo, (source_id, source["repo"])
        assert isinstance(source.get("ref"), str) and source["ref"]
        assert isinstance(source.get("license"), str) and source["license"]
        assert isinstance(source.get("tier"), str) and source["tier"]
        assert isinstance(source.get("tracks"), list) and source["tracks"]
        includes = source.get("includes")
        assert isinstance(includes, list) and includes
        paths = [item["path"] for item in includes]
        assert len(paths) == len(set(paths)), (source_id, paths)
        assert any(Path(path).name.lower() in LICENSE_NAMES for path in paths), (source_id, paths)
        for item in includes:
            path = item["path"]
            assert path and not path.startswith("/") and ".." not in Path(path).parts
            if item.get("recursive"):
                assert path not in {"docs", "doc", "document", "website_and_docs", "guides"}, (
                    source_id,
                    "recursive selection is too broad",
                    path,
                )

    selenium = [item["path"] for item in by_id["selenium-test-practices"]["includes"] if item["path"].endswith(".md")]
    assert all(path.endswith(".en.md") for path in selenium), selenium

    wstg_paths = [item["path"] for item in by_id["owasp-wstg"]["includes"]]
    assert "document/4-Web_Application_Security_Testing" not in wstg_paths
    for required in (
        "document/3-The_OWASP_Testing_Framework",
        "document/4-Web_Application_Security_Testing/05-Authorization_Testing",
        "document/4-Web_Application_Security_Testing/07-Input_Validation_Testing",
        "document/4-Web_Application_Security_Testing/10-Business_Logic_Testing",
        "document/4-Web_Application_Security_Testing/12-API_Testing",
        "document/5-Reporting",
    ):
        assert required in wstg_paths, required

    playwright_paths = {item["path"] for item in by_id["playwright-test-docs"]["includes"]}
    assert {
        "docs/src/best-practices-js.md",
        "docs/src/test-fixtures-js.md",
        "docs/src/test-assertions-js.md",
        "docs/src/accessibility-testing-js.md",
    } <= playwright_paths

    # Source packs must be discoverable from the normal QA learning/lookup routes.
    index = (LIBRARY / "INDEX.md").read_text(encoding="utf-8")
    for source_id in EXPECTED:
        assert f"`{source_id}`" in index, source_id
    learning = (ROOT / "references" / "complete-learning-path.md").read_text(encoding="utf-8")
    standards = (ROOT / "references" / "standards" / "index.md").read_text(encoding="utf-8")
    assert "library/INDEX.md" in learning
    assert "../library/INDEX.md" in standards
    assert "sync-qa-library.yml" in standards

    print("qa offline catalog and routing contract passed")


if __name__ == "__main__":
    main()
