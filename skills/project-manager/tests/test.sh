#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

python "$ROOT/tests/test_control_plane.py"
python "$ROOT/tests/test_library_sync.py"
python "$ROOT/tests/test_library.py"
python "$ROOT/scripts/offline_library.py" verify
python "$ROOT/scripts/offline_library.py" list | grep -q '^usds-playbook'
python "$ROOT/scripts/offline_library.py" list | grep -q '^scrum-guide-2020'
python "$ROOT/scripts/offline_library.py" list | grep -q '^open-guide-to-kanban-2025-7'
python "$ROOT/scripts/offline_library.py" list | grep -q '^gao-agile-assessment'
python "$ROOT/scripts/offline_library.py" list | grep -q '^gao-schedule-assessment'
python "$ROOT/scripts/offline_library.py" list | grep -q '^gao-cost-estimating'
python "$ROOT/scripts/offline_library.py" list | grep -q '^pm2-project-management'
python "$ROOT/scripts/offline_library.py" search 'primary users' --source usds-playbook --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'Sprint Goal' --source scrum-guide-2020 --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'flow' --source open-guide-to-kanban-2025-7 --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'best practices' --source gao-agile-assessment --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'critical path' --source gao-schedule-assessment --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'earned value management' --source gao-cost-estimating --limit 1 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'governance' --source pm2-project-management --limit 1 >/dev/null

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
 'references/library/INDEX.md',
 'references/library/curriculum.md',
 'references/library/restricted-canon.md',
]
for rel in required:
    path=root/rel
    assert path.is_file() and path.stat().st_size>500,rel

assert (root/'agents'/'openai.yaml').is_file()
assert (root/'references'/'library'/'SOURCES.json').is_file()
assert (root/'references'/'library'/'SOURCES.lock.json').is_file()
assert len(list((root/'references'/'library'/'originals').glob('*/SOURCE.json'))) == 7
assert len([p for p in (root/'references'/'library'/'processed').iterdir() if p.is_dir()]) == 7

links=0
for source in root.rglob('*.md'):
    if 'references/library/originals/' in source.as_posix() or 'references/library/processed/' in source.as_posix():
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
