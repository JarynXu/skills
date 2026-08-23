# Perform backend production operations

Use this workflow only for an explicitly authorized runtime action: deployment, migration execution, traffic change, cache/queue/database mutation, secret/configuration change, replay/backfill, repair, restart, scaling, rollback, or external-service action.

Knowing how to run a command is not authorization to run it.

## Establish the operation contract

Before any mutation, confirm from the user/task/environment:

- exact system, account/project, cluster, region, namespace, database or service;
- intended environment;
- requested result;
- allowed change window/scope;
- credentials or tool context actually selected;
- current state;
- dependencies and blast radius;
- backup/recovery or safe forward path;
- rollback trigger and mechanism;
- post-action verification.

If the target or authority is materially ambiguous, stop before the mutation. Do not guess “production” versus staging, account, region, database, tenant or resource.

## Inspect before changing

Prefer read-only commands first. Capture enough state to compare after the action:

- deployed version/configuration;
- health and traffic;
- database/schema/migration state;
- queue/lag/backlog;
- error/latency/saturation;
- replicas/instances;
- feature flags;
- relevant checksums/counts/invariants.

Use plan/dry-run/diff modes when available. Confirm that the plan affects only the intended resources.

## Minimize the blast radius

Prefer the narrowest mechanism that can achieve the requested result:

- canary or one instance before fleet;
- one tenant/partition/batch before all;
- bounded replay/backfill;
- reversible feature/config switch;
- rate-limited migration;
- phased traffic movement.

Do not combine unrelated maintenance with an incident or requested operation.

## Execute with explicit observation

During the action monitor the signals that can falsify success:

- application errors and key business outcomes;
- latency and saturation;
- dependency/database/broker health;
- migration progress and data invariants;
- resource utilization and queue growth;
- version/configuration convergence.

Pause or rollback when a predefined trigger is crossed. “Command returned 0” is not sufficient evidence when the desired state is external.

## Handle destructive actions specially

For delete/drop/truncate/purge/revoke/overwrite/replay-with-side-effects or other difficult-to-reverse actions:

- require explicit authorization for the destructive outcome;
- enumerate exactly what will be affected;
- verify backup/retention/recovery where relevant;
- prefer a reversible quarantine/disable/rename/soft-delete when it satisfies the goal;
- avoid wildcard or broad selectors unless explicitly intended and independently checked.

Never expose secrets, credentials, sensitive dumps or customer data in the handoff.

## Distinguish mitigation from permanent repair

During an incident, actions such as restart, scale-out, failover, disable feature, drain traffic or kill a query may reduce impact without fixing the cause. Record the resulting state and whether follow-up diagnosis/repair remains.

Do not claim root cause from a successful mitigation.

## Verify the resulting state

After mutation, re-run the preselected health/data/traffic checks and compare with the baseline. Confirm:

- the requested state converged;
- no unexpected resource changed;
- critical errors/latency did not regress;
- data/queue/migration invariants hold;
- rollback is no longer needed or remains available for the observation window.

## Completion

Lead the handoff with:

```text
target
+ action performed
+ resulting state
+ verification evidence
+ rollback/observation status
```

State any continuing background process, monitoring window, or follow-up owner. Do not treat an operation as complete while its critical effect is still unobserved.
