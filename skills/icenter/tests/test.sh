#!/usr/bin/env bash
set -euo pipefail
SKILL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
node --test "$SKILL_ROOT"/tests/*.test.cjs "$SKILL_ROOT"/scripts/tests/*.test.cjs
