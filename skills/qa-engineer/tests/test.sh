#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/tests/api" "$TMP/tests/e2e" "$TMP/.github/workflows"
cat > "$TMP/package.json" <<'EOF'
{"devDependencies":{"@playwright/test":"1","vitest":"3","newman":"6","@axe-core/playwright":"4","allure-playwright":"3","testcontainers":"10"},"scripts":{"test":"vitest","e2e":"playwright test"}}
EOF
cat > "$TMP/playwright.config.ts" <<'EOF'
import { defineConfig } from '@playwright/test'; export default defineConfig({});
EOF
cat > "$TMP/tests/api/contract.test.ts" <<'EOF'
// pact wiremock schemathesis
EOF
cat > "$TMP/tests/e2e/user.spec.ts" <<'EOF'
// playwright axe-core
EOF
cat > "$TMP/load.js" <<'EOF'
import http from 'k6/http';
EOF
cat > "$TMP/security.yml" <<'EOF'
tool: owasp-zap
EOF
cat > "$TMP/.github/workflows/ci.yml" <<'EOF'
name: test
EOF
python "$ROOT/scripts/inspect_test_system.py" "$TMP" > "$TMP/result.json"
python - "$TMP/result.json" <<'PY'
import json,sys
p=json.load(open(sys.argv[1],encoding='utf-8'))
assert 'playwright' in p['ui_and_device'],p
assert 'vitest' in p['unit_and_code'],p
assert {'postman-newman','pact','wiremock','testcontainers'} <= set(p['api_contract_virtualization']),p
assert 'k6' in p['performance_resilience'],p
assert {'axe','owasp-zap'} <= set(p['security_accessibility']),p
assert 'allure' in p['reporting_coverage'],p
assert 'github-actions' in p['ci'],p
PY
python "$ROOT/scripts/inspect_test_system.py" "$TMP" --format text >/dev/null
if python "$ROOT/scripts/inspect_test_system.py" "$TMP/missing" >/dev/null 2>&1; then
  echo "expected missing directory to fail" >&2; exit 1
fi

python "$ROOT/tests/test_control_plane.py"
python "$ROOT/tests/test_library_catalog.py"
python "$ROOT/scripts/sync_library_catalogs.py" --list-source-ids > "$TMP/source-ids.txt"

EXPECTED_SOURCES=(
  owasp-cheat-sheet-series
  playwright-test-docs
  selenium-test-practices
  pact-specification
  pytest-core-docs
  hypothesis-property-testing
  testcontainers-core-docs
  owasp-wstg
)

LIB_LIST="$(python "$ROOT/scripts/offline_library.py" list)"
for source in "${EXPECTED_SOURCES[@]}"; do
  grep -qx "$source" "$TMP/source-ids.txt"
  grep -q "^${source}[[:space:]]" <<<"$LIB_LIST"
  grep -q "^${source}.*agent_ready=True" <<<"$LIB_LIST"
done

python "$ROOT/scripts/offline_library.py" verify | grep -q 'agent-ready Markdown'

# Source-backed semantics must be searchable in the processed agent layer.
python "$ROOT/scripts/offline_library.py" search "authorization matrix" --source owasp-cheat-sheet-series --limit 5 >/dev/null
python "$ROOT/scripts/offline_library.py" search "auto-retrying assertions" --source playwright-test-docs --limit 5 >/dev/null
python "$ROOT/scripts/offline_library.py" search "sharing state" --source selenium-test-practices --limit 5 >/dev/null
python "$ROOT/scripts/offline_library.py" search "provider" --source pact-specification --limit 5 >/dev/null
python "$ROOT/scripts/offline_library.py" search "fixture" --source pytest-core-docs --limit 5 >/dev/null
python "$ROOT/scripts/offline_library.py" search "shrink" --source hypothesis-property-testing --limit 5 >/dev/null
python "$ROOT/scripts/offline_library.py" search "wait strategy" --source testcontainers-core-docs --limit 5 >/dev/null
python "$ROOT/scripts/offline_library.py" search "Authorization Testing" --source owasp-wstg --limit 5 >/dev/null

python "$ROOT/scripts/offline_library.py" read playwright-test-docs/docs/src/test-assertions-js.md --start 1 --end 8 | grep -q '# layer=processed'
python "$ROOT/scripts/offline_library.py" read pytest-core-docs/doc/en/how-to/fixtures.rst --original --start 1 --end 3 | grep -q '# layer=original'

if python "$ROOT/scripts/offline_library.py" read '../escape' >/dev/null 2>&1; then
  echo "expected unsafe library path to fail" >&2
  exit 1
fi

echo "qa-engineer tests passed"
python - "$ROOT" <<'PY'
from pathlib import Path
import re, sys
root=Path(sys.argv[1])
skill=(root/'SKILL.md').read_text(encoding='utf-8')
assert skill.startswith('---\nname: qa-engineer\ndescription: ')
for required in ('smoke', 'regression', 'performance', 'UAT', 'release recommendation', 'production validation'):
    assert required.lower() in skill.lower(), required
links=0
for source in root.rglob('*.md'):
    posix=source.as_posix()
    # Third-party library content keeps upstream relative links/provenance and is
    # validated by offline_library.py rather than the authored-doc link audit.
    if 'references/library/originals/' in posix or 'references/library/processed/' in posix:
        continue
    text=source.read_text(encoding='utf-8')
    for match in re.finditer(r'\[[^\]]+\]\(([^)]+)\)', text):
        target=match.group(1)
        if '://' in target or target.startswith('#'):
            continue
        assert (source.parent/target).resolve().exists(), f'broken link: {source} -> {target}'
        links += 1
assert links >= 16, links
authored_readmes=[p for p in root.rglob('README.md') if 'references/library/' not in p.as_posix()]
assert not authored_readmes, authored_readmes
PY
