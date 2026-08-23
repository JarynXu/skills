# DevOps control plane

Use this reference when an agent must convert repository evidence into a safe verification or change path. The control plane has two deterministic, read-only helpers:

```bash
python scripts/inspect_delivery_system.py <project-root>
python scripts/plan_delivery_checks.py <project-root>
python scripts/plan_delivery_checks.py <project-root> --format text
```

Neither tool executes infrastructure, build, deployment, registry or cloud commands.

## Inspector role

`inspect_delivery_system.py` looks for repository evidence of:

- CI systems such as GitHub Actions, GitLab CI, Jenkins, Azure Pipelines, CircleCI and Buildkite;
- Dockerfiles and Compose;
- Kubernetes manifests, Helm and Kustomize;
- Terraform/OpenTofu, Pulumi, Bicep and Ansible;
- Argo CD and Flux GitOps signals;
- SOPS, Vault, Sealed Secrets and External Secrets;
- OpenTelemetry, Prometheus/Grafana and operator resources;
- cosign/SBOM/scanning/SLSA and update automation;
- AWS/GCP/Azure provider signals;
- task entrypoints such as package scripts and Makefiles.

Detection is orientation evidence. A file may be an example, generated output, migration remnant or inactive configuration. Verify active ownership before changing it.

## Planner role

`plan_delivery_checks.py` emits candidate commands with metadata:

```text
category
command
evidence
confidence
locality
requires_target
authorization_required
mutates_local_state
mutates_remote_state
destructive
may_use_network
may_lock_remote_state
notes
```

Candidates are not executed and are not an instruction to run every discovered command.

## Candidate categories

### format

Formatting check that should not intentionally write state, such as Terraform/OpenTofu `fmt -check`.

### validate

Local/static validation such as IaC validate, Helm lint, Kubernetes client dry-run or Ansible syntax check. Validation can still require local providers/dependencies and may read environment values.

### render

Produces effective configuration such as Helm template, Kustomize or Compose config. Render output may contain secrets or sensitive configuration; control artifact/log retention.

### policy

Policy-as-code/static rules. A policy failure should be investigated rather than bypassed mechanically.

### diff / plan

Remote comparison or desired-state planning. These often contact clusters/cloud APIs/state backends, use credentials, run providers/plugins, acquire locks or invoke admission. They require exact target and authority even when they do not intentionally persist infrastructure changes.

### build / scan

May execute repository-controlled build steps, pull dependencies/images, create local artifacts or use external services. Treat untrusted inputs as executable content.

### publish / deploy / release / rollback

Remote mutations. Resolve target, artifact, authority, concurrency, blast radius and recovery before action.

### destroy

Destructive remote mutation. Require explicit authorization and credible recovery/reconciliation evidence.

## Repository-owned commands outrank generic candidates

If the project provides:

```text
make validate
pnpm run infra:plan
./scripts/render.sh
Taskfile/just targets
CI reusable workflows
platform-specific wrapper CLI
```

inspect those first. They may encode required variables, versions, policy, generated inputs and environment setup. Do not bypass a deliberate wrapper merely because you know a lower-level command.

The planner currently recognizes package scripts and Makefile targets by semantic names. Inspect the actual recipe/body before execution; a target named `check` can still contact production if the project defines it that way.

## Generic Terraform/OpenTofu candidates

For detected Terraform-compatible roots, the planner may offer:

```text
terraform/tofu fmt -check -recursive
terraform/tofu validate
terraform/tofu plan
```

The `plan` candidate is explicitly remote/target-dependent and may lock state. `validate` does not authorize running `init`; if initialization or provider upgrades are needed, investigate and treat them as separate changes.

The planner prefers OpenTofu when repository evidence such as `.opentofu-version` or CI commands indicates it.

## Generic Kubernetes candidates

For manifest sources:

```text
kubectl apply --dry-run=client -f <path>
kubectl diff -f <path>
```

These protect different layers. Client dry-run is local decoding/defaulting evidence. `kubectl diff` contacts the selected cluster and can invoke server-side dry-run/admission; it therefore requires target/context/namespace and authorization.

For charts/overlays:

```text
helm lint <chart>
helm template qa-render <chart>
kubectl kustomize <overlay>
```

The placeholder release name is only a generic render aid. Use project values/release/namespace semantics before treating the output as representative.

## Generic Ansible candidates

The planner may offer syntax check plus `--check --diff`. Check mode is marked remote and potentially mutating because not every module/plugin/lookup faithfully supports no-op behavior. Confirm inventory, limit, credentials, privilege escalation and module semantics.

## Generic Pulumi candidate

`pulumi preview` is remote/target-dependent. It runs project/provider code and reads stack/backend/cloud APIs. Resolve stack/account/config/secrets provider before use.

## Compose rendering

`docker compose ... config` is useful for effective configuration, but it can expand environment and `.env` values. Do not capture secret-expanded output into public logs/artifacts.

## CI command evidence

The planner also extracts recognizable commands from CI. This helps answer “how does the project actually validate/deploy?” but does not prove a copied command works interactively: CI may inject images, credentials, working directories, generated files and services.

## Execution decision

Before running any candidate, answer:

1. What risk or claim does this command test?
2. Is it the repository's intended entry point?
3. What exact files/config/variables does it consume?
4. Does it execute repository/plugin/provider code?
5. Does it use the network or credentials?
6. What exact account/project/cluster/namespace/region/workspace/stack does it target?
7. Can it acquire a lock or create local/remote state?
8. Can it publish, deploy, rotate, delete or otherwise mutate external systems?
9. Who authorized that target/action?
10. What evidence and recovery path follow execution?

If the answer to target or authority is unknown, stop at planning/read-only evidence.

## Extending the control plane

Add deterministic support only when a stable repository signal can produce a useful candidate without hiding major assumptions. Each new candidate must encode its safety class and have fixture tests.

Do not turn the planner into a universal cloud command generator. Version-sensitive or organization-specific commands belong in project wrappers, tool-routing guidance or explicit investigation.
