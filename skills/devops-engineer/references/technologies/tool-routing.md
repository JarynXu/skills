# DevOps tool and platform routing

Use this reference after repository evidence identifies the active delivery/platform stack. Existing wrappers, versions, provider configuration, policy and operating procedures outrank generic tool familiarity.

## CI/CD platforms

### GitHub Actions

Inspect workflow/event semantics, permissions, environments, OIDC, concurrency, caches, artifacts, reusable workflows and action pinning. `pull_request`, `pull_request_target`, workflow reuse and environment secrets have different trust implications. Do not expose privileged credentials to untrusted PR code.

Use repository-native workflow validation/lint tooling when configured. GitHub-hosted execution behavior is not fully reproduced by YAML parsing alone.

### GitLab CI

Inspect includes/templates, rules/only/except, protected refs, environments, runners, variables, artifacts/cache, needs/dependencies, manual jobs and OIDC/id_tokens. Understand whether runner tags imply privileged/shared infrastructure.

### Jenkins

Trace Jenkinsfile/shared libraries, controller/agent trust, credentials bindings, workspace reuse, plugin behavior and script approvals. Jenkins environments are highly organization-specific; do not invent standard credentials or node labels.

### Azure Pipelines / CircleCI / Buildkite

Inspect reusable templates/orbs/plugins, agent pools, service connections/contexts, caches/artifacts, approvals and deployment/environment semantics. Prefer organization-defined wrappers and policy.

## Container build tools

Docker/BuildKit, Buildah, Podman, Kaniko, buildpacks and cloud builders differ in daemon privilege, cache, secret mounts, provenance and multi-platform support. Detect what the project actually uses before changing Dockerfiles or build commands.

A container build can execute arbitrary repository code and download dependencies. Treat building untrusted source on privileged infrastructure as a security boundary.

## Kubernetes CLI and render tools

### kubectl

Use for cluster API reads/changes according to the selected context/namespace and RBAC. Verify context identity before remote operations. Distinguish client dry-run, server-side dry-run/diff and persisted apply.

### Helm

Use chart lint/template for local evidence and upgrade/install/rollback/uninstall for release operations. Understand values precedence, hooks, CRDs, lookup, release history and namespace.

### Kustomize

Use rendered output to understand bases/overlays/patches/generators. Avoid editing generated output as source of truth.

### Argo CD / Flux

Treat sync/reconcile/prune/suspend/resume and promotion as controller operations. Resolve source revision, target cluster/namespace and health/prune policy. Git changes may themselves be production mutations through reconciliation.

## Terraform and OpenTofu

Use the repository's selected CLI/version and provider/module lock strategy. Key evidence path:

```text
fmt/check
-> validate
-> init only when intentionally required
-> plan with exact workspace/backend/account
-> reviewed apply
-> remote/post-apply verification
```

OpenTofu and Terraform are compatible in many workflows but not interchangeable by assumption. Follow project tooling and state/provider compatibility.

Do not run backend migration/reconfigure, provider upgrade, force-unlock, import/state rm/mv or destroy as incidental setup.

## Pulumi

Identify language/runtime, project, stack, backend, config/secrets provider and cloud identity. `pulumi preview` executes program/provider logic; `up`, `destroy`, stack/config operations are mutations. Prefer project wrappers and inspect generated preview for replacements/deletes/privilege changes.

## Ansible

Resolve inventory, host limit, connection identity, become, variables/vault, roles/collections and module semantics. `--syntax-check` is local evidence; `--check --diff` is not a universal no-op guarantee. Avoid broad inventory targeting and uncontrolled privilege escalation.

## Cloud platforms

### AWS

Resolve account ID, role/session identity and region before action. Names/profiles alone are insufficient. Review IAM, VPC/network, load balancing, ECS/EKS/Lambda, CloudFormation, KMS/secrets, S3/state backends and CloudTrail according to the task.

Prefer short-lived role/OIDC sessions. Destructive operations on IAM, KMS, networking, DNS, databases and stateful storage have broad blast radius.

### Google Cloud

Resolve project number/ID, principal and region/zone. Distinguish user ADC, service accounts and workload identity. Review IAM, VPC, GKE, Cloud Run, Artifact Registry, Secret Manager/KMS, Cloud Storage/state and audit logs as relevant.

### Azure

Resolve tenant, subscription, principal and region/resource group. Distinguish service connections/managed identity/federation. Review RBAC, VNets, AKS, App Service/Container Apps, ACR, Key Vault, Storage/state and Activity Logs as relevant.

Do not add cloud CLIs or SDKs merely because a provider signal is detected. Use the project's established tooling.

## Secrets and encryption

### SOPS

Inspect creation rules and KMS/age/PGP recipients. Avoid decrypted output in logs/artifacts and ensure environment-specific recipients are correct.

### Vault

Understand auth method, policies, paths, leases/renewal and secret engine semantics. Avoid root tokens and broad policy changes for routine workflows.

### External Secrets / Sealed Secrets

Inspect controller identity, source paths, target namespace/name, refresh/rotation and key/scope semantics. Verify consumer reload after rotation.

## Observability

### OpenTelemetry

Inspect SDK/agent/collector versions, signal pipelines, resource identity, processors/sampling, exporters and backend. Verify collector/export health separately from application health.

### Prometheus/Grafana

Understand scrape/discovery, recording/alert rules, labels/cardinality, query semantics, dashboard data sources and alert routing. A configuration reload/sync can affect monitoring production-wide.

Other stacks such as Datadog, New Relic, Elastic, Loki, Tempo and cloud monitoring are organization-specific; route through project configuration and vendor docs for the installed version.

## Supply-chain tools

### cosign

Use for signing/verification/attestations according to key/keyless identity policy. Verify exact artifact digest and trusted issuer/identity conditions.

### syft / SPDX / CycloneDX

Generate component inventory at the appropriate artifact/build layer. Preserve artifact linkage.

### grype / Trivy / OSV scanners

Treat findings as triage evidence with ownership, affected component, fix/mitigation and waiver policy.

### SLSA/provenance generators

Use the adopted specification version and build platform. Do not claim a level from tool presence alone.

## Policy engines

OPA/Conftest, Gatekeeper, Kyverno, Sentinel, cloud policy and custom policy systems enforce different inputs and stages. Inspect the actual rule set, exemptions and enforcement mode. A local policy test and admission-time policy are different evidence.

## Registry and artifact tools

Docker/OCI registries, GitHub Packages, ECR/GAR/ACR, Artifactory and Nexus differ in immutability, scanning, replication and retention. Know whether tags can be overwritten and whether deletion/garbage collection affects rollback.

## Network and diagnostic tools

Use `curl`, `dig`, `openssl`, `grpcurl`, `ss`, packet capture and cloud/Kubernetes networking inspection only to answer a specific hypothesis. Packet captures and verbose headers can contain credentials/customer data. Elevated node/network debugging requires appropriate authority.

## Adoption rule

Do not introduce Terraform, Kubernetes, Helm, GitOps, Vault, OpenTelemetry, a new CI platform, policy engine or scanner simply because this skill knows it. New platform components create ownership, upgrades, security and operating cost. Introduce them only when an identified requirement/evidence gap justifies the lifecycle cost and the responsible team will own them.
