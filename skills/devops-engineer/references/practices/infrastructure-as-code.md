# Infrastructure as code and state

Use this reference for Terraform/OpenTofu, Pulumi, CloudFormation/Bicep, Ansible and other declarative or semi-declarative infrastructure systems. The central questions are ownership, state, provider semantics, drift, dependency/replacement behavior and recoverability—not the syntax of one tool.

## Establish infrastructure identity

Before planning or applying, identify:

```text
source repository + revision
IaC tool + version
provider/plugin/module versions
state backend or stack backend
workspace/stack
target account/project/subscription
region/zone
credentials/identity
variable/config sources
policy/approval path
```

Do not rely on a workspace, profile or CLI context name without resolving the underlying account and backend. The same configuration can target radically different infrastructure through credentials or variables.

## Treat state as a control asset

State may contain resource IDs, dependencies, outputs and sensitive values. Understand backend, encryption, locking, versioning, backups and access controls. Do not commit remote state into source control or paste state output into logs merely to debug.

A state lock protects coordination; it is not an annoyance to bypass. Force-unlock only after proving the owner is no longer active and understanding whether the interrupted operation changed remote resources.

## Format, validate, initialize, plan, apply are different

For Terraform/OpenTofu:

- `fmt -check` evaluates formatting without writing;
- `validate` checks configuration consistency but may require providers/modules already initialized;
- `init` changes the local working directory and can download modules/providers, configure/migrate backends and access credentials;
- `plan` can read state/provider APIs/data sources and acquire locks;
- `apply` changes remote resources and state;
- `destroy` is explicitly destructive.

Do not run `init -upgrade`, backend migration/reconfigure, provider upgrade or state operations merely to make validation pass unless that change is part of the authorized task.

For Pulumi, `preview` still executes program/provider logic and reads the selected stack/backend/cloud APIs. For Ansible, check mode is not guaranteed side-effect-free for every module/plugin/lookup.

## Review a plan structurally

Do not reduce a plan to “N add, M change, K destroy.” Inspect:

- resource address and ownership;
- create/update/replace/delete action;
- why replacement occurs;
- sensitive or unknown values;
- dependency ordering;
- network/security/IAM changes;
- data/storage lifecycle;
- region/account/namespace;
- tags/labels/ownership metadata;
- provider/API default changes;
- outputs and consumers;
- whether the plan is stale relative to current state.

Unexpected replacement, privilege expansion or deletion deserves explanation before apply even if the total change count is small.

## Separate desired change from drift

A plan can contain:

1. intended source changes;
2. external/manual drift;
3. provider/API normalization or defaults;
4. imported/moved state effects;
5. version-upgrade semantic changes.

Do not apply a mixed plan until you understand which category each consequential difference belongs to. Applying unrelated drift during a feature change hides ownership and rollback scope.

## Imports, moves and refactors

Resource address refactors can be infrastructure-neutral only if state is moved correctly. Use explicit moved/import mechanisms supported by the tool and version. Verify the resulting plan does not recreate or delete the real resource.

Never “fix” an address mismatch by deleting state or remote infrastructure without proving ownership and desired lifecycle.

## Provider and module upgrades

Treat provider/module changes like dependency migrations:

- read release/upgrade notes;
- pin/lock intended versions;
- inspect schema/default/deprecation changes;
- run validate and representative plans;
- look for replacement, sensitive output or permission changes;
- test modules in lower-risk environments when possible;
- preserve rollback constraints if state schema changes.

A version bump that produces no syntax error can still alter resource behavior.

## Variables and secrets

Map variable precedence and sources: defaults, tfvars, environment, workspace/stack config, CI variables, secret managers and generated files. Do not include secrets in committed variable files or plan artifacts.

Mark outputs sensitive when appropriate, but remember “sensitive” usually controls display rather than removing the value from state. Protect state accordingly.

## Modules and ownership boundaries

A module should encapsulate a coherent infrastructure responsibility with a stable interface. Avoid deep pass-through abstraction that makes every input/output indirect. Expose only what consumers need and make destructive/replacement consequences visible.

Do not create a module merely because resources repeat once. Do not fork a shared module for one environment without understanding upgrade ownership.

## Policy and governance

Policy-as-code may enforce required tags, regions, encryption, network rules, IAM, image/provenance or cost constraints. Treat policy failures as evidence of a defined control, not an obstacle to disable. Waivers require the policy owner's process and should be scoped, attributable and expiring where appropriate.

## Ansible and configuration automation

For playbooks, establish inventory, limit, connection identity, privilege escalation, variables/vault, roles/collections and idempotency. `--check --diff` is useful evidence only where modules support it faithfully. A task reporting `changed` repeatedly may reveal non-idempotent automation or a resource that continually drifts.

Avoid broad `hosts: all` or unrestricted privilege escalation when a narrower target is correct.

## Cloud-native template systems

For CloudFormation, Bicep/ARM and similar systems, understand change-set/what-if semantics, stack/resource ownership, replacement/deletion policy, rollback behavior, nested modules/stacks and provider/API defaults. A server-side preview can still require powerful credentials and may not reproduce runtime behavior after deployment.

## Destruction and lifecycle

Before delete/destroy/replacement, inspect deletion protection, retain policies, final snapshots/backups, dependent resources, DNS/network references, IAM bindings, data retention and recreation time. Storage/database/KMS/identity resources often have asymmetric recovery.

Never approve a destroy plan from count alone.

## Apply discipline

Before apply:

- confirm the exact plan/revision if the workflow separates plan and apply;
- verify target account/region/workspace/backend;
- check state lock/active operators;
- confirm approval and maintenance window if required;
- preserve recovery/backup for stateful changes;
- understand external systems not represented in state.

After apply, verify remote resource state and direct consumers. State convergence alone does not prove application or network correctness.

## Drift and reconciliation

Schedule or trigger drift detection according to environment risk. Investigate drift before auto-remediating consequential resources. Some drift is emergency/manual change that should be reconciled into source; some is platform-managed fields that should be ignored/configured appropriately.

Avoid perpetual noisy plans. Noise trains operators to miss real infrastructure changes.

## Evidence handoff

For material IaC work report the tool/version, target identity, source revision, state backend/workspace, plan summary with consequential replacements/deletes/privilege changes, checks run, apply identity/result, post-apply verification and rollback/recovery limitations.
