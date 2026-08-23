# Middleware operations and diagnosis

Use this reference when backend behavior depends on Redis, Kafka, RabbitMQ, NATS, Elasticsearch/OpenSearch, object storage, schedulers/workflow systems, configuration/discovery or gateways. Start with read-only state and telemetry. Creating/deleting topics, queues, streams, indexes or buckets; resetting offsets; purging messages; changing policies/configuration; replaying work; failover; or mutating production data requires explicit authority.

## Redis

Use `redis-cli` or the platform-approved client to inspect connectivity, server/cluster role, memory, clients, command latency, slow operations, keyspace distribution and replication. Useful read-only evidence may include `PING`, `INFO`, `MEMORY STATS`, `CLIENT LIST`, `SLOWLOG GET`, `LATENCY DOCTOR`, `CLUSTER INFO/NODES` and bounded `SCAN` according to product/mode.

Avoid `KEYS` on large production keyspaces. Treat hot keys, oversized values, eviction, TTL behavior, replication/failover, blocked clients, connection storms and serialization as system mechanisms. Never run `FLUSH*`, mass deletes, `CONFIG SET`, failover or cluster mutations without explicit authority.

## Kafka

Use broker/platform telemetry plus project-compatible Kafka CLI or `kcat` to inspect metadata, topic/partition layout, leaders/ISR, consumer groups, lag, offsets, retention, compaction and message/schema characteristics. Typical read-only tools include topic description, consumer-group describe, config describe and bounded sample consumption with safe credentials.

Distinguish producer acknowledgement/durability, broker storage and consumer business completion. High lag may come from slow processing, rebalance, partition skew, downstream dependency or insufficient capacity. Do not reset offsets, delete/recreate topics, alter retention/partitions or replay production messages without a defined recovery model and authorization.

## RabbitMQ

Use management API/UI and `rabbitmq-diagnostics`/`rabbitmqctl` as permitted to inspect node health, alarms, connections, channels, consumers, queue depth, ready/unacked messages, memory/disk pressure, federation/shovel and cluster state.

Diagnose redelivery loops, prefetch, unacked accumulation, consumer churn, poison messages, dead-letter routing and publisher confirms. Purging/deleting queues, closing connections or changing policies is a mutation and can destroy business work.

## NATS / JetStream

Use the `nats` CLI and server monitoring endpoints to inspect server/cluster state, connections, subscriptions, streams, consumers, pending/ack/redelivery state and storage. For JetStream, distinguish stream retention from consumer acknowledgement and delivery policy.

Do not delete streams/consumers, purge messages, reset delivery positions or issue administrative cluster changes without explicit authority and replay/recovery analysis.

## Elasticsearch / OpenSearch

Use authenticated REST APIs/console to inspect `_cluster/health`, allocation, nodes/stats, mappings/settings, aliases, index lifecycle, tasks, thread pools, search/profile/explain behavior and bounded `_cat` views. Use query profiling only when its overhead and target are acceptable.

Investigate shard count/size, heap/GC, rejected thread pools, segment/merge pressure, mapping explosion, expensive queries/aggregations, refresh, disk watermarks and replica/allocation state. Deleting indexes, force merge, rerouting shards, changing mappings/settings or mass update-by-query are consequential mutations.

## Object storage

Use provider CLI/API such as AWS `s3api`, MinIO `mc`, Azure/GCS equivalents or project wrappers to inspect object metadata, versioning, retention, lifecycle, encryption, replication, access policy and event configuration. Prefer HEAD/stat/list with bounded prefixes.

Uploading/deleting objects, changing bucket policy/lifecycle/retention, restoring versions or bulk copy can have irreversible or cost/security consequences. Confirm exact bucket/account/region and tenant before mutation.

## Schedulers and workflow engines

Inspect schedule, last/next run, active executions, checkpoints, retries, timers, workflow history and worker health. For Temporal/Cadence/Argo/Airflow/Quartz/Celery-style systems, understand whether retry/replay/backfill/resume re-executes external side effects.

Pause, retry, terminate, reset, backfill or replay operations are business-affecting changes. Require idempotency/reconciliation and an operator-visible expected result.

## Configuration, discovery and gateways

Inspect effective versioned configuration, service registrations, health, certificates, routes, timeout/retry/rate-limit policy and recent changes. For Consul/etcd/config services, distinguish read of state from writes that affect all instances. For Envoy/Nginx/HAProxy/API gateways, align client/proxy/service timeout and retry behavior to avoid retry multiplication.

## Diagnostic discipline

For every middleware incident, connect platform state to application behavior:

```text
request/job/event identity
-> middleware object (key/topic/queue/partition/index/object/workflow)
-> delivery/storage/processing state
-> downstream effect
-> telemetry and recovery
```

Do not conclude “Redis/Kafka/queue/search is slow” from one dashboard. Preserve workload, partition/key/shard distribution, client behavior and dependency evidence.