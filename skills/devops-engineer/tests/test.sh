#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

python "$ROOT/scripts/offline_library.py" verify
python "$ROOT/scripts/offline_library.py" list | grep -q '^kubernetes'
python "$ROOT/scripts/offline_library.py" list | grep -q '^opentelemetry'
python "$ROOT/scripts/offline_library.py" list | grep -q '^oci-runtime'
python "$ROOT/scripts/offline_library.py" list | grep -q '^slsa'
python "$ROOT/scripts/offline_library.py" search 'current-context' --source kubernetes --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'unhandled exceptions' --source opentelemetry --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'container process' --source oci-runtime --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'Build L3' --source slsa --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" read oci-runtime/runtime.md --start 1 --end 8 | grep -q 'Runtime and Lifecycle'

python - "$ROOT" <<'PY'
from pathlib import Path
import sys
root = Path(sys.argv[1])
skill = (root / 'SKILL.md').read_text(encoding='utf-8')
assert skill.startswith('---\nname: devops-engineer\ndescription: ')
for term in ('CI/CD', 'Kubernetes', 'infrastructure as code', 'observability', 'rollback', 'supply-chain'):
    assert term.lower() in skill.lower(), term
assert (root / 'agents' / 'openai.yaml').is_file()
assert (root / 'references' / 'library' / 'LICENSES' / 'Apache-2.0.txt').is_file()
assert len(list((root / 'references' / 'library' / 'originals').glob('*/SOURCE.json'))) == 4
PY

echo "devops-engineer tests passed"
