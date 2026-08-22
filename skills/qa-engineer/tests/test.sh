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
    text=source.read_text(encoding='utf-8')
    for match in re.finditer(r'\[[^\]]+\]\(([^)]+)\)', text):
        target=match.group(1)
        if '://' in target or target.startswith('#'):
            continue
        assert (source.parent/target).resolve().exists(), f'broken link: {source} -> {target}'
        links += 1
assert links >= 14, links
assert not list(root.rglob('README.md'))
PY
