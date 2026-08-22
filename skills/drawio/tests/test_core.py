from __future__ import annotations

import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SKILL_ROOT / "scripts"))

from drawio_lib import *


def assert_offline_bundle() -> None:
    books = {
        "references/library/mxfile.xsd": (1500, "<xs:schema"),
        "references/library/style-reference.md": (30000, "# draw.io Style Reference"),
        "references/library/xml-reference.md": (30000, "# draw.io XML Reference"),
    }
    for relative, (minimum_bytes, marker) in books.items():
        path = SKILL_ROOT / relative
        assert path.is_file(), f"missing bundled offline reference: {relative}"
        data = path.read_bytes()
        assert len(data) >= minimum_bytes, f"bundled reference looks truncated: {relative}"
        assert marker in data.decode("utf-8"), f"unexpected bundled reference content: {relative}"

    skill_text = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
    for target in re.findall(r"\]\((references/[^)#]+(?:#[^)]+)?)\)", skill_text):
        relative = target.split("#", 1)[0]
        assert (SKILL_ROOT / relative).exists(), f"SKILL.md points to missing local reference: {relative}"


def main() -> None:
    assert_offline_bundle()

    with tempfile.TemporaryDirectory() as td:
        p = Path(td)
        root, pages = new("Test")
        model = pages[0][1]
        add_vertex(model, "a", "A", 10, 20, 120, 60, style("node.service"))
        add_vertex(model, "b", "B", 300, 20, 120, 60, style("node.data"))
        add_edge(model, "e", "a", "b", "reads", style("edge.data"))
        assert not validate(pages)

        source = p / "a.drawio"
        save(root, pages, source, "uncompressed")
        root2, pages2 = load(source)
        assert len(inspect(pages2)[0]["cells"]) == 5

        packed = p / "p.drawio"
        save(root2, pages2, packed, "compressed")
        _, pages3 = load(packed)
        assert not validate(pages3)

        before = load(source)[1]
        patch(pages2, {"operations": [{"op": "set-label", "id": "a", "value": "AA"}]})
        assert semantic_diff(before, pages2)[0]["kind"] == "label-changed"
        layout(pages2, "vertical")
        assert validate(pages2) == []

        cli = SKILL_ROOT / "scripts" / "drawio.py"
        diff = subprocess.run(
            [sys.executable, str(cli), "diff", str(source), str(source), "--json"],
            capture_output=True,
            text=True,
            check=False,
        )
        assert diff.returncode == 0, diff.stderr
        assert json.loads(diff.stdout)["changed"] is False

    print("drawio core tests passed")


if __name__ == "__main__":
    main()
