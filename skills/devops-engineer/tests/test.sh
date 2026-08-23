#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

python "$ROOT/tests/test_control_plane.py"
python "$ROOT/tests/test_library_catalog.py"
python "$ROOT/scripts/offline_library.py" verify
python "$ROOT/tests/test_library_ready.py"
python "$ROOT/scripts/offline_library.py" read oci-runtime/runtime.md --start 1 --end 8 | grep -q 'Runtime and Lifecycle'

python - "$ROOT" <<'PY'
from pathlib import Path
import re, sys
root = Path(sys.argv[1])
skill = (root / 'SKILL.md').read_text(encoding='utf-8')
assert skill.startswith('---\nname: devops-engineer\ndescription: ')
for term in (
    'CI/CD', 'Kubernetes', 'GitOps', 'infrastructure as code', 'observability',
    'rollback', 'supply-chain', 'inspect_delivery_system.py', 'plan_delivery_checks.py'
):
    assert term.lower() in skill.lower(), term

required = [
    'references/core/project-orientation.md',
    'references/core/change-and-execution-model.md',
    'references/practices/ci-cd-and-artifacts.md',
    'references/practices/containers-kubernetes-and-gitops.md',
    'references/practices/infrastructure-as-code.md',
    'references/practices/configuration-secrets-and-identity.md',
    'references/practices/observability-and-release-verification.md',
    'references/practices/supply-chain-and-policy.md',
    'references/practices/change-recovery-and-production-operations.md',
    'references/technologies/control-plane.md',
    'references/technologies/tool-routing.md',
    'references/complete-learning-path.md',
    'references/library/INDEX.md',
    'references/library/SOURCES.json',
    'references/library/SOURCES.lock.json',
]
for rel in required:
    path = root / rel
    assert path.is_file() and path.stat().st_size > 100, rel

assert (root / 'agents' / 'openai.yaml').is_file()
assert len(list((root / 'references' / 'library' / 'originals').glob('*/SOURCE.json'))) == 12
assert len([p for p in (root / 'references' / 'library' / 'processed').glob('*') if p.is_dir()]) == 12

# Authored relative links must resolve. Third-party originals/processed derivatives preserve upstream links separately.
links = 0
for source in root.rglob('*.md'):
    posix = source.as_posix()
    if 'references/library/originals/' in posix or 'references/library/processed/' in posix:
        continue
    text = source.read_text(encoding='utf-8')
    for match in re.finditer(r'\[[^\]]+\]\(([^)]+)\)', text):
        target = match.group(1)
        if '://' in target or target.startswith('#'):
            continue
        assert (source.parent / target).resolve().exists(), f'broken link: {source} -> {target}'
        links += 1
assert links >= 12, links
PY

echo "devops-engineer tests passed"
