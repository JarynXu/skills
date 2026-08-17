# Deployment and cross-cutting concepts

Connect software structure to the environments in which it is built, released, operated, secured, observed, and recovered. Define recurring mechanisms once when they constrain multiple building blocks.

## Model deployment

For relevant environments, describe:

- Deployable software units and their mapping to processes, nodes, devices, clusters, regions, or managed services.
- Network, trust, data-residency, fault, and scaling boundaries.
- Infrastructure and external platform dependencies.
- Configuration, secrets, identity, certificates, and environment variation.
- Persistence, replication, backup, recovery, and disaster boundaries.
- Release, compatibility, rollout, rollback, and decommissioning mechanics.
- Health, logs, metrics, traces, alerts, and operator access.
- Capacity, cost, resource, and energy constraints when significant.

Show production reality first. Add development, test, staging, edge, offline, or customer-hosted variants only when they change a concern or decision.

Do not confuse a deployment diagram with infrastructure inventory. Map runtime software to the infrastructure and explain relationships, responsibilities, and failure effects.

Treat each supplied platform fact narrowly. Existing technology or organizational operation does not prove a particular region, topology, replica set, fault domain, encryption mode, backup behavior, provider capability, or service level. Mark every added deployment property `[PROPOSAL]` or `[OPEN]` in the node or statement where it appears; a broad legend cannot convert an embellished `existing` label into a fact.

## Identify cross-cutting concepts

Consider a shared concept when multiple building blocks require a consistent solution for concerns such as:

- Identity, authentication, authorization, policy, and audit.
- Data persistence, transactions, caching, search, and schema evolution.
- Communication, messaging, serialization, retries, and error handling.
- Configuration, feature controls, secrets, and environment discovery.
- Logging, metrics, tracing, diagnostics, and supportability.
- Validation, localization, accessibility, privacy, and content handling.
- Resilience, rate limits, overload, degradation, and recovery.
- Testing, delivery, migration, compatibility, and dependency management.

Select concepts from actual drivers. Do not create a mandatory policy for every possible topic.

## Define a system-wide concept

State:

- The concern, scope, and stakeholders.
- Required invariants and quality outcomes.
- Responsibilities and extension points.
- Approved mechanism and meaningful alternatives rejected.
- Exceptions and who may approve them.
- How implementation and conformance will be verified.
- Operational behavior and failure consequences.

Keep business-specific policy with its domain owner. A cross-cutting mechanism may enforce or transport policy, but should not become an accidental central authority for unrelated business decisions.

## Collaborate with specialist owners

Security, privacy, safety, data, networking, infrastructure, and operations often require specialist ownership. The software architect integrates their constraints and decisions into a coherent system architecture, but does not silently certify work outside available expertise or authority.

Escalate when a local software decision changes organizational trust boundaries, regulated controls, enterprise platforms, shared infrastructure, or another team's service commitments.
