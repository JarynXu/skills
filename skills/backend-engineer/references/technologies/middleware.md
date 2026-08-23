# Middleware and infrastructure adapters

Use this reference when backend behavior depends on a cache, broker, search engine, object store, scheduler, workflow engine, configuration/discovery system, or gateway. Treat each product as an operational dependency with semantics, not a feature checkbox.

When the task requires live broker/cache/search/object-store/workflow inspection or command-line diagnosis, route to [`middleware-operations.md`](middleware-operations.md). That reference separates read-only evidence from production-affecting actions such as purge/delete/reset/replay/configuration changes.

## Redis and distributed caches

Clarify whether Redis is a cache, ephemeral coordination store, queue, rate limiter, session store, or authoritative data store. Define persistence and failover assumptions, key model, memory bounds and eviction, TTL, serialization, atomicity, cluster/slot behavior, hot keys, tenant isolation, and fallback. Use Lua or transactions only with understood atomic scope. Locks require leases and fencing where stale owners can cause harm.

## Kafka and append-only event logs

Define topic purpose and owner, key and partitioning, ordering scope, producer idempotence/transactions where applicable, acknowledgement and durability, schema governance, consumer groups, offset commit point, retries, dead-letter or quarantine, retention, compaction, replay, backfill, lag, and mixed-version behavior. Monitor business completion separately from broker delivery.

## RabbitMQ, NATS, and work queues

Define exchange/subject and routing, durability, acknowledgement, prefetch or consumer bounds, retry topology, poison handling, ordering, duplicate behavior, expiry, priority, dead-lettering, and failover. Avoid immediate requeue loops. Make the durable business effect and acknowledgement relationship explicit.

## Elasticsearch and OpenSearch

Treat search as a derived index unless explicitly authoritative. Define mapping, analyzer, query semantics, refresh and consistency, aliases and versioned indexes, bulk/retry behavior, pagination, shard and replica strategy, index lifecycle, reindex and rollback, security, and rebuild source. Control expensive queries and cardinality.

## Object storage

Define bucket/container ownership, object key scheme, metadata, content validation, size and multipart behavior, encryption, retention, legal hold, versioning, lifecycle, signed URL scope and expiry, event delivery, and consistency. Do not expose internal buckets or trust client-provided content type and filename.

## Schedulers and background jobs

Define schedule timezone, missed runs, overlap, singleton or partitioned ownership, retry, idempotency, checkpoint, cancellation, progress, backfill, and operator controls. A cron expression does not define failure recovery.

## Workflow engines

Use a workflow engine when durable long-running state, retries, timers, human steps, compensation, and visibility justify the dependency. Keep workflow definitions deterministic where required, version them for in-flight instances, isolate activities, define idempotency, and test replay/migration. Do not hide simple local transactions behind orchestration.

## Configuration and service discovery

Define source precedence, dynamic versus restart-required settings, schema and validation, secret separation, rollout, cache/failure behavior, audit, and environment ownership. Discovery needs health semantics, stale-entry behavior, load balancing, identity, and DNS or control-plane failure handling.

## Gateways and proxies

Clarify which concerns belong at the gateway—routing, TLS, coarse authentication, quotas, protocol translation—and which remain in the service, especially authorization and domain validation. Align timeout, retry, body, header, streaming, WebSocket, and error behavior end to end. Avoid retry multiplication across client, proxy, service, and SDK layers.

## Adoption test

Before adding middleware, identify the demonstrated need, simpler alternatives, semantics relied upon, operating owner, failure behavior, observability, test strategy, migration/exit path, and cost. Availability in the platform is not evidence that the application should depend on it.
