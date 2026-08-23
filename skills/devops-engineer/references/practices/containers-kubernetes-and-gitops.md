# Containers, Kubernetes, and GitOps

Use this reference for OCI/container build and runtime assumptions, Kubernetes desired state, workload diagnosis, Helm/Kustomize rendering, GitOps reconciliation, rollout, networking, storage and cluster-safe changes.

## Keep layers distinct

Reason separately about:

```text
image build and OCI artifact
container runtime/process
Pod specification and lifecycle
controller desired state
scheduler placement
node/runtime resources
Service/endpoints/routing
storage
cluster policy/admission
GitOps source/reconciliation
application behavior
```

A failure visible in a Pod may originate in the image, controller, scheduler, node, network, volume, admission policy, dependency or application. Do not “fix Kubernetes” before locating the layer.

## Container image discipline

Inspect Dockerfile/build context, base image, package installation, user, filesystem permissions, entrypoint/command, signals, health behavior, multi-stage boundaries and architecture/platform targets.

Prefer minimal required privileges and avoid embedding secrets in layers, build arguments, environment defaults or copied files. Build secrets should use mechanisms that do not persist them into image history/layers.

Tags are mutable references. For consequential deployments, know the image digest actually promoted and running. Rebuilding the same tag does not preserve release identity.

## Understand process semantics

Containers do not remove Unix/process behavior. Verify:

- PID 1 signal handling and child reaping;
- graceful termination and configured grace period;
- startup dependencies and initialization;
- filesystem mutability and ephemeral paths;
- stdout/stderr versus file logging;
- resource limits and OOM behavior;
- user/group and capability requirements;
- read-only root filesystem compatibility where adopted.

Do not add a shell wrapper or init process without understanding how it changes signals, exit status and child ownership.

## Start from controller ownership

For a workload problem, identify the owner chain: Pod -> ReplicaSet -> Deployment, StatefulSet, DaemonSet, Job/CronJob, custom controller or another owner. Repair the controller/source definition rather than an individual replaceable Pod unless instance-level intervention is explicitly part of diagnosis.

For GitOps-managed resources, identify the Git source, rendered object and reconciliation controller before live edits. A manual `kubectl edit/apply` may be immediately reverted or may create hidden drift.

## Render before applying

Use the project's real render path:

- Helm chart + values/schema;
- Kustomize bases/overlays;
- templating/operator generation;
- GitOps controller sources;
- plain manifests when they are truly source of truth.

Render and review names, namespaces, labels/selectors, service accounts, images/digests, env/config/secret references, probes, resources, volumes, security context, affinity/topology, disruption policy, services and ingress/gateway objects.

A syntactically valid manifest can still select the wrong namespace, image, secret, service or workload.

## Diagnose scheduling and startup in order

For a non-running workload inspect:

1. controller desired/available/updated state and observed generation;
2. Pod conditions and events;
3. scheduler constraints: resources, affinity, taints/tolerations, topology, volumes;
4. image pull and registry auth;
5. config/secret/volume mounts;
6. init containers;
7. container state/reason/restart history and previous logs;
8. startup/readiness/liveness probes;
9. dependency/network/storage behavior;
10. node pressure/runtime issues when evidence points there.

Avoid deleting/restarting Pods repeatedly before preserving the error evidence.

## Use probes correctly

- **startup** protects slow startup from premature liveness failure;
- **readiness** controls whether an instance should receive traffic;
- **liveness** detects a process that should be restarted.

Do not use liveness as a dependency health check that causes restart storms. Readiness should reflect ability to serve the intended traffic, not every optional downstream dependency. Probe endpoints must be cheap, bounded and appropriate to the failure policy.

## Resource management

Requests affect scheduling and capacity; limits affect runtime behavior. CPU throttling and memory OOM are different mechanisms. Inspect actual workload usage, QoS class, node capacity, HPA/VPA behavior and application runtime before changing resources blindly.

An OOMKilled container is evidence of memory-limit interaction, not automatically proof that “the limit is too low.” Investigate leak, working set, concurrency, cache and JVM/runtime settings where relevant.

## Networking path

Reconstruct:

```text
client
-> DNS
-> ingress/gateway/load balancer
-> Service
-> EndpointSlice/endpoints
-> Pod port
-> sidecar/service mesh if present
-> application listener
```

Check labels/selectors, namespaces, ports/targetPorts, readiness, policies, TLS/SNI, gateway routes and cloud load-balancer health. A healthy Pod with no endpoint or wrong selector is not a network mystery.

NetworkPolicy is additive allow policy within the enforcement model. Verify the actual CNI/platform support and both ingress/egress directions rather than assuming a manifest guarantees enforcement.

## Storage and stateful workloads

Identify StorageClass, PV/PVC binding, access mode, zone/topology, reclaim policy, snapshots/backups, expansion and application-level consistency. StatefulSet identity does not itself provide database correctness or backup.

Before deleting/recreating storage objects, understand reclaim/finalizer/snapshot behavior and recovery. Never use destructive storage repair merely to force a Pending workload to schedule.

## Rollouts

For Deployments and similar controllers, inspect strategy, max surge/unavailable, progress deadline, PDB, readiness and capacity. Verify the new ReplicaSet/image digest actually serves traffic. Watch application/error/latency/saturation signals during rollout.

Rollback only if the previous artifact/config remains compatible with database/schema/external state. Kubernetes controller rollback cannot reverse arbitrary side effects.

## Helm

`helm lint` and `helm template` are local evidence, not cluster acceptance. Review chart dependency versions, values precedence, schema, hooks, CRDs, release name/namespace, lookup functions and generated names. `helm upgrade --install` is a remote mutation and hooks can execute Jobs with broad effects.

Treat rollback hooks and uninstall/delete behavior as real operations, not bookkeeping.

## Kustomize

Trace bases, overlays, generators, patches, name prefixes/suffixes and image replacements. Generated ConfigMap/Secret names can trigger rollout semantics. Avoid duplicate patches that obscure final state; inspect the rendered object.

## GitOps

For Argo CD, Flux or similar systems, identify:

- Git/OCI source and revision;
- reconciliation object and interval/webhook;
- render/decryption process;
- target cluster/namespace;
- health/sync policy;
- prune behavior;
- drift/self-heal behavior;
- promotion mechanism;
- controller identity/permissions.

A Git merge may be the real deployment action. Conversely, forcing a controller sync may be a production mutation even though no manifest changed.

Before using `sync`, `reconcile`, `prune`, `suspend`, `resume` or rollback, confirm target and authority. Preserve controller events/status and rendered diff as evidence.

## Cluster access and contexts

Never trust the current kubeconfig context by name alone. Resolve cluster server/identity, namespace and cloud account/project when applicable. Avoid broad cluster-admin credentials for routine automation. Prefer workload and environment-scoped RBAC.

`kubectl diff` contacts the cluster and may invoke server-side dry-run/admission. `--dry-run=client` does not prove CRDs, admission policies or server defaults. Treat each as evidence for a different layer.

## Completion evidence

For a Kubernetes delivery change, record source/render revision, target cluster/namespace, deployed image digest, controller rollout status, relevant events, service/endpoints, probes, application/synthetic evidence, resource behavior and rollback state. A CLI exit code alone is insufficient.
