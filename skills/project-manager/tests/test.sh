#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

python "$ROOT/tests/test_control_plane.py"
python "$ROOT/scripts/offline_library.py" verify
python "$ROOT/scripts/offline_library.py" list | grep -q '^usds-playbook'
python "$ROOT/scripts/offline_library.py" search 'primary users' --source usds-playbook --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'minimum viable product' --source usds-playbook --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'transition-out plan' --source usds-playbook --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'key metrics' --source usds-playbook --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" read usds-playbook/04.md --start 1 --end 6 | grep -q 'agile and iterative practices'

python - "$ROOT" <<'PY'
from pathlib import Path
import re,sys
root=Path(sys.argv[1])
skill=(root/'SKILL.md').read_text(encoding='utf-8')
assert skill.startswith('---\nname: project-manager\ndescription: ')
for term in (
    'governance','scope','schedule','cost','EVM','stakeholder','risk','change','predictive','agile','hybrid','benefit',
    'inspect_project_system.py','plan_project_controls.py','project_metrics.py'
):
    assert term.lower() in skill.lower(),term

required=[
 'references/core/project-truth-and-authority.md',
 'references/core/adaptive-management-system.md',
 'references/practices/scope-requirements-and-change.md',
 'references/practices/schedule-estimation-and-dependencies.md',
 'references/practices/cost-resources-and-procurement.md',
 'references/practices/risk-decisions-stakeholders-and-communications.md',
 'references/practices/quality-acceptance-release-and-transition.md',
 'references/practices/agile-flow-and-hybrid-delivery.md',
 'references/practices/project-recovery-closure-and-benefits.md',
 'references/technologies/control-plane.md',
 'references/technologies/tool-routing.md',
 'references/complete-learning-path.md',
]
for rel in required:
    path=root/rel
    assert path.is_file() and path.stat().st_size>500,rel
    assert f'({rel})' in skill or rel=='references/complete-learning-path.md',rel

assert (root/'agents'/'openai.yaml').is_file()
assert (root/'references'/'library'/'INDEX.md').is_file()
manifest=root/'references'/'library'/'originals'/'usds-playbook'/'SOURCE.json'
assert manifest.is_file()

links=0
for source in root.rglob('*.md'):
    if 'references/library/originals/' in source.as_posix():
        continue
    text=source.read_text(encoding='utf-8')
    for match in re.finditer(r'\[[^\]]+\]\(([^)]+)\)',text):
        target=match.group(1)
        if '://' in target or target.startswith('#'):
            continue
        assert (source.parent/target).resolve().exists(),f'broken link: {source} -> {target}'
        links+=1
assert links>=12,links
PY

echo "project-manager tests passed"
