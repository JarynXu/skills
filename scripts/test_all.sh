#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
found=0

while IFS= read -r test_file; do
  found=1
  echo "==> Running ${test_file#"$ROOT/"}"
  bash "$test_file"
done < <(find "$ROOT/skills" -mindepth 3 -maxdepth 3 -type f -path '*/tests/test.sh' | sort)

if [[ "$found" -eq 0 ]]; then
  echo "No skill test entry points found."
fi
