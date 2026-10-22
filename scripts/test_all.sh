#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
found=0

while IFS= read -r test_file; do
  found=1
  echo "==> Running ${test_file#"$ROOT/"}"
  bash "$test_file"
done < <(find "$ROOT/skills" -mindepth 3 -maxdepth 3 -type f -path '*/tests/test.sh' | sort)

if [[ -d "$ROOT/scripts/tests" ]]; then
  mapfile -t integration_tests < <(find "$ROOT/scripts/tests" -maxdepth 1 -type f -name '*.test.cjs' | sort)
  if [[ "${#integration_tests[@]}" -gt 0 ]]; then
    found=1
    echo "==> Running repository integration tests"
    node --test "${integration_tests[@]}"
  fi
fi

if [[ "$found" -eq 0 ]]; then
  echo "No skill test entry points found."
fi
