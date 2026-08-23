# Change and execution model

Use this reference to decide what a DevOps action means before running it. Infrastructure and delivery tools expose commands with very different consequences even when their names sound harmless. Classify the operation by actual effects, target and recovery characteristics rather than by CLI verb alone.

## Classify the action

Use these classes:

### Local inspection

Reads repository files or local metadata without changing state. Examples include source inspection, `git diff`, static inventory and rendering already-downloaded configuration.

### Local validation or rendering

Parses, validates, formats in check mode, renders manifests or evaluates policy without intentionally changing the target environment. Examples may include `terraform fmt -check`, `helm lint`, `helm template`, `kubectl kustomize`, `docker compose config`, schema validation and policy tests.

These commands can still read environment variables, local credentials or files. Their output may expose secrets. Some tools may fetch plugins/modules/dependencies if configuration is incomplete, so verify actual behavior before assuming an offline no-op.

### Remote read or comparison

Reads an API, cluster, registry, state backend or controller to establish current state or compute a diff. Examples include cloud resource inspection, `kubectl get`, controller status, registry metadata, Terraform refresh/plan, Pulumi preview and some GitOps diffs.

Remote reads require the correct target and identity. They can consume quotas, expose sensitive metadata, acquire state locks, execute provider/plugin code, or invoke server-side admission/dry-run paths even when they do not persist intended infrastructure changes.

### Local build or artifact mutation

Creates images, binaries, charts, packages, generated manifests, SBOMs or signatures locally. Builds can execute repository-controlled code and use the network. Treat untrusted build inputs as executable supply-chain content rather than passive data.

### Remote mutation

Changes shared or external state: publishing an artifact, applying infrastructure, deploying, syncing GitOps, rotating a secret, changing policy, shifting traffic, promoting a release or rolling back.

Resolve target, authority, blast radius, concurrency, recovery and verification before action.

### Destructive or hard-to-reverse mutation

Deletes, destroys, purges, revokes, rotates irreversibly, truncates state, forces replacement, removes storage, disables access, rewrites history or otherwise makes rollback uncertain. Require explicit authorization and a concrete recovery/backup/reconciliation path. Do not infer permission from a broader request to “fix” an environment.

## Plan before mutation

For a consequential change, define:

```text
intent
source of truth
exact target
current observed state
proposed state/diff
artifact/config identity
preconditions
expected controller/tool behavior
health/success evidence
abort boundary
rollback or roll-forward path
post-change reconciliation
```

The plan should be falsifiable. “Deploy and see if it works” is not a release plan.

## Prefer progressive evidence

Use the cheapest evidence that can invalidate the change before broader execution:

```text
syntax / format check
-> static validation / schema / policy
-> render
-> local or ephemeral test
-> remote read / plan / diff
-> lower-environment apply or deployment
-> progressive production rollout
-> post-rollout verification
```

Do not run every layer mechanically. The risk mechanism determines which layers are necessary.

## Plans and dry runs are not all equivalent

A plan or dry run may:

- use stale local state;
- refresh remote state;
- acquire a lock;
- evaluate data sources;
- call cloud/provider APIs;
- invoke admission webhooks;
- execute plugins, providers, templates or repository code;
- omit runtime/controller behavior that only appears after apply;
- differ from the later apply because state or configuration changed.

Record what the specific tool/version actually did. Never label a command “safe” merely because it contains `plan`, `preview`, `diff`, `check` or `dry-run`.

## Keep artifact and target identity stable

For releases, separate:

- source commit;
- build run and builder identity;
- artifact version/tag;
- immutable digest or checksum;
- signature/provenance identity;
- deployment revision;
- target environment.

If the artifact changes between validation and promotion, prior evidence may not apply. Prefer immutable references for consequential promotion and verify the running/deployed identity after rollout.

## Manage concurrency

Before triggering build, deploy or IaC operations, understand:

- pipeline concurrency groups and cancellation;
- environment locks or approval gates;
- Terraform/state locks;
- GitOps reconciliation loops;
- rolling-controller ownership;
- multiple operators or automation acting on the same resource;
- repeated webhooks/events;
- retries after partial failure.

Do not bypass locks or force-unlock merely because work appears stuck. First prove whether the lock owner is active, stale or recoverable.

## Preserve recovery

A good change path preserves at least one credible recovery option:

- revert declarative source and reconcile;
- roll forward with a corrected immutable artifact;
- controller-native rollback;
- infrastructure state-aware reversal;
- traffic shift/canary abort;
- feature/config rollback;
- restore from tested backup/snapshot where data is involved.

“Run the opposite command” is not necessarily rollback. Schema/data migrations, external side effects, secret rotation and infrastructure replacement can make reversal asymmetric.

## Verify after mutation

Validate more than command exit status. Depending on the system, inspect:

- controller reconciliation and observed generation;
- resource events and error conditions;
- desired versus available replicas;
- image/artifact digest actually running;
- service endpoints/routing;
- migrations/init jobs;
- application health and dependency behavior;
- logs/metrics/traces/synthetic checks;
- business/user-visible signals;
- policy/compliance evidence;
- absence of unintended resource replacement or privilege change.

## Reconcile emergency changes

If an authorized incident response requires a live/manual change:

1. capture the pre-change state and reason;
2. make the smallest bounded intervention;
3. verify recovery and watch for secondary effects;
4. record the exact live divergence;
5. update or revert the declarative source so the controller will not undo or perpetuate hidden state;
6. remove temporary privileges/debug resources.

Emergency speed does not justify permanent configuration drift.

## Use the planner as a control aid

`python scripts/plan_delivery_checks.py <project-root>` produces candidates with safety metadata. It does not execute them. Treat repository-owned scripts as stronger routing evidence than generic tool guesses, but still inspect what a script actually does before execution.
