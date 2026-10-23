#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
export PYTHONDONTWRITEBYTECODE=1
"${PYTHON:-python3}" -m unittest discover -s "$HERE" -p 'test_*.py'
