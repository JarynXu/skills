#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

python "$ROOT/scripts/offline_library.py" verify
python "$ROOT/scripts/offline_library.py" list | grep -q '^usds-playbook'
python "$ROOT/scripts/offline_library.py" search 'primary users' --source usds-playbook --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'minimum viable product' --source usds-playbook --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'transition-out plan' --source usds-playbook --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'key metrics' --source usds-playbook --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" read usds-playbook/04.md --start 1 --end 6 | grep -q 'agile and iterative practices'

python - "$ROOT" <<'PY'
from pathlib import Path
import sys
root = Path(sys.argv[1])
skill = (root / 'SKILL.md').read_text(encoding='utf-8')
assert skill.startswith('---\nname: project-manager\ndescription: ')
for term in ('governance', 'scope', 'schedule', 'budget', 'stakeholder', 'risk', 'change', 'predictive', 'agile', 'hybrid', 'benefit'):
    assert term.lower() in skill.lower(), term
assert (root / 'agents' / 'openai.yaml').is_file()
assert (root / 'references' / 'library' / 'INDEX.md').is_file()
manifest = root / 'references' / 'library' / 'originals' / 'usds-playbook' / 'SOURCE.json'
assert manifest.is_file()
PY

echo "project-manager tests passed"
