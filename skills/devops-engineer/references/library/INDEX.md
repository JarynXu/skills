# DevOps offline teaching library

This library is the source-backed teaching and lookup layer for `devops-engineer`. It is intentionally curated around the delivery chain rather than organized as a mirror of product documentation sites.

## Runtime model

Use the layers differently:

```text
references/library/processed/   -> normal Agent learning and lookup
references/library/originals/   -> upstream evidence, attribution, exact wording
SOURCES.json                    -> reviewable source-selection policy
SOURCES.lock.json               -> resolved commits, counts and processing state
```

For ordinary work, read/search `processed/`. Return to `originals/` when exact upstream language, attribution, version, or preprocessing fidelity matters.

## Commands

```bash
python scripts/offline_library.py list
python scripts/offline_library.py search "CrashLoopBackOff" --source kubernetes
python scripts/offline_library.py search "multi-stage" --source docker-docs
python scripts/offline_library.py search "reconciliation" --source flux-gitops
python scripts/offline_library.py search "alerting" --source prometheus-practices
python scripts/offline_library.py search "Metrics Data Model" --source opentelemetry
python scripts/offline_library.py search "Sign the supplied container image" --source cosign
python scripts/offline_library.py read oci-runtime/runtime.md --start 1 --end 30
python scripts/offline_library.py verify
```

`verify` works offline. It checks byte-tracked originals, processed Markdown, provenance mappings, processing coverage, and `agent_ready` state.

## Curriculum by delivery stage

| Stage | Source packs | Learn when |
|---|---|---|
| Build and containerize | `docker-docs`, `oci-image`, `oci-runtime` | image construction, immutable identity, multi-stage builds, secrets, layers/manifests, process lifecycle, storage/network assumptions |
| Kubernetes desired state | `kubernetes`, `kustomize` | Pod lifecycle, probes, resources, Service/storage, kubeconfig, rendering and configuration composition |
| GitOps reconciliation | `argo-cd`, `flux-gitops` | desired state, reconciliation ownership, sync, controller architecture, deployment/security boundaries |
| CI/CD trust | `github-actions` | workflow security, reusable automation, deployment paths, troubleshooting, artifact attestations and untrusted execution |
| Observability | `prometheus-practices`, `opentelemetry` | instrumentation, metric semantics, alerting, logs/metrics data models, telemetry failure and cost/cardinality decisions |
| Supply-chain evidence | `slsa`, `cosign`, `oci-image` | provenance levels, signatures, attestations, digest identity and verification policy |

The authored operating references remain the primary decision layer for infrastructure-as-code, cloud platforms, secret managers, incident/recovery procedures, and cross-tool operating boundaries. The library supplies source-backed semantics where authoritative redistributable documents are practical.

## Current source packs

### `docker-docs`
Official Docker documentation covering build best practices, base/multi-stage/multi-platform images, build secrets, container networking/port publishing, and persistent storage/bind mounts. Apache-2.0.

### `kubernetes`
Official Kubernetes documentation covering kubeconfig, Pod lifecycle, resource management, Services, persistent volumes, probes, and running-Pod diagnosis. CC BY 4.0.

### `kustomize`
Official Kustomize documentation covering configuration composition and core concepts. Apache-2.0.

### `argo-cd`
Official Argo CD core concepts, getting started, security considerations, and operator architecture. Apache-2.0.

### `flux-gitops`
Official Flux concepts, getting-started and operational overview material. Apache-2.0.

### `github-actions`
GitHub Actions documentation focused on workflow security, reuse, deployment, artifact attestations, and troubleshooting. CC BY 4.0.

### `prometheus-practices`
Prometheus project guidance for instrumentation, alerting, histograms, metric naming, recording rules, remote write and operational practice. Apache-2.0 with NOTICE preserved.

### `opentelemetry`
OpenTelemetry specification subset covering overview, failure handling, metrics/logs data models and instrumentation-library behavior. Apache-2.0.

### `oci-runtime`
OCI Runtime Specification for container runtime state, lifecycle and configuration. Apache-2.0.

### `oci-image`
OCI Image Specification for manifests, image indexes, configuration, layers and artifacts. Apache-2.0.

### `slsa`
SLSA Build Track basics under the upstream Community Specification License 1.0. Use as supply-chain assurance vocabulary and requirement evidence; do not claim a level without satisfying the actual requirements for the build under review.

### `cosign`
Sigstore Cosign command guidance for digest-based signing, verification and attestations. Apache-2.0. Tool commands are knowledge, not authorization to sign, publish or modify registry state.

## Deliberate exclusions

- **Helm official website content** is currently MDX-heavy. The skill can use Helm operationally through its authored control plane, but the upstream site is not vendored until the preprocessing pipeline has a tested MDX contract.
- **OpenTofu official web documentation** is also MDX-heavy. IaC/state behavior is covered by authored guidance and repository-aware planning; source-backed OpenTofu canon will be added with MDX support rather than shipped as unprocessed files.
- **Ansible documentation** is redistributable under GPL-3.0 but is intentionally deferred from this first canon expansion to keep licensing and package scope reviewable. The control plane already supports Ansible detection and check-mode safety boundaries.

## Source governance

Every source package must declare its owner repository, requested ref, license, tier, tracks and included paths in `SOURCES.json`. Synchronization resolves the ref to a commit, downloads Git blobs, verifies Git blob SHA-1 values, preserves originals, derives Agent-ready Markdown for supported document formats, and writes `SOURCES.lock.json` plus per-source `SOURCE.json` provenance.

A source may be authoritative without being suitable for local redistribution. Do not add paid standards, vendor training, copyrighted books, or documentation whose applicable license is unclear. Do not imply upstream endorsement.
