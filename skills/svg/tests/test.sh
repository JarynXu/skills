#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

python "$ROOT/scripts/svg_preflight.py" \
  "$ROOT/examples/good-diagram.svg" \
  --render "$ROOT/examples/good-diagram.png"

if python "$ROOT/scripts/svg_preflight.py" "$ROOT/examples/bad-entity.svg"; then
  echo "Expected bad-entity.svg to fail" >&2
  exit 1
fi

echo "SVG skill checks passed."
