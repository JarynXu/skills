# Change, recovery, and production operations

Use this reference for authorized production changes, rollouts, rollbacks, traffic shifts, emergency fixes, credential rotation, infrastructure recovery, failed deployment cleanup and operational handoff. DevOps skill possession is not production authority.

## Establish change authority

Before a remote mutation, identify:

- exact environment/account/project/subscription/cluster/namespace/region;
- requested outcome and change owner;
- operator/automation identity;
- maintenance/change window where applicable;
- blast radius and affected consumers;
- current source/artifact/config state;
- approval or separation-of-duties requirement;
- abort boundary;
- rollback/roll-forward/recovery path;
- post-change evidence.

Do not infer authorization from having credentials, being repository owner, or being able to run the command.

## Use the normal control path

Prefer:

```text
versioned source change
-> review/gate
-> pipeline/controller reconciliation
-> progressive rollout
-> verification
```

over ad-hoc live edits. Normal paths preserve audit, repeatability, source-of-truth and rollback evidence.

Emergency operations can justify a bounded manual intervention, but they require explicit reconciliation afterward.

## Pre-change evidence

Capture what you need before state changes erase it:

- current deployed artifact/digest/revision;
- controller/resource status;
- relevant plan/diff;
- logs/events around the failure/change;
- current traffic/health indicators;
- state/lock/backup/snapshot status;
- active pipeline/deployment operations;
- known drift/manual changes.

Do not restart/delete/recreate first and investigate later when evidence is transient.

## Progressive rollout

Use the platform's established strategy: rolling, canary, blue-green, feature/config rollout, GitOps promotion or another mechanism. Define success and abort conditions before starting.

Watch both control-plane and service behavior. Typical evidence:

- desired/updated/available revision;
- target artifact digest;
- readiness and routing;
- error rate/latency/saturation;
- dependency/job/queue behavior;
- migration status;
- synthetic or user-visible checks;
- new error classes in logs/traces/events.

Pause or abort according to the defined boundary rather than waiting for total failure.

## Rollback versus roll-forward

Choose recovery from actual reversibility.

Rollback may be appropriate when previous artifact/config remains compatible and the controller can return safely. Roll-forward may be safer when database/schema, external side effects, secret rotation, message formats or infrastructure state have advanced.

Document what rollback does not reverse. A Kubernetes/Helm rollback cannot undo external API calls or data changes; a Git revert does not automatically restore deleted cloud resources.

## Data and schema dependency

Deployment operations that interact with migrations require compatibility sequencing. Understand expand/contract, mixed-version operation, migration job ownership, retry/idempotency and backup/recovery.

Do not roll application code backward across an incompatible schema without evidence. Do not rerun a failed migration job blindly if it may have partially committed work.

## Traffic shifts

Before changing DNS, load balancer weights, ingress/gateway routes, service mesh policy or canary traffic:

- identify old/new backends and health;
- understand TTL/session/connection behavior;
- define percentage/segment and duration;
- preserve observability by cohort;
- plan return traffic;
- check capacity on both sides.

A 100% cutover is not required merely because deployment completed.

## Failed rollout cleanup

Classify leftovers before deletion: failed Jobs, old ReplicaSets, preview namespaces, temporary images, Terraform locks/plans, generated secrets, feature flags, debug containers, port-forwards, cloud resources.

Cleanup can destroy diagnostic evidence or rollback capability. Preserve required artifacts/status first and respect controller ownership/finalizers.

## State and lock recovery

For IaC/state systems, prove whether an operation is still active before breaking a lock. Capture operation ID/owner/time and remote state. After interrupted apply, run read/plan evidence to understand partial remote changes.

Never delete state entries to “make the plan clean” unless resource ownership/state surgery is the authorized remediation and backup exists.

## Backup and restore

A backup is useful only if restoration is possible within the required objective. For operations involving stateful services, know artifact location, point-in-time semantics, encryption/key access, consistency, retention, restore procedure and application compatibility.

Production restore/failover is a consequential operation with its own authority. Test restoration in a safe environment where practical rather than assuming backup job success proves recoverability.

## Credential and certificate operations

Rotation/revocation can cause immediate outage. Map all consumers, overlap period, reload behavior and rollback constraints before invalidating the old credential. Confirm the new credential is actively used before revocation when overlap is supported.

Avoid exposing values while verifying rotation.

## Incident operations

During an incident:

1. preserve timeline and target identity;
2. stabilize the system with the smallest safe intervention;
3. keep hypotheses separate from observations;
4. avoid simultaneous unrelated changes;
5. record every mutation and operator;
6. verify user/service recovery;
7. reconcile source and temporary state;
8. hand off remaining risk and follow-up evidence.

Do not turn incident urgency into permission for destructive experiments.

## Manual hotfix reconciliation

If a live config/resource was changed directly, record exact before/after and reason. Decide whether the declarative source should adopt the change or the live state should return to source. Complete reconciliation promptly so future controller actions do not surprise operators.

## Production diagnostics

Prefer read-only evidence first: status, logs, events, metrics, traces, resource usage, network/service endpoints, registry metadata, state/plan. Debug containers, shell exec, packet capture, profilers and elevated host/node tools can expose sensitive data or affect workload behavior; use only when needed and authorized.

Do not leave debug privileges/resources running after use.

## Rollback evidence

After rollback/recovery, verify the actual old/new artifact/config identity, controller state, traffic, service health and any state that did not roll back. A rollback command returning success is not proof the incident is resolved.

## Operational completion

A production operation is complete when:

```text
target state is known
+ service/control-plane behavior is verified
+ source of truth is reconciled
+ recovery path remains understood
+ temporary access/resources are cleaned
+ residual risk and follow-up are handed off
```

Report what was actually observed. Do not claim “production healthy” from one command or one dashboard if key boundaries were not checked.
