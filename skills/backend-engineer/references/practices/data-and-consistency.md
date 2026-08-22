# Data, transactions, and consistency

Use this reference for data modeling, databases, transactions, indexes, locks, migrations, caches, replicas, NoSQL stores, retention, and consistency decisions.

## Establish data authority

For every important datum, identify its owner, system of record, lifecycle, classification, writers, readers, derived copies, retention, and deletion obligations. A cache, search index, replica, warehouse, or event log may contain the data without owning its truth.

## Model for invariants and access

Relational modeling is a strong default when relationships, constraints, transactions, and flexible queries matter. Use document, key-value, wide-column, graph, time-series, or search stores when their access and consistency model fits the demonstrated workload.

Do not choose a database from scale folklore. Evaluate:

- write and read shapes, volume, latency, and locality;
- invariants and transaction scope;
- query flexibility and index cost;
- retention, archival, deletion, and legal needs;
- operational skill, backup, restore, replication, and migration;
- failure semantics and consistency expectations.

Use database constraints for invariants the database can enforce. Application validation improves feedback but cannot replace unique, referential, range, or conditional integrity under concurrency.

## Define transaction boundaries

Keep transactions as short as correctness allows. Do not hold database locks across slow network calls. Decide isolation from actual anomalies: dirty or nonrepeatable reads, phantoms, lost updates, write skew, and serialization conflicts.

Use optimistic concurrency when conflicts are uncommon and detectable. Use pessimistic locking or serialized processing when contention and consequence justify it. Handle deadlocks and serialization failures as expected outcomes with bounded retry and idempotency.

## Engineer schema migration safely

Prefer expand-and-contract:

1. add compatible schema or fields;
2. deploy code that can read old and new representations;
3. write new form, dual-write only when reconciliation is designed;
4. backfill in bounded, resumable, observable batches;
5. verify counts, invariants, samples, and consumer adoption;
6. switch reads or constraints;
7. remove old writes and later old schema after rollback and retention windows.

Classify DDL locking and runtime behavior for the actual database and version. Backups are useful only if restore time and procedure are tested. Never call a migration reversible merely because a down script exists; data loss or external effects may make rollback impossible.

## Design indexes from queries

Use real predicates, joins, ordering, selectivity, cardinality, and write rate. Inspect query plans and production-like data. Account for composite index order, covering indexes, partial indexes, uniqueness, collation, null semantics, and maintenance cost. Remove redundant indexes only after proving no workload or constraint depends on them.

## Use caching deliberately

Define cache purpose, key, value, source of truth, freshness, invalidation, expiry, stampede control, negative caching, size, privacy, and failure behavior. Choose cache-aside, write-through, write-behind, or refresh-ahead from consistency and failure needs. A longer TTL is not a correctness strategy.

Treat distributed cache operations as network calls. Bound time and memory, avoid unbounded keys or values, and prevent tenant or authorization data leakage through key design.

## Handle replication and derived stores

Read replicas and asynchronous indexes introduce lag. Decide whether each operation can tolerate stale, monotonic, read-your-write, or eventual behavior. Route critical reads to an authority or carry a version/fence. Rebuild derived stores from a durable source and make checkpoints, replay, and reconciliation explicit.

## Protect data throughout its lifecycle

Minimize collection, classify sensitivity, encrypt appropriately, control access, mask logs and nonproduction copies, audit privileged actions, define retention and deletion, and verify backups and replicas honor lifecycle obligations. Preserve evidence when deletion is asynchronous or legally constrained without retaining prohibited content.
