# Backend systems learning track

Language fluency is necessary but not sufficient for backend work. This track teaches the cross-language mechanisms that most often decide production correctness.

## 1. HTTP and public API semantics

Read exact protocol semantics before relying on framework helpers.

Recommended sequence:

1. HTTP semantics and caching from the bundled HTTP Working Group RFC material.
2. OpenAPI 3.2.0 for a machine-readable HTTP API contract model.
3. The skill's `practices/contracts-and-integration.md` for local design decisions such as stable error models, idempotency, compatibility, webhooks, and third-party boundaries.
4. When the project uses RPC, study the bundled gRPC guides for deadlines, cancellation, retries, status/error behavior, flow control, keepalive, health checking, authentication, and observability.

Learn to distinguish protocol semantics from REST style preferences. For every remote operation, be able to state method/operation semantics, authentication and authorization, deadline/timeout, cancellation, idempotency, retryability, compatibility, payload limits, rate/cost limits, and ambiguous-outcome reconciliation.

## 2. Data, transactions, and storage

Use PostgreSQL documentation as a concrete, high-quality reference for mechanisms that recur across relational systems. Study:

- MVCC and transaction isolation;
- indexes and query planning;
- performance evidence and query plans;
- constraints and DDL/migration behavior;
- monitoring and failure/recovery concepts.

Then map the mechanism to the actual database and version in the project. PostgreSQL behavior is not a universal SQL standard.

A backend engineer should be able to explain:

- the system of record and every derived copy;
- which invariants are enforced by application logic versus database constraints;
- the transaction boundary and isolation anomalies that matter;
- migration sequencing and mixed-version compatibility;
- index selection from real query shapes and plans;
- cache freshness/invalidation and failure semantics;
- backup, restore, retention, privacy, and deletion behavior.

## 3. Remote failure and asynchronous systems

Study distributed work as a failure problem, not a library problem.

For gRPC or HTTP calls, learn bounded deadlines, cancellation, retry budgets, exponential backoff/jitter, connection behavior, health, and load/backpressure. For Kafka, study the official design and operations documentation around replication, delivery, offsets, consumer groups, partition ordering, idempotent producers/transactions, retention, and failure recovery. For Redis, the bundled protocol material teaches exact wire semantics; application-level cache and coordination behavior still requires explicit ownership, expiration, consistency, and failure design.

For every asynchronous workflow, define:

- durable state and owner;
- delivery and acknowledgement point;
- ordering scope;
- duplicate behavior and idempotency;
- poison-message/retry policy;
- schema evolution and replay;
- timeout, cancellation, compensation, and reconciliation;
- lag/backpressure and operator controls.

Do not infer “exactly once” business effects from a broker feature name.

## 4. Security as a verification discipline

Read OWASP ASVS 5.0 as a structured verification model. Use it to learn what must be demonstrated across architecture, authentication, session/token handling, authorization, validation, cryptography, data protection, API/web-service security, configuration, logging, and other security boundaries.

Then pair ASVS with threat modeling and the actual platform/framework controls. A scanner does not prove authorization. Authentication does not imply authorization. UI hiding does not protect a backend resource.

Security learning should result in executable questions:

- what asset and trust boundary exists here?
- which identity and assurance level is used?
- what exact permission is checked on what resource/state?
- what is untrusted, bounded, normalized, encoded, or rejected?
- where do secrets live and how do they rotate?
- what data is sensitive, retained, logged, copied, or deleted?
- how are negative cases and tenant isolation verified?

## 5. Testing and quality evidence

Backend engineers own implementation-level evidence even when an independent QA role owns the broader quality strategy.

Learn tests by the mechanism they prove:

- unit tests for pure policy and state transitions;
- integration tests for real databases, brokers, caches, filesystems, serialization and protocols;
- contract tests for consumer/provider compatibility;
- migration tests for old/new schema and data states;
- concurrency/race/state-machine/property/fuzz testing when input or interleaving space is large;
- performance/resilience tests for latency, throughput, resources, saturation, failure and recovery.

Pact specifications are useful for understanding consumer-driven contract artifacts when Pact is actually adopted, but the general concept is broader than one tool.

Never use coverage percentage as a substitute for identifying the oracle and failure class a test proves.

## 6. Operability, observability, and diagnostics

A production backend must be diagnosable without attaching an interactive debugger to production.

Study OpenTelemetry semantics for traces, metrics, logs, baggage/context propagation, resources, error behavior and SDK boundaries. Use the Twelve-Factor App as a historical foundation for deployable application thinking, while recognizing its age and pairing it with current container, cloud, orchestration and observability practice.

Be able to answer from evidence:

- what demand is arriving and what outcome is completing?
- where is time spent and where is work queued?
- which dependency/tenant/version/region is affected?
- what is CPU, memory, allocation/GC, thread/task/goroutine, connection-pool or database wait state?
- which health signal controls liveness/readiness versus diagnosis?
- what changed, can it be disabled/rolled back, and how is recovery proven?

Use runtime-specific profilers, dumps, traces, query plans, system/network tools and structured telemetry according to the language track.

## 7. Architecture and design classics

Architecture names such as DDD, Clean/Hexagonal Architecture, CQRS, event sourcing, sagas and microservices are not objectives. Learn the underlying forces: responsibility, invariants, ownership, coupling, transaction scope, consistency, deployment, failure isolation, change cost and team boundaries.

Many of the best-known books in this layer cannot be redistributed as full text. They are therefore maintained in `restricted-canon.md` with a precise explanation of why an expert should know them and which local/open sources can cover adjacent mechanisms.

## Completion test

Before considering this systems track learned, the agent should be able to take one real backend request and produce a defensible chain:

```text
business rule
-> contract and authorization
-> domain/application ownership
-> transaction/data effects
-> remote/asynchronous failure behavior
-> tests and security evidence
-> telemetry and diagnostics
-> deployment/migration compatibility
-> recovery and operational handoff
```

If one of these layers is irrelevant, explain why from the actual system rather than silently ignoring it.
