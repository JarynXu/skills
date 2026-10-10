# V1 collection with additions

The working directory remains the existing skills repository. The active branch is `feature/skills-v1-plus-additions`, based on V1 `de77253cde775bc624f5de90d33a9a19d2d96464`.

## Active content

- All 14 original skill directories are unchanged from V1, including their references and scripts.
- `coremail`, `natural-writing` and `presentation` are preserved unchanged from the pre-restoration local working tree.
- [maintainable-design](../skills/maintainable-design/) is the independent engineering skill, with its entry, UI metadata and three conditional references.
- The [natural-writing global prompt](natural-writing/AGENTS_WRITING_PROMPT.md) is retained as an optional excerpt, without applying it to any host.

The prior five-file cloud draft of `maintainable-design` was no longer available. Its agreed description and UI short description were retained; the remaining text was faithfully reconstructed from the established scope. This is not a byte-for-byte recovery of that draft, and previous behavioral trials do not validate this newly reconstructed wording.

## Preserved work

- `feature/skills-v2` remains at `2bfdd20`.
- `feature/skills-maintainability` remains at `17b5912` in its existing worktree. It is an optimization branch, not a skill package.
- `preservation/skills-v2-local-20261010` at `ad4f161` preserves the original uncommitted tracked changes and additions, including their previous companion documents, tests and evaluation records.
- `../skills-preservation/20261010-0638-v1-restore/workspace-before.tar` preserves all original working-tree files, including ignored files. The same backup directory contains the original index, binary differences, status, refs and worktree list.

Historical evaluation records were not copied into the active collection as evidence of V1 quality. This restoration neither deletes nor replaces the Git repository and does not merge the V2 or optimization branches into V1.

## Verification scope

Git differences confirm all 14 original package paths match V1 and all three existing additions match the preservation commit. Basic package structure, discovery-table consistency and the reconstructed skill's relative references are checked for this integration. No large model evaluation or SIP test was started; no SHA256 gate, installation, push or remote merge was performed.

Source-linked installations can observe repository changes immediately. No installation configuration was changed. The inspected Windows `designer` and `natural-writing` installations were independent directories; this is not a guarantee about every host's loaded context.
