# Contracts and integration engineering

Use this reference for APIs, RPC, GraphQL, WebSocket, events, files, batch interfaces, third-party integrations, versioning, error semantics, and consumer compatibility.

When a contract failure may actually be DNS/TCP/TLS/HTTP2/proxy/gRPC transport behavior, route to [`../technologies/network-protocol-diagnostics.md`](../technologies/network-protocol-diagnostics.md) before changing application semantics. Reproducing a request with `curl`, `grpcurl`, WebSocket clients or packet tools is diagnostic evidence, not permission to weaken authentication/TLS or production controls.

## Design from consumer-visible semantics

Define operations in terms of purpose, authority, preconditions, state change, result, side effects, failure, retry, and consistency. Protocol shape follows these semantics.

- Use HTTP/REST when resource and operation semantics map cleanly to HTTP, intermediaries, and broad clients.
- Use RPC when typed operations, low-latency internal calls, or generated clients are a strong fit.
- Use GraphQL when clients need flexible composition and the organization can govern schema, authorization, query cost, and resolver behavior.
- Use WebSocket or streaming protocols for ongoing bidirectional or server-pushed interaction with explicit lifecycle and backpressure.
- Use events for facts and asynchronous decoupling, not as hidden remote commands without ownership.
- Use files or batch contracts when volume, partner capability, regulatory exchange, or offline operation requires them.

## Make errors machine-usable

A useful error contract separates:

- stable category or code;
- human-safe message;
- field or item details when appropriate;
- retryability and conflict semantics;
- correlation identifier;
- documentation or recovery hint when safe.

Do not leak stack traces, SQL, secrets, internal topology, or sensitive identifiers. Keep transport status and domain meaning aligned. Distinguish invalid input, unauthenticated identity, forbidden action, missing resource, state conflict, rate limit, dependency failure, and internal defect.

## Define idempotency where repetition is possible

Retries occur through clients, proxies, queues, operators, and timeouts. For a repeatable command define:

- key scope and issuer;
- request-equivalence rule;
- storage and expiry;
- concurrent duplicate behavior;
- response replay policy;
- interaction with transaction commit and external side effects.

An idempotent HTTP verb does not make a non-idempotent implementation safe. A queue's delivery mode does not remove the consumer's duplicate responsibility.

## Evolve contracts compatibly

Prefer additive changes and tolerant readers. Treat renaming, retyping, required fields, changed defaults, enum expansion, ordering, precision, time-zone semantics, pagination, error codes, and event meaning as compatibility concerns.

For a breaking change, define:

```text
new contract introduced
-> producers/servers support both
-> consumers migrate with evidence
-> old traffic or data reaches zero
-> old contract is disabled
-> compatibility code and data are removed
```

Version semantics, not merely URLs. Event schema evolution must account for retained messages, replay, delayed consumers, and backfills.

## Secure each integration

Establish identity, authorization, confidentiality, integrity, replay resistance, certificate or key rotation, input limits, and audit needs. Treat partner callbacks and webhooks as untrusted: authenticate origin, validate freshness and signature, deduplicate, bound payloads, and make processing observable.

## Engineer third-party boundaries

Wrap external behavior in an adapter shaped by local use cases. Record:

- service limits and quotas;
- timeout and retry guidance;
- error taxonomy and retryability;
- data ownership and privacy;
- sandbox and test strategy;
- fallback, degradation, and operator controls;
- version and deprecation policy;
- reconciliation for ambiguous outcomes.

A successful network response may not prove the business effect. Use reconciliation or query-back where the external system can accept work asynchronously or return an indeterminate result.

## Verify contracts from both sides

Use schema validation, generated-code checks, provider and consumer contract tests, integration tests, replay fixtures, compatibility tests, and production telemetry according to risk. Mocks prove local branching; they do not prove serialization, authentication, protocol, deployed configuration, or third-party behavior.
