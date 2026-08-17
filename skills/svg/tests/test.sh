#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
python_command="${SKILLS_PYTHON:-python}"

(
  cd "$ROOT"
  "$python_command" -B -m unittest discover -s tests -p "test_*.py" -v
)
