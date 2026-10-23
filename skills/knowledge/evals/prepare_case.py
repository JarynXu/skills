#!/usr/bin/env python3
"""仅生成隔离任务输入；评审依据不进入任务工作区。"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tests"))
from fixtures import build

parser = argparse.ArgumentParser()
parser.add_argument("case", help="ID from cases.json")
parser.add_argument("--output", required=True, type=Path, help="New or empty isolated directory; never a live application project")
args = parser.parse_args()
cases = json.loads((Path(__file__).parent / "cases.json").read_text(encoding="utf-8"))["cases"]
case = next((c for c in cases if c["id"] == args.case), None)
if case is None:
    parser.error("Unknown case ID")
project = Path(__file__).resolve().parents[3]
output = args.output.expanduser().absolute()
if output.is_relative_to(project) or output.is_symlink() or output.parent.resolve() != output.parent:
    parser.error("Refusing to create fixture in a live knowledge location")
build(output, case["fixture"])
(output / "TASK.txt").write_text(case["task"] + "\n", encoding="utf-8")
print(json.dumps({"case": case["id"], "workspace": str(output), "task": case["task"]}, ensure_ascii=False))
