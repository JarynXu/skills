# Database tooling and live diagnosis

Use this reference when a backend task needs database inspection, query diagnosis, connection/lock analysis, migration evidence, or production-like data-system troubleshooting. Prefer read-only metadata/statistics first. Any DDL/DML, kill/cancel, vacuum/reindex, failover, backup restore, permission, replication or configuration mutation requires the applicable authorization.

## Universal diagnosis sequence

1. Identify the exact database product/version, cluster/instance, database/schema and environment.
2. Establish the symptom: latency, errors, lock waits, connection exhaustion, replication lag, storage, CPU/I/O or incorrect result.
3. Correlate application request/query identity with database sessions/statements where possible.
4. Inspect active work, waits/locks, connection pools, query plan and data/cardinality shape.
5. Compare against a baseline or known-good interval; do not optimize one plan captured with unrepresentative parameters.
6. Change query/index/schema/configuration only after the mechanism and rollback/verification path are explicit.

Never paste credentials into command history or reports. Production query text and bind values may contain sensitive data.

## PostgreSQL / `psql`

Useful read-only evidence includes `\d+`, catalog queries, `pg_stat_activity`, `pg_stat_database`, `pg_stat_statements` when installed, lock/wait relationships, index/table statistics, replication views and `EXPLAIN`/`EXPLAIN (ANALYZE, BUFFERS)` in an environment where executing the statement is safe.

Use `EXPLAIN ANALYZE` carefully: it executes the query. For writes or expensive statements, use a safe representative environment or an explicit transaction/rollback strategy only when semantics permit it.

Investigate long transactions, idle-in-transaction sessions, blocked/blocking PIDs, autovacuum/bloat symptoms, cache/I/O, row-estimate errors, sequential versus index access, nested-loop fan-out and connection pressure before adding indexes mechanically.

## MySQL / MariaDB

Use `mysql` plus `SHOW PROCESSLIST`, `SHOW ENGINE INNODB STATUS`, Performance Schema/sys schema, transaction/lock metadata, `EXPLAIN`/`EXPLAIN ANALYZE` where supported, index metadata and replication status according to product/version.

Check isolation/autocommit, gap/next-key locks, long transactions, deadlock records, buffer-pool/I/O, temporary tables/filesort, row estimates and connection limits. Do not copy optimizer advice from PostgreSQL; locking and plan semantics differ.

## SQL Server

Use `sqlcmd`/approved clients and DMVs such as request/session, wait, query-statistics, index and transaction views according to permissions. Inspect actual/estimated execution plans, blocking chains, parameter sniffing/cardinality, tempdb, memory grants, log/transaction behavior and connection-pool symptoms.

`KILL`, index rebuilds, statistics changes and server configuration are operational mutations requiring explicit authority and impact analysis.

## MongoDB

Use `mongosh`, `explain`, profiler/current operation/diagnostic views as permitted, index metadata, replica-set/sharding status and server metrics. Examine document shape/cardinality, covered/index scans, working-set pressure, read/write concern, transaction scope, replica lag and chunk/shard distribution where applicable.

Avoid production-wide profiling or unbounded collection scans without understanding overhead. A flexible schema does not remove data-contract or migration responsibility.

## SQLite

Inspect schema, pragmas, query plans, journal/WAL mode, busy/locking behavior and file ownership. SQLite concurrency/durability semantics differ sharply from client/server databases; do not extrapolate PostgreSQL/MySQL pooling or transaction assumptions.

## Migration evidence

Before applying a migration, inspect current version/history, target schema, generated SQL/plan when the tool supports it, lock/rewriting behavior, data backfill cost, mixed-version application compatibility and recovery. Prefer additive/expand-contract changes for online systems.

Useful read-only/status tools may include Flyway `info`, Liquibase status/history/diff commands, Alembic `current`/`heads`/history, EF migration lists/scripts, Prisma migration status, goose/dbmate status, or project wrappers. Exact commands and environment configuration must come from the project.

## Query and index evidence

An index is justified by real predicates/order/join/uniqueness needs and workload. Check selectivity, composite column order, covering/include behavior, partial/filter indexes, collation/null semantics, write amplification and redundant indexes. Preserve constraint indexes.

A faster single query can make the whole system worse through write cost, memory, plan instability or lock contention. Evaluate system consequence, not one plan score.