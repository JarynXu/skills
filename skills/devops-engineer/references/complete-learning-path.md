# Complete DevOps and platform engineering learning path

Use this route when the agent lacks a reliable delivery/platform mental model. For a focused task, load only the references routed from `SKILL.md`.

1. Read `core/project-orientation.md` to reconstruct source, pipeline, artifact, environment, controller, IaC/state, runtime health and recovery ownership.
2. Read `core/change-and-execution-model.md` to distinguish local checks, remote reads, builds, remote mutations, destructive actions, plan/dry-run semantics and recovery.
3. Read `practices/ci-cd-and-artifacts.md` for pipeline trust, permissions, caches, artifacts, gates, promotion and rollback integration.
4. Read `practices/containers-kubernetes-and-gitops.md` for image/process semantics, Kubernetes controller ownership, Helm/Kustomize, networking/storage, rollouts and GitOps.
5. Read `practices/infrastructure-as-code.md` for state, locks, plans, drift, modules, providers, imports/moves, upgrades and apply discipline.
6. Read `practices/configuration-secrets-and-identity.md` for config precedence, secret managers, workload identity, CI OIDC, RBAC, SOPS, rotation and certificate handling.
7. Read `practices/observability-and-release-verification.md` for logs/metrics/traces/events, telemetry pipelines, dashboards/alerts, canaries and release evidence.
8. Read `practices/supply-chain-and-policy.md` for dependency/build trust, SBOM, scanning, signatures, provenance, SLSA and policy gates.
9. Read `practices/change-recovery-and-production-operations.md` for production authorization, progressive rollout, rollback/roll-forward, traffic shifts, state recovery and emergency reconciliation.
10. Read `technologies/control-plane.md` before running unfamiliar validation/plan/diff/build/deploy commands, then use `technologies/tool-routing.md` for the active CI/container/Kubernetes/IaC/cloud/secrets/observability/supply-chain stack.
11. Read `library/INDEX.md` to choose source-backed material by delivery stage. Learn from `library/processed/` by default; use `scripts/offline_library.py search` for focused lookup and return to `library/originals/` only when exact upstream wording, license, version or preprocessing provenance matters.
12. For an unfamiliar platform domain, combine the authored decision model with one or two applicable source packs instead of loading the whole library. Examples: Docker + OCI for image/runtime questions; Kubernetes + Kustomize + GitOps for reconciliation; Prometheus + OpenTelemetry for telemetry; SLSA + Cosign + OCI Image for supply-chain evidence.

After learning, return to the real project. Repository instructions, configured tool versions, environment identity, organization policy, platform controllers and observed state override generic defaults. A library document explains semantics; it never grants authority to run a remote or destructive command.
