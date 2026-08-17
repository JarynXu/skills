#!/usr/bin/env bash
set -euo pipefail

SKILL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FIXTURES="$SKILL_ROOT/tests/fixtures"

report="$(node "$SKILL_ROOT/scripts/collect-frontend-evidence.mjs" "$FIXTURES/project")"
node -e '
const report = JSON.parse(process.argv[1])
const expected = {
  inlineStyle: 1,
  nativeInteractiveElement: 1,
  workMarker: 1,
}

if (report.package?.name !== "frontend-evidence-fixture") {
  throw new Error("collector did not read package metadata")
}
if (report.sourceFileCount !== 1 || report.routeCandidates[0] !== "src/pages/index.tsx") {
  throw new Error("collector did not inventory the fixture route")
}
for (const [signal, count] of Object.entries(expected)) {
  if (report.signalCounts[signal] !== count) {
    throw new Error(`unexpected ${signal} count: ${report.signalCounts[signal]}`)
  }
}
' "$report"

node "$SKILL_ROOT/scripts/compare-json-locales.mjs" \
  "$FIXTURES/locales/en.json" \
  "$FIXTURES/locales/fr.json" >/dev/null

if node "$SKILL_ROOT/scripts/compare-json-locales.mjs" \
  "$FIXTURES/locales/en.json" \
  "$FIXTURES/locales/invalid.json" >/dev/null 2>&1; then
  echo "Expected locale mismatch to fail" >&2
  exit 1
fi

echo "frontend-engineer scripts passed"
