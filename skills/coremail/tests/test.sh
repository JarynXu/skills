#!/usr/bin/env bash
set -euo pipefail

SKILL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
python -m unittest discover -s "$SKILL_ROOT/tests" -p 'test_*.py' -v
node --test "$SKILL_ROOT/tests/test_client.cjs"
