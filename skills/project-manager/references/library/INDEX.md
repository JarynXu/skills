# Project Manager offline reference library

This library separates redistributable offline originals from standards that must be consulted from an authorized source.

## Bundled source

`usds-playbook` is a selected mirror of the U.S. Digital Services Playbook pinned to commit `f5d71f1939efe87db9f0be414bcfa7c489e01c19`. The upstream repository states that it is a work of the United States Government in the public domain within the United States and additionally dedicates rights worldwide through CC0 1.0.

Bundled plays:

- `01.md` — understand what people need;
- `04.md` — agile and iterative delivery;
- `05.md` — budgets and contracts that support delivery;
- `12.md` — use data to drive decisions.

Use the local tool for narrow lookup:

```bash
python scripts/offline_library.py list
python scripts/offline_library.py search "primary users" --source usds-playbook
python scripts/offline_library.py search "minimum viable product" --source usds-playbook
python scripts/offline_library.py search "transition-out plan" --source usds-playbook
python scripts/offline_library.py search "key metrics" --source usds-playbook
python scripts/offline_library.py verify
```

## Open authoritative material not mirrored here

The European Commission PM² portal publishes openly accessible PM² Project Management guides and artefacts. As of 2026-08-23, the official resources page lists PM² Project Management Guide v3.1 and v3.1 project-management artefacts; the artefacts aligned with v3.1 were announced on 2026-03-09. These resources are distributed primarily as downloadable documents, so this repository records the source rather than claiming a connector-normalized copy is an exact offline original.

Canonical entry: `https://pm2.europa.eu/pm2-resources_en`

## Restricted or separately licensed standards

Do not copy proprietary standards into this skill merely because they are useful. PMI publications (including PMBOK/PMP examination source material), ISO standards, PRINCE2 publications, contracts, organizational process assets, and customer-specific standards must be used from authorized copies and in the exact edition adopted by the project.

The skill's authored guidance is an independent operational model. It is not a substitute, translation, or reproduction of any restricted standard.
