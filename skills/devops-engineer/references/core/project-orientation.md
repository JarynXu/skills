# DevOps project orientation

Use this reference before changing an unfamiliar delivery, infrastructure, platform, or production repository. The goal is not to inventory every file. It is to reconstruct the real path from source to artifact to environment to observable runtime state, including who or what is authoritative at each boundary.

## Build the delivery map

Trace one representative change through:

```text
source revision
-> dependency/toolchain resolution
-> build/test/policy gates
-> artifact packaging
-> registry or artifact store
-> environment-specific configuration
-> deployment renderer/controller
-> runtime scheduler/platform
-> service/network/storage dependencies
-> health and user-visible verification
-> rollback or roll-forward path
```

Record the concrete mechanism at each step. A repository may use GitHub Actions to call a reusable workflow that publishes an image, while Argo CD in another repository controls deployment. Do not assume the repository containing application code owns the whole release path.

## Establish sources of truth

Identify which system owns:

- pipeline/workflow definitions and reusable actions/templates;
- build and package metadata, lockfiles and generated artifacts;
- container image names, tags and immutable digests;
- Helm/Kustomize manifests, Terraform/Pulumi/Ansible configuration or other IaC;
- environment overlays and promotion rules;
- cluster/cloud/project/account/namespace/region selection;
- configuration and secret references;
- infrastructure state and locking;
- GitOps desired state versus live reconciled state;
- release approval, rollout and rollback policy;
- dashboards, alerts, SLOs, synthetic checks and release annotations;
- runbooks and emergency/manual procedures.

Prefer changing the highest legitimate declarative source that will reconcile the intended state. Live state is evidence and may be an emergency control surface, but it is usually not the durable source of truth.

## Resolve identity before action

For consequential work, resolve at least:

```text
repository + commit
pipeline/workflow run
artifact name + digest
environment
cloud account/project/subscription + region
cluster/context + namespace
IaC workspace/stack/state backend
release/deployment controller
operator or automation identity
```

Names such as `prod`, `main`, `latest`, `default`, or a current CLI context are not sufficient identity by themselves. Verify the underlying account, endpoint, resource IDs and immutable artifact when consequences matter.

## Reconstruct environment progression

Determine whether environments are:

- independently built or promoted from one immutable artifact;
- branch-based, tag-based, manually approved, GitOps-driven, or controller-driven;
- long-lived or ephemeral;
- isolated by account/project/subscription, cluster, namespace, tenant, VPC/network, database or only configuration;
- using identical infrastructure modules with different inputs or divergent implementations;
- subject to different policy, secret, observability or capacity controls.

Do not call two environments equivalent because their manifests look similar. Record meaningful topology, identity, policy and dependency differences.

## Inspect pipeline semantics

For each relevant workflow/job, determine:

- triggers and trusted/untrusted input boundaries;
- permissions, OIDC/token issuance and secret exposure;
- concurrency/cancellation and duplicate-run behavior;
- caches and whether cache poisoning can affect trusted builds;
- matrix/shard behavior and skipped/conditional gates;
- artifact upload/download integrity and retention;
- reusable workflow/action pinning;
- environment protection or human approval;
- build provenance and source revision linkage;
- deploy/promotion behavior and rollback path.

A green workflow can still omit a required matrix entry, run against the wrong environment, publish a mutable artifact, or skip a gate through conditions.

## Inspect infrastructure state

For IaC, identify provider/plugin versions, modules, variable sources, generated configuration, state backend, lock behavior, imports/moves, workspaces/stacks, drift process and policy checks. For Kubernetes/GitOps, identify chart/kustomization/render path, controller ownership, CRDs, admission/policy, namespaces, service accounts, storage classes, ingress/gateway and network policy.

Do not run `apply`, `destroy`, `sync`, `reconcile`, `upgrade`, `rollback` or equivalent just to learn current state.

## Inspect artifact flow

Establish what the deployable unit is: OCI image, package, binary, archive, chart, manifest bundle, serverless artifact, VM image, firmware or another form. Record:

- build input revision and toolchain;
- version/tag/digest;
- registry/repository;
- signing/attestation/SBOM/scanning if present;
- environment promotion identity;
- retention and garbage-collection implications.

Build once/promote is a useful default only when the product and platform support it. If environment-specific build output is intentional, make the divergence explicit rather than pretending artifacts are identical.

## Inspect runtime and health

Determine what actually declares rollout success:

- controller reconciliation status;
- scheduling and container/process startup;
- readiness/startup/liveness semantics;
- service/endpoints/routing and dependency reachability;
- migration/init jobs;
- logs, metrics, traces and events;
- saturation/resource limits;
- synthetic or user-visible checks;
- business or release-specific indicators.

A resource becoming `Ready` proves only the configured readiness condition. It does not automatically prove migration success, dependency correctness, traffic routing or business behavior.

## Identify authority and blast radius

Before remote action, distinguish:

- repository write authority;
- pipeline dispatch/retry/cancel authority;
- registry publish/delete authority;
- cloud/IaC plan versus apply authority;
- cluster read versus write versus admin authority;
- secret read/rotate authority;
- production rollout/rollback/failover/restore authority.

Access does not collapse these boundaries. If a task requires authority not delegated, produce the exact intended action, target and evidence needed for the authorized operator.

## Orientation output

A useful orientation ends with a compact map:

```text
source of truth:
build/pipeline:
artifact identity:
deployment controller:
environments/targets:
configuration/secrets:
IaC/state:
runtime health path:
rollback/recovery:
observability:
known risks/unknowns:
```

Use `python scripts/inspect_delivery_system.py <project-root>` for a deterministic first-pass inventory, then verify every consequential detection against the repository and live read-only evidence where authorized.
