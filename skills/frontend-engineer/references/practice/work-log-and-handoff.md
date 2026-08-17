# Work log and handoff

Maintain enough execution memory for continuity, review, and recovery without turning project documentation into a transcript of commands or hidden reasoning.

## Keep a working log for non-trivial work

Use the project's existing issue, task, development log, decision record, or knowledge system. If none exists, keep concise task-local notes and promote only durable information at the end.

Record when relevant:

- Current objective, scope, and non-goals.
- Product or architecture facts established from evidence.
- Decisions made and constraints that drove them.
- Material implementation increments completed.
- Baseline failures, blockers, changed assumptions, and scope changes.
- Verification run, outcomes, warnings, and untested boundaries.
- Follow-up work that is genuinely separate from the task.

Update at meaningful checkpoints, not after every command. The log should let another engineer resume safely and understand why the current boundary exists.

## Do not preserve process noise

Exclude:

- Raw command and search history.
- Temporary hypotheses already disproved.
- Hidden chain-of-thought or private deliberation.
- Tool-specific scaffolding with no effect on correctness or reproducibility.
- Repeated status that does not change the state of the work.
- Project history copied into a new location without a maintenance owner.

Keep a command only when it is the stable, reproducible verification or operational procedure the project needs.

## Promote knowledge deliberately

At the end of the task, classify new information:

- Keep ephemeral investigation details task-local.
- Update existing project docs when a stable product fact, setup requirement, convention, runbook step, or architecture decision changed.
- Add a regression test when the durable lesson is executable behavior.
- Add a static script only for deterministic repeated evidence collection.
- Propose broader reusable skill guidance only after the lesson is validated beyond one project's circumstances.

Do not invent a new documentation system merely to record one change.

## Prepare the handoff

Lead with outcomes:

1. What behavior now exists or what diagnosis was established.
2. Which important boundaries or files changed.
3. What verification passed and what each check proves.
4. What was not tested, why, and the resulting risk.
5. Any migration, deployment, data, coordination, or follow-up requirement.

For audit-only work, lead with findings by impact and include scope and evidence. For implementation work, distinguish completed behavior from recommendations.

## Final hygiene

Before handoff:

- Review the diff and worktree for unrelated user changes.
- Remove temporary dependencies, debug output, screenshots, generated files, and experiments unless intentionally delivered.
- Confirm comments and documents describe the final system rather than the construction process.
- Ensure the plan, issue, or log does not claim checks that were not run.
- Leave the repository in a state another engineer can understand and verify.
