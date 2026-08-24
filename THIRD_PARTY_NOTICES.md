# Third-Party Notices

This repository contains both repository-authored material and redistributed third-party reference material. The repository-level MIT license applies to the repository-authored material only to the extent the repository has the right to license it. Third-party material retains its own copyright, public-domain status, license terms, attribution requirements, and disclaimers; it is **not** relicensed under the repository MIT license merely because it is stored here.

## Draw.io reference material

The `drawio` skill contains draw.io reference material derived from JGraph's `drawio-mcp` project, pinned during authoring to commit `14b318b19cc37b159f841227b9d11fbd18ce18ea`. Runtime reference material lives under `skills/drawio/references/library/`.

JGraph drawio-mcp is distributed under the Apache License, Version 2.0. See `THIRD_PARTY_LICENSES/drawio-mcp-APACHE-2.0.txt`.

## Offline professional reference libraries

The following skills contain curated offline reference libraries with exact or source-backed third-party originals and generated agent-ready derivatives:

- `skills/backend-engineer/references/library/`
- `skills/qa-engineer/references/library/`
- `skills/devops-engineer/references/library/`
- `skills/project-manager/references/library/`

For each library:

- `SOURCES.json` records the reviewed upstream owner/project, source, version/ref, license/status, selection scope, and intended learning tracks.
- `SOURCES.lock.json` records the resolved revisions or content hashes used for the installed library state.
- `originals/<source-id>/SOURCE.json` records source-specific provenance, local paths, integrity identifiers, inclusion/processing status, and other attribution metadata.
- `originals/` preserves source material according to its source-specific terms.
- `processed/` contains generated teaching/search derivatives and includes provenance back to the exact source material. These derivatives remain subject to applicable source-license obligations; generating Markdown does not relicense the underlying work.

The libraries include material under multiple terms, including Apache-2.0, MIT, MPL-2.0, Creative Commons licenses such as CC BY 4.0 and CC BY-SA 4.0, the SLSA Community Specification License 1.0, and U.S. Government/public-domain material. Some source packs may contain additional notices or third-party components whose original terms are preserved in the source pack. Consult the applicable `SOURCES.json` and `SOURCE.json` before redistribution or modification.

The skills also maintain restricted-canon/source maps for important proprietary or non-redistributable standards and books. Those works are referenced for learning context but are not intentionally vendored without confirmed redistribution rights.

## No endorsement

Bundling or referencing a third-party source does not imply endorsement by the source owner, and the repository does not claim ownership of third-party trademarks or protected material.
